import gql from 'graphql-tag'

export default gql`
  mutation CreateNote($noteInput: CreateNoteInput) {
    createNote (noteInput: $noteInput) {
      id
      createdAt 
      title
      content
    }
  }
`
