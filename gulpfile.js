const {src, dest} = require('gulp');
const concat = require('gulp-concat')

const jsFiles = [
    './genanki/license.js',
    './genanki/anki_hash.js',
    './genanki/model.js',
    './genanki/default.js',
    './genanki/deck.js',
    './genanki/note.js',
    './genanki/package.js',
    './genanki/sha256.js',
    './genanki/apkg_schema.js',
    './genanki/apkg_col.js'
]

const bundleJs = () => {
    return src(jsFiles)
    .pipe(concat('genanki.js'))
    .pipe(dest('./dist'))
}

exports.bundleJs = bundleJs;