# genanki-js
A JavaScript implementation for generating Anki decks in browser. This is fork of [mkanki](https://github.com/nornagon/mkanki).

# QuickStart
```
npm i genanki-js
```

### View sample project to get started
[genanki-js-template](https://github.com/krmanik/genanki-js/tree/main/sample)

# Documentation
View [Documentation](https://krmanik.github.io/genanki-js)

## CSV/TSV to Anki Package
Visit page and select `CSV to APKG` from top menu.<br>
[CSV to APKG](https://krmanik.github.io/genanki-js/demo/index.html)

# Set-up a project from scratch
1. Install genanki-js
```
npm i genanki-js
```

2. Create a `SQL` global variable (may be added to index.js). Sql setup may be different for different JS library. View for react [sql-js/react-sqljs-demo](https://github.com/sql-js/react-sqljs-demo) and read more at [sql.js.org](https://sql.js.org/)

```js
// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
config = {
    locateFile: filename => `js/sql/sql-wasm.wasm`
}

let SQL;
initSqlJs(config).then(function (sql) {
    //Create the database
    SQL = sql;
});
```

3. Now use following `Examples` to generate and export decks.

*View more examples here [Examples](https://krmanik.github.io/genanki-js/demo/index.html)*

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
p.setSqlJs(SQL);        // global SQL variable from step 2 in setup
p.addDeck(d)

p.writeToFile('deck.apkg')
```

# License
### [genanki-js]()
[GNU Affero General Public License v3](https://opensource.org/licenses/AGPL-3.0)
<br>Copyright (c) 2021 Mani

## Other Third Party Licenses
[License.md](https://github.com/krmanik/genanki-js/blob/master/License.md)