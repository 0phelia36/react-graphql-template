import { createZomeCall } from './holochainClient'

function dnaToUiNote (noteResult) {
  return {
    ...noteResult,
    createdAt: noteResult.created_at
  }
}

export const resolvers = {
  Query: {
    getNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/get_note')),

    listNotes: async () =>
      (await createZomeCall('/notes/notes/list_notes', null))
  },

  Mutation: {
    createNote: async (_, { noteInput }) =>{ console.log("note input", noteInput)
      return dnaToUiNote(await createZomeCall('/notes/notes/create_note', noteInput))},

    updateNote: async (_, { id, noteInput }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/update_note', noteInput)),

    removeNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/notes/notes/remove_note', id)),
  }
}

export default resolvers
