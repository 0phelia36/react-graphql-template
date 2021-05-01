import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { rsmConnectApp } from './holochainClient'
import apolloClient from './apolloClient'
import './index.css'
import NotesHApp from './NotesHApp'
import * as serviceWorker from './serviceWorker'


function HApp () {
  const [connected, setConnected] = useState(false);

  rsmConnectApp().then( async (cellId) => {
    setConnected(true)
    console.log("Connected!")
  }
  )

  console.log("connection Status ", connected)
  if (!connected) {
    console.log("not connected ", connected)
    return <div>Connecting...</div>
  }
  return <ApolloProvider client={apolloClient}>
    <NotesHApp />
  </ApolloProvider>
}

ReactDOM.render(<HApp />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
