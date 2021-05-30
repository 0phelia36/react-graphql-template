# react-graphql-template

This repository contains a simple "notes hApp" for holochain RSM that allows you to create, edit, delete, and list notes. It includes a DNA backend and a React + GraphQL frontend. It is a minimal working Holochain app.

## 0 - Install `nix-shell`

Install `nix-shell` on your machine, using this one-line command:

```
curl https://nixos.org/nix/install | sh
```

(Note: we currently support macOS and Linux only; please see our [development environment setup guide](https://developer.holochain.org/docs/install/) to set up Linux and `nix-shell` on Windows.)

## 1 - Enter nix-shell

```
. ~/.nix-profile/etc/profile.d/nix.sh
nix-shell
```

The nix-shell command will take a long time to finish the first time it is run, after that it will only take a few seconds.
## 2 - Build the hApp and install dependencies 

From within the `nix-shell` environment, run the following commands:

```
yarn install
yarn hc:build
```

This downloads all the dependencies for the frontend, and create the hApp source code. This will take some time.

## 3 - Start your new hApp!

Once that's complete, run this command to start up the hApp:

```
yarn hc:start
```

The first time the Holochain conductor runs there may be some additional compilation, so it might take a little while. When it's done, a browser page should open to the notes hApp. If it doesn't, you can browse to http://localhost:3000 to use the hApp.

The conductor and the UI server run in the foreground, so you can stop them by pressing `Ctrl`+`C`.
`$ npm start`

## A very brief tour

The UI code is in `ui_src` and the DNA code is in `dna_src`. This notes demo app uses:

1. A Holochain DNA on the back end (of course)
2. [Apollo GraphQL middleware](https://www.apollographql.com/) in the browser to translate zome calls into something easy for front-end frameworks to understand and manipulate
3. [React](https://reactjs.org) for UI and data flow
4. [create-react-app](https://create-react-app.dev/) for development tooling

As with most hApps, much of the business logic lives in the front-end and is delivered as static assets to the browser. The create-react-app dev tooling builds it all from source, gets it ready for the browser, and serves it up using [Webpack's dev server](https://webpack.js.org/configuration/dev-server/). (We're using this instead of Holochain's built-in static asset server because it supports live reloading of changes to the UI code.)

**Happy hacking!**
