#!/bin/bash

input="./src"
output="./build"

mkdir -p "$output"

for file in $(find "$input" -name "*.css" -o -name "*.html" -o -name "*.js" | sed "s|^$input/||"); do
    input_file="$input/$file"
    output_file="$output/$file"

    mkdir -p "${output_file%/*}" 
    cp "$input_file" "$output_file"
done

cp -nR "$input/." "$output"
