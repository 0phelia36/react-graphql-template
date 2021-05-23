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
pub fn get_book(_hash: SomeExternalInput) -> ExternResult<Book> {
    // let element: Element = get(EntryHash::from(hash), GetOptions::default())?
    //     .ok_or(WasmError::Guest(String::from("Could not find book")))?;
    // let bookoption: Option<Book> = element.entry().to_app_option()?;
    // let book: Book = bookoption.unwrap();
    Ok(Book {title: "a".to_string(), content: "b".to_string()})
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

// #[hdk_extern]
// pub fn remove_note(id: EntryHash) -> ExternResult<Book> {
//     update_entry()

//     Ok(book)
// }

#[hdk_extern]
pub fn list_notes(_: ()) -> ExternResult<Vec<BookEntry>> {
    let note_links = get_links(Path::from("notes").hash()?, None)?;
    let mut notes : Vec<BookEntry> = Vec::new();

    for link in note_links.into_inner() {
        notes.push(_return_content(&link)?);
    }

    Ok(notes)
}

fn _return_content(link: &Link) -> ExternResult<BookEntry> {
    // let res = get_details(link.target, GetOptions::default())?.ok_or(WasmError::Guest(String::from("Entry not found")))?;
    // res.
    let element: Element = get(link.target.clone(), GetOptions::default())?
        .ok_or(WasmError::Guest(String::from("Entry not found")))?;
    // let entry_option: Option<Book> = element.entry().to_app_option()?;
    // let entry: Book =
    //     entry_option.ok_or(WasmError::Guest("The targeted entry is not a note".into()))?;
    //let entry = _get_note(&element)?;
    let entry: Book = match hc_utils::get_latest_entry(link.target.clone(), Default::default()) {
        Ok(e) => Ok(e.try_into()?),
        _ => Err (WasmError::Guest(String::from("Link not found")),)
    }?;
    let hash: HeaderHashB64
        = element.header_address().clone().into_hash().into();
    Ok(BookEntry { id: hash,  title: entry.title, content: entry.content})
}

fn _get_note(element: &Element) -> ExternResult<Book> {
    let element_hash = element.header_hashed().entry_hash().ok_or(WasmError::Guest(String::from("Entry not found"))).expect("asd");
    let entry_option: Option<Book> = element.entry().to_app_option()?;
    let entry: Book =
        entry_option.ok_or(WasmError::Guest("The targeted entry is not a note".into()))?;
    let latest_link = get_latest_link(element_hash.clone().into_hash(), None).unwrap();//.ok_or(WasmError::Guest(String::from("Link not found")))?;


    match latest_link {
        Some(link) => match hc_utils::get_latest_entry(link.target, Default::default()) {
            Ok(e) => Ok(e.try_into()?),
            _ => Err (WasmError::Guest(String::from("Link not found")),)
        }
        None => Ok(entry)
    }
}