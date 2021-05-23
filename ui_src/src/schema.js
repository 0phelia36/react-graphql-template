import gql from 'graphql-tag'

export default gql`

type Note {
  id: ID
  createdAt: String
  title: String
  content: String
}
type Thing {
  title: String
  content: String
}

input CreateNoteInput {
  title: String
  content: String
}

input UpdateNoteInput {
  id: String
  title: String
  content: String
}

type Query {
  getNote(id: String): Note
  listNotes: [Note]
  getExampleNote: Thing
}

type Mutation {
  createNote(noteInput: CreateNoteInput): Note
  updateNote(noteInput: UpdateNoteInput): Note
  removeNote(id: String): Note
}
`
