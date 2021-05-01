import { createZomeCall } from './holochainClient'

function dnaToUiNote (noteResult) {
  return {
    ...noteResult,
    createdAt: noteResult.created_at
  }
}

export const resolvers = {
  Query: {
    getExampleNote: async () =>{ console.log("getExampleNote resolver")
      return await createZomeCall('/notes/notes/get_book')},

    getNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/get_note')),

    listNotes: async () =>
      (await createZomeCall('/notes/notes/list_notes'))
  },

  Mutation: {
    createNote: async (_, { noteInput }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/create_note')({ note_input: noteInput })),

    updateNote: async (_, { id, noteInput }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/update_note')({ id, note_input: noteInput })),

    removeNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/remove_note')({ id }))
  }
}

export default resolvers
