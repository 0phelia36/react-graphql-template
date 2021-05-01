#!/bin/bash

## CHECK NIX-SHELL 

# check result of script and exit when not in right nix-shell
[ $? -eq 0 ] || exit 1


# show fancy text in terminal if we are running in the right nix-shell
echo " ****HOLOCHAIN-GYM BUILDING ZOME ****"

## THE ACTUAL COMMANDS 

# compile your rust code into a wasm binary
CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown

hc dna pack --output=hashes.dna workdir

hc app pack --output=hashes.happ .