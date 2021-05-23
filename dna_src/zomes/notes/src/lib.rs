use hdk::prelude::*;
use holo_hash::{HeaderHashB64};
use hc_utils::*;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SomeExternalInput {
    title: String,
    content: String,
}

#[hdk_entry(id = "note")]
pub struct Note {
    title: String,
    content: String,
}

#[hdk_entry(id = "noteentry")]
pub struct NoteEntry {
    id: HeaderHashB64,
    title: String,
    content: String,
}

entry_defs![Path::entry_def(), Note::entry_def(), NoteEntry::entry_def()];

#[hdk_extern]
pub fn create_note(input: SomeExternalInput) -> ExternResult<Note> {
    let note: Note = Note {
        title: input.title,
        content: input.content,
    };
    let _a: HeaderHash = create_entry(&note)?;
    let x: EntryHash = hash_entry(&note)?;
    let notes_path = Path::from("notes");
    notes_path.ensure()?;

    create_link(notes_path.hash()?, x.clone(), ())?;

    Ok(note)
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateNoteInput {
    id: HeaderHashB64,
    title: String,
    content: String,
}

#[hdk_extern]
pub fn update_note(input: UpdateNoteInput) -> ExternResult<HeaderHash> {
    update_entry(input.id.into(), Note{ title: input.title, content: input.content})
}

#[hdk_extern]
pub fn remove_note(id: HeaderHashB64) -> ExternResult<HeaderHash> {
    delete_entry(id.into())
}

#[hdk_extern]
pub fn list_notes(_: ()) -> ExternResult<Vec<NoteEntry>> {
    let note_links = get_links(Path::from("notes").hash()?, None)?;
    let mut notes : Vec<NoteEntry> = Vec::new();

    for link in note_links.into_inner() {
        match _get_note(link.target.into_hash()) {
            Ok(note) => notes.push(note),
            Err(_) => {}
        };
    }

    Ok(notes)
}

fn _get_note(entry_hash: EntryHash) -> ExternResult<NoteEntry> {

    let entry: Note = match get_latest_entry(entry_hash.clone(), Default::default()) {
        Ok(e) => Ok(e.try_into()?),
        _ => Err (WasmError::Guest(String::from("Entry Not Found")))
    }?;

    let header = match get_header(entry_hash.clone()) {
        Ok(e) => Ok(e.into()),
        _ => Err (WasmError::Guest(String::from("Header Not Found")))
    }?;

    Ok(NoteEntry { id: header,  title: entry.title, content: entry.content})
}
