# genanki-js
A JavaScript implementation for generating Anki decks in browser. This is fork of [mkanki](https://github.com/nornagon/mkanki).

# QuickStart
Fork and download this repository. The `sample` folder contains all necessary files to get started.

# Set Up a new project from scratch
1. Download and copy these three files from `dist` folder and add to the project
```js
anki_hash.js    // used for generating id
db.js           // used for creating global db variable using sql.js
genanki.js      // for creating and exporting anki package file
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

3. Create a `db` global variable and run sql `APKG_SCHEMA` (may be added to index.js)
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

4. Now use following `Examples` to generate and export decks.

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

## Documentation

*Following documentation taken from [mkanki](https://github.com/nornagon/mkanki)*

First, some information about how Anki works.

In Anki, things to be remembered are called _notes_. Each note can have several
fields—most commonly, a "Front" and a "Back", but the fields can be arbitrary.
Each note can potentially correspond to many individual _cards_, each of which
should help you remember one facet of the note.

The thing that describes how those fields are turned into flashcards is called
a _model_. Every note is described by exactly one model. The model defines
which fields are allowed, and additionally defines one or more _templates_,
which are written as HTML with [mustache](https://mustache.github.io/)-like
placeholders.

Finally, each card belongs to a _deck_. Decks collect cards into logical groups
that you might want to study separately from each other.

_Models_, _notes_, _cards_ and _decks_ are the fundamental concepts of Anki. In
mkanki, cards are implicitly defined by notes and models, and you will only
deal with models, notes, and decks.

### `Model`

Anki supports two types of models: _standard_ and _cloze_. Standard models
generate one card per template, while cloze models generate one card per cloze
deletion. See the [Anki cloze documentation][anki-cloze-docs] for more on cloze
deletion.

#### `new anki.Model(props)`

Create a new standard model with the given properties. `props` is an object
with the following fields.

- `id` string - a stable, unique identifier for this model. Generate this once
  with `+new Date` and then hard-code it into your code. Keeping this stable
  means that if the package is updated and re-imported into Anki, the app will
  be able to tell which cards are new and which cards should be merged into
  already-existing cards, preserving study history.
- `name` string - the name of the model. Shows up in the "Add" UI in Anki.
- `flds` Array&lt;{name: string}&gt; - the fields in the model.
- `tmpls` Array&lt;{name?: string, qfmt: string, afmt: string}&gt; - a list of
  card templates to be generated from each note. `qfmt` is the HTML template
  for the question, and `afmt` is the HTML template for the answer. `name` is
  displayed in the configuration screen in Anki and nowhere else, and will
  default to "Card N". See the [Anki template
  documentation][anki-template-docs] for more on template formatting.
- `req` Array&lt;[number, "all" | "any", Array&lt;number&gt;]&gt; - this
  describes which fields must be non-empty in order for a card to be generated.
  Each entry in this list is a tuple of the template index, "all" or "any", and
  a list of field indices. In order for a card to be generated for a given note
  and template, one or all of the fields specified in the field list must be
  non-empty. If the requirement isn't met for a given (template, note) pair, no
  card will be generated.

#### `new anki.ClozeModel(props)`

Create a new cloze model with the given properties. `props` is an object with
the following fields.

- `id` string - a stable, unique identifier for this model. Generate this once
  with `+new Date` and then hard-code it into your code. Keeping this stable
  means that if the package is updated and re-imported into Anki, the app will
  be able to tell which cards are new and which cards should be merged into
  already-existing cards, preserving study history.
- `name` string - the name of the model. Shows up in the "Add" UI in Anki.
- `flds` Array&lt;{name: string}&gt; - the fields in the model.
- `tmpl` {name?: string, qfmt: string, afmt: string} - the cloze template to
  be generated from each note. `qfmt` is the HTML template for the question,
  and `afmt` is the HTML template for the answer. `name` is displayed in the
  configuration screen in Anki and nowhere else, and will default to "Cloze".
  See the [Anki template documentation][anki-cloze-template-docs] for more on
  cloze template formatting. Cloze models can only have one template.

#### `model.note(fieldValues, [guid])`

Create a note using this model.

- `fieldValues` Array&lt;string&gt; | {[fieldName: string]: string} - If
  `fieldValues` is an array, the order of fields will be matched with the order
  of the `flds` in the model. If `fieldValues` is an object, the keys must be
  the names of fields in the model.
- `guid` string _(optional)_ - a stable, unique identifier for this note. When
  re-importing an updated version of this note, Anki will replace notes with
  matching identifiers. Defaults to a hash of the field values.

### `Deck`

In mkanki, decks are collections of notes (not cards, as in Anki proper).

#### `new anki.Deck(id, name)`

Create a new deck.

- `id` string - a stable, unique identifier for this deck. Generate this once
  with `+new Date` and then hard-code it into your code. Keeping this stable
  means that if the package is updated and re-imported into Anki, the app will
  be able to tell which cards are new and which cards should be merged into
  already-existing cards, preserving study history.
- `name` string - the name of the deck. When importing, Anki will create new
  decks with the specified names for each deck in the package.

#### `deck.addNote(note)`

Add a note to this deck. Technically, it is possible for a single note in Anki
to generate cards belonging to multiple decks, but mkanki does not support
that.

- `note` Note - create notes using [`model.note()`](#modelnotefieldvalues).

### `Package`

A package collects together decks, notes, and any media objects (images, audio,
video, etc.) to be exported into a `.apkg` file.

#### `new anki.Package()`

Create a new empty package.

#### `package.addDeck(deck)`

Add a deck to this package.

- `deck` [Deck](#deck) - the deck to add.

#### `package.addMedia(data, name)`

Add a media file to this package.

- `data` string | Buffer - the contents of the media file.
- `name` string - the name of the file in the package.

#### `package.addMediaFile(filename, [name])`

Add a media file from the filesystem to this package.

- `filename` string - path to the file.
- `name` string _(optional)_ - the name of the file in the package. Defaults to
  `filename`.

#### `package.writeToFile(filename)`

Serializes the package to a file.

- `filename` string - path to the exported package. Conventionally ends in
  `".apkg"`.


[anki-template-docs]: https://apps.ankiweb.net/docs/manual.html#cards-and-templates
[anki-cloze-docs]: https://apps.ankiweb.net/docs/manual.html#cloze-deletion
[anki-cloze-template-docs]: https://apps.ankiweb.net/docs/manual.html#cloze-templates

# License
### [genanki-js]()
[GNU Affero General Public License v3](https://opensource.org/licenses/AGPL-3.0)
<br>Copyright (c) 2021 Mani

## Other Third Party Licenses
[License.md](https://github.com/infinyte7/genanki-js/blob/master/License.md)