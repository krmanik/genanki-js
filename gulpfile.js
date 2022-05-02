const {src, dest} = require('gulp');
const concat = require('gulp-concat');
const minify = require("gulp-minify");

const jsFiles = [
    './genanki/license.js',
    './genanki/import.js',
    './genanki/anki_hash.js',
    './genanki/model.js',
    './genanki/default.js',
    './genanki/deck.js',
    './genanki/note.js',
    './genanki/package.js',
    './genanki/apkg_schema.js'
]

const bundleJs = () => {
    return src(jsFiles)
    // bundle all js files in genanki folder in genanki.js file
    .pipe(concat('genanki.js'))
    .pipe(minify({}))
    // write genanki.js to dist, demo and sample folder
    .pipe(dest('./dist'))
    //.pipe(dest('./docs/demo/js/anki'))
    //.pipe(dest('./sample/js/anki'))
}

exports.bundleJs = bundleJs;