# genanki-js
A JavaScript implementation for generating Anki decks in browser. This is fork of [mkanki](https://github.com/nornagon/mkanki).

# QuickStart
Download [genanki](https://github.com/infinyte7/genanki-js/releases) zip file from release pages.

The zip file contains two folder

- `dist` : This folder contains `genanki.js` file. If project already configured with [sql.js](https://github.com/sql-js/sql.js), [FileSaver.js](https://github.com/eligrey/FileSaver.js) and [JSZip](https://github.com/Stuk/jszip) then just add `genanki.js` file to project.

- `sample` : This folder contains latest [sql.js](https://github.com/sql-js/sql.js), [FileSaver.js](https://github.com/eligrey/FileSaver.js), [JSZip](https://github.com/Stuk/jszip) and [genanki.js](https://github.com/infinyte7/genanki-js). It is ready to use folder. 

Alternatively, `genanki.js` can also be loaded from CDN.
```html
<script src="https://cdn.jsdelivr.net/gh/infinyte7/genanki-js/dist/genanki.js"></script>
```

# Documentation
View [Documentation](https://infinyte7.github.io/genanki-js)

# CSV/TSV to Anki Package
Visit page and select `CSV to APKG` from top menu.<br>
[CSV to APKG](https://infinyte7.github.io/genanki-js/demo/index.html#)

# Set Up a new project from scratch
1. Download `genanki.js` from `dist` folder and add to the project
```html
<!-- for creating and exporting anki package file -->
<script src='genanki.js'></script>
```

2. Add [sql.js](https://github.com/sql-js/sql.js), [FileSaver.js](https://github.com/eligrey/FileSaver.js) and [JSZip](https://github.com/Stuk/jszip) to the project

    >*Note: [mkanki](https://github.com/nornagon/mkanki) uses `better-sql`, `fs` and `archiver`, that make it difficult to be used in browser*

```html
<!-- sqlite -->
<script src='js/sql/sql.js'></script>

<!-- File saver -->
<script src="js/filesaver/FileSaver.min.js"></script>

<!-- jszip for .apkg -->
<script src="js/jszip.min.js"></script>
```

3. Create a `SQL` global variable (may be added to index.js)
```js
// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
config = {
    locateFile: filename => `js/sql/sql-wasm.wasm`
}

var SQL;
initSqlJs(config).then(function (sql) {
    //Create the database
    SQL = sql;
});
```

4. Now use following `Examples` to generate and export decks.

*View more examples here [Examples](https://infinyte7.github.io/genanki-js/demo/index.html)*

# Examples
```js
var m = new Model({
  name: "Basic (and reversed card)",
  id: "1543634829843",
  flds: [
    { name: "Front" },
    { name: "Back" }
  ],
  req: [
    [ 0, "all", [ 0 ] ],
    [ 1, "all", [ 1 ] ]
  ],
  tmpls: [
    {
      name: "Card 1",
      qfmt: "{{Front}}",
      afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
    },
    {
      name: "Card 2",
      qfmt: "{{Back}}",
      afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Front}}",
    }
  ],
})
                        
var d = new Deck(1276438724672, "Test Deck")

d.addNote(m.note(['this is front', 'this is back']))

var p = new Package()
p.addDeck(d)

p.writeToFile('deck.apkg')
```

# License
### [genanki-js]()
[GNU Affero General Public License v3](https://opensource.org/licenses/AGPL-3.0)
<br>Copyright (c) 2021 Mani

## Other Third Party Licenses
[License.md](https://github.com/infinyte7/genanki-js/blob/master/License.md)