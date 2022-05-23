#!/bin/bash

input="./src"
output="./build"

mkdir $output

for file in $(find $input -name "*.css" -o -name "*.html" -o -name "*.js" | sed "s|^$input/||"); do
    input_file="$input/$file"
    output_file="$output/$file"

    mkdir -p "${output_file%/*}" && touch "$output_file"
    yarn minify $input_file > $output_file 
done

yarn tailwindcss -i "$input/index.css" -o "$output/index.css"
yarn minify "$output/index.css" > "$output/index-1.css"
rm -rf "$output/index.css"
mv "$output/index-1.css" "$output/index.css"
cp -nR "$input/." $output
