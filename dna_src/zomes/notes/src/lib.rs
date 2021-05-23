use hdk::prelude::*;
use holo_hash::{EntryHashB64, HeaderHashB64};
use hc_utils::*;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SomeExternalInput {
    title: String,
    content: String,
}

#[hdk_entry(id = "book")]
pub struct Book {
    title: String,
    content: String,
}

#[hdk_entry(id = "bookentry")]
pub struct BookEntry {
    id: HeaderHashB64,
    title: String,
    content: String,
}

entry_defs![Path::entry_def(), Book::entry_def(), BookEntry::entry_def()];

#[hdk_extern]
pub fn add_book(input: SomeExternalInput) -> ExternResult<EntryHashB64> {
    let book: Book = Book {
        title: input.title,
        content: input.content,
    };
    let _a: HeaderHash = create_entry(&book)?;
    let x: EntryHash = hash_entry(&book)?;
    
    Ok(EntryHashB64::from(x))
}

#[hdk_extern]
pub fn create_note(input: SomeExternalInput) -> ExternResult<Book> {
    let book: Book = Book {
        title: input.title,
        content: input.content,
    };
    let _a: HeaderHash = create_entry(&book)?;
    let x: EntryHash = hash_entry(&book)?;
    let notes_path = Path::from("notes");
    notes_path.ensure()?;

    create_link(notes_path.hash()?, x.clone(), ())?;

    Ok(book)
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateNoteInput {
    id: HeaderHashB64,
    title: String,
    content: String,
}

#[hdk_extern]
pub fn update_note(input: UpdateNoteInput) -> ExternResult<HeaderHash> {
    update_entry(input.id.into(), Book{ title: input.title, content: input.content})
}

#[hdk_extern]
pub fn remove_note(id: HeaderHashB64) -> ExternResult<HeaderHash> {
    delete_entry(id.into())
}

#[hdk_extern]
pub fn list_notes(_: ()) -> ExternResult<Vec<BookEntry>> {
    let note_links = get_links(Path::from("notes").hash()?, None)?;
    let mut notes : Vec<BookEntry> = Vec::new();

    for link in note_links.into_inner() {
        match _get_note(link.target.into_hash()) {
            Ok(note) => notes.push(note),
            Err(_) => {}
        };
    }

    Ok(notes)
}

fn _get_note(entry_hash: EntryHash) -> ExternResult<BookEntry> {

    let entry: Book = match get_latest_entry(entry_hash.clone(), Default::default()) {
        Ok(e) => Ok(e.try_into()?),
        _ => Err (WasmError::Guest(String::from("Entry Not Found")))
    }?;

    let header = match get_header(entry_hash.clone()) {
        Ok(e) => Ok(e.into()),
        _ => Err (WasmError::Guest(String::from("Header Not Found")))
    }?;

    Ok(BookEntry { id: header,  title: entry.title, content: entry.content})
}
