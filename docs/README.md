# genanki-js
A JavaScript implementation for generating Anki decks in browser. This is fork of [mkanki](https://github.com/nornagon/mkanki).

# QuickStart
Fork and download [this](https://github.com/infinyte7/genanki-js) repository. The `sample` folder contains all necessary files to get started.

# Demo


# Set Up a new project from scratch
#### 1. Download and copy these three files from  [dist](https://github.com/infinyte7/genanki-js/tree/main/dist) folder and add to the project

```
anki_hash.js    // used for generating id
db.js           // used for creating global db variable using sql.js
genanki.js      // for creating and exporting anki package file
```

#### 2. Add  [sql.js](https://github.com/sql-js/sql.js), [FileSaver.js](https://github.com/eligrey/FileSaver.js) and [JSZip](https://github.com/Stuk/jszip) to the project

  >*Note: [mkanki](https://github.com/nornagon/mkanki) uses `better-sql`, `fs` and `archiver`, that make it difficult to be used in browser*

```html
<!-- sqlite -->
<script src='js/sql/sql.js'></script>

<!-- File saver -->
<script src="js/filesaver/FileSaver.min.js"></script>

<!-- jszip for .apkg -->
<script src="js/jszip.min.js"></script>
```

#### 3. Create a `db` global variable and run sql `APKG_SCHEMA` (may be added to index.js)

>Note: The `db` variable is used in [package.js#L57](https://github.com/infinyte7/genanki-js/blob/main/genanki/package.js#L57).

```js
// change path of sql-wasm.wasm for filename
config = {
    locateFile: filename => `js/sql/sql-wasm.wasm`
}

var db = null;
initSqlJs(config).then(function (SQL) {
    //Create the database
    db = new SQL.Database();
    db.run(APKG_SCHEMA);
});

```

#### 4. After finishing above, the project structure should be like this

```
.
└── sample
    ├── js
    │   ├── anki
    │   │     ├── anki_hash.js
    │   │     ├── db.js
    │   │     └── genanki.js
    │   ├── filesaver
    │   │     ├── FileSaver.min.js
    │   │     └── FileSaver.min.js.map
    │   ├── sql
    │   │     ├── sql.js
    │   │     └── sql-wasm.wasm
    │   ├── jszip.min.js
    │   └── index.js
    └── index.html
```

#### 5. Now use following `Examples` to generate and export decks.

##### Examples

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
## [genanki-js](https://github.com/infinyte7/genanki-js)
[GNU Affero General Public License v3](https://opensource.org/licenses/AGPL-3.0)
<br>Copyright (c) 2021 Mani

## Other Third Party Licenses
[License.md](License.md)