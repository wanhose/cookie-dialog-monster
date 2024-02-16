#!/usr/bin/env bash

path=$(pwd)
version=$(jq -r '.version' "$path/build/manifest.json")

cd "$path/build" || exit
zip -r "$path/$(basename $path)-$version.zip" . -x */\.* *.git* \.* *.md *.sh *.zip
