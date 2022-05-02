/**
 * [mkanki]{@link https://github.com/nornagon/mkanki}
 * @copyright Copyright (c) 2018 Jeremy Apthorp
 * @license AGPL-3.0 License
 * 
 * 
 * [genanki]{@link https://github.com/kerrickstaley/genanki}
 * @copyright Copyright (c) Kerrick Staley 2021
 * @license The MIT License
 * 
 * 
 * [genanki-js]{@link https://github.com/krmanik/genanki-js}
 * @copyright Copyright (c) 2021 Mani
 * @license AGPL-3.0 License
 */

import { saveAs } from "file-saver";
import { sha256 } from "js-sha256";
import JSZip from "jszip";
import bigInt from "big-integer";

const BASE91_TABLE = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
  't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4',
  '5', '6', '7', '8', '9', '!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', ':',
  ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '`', '{', '|', '}', '~']

function ankiHash(fields) {
  const str = fields.join('__')
  const h = sha256.create();
  h.update(str)
  const hex = h.digest()

  let hash_int = bigInt();
  for (let i = 0; i < 8; i++) {
      hash_int *= bigInt("256");
      hash_int += bigInt(hex[i])
  }

  // convert to the weird base91 format that Anki uses
  let rv_reversed = []
  while (hash_int > 0) {
      rv_reversed.push(BASE91_TABLE[hash_int % bigInt("91")])
      hash_int = (hash_int / bigInt("91"))
  }

  return rv_reversed.reverse().join('')
}

const MODEL_STD = 0
const MODEL_CLOZE = 1

export class Model {
    constructor(props) {
        this.props = {
            ...defaultModel,
            ...props,
            flds: props.flds.map((f, i) => ({ ...defaultField, ord: i, ...f })),
            tmpls: props.tmpls.map((t, i) => ({ ...defaultTemplate, ord: i, name: `Card ${i + 1}`, ...t })),
            mod: new Date().getTime()
        }
        this.fieldNameToOrd = {}
        this.props.flds.forEach(f => { this.fieldNameToOrd[f.name] = f.ord })
    }

    note(fields, tags, guid = null) {
        if (Array.isArray(fields)) {
            if (fields.length !== this.props.flds.length) {
                throw new Error(`Expected ${this.props.flds.length} fields for model '${this.props.name}' but got ${fields.length}`)
            }
            return new Note(this, fields, tags, guid)
        } else {
            const field_names = Object.keys(fields)
            const fields_list = []
            field_names.forEach(field_name => {
                const ord = this.fieldNameToOrd[field_name]
                if (ord == null) throw new Error(`Field '${field_name}' does not exist in the model`)
                fields_list[ord] = fields[field_name]
            })
            return new Note(this, fields_list, tags, guid)
        }
    }
}

export class ClozeModel extends Model {
    constructor(props) {
        super({
            type: MODEL_CLOZE,
            css: `
         .card {
           font-family: arial;
           font-size: 20px;
           text-align: center;
           color: black;
           background-color: white;
         }
 
         .cloze {
           font-weight: bold;
           color: blue;
         }
       `,
            tmpls: [{ name: "Cloze", ...props.tmpl }],
            ...props
        })
    }
}

export const defaultModel = {
    sortf: 0, // sort field
    did: 1, // deck id
    latexPre: `\\documentclass[12pt]{article}
 \\special{papersize=3in,5in}
 \\usepackage[utf8]{inputenc}
 \\usepackage{amssymb,amsmath}
 \\pagestyle{empty}
 \\setlength{\\parindent}{0in}
 \\begin{document}`,
    latexPost: "\\end{document}",
    mod: 0, // modification time
    usn: 0, // unsure, something to do with sync?
    vers: [], // seems to be unused
    type: MODEL_STD,
    css: `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
 }`,
    /* also:
    name: string,
    flds: [Field],
    tmpls: [Template],
    tags: [??],
    id: string
    */
    tags: [],
}

export const defaultField = {
    name: "",
    ord: null,
    sticky: false,
    rtl: false,
    font: "Arial",
    size: 20,
    media: [],
}

export const defaultTemplate = {
    name: "",
    ord: null,
    qfmt: "",
    afmt: "",
    did: null,
    bqfmt: "",
    bafmt: "",
}

// whether new cards should be mixed with reviews, or shown first or last
const NEW_CARDS_DISTRIBUTE = 0
const NEW_CARDS_LAST = 1
const NEW_CARDS_FIRST = 2

export const defaultConf = {
    // review options
    'activeDecks': [1],
    'curDeck': 1,
    'newSpread': NEW_CARDS_DISTRIBUTE,
    'collapseTime': 1200,
    'timeLim': 0,
    'estTimes': true,
    'dueCounts': true,
    // other config
    'curModel': null,
    'nextPos': 1,
    'sortType': "noteFld",
    'sortBackwards': false,
    'addToCur': true, // add new to currently selected deck?
    'dayLearnFirst': false,
}


// new card insertion order
const NEW_CARDS_RANDOM = 0
const NEW_CARDS_DUE = 1

const STARTING_FACTOR = 2500

export const defaultDeckConf = {
    'name': "Default",
    'new': {
        'delays': [1, 10],
        'ints': [1, 4, 7], // 7 is not currently used
        'initialFactor': STARTING_FACTOR,
        'separate': true,
        'order': NEW_CARDS_DUE,
        'perDay': 20,
        // may not be set on old decks
        'bury': false,
    },
    'lapse': {
        'delays': [10],
        'mult': 0,
        'minInt': 1,
        'leechFails': 8,
        // type 0=suspend, 1=tagonly
        'leechAction': 0,
    },
    'rev': {
        'perDay': 200,
        'ease4': 1.3,
        'fuzz': 0.05,
        'minSpace': 1, // not currently used
        'ivlFct': 1,
        'maxIvl': 36500,
        // may not be set on old decks
        'bury': false,
        'hardFactor': 1.2,
    },
    'maxTaken': 60,
    'timer': 0,
    'autoplay': true,
    'replayq': true,
    'mod': 0,
    'usn': 0,
}

export const defaultDeck = {
    newToday: [0, 0], // currentDay, count
    revToday: [0, 0],
    lrnToday: [0, 0],
    timeToday: [0, 0], // time in ms
    conf: 1,
    usn: 0,
    desc: "",
    dyn: 0,  // anki uses int/bool interchangably here
    collapsed: false,
    // added in beta11
    extendNew: 10,
    extendRev: 50,
}

export class Deck {
    constructor(id, name, desc="") {
        this.id = id
        this.name = name
        this.desc = desc
        this.notes = []
    }

    addNote(note) {
        this.notes.push(note)
    }
}

export class Note {
    constructor(model, fields, tags = null, guid = null) {
        this.model = model
        this.fields = fields
        this.tags = tags
        this._guid = guid
    }

    get guid() {
        return this._guid ? this._guid : ankiHash(this.fields);
    }

    get cards() {
        if (this.model.props.type === MODEL_STD) {
            const isEmpty = f => {
                return !f || f.toString().trim().length === 0
            }
            const rv = []
            for (const [card_ord, any_or_all, required_field_ords] of this.model.props.req) {
                const op = any_or_all === "any" ? "some" : "every"
                if (required_field_ords[op](f => !isEmpty(this.fields[f]))) {
                    rv.push(card_ord)
                }
            }
            return rv
        } else {
            // the below logic is copied from anki's ModelManager._availClozeOrds
            const ords = new Set()
            const matches = []
            const curliesRe = /{{[^}]*?cloze:(?:[^}]?:)*(.+?)}}/g
            const percentRe = /<%cloze:(.+?)%>/g
            const { qfmt } = this.model.props.tmpls[0] // cloze models only have 1 template
            let m;
            while (m = curliesRe.exec(qfmt))
                matches.push(m[1])
            while (m = percentRe.exec(qfmt))
                matches.push(m[1])
            const map = {}
            this.model.props.flds.forEach((fld, i) => {
                map[fld.name] = [i, fld]
            })
            for (const fname of matches) {
                if (!(fname in map)) continue
                const ord = map[fname][0]
                const re = /{{c(\d+)::.+?}}/gs
                while (m = re.exec(this.fields[ord])) {
                    const i = parseInt(m[1])
                    if (i > 0)
                        ords.add(i - 1)
                }
            }
            if (ords.size === 0) {
                // empty clozes use first ord
                return [0]
            }
            return Array.from(ords)
        }
    }
}

export class Package {
    constructor() {
        this.db = null;
        this.decks = []
        this.media = []
    }

    setSqlJs(SQL) {
        this.db = SQL;
    }

    addDeck(deck) {
        this.decks.push(deck)
    }

    addMedia(data, name) {
        this.media.push({ name, data })
    }

    addMediaFile(filename, name = null) {
        this.media.push({ name: name || filename, filename })
    }

    writeToFile(filename) {
        let db = this.db;
        db.run(APKG_SCHEMA);

        this.write(db)

        let zip = new JSZip();

        const data = db.export();
        const buffer = new Uint8Array(data).buffer;
        
        zip.file("collection.anki2", buffer);

        const media_info = {}

        this.media.forEach((m, i) => {
            if (m.filename != null) {
                zip.file(i.toString(), m.filename)
            } else {
                zip.file(i.toString(), m.data)
            }

            media_info[i] = m.name
        })

        zip.file('media', JSON.stringify(media_info))

        zip.generateAsync({ type: "blob", mimeType: "application/apkg" }).then(function (content) {
            // see FileSaver.js
            saveAs(content, filename);
        });
    }


    write(db) {
        const now = new Date
        const models = {}
        const decks = {}

        // AnkiDroid failed to import subdeck, So add a Default deck
        decks["1"] = {...defaultDeck, id: 1, name: "Default"}

        this.decks.forEach(d => {
            d.notes.forEach(n => models[n.model.props.id] = n.model.props)
            decks[d.id] = {
                ...defaultDeck,
                id: d.id,
                name: d.name,
                desc: d.desc,
            }
        })

        const col = [
            null,                           // id
            (+now / 1000) | 0,              // crt
            +now,                           // mod
            +now,                           // scm
            11,                             // ver
            0,                              // dty
            0,                              // usn
            0,                              // ls
            JSON.stringify(defaultConf),    // conf
            JSON.stringify(models),         // models
            JSON.stringify(decks),          // decks
            JSON.stringify({ 1: { id: 1, ...defaultDeckConf } }),    // dconf
            JSON.stringify({}),             // tags
        ]

        db.prepare(`INSERT INTO col
         (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(col)

        const insert_notes = db.prepare(`INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) 
        VALUES (null, ?, ?, ?, ?, ?, ?, ?, 0, 0, '')`)

        const insert_cards = db.prepare(`INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) 
        VALUES (null, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, '')`)

        for (const deck of this.decks) {
            for (const note of deck.notes) {
                let tags = note.tags == null ? '' : note.tags.join(' ')
                insert_notes.run(
                    [
                        note.guid,                  // guid
                        note.model.props.id,        // mid
                        (+now / 1000) | 0,          // mod
                        -1,                         // usn
                        tags,                       // tags
                        note.fields.join('\x1f'),   // flds
                        0,                          // sfld
                    ])

                let rowID = db.exec("select last_insert_rowid();")
                let note_id = rowID[0]['values'][0][0];

                for (const card_ord of note.cards) {
                    insert_cards.run(
                        [
                            note_id,            // nid
                            deck.id,            // did
                            card_ord,           // ord
                            (+now / 1000) | 0,  // mod
                            -1,                 // usn
                            0,                  // type 0=new, 1=learning, 2=due 
                            0,                  // queue -1 for suspended
                        ])
                }
            }
        }
    }
}

/*
* [genanki]{@link https://github.com/kerrickstaley/genanki}
* @copyright Copyright (c) Kerrick Staley 2021
* @license The MIT License
*/

export const APKG_SCHEMA = `
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE col (
    id              integer primary key,
    crt             integer not null,
    mod             integer not null,
    scm             integer not null,
    ver             integer not null,
    dty             integer not null,
    usn             integer not null,
    ls              integer not null,
    conf            text not null,
    models          text not null,
    decks           text not null,
    dconf           text not null,
    tags            text not null
);
CREATE TABLE notes (
    id              integer primary key,   /* 0 */
    guid            text not null,         /* 1 */
    mid             integer not null,      /* 2 */
    mod             integer not null,      /* 3 */
    usn             integer not null,      /* 4 */
    tags            text not null,         /* 5 */
    flds            text not null,         /* 6 */
    sfld            integer not null,      /* 7 */
    csum            integer not null,      /* 8 */
    flags           integer not null,      /* 9 */
    data            text not null          /* 10 */
);
CREATE TABLE cards (
    id              integer primary key,   /* 0 */
    nid             integer not null,      /* 1 */
    did             integer not null,      /* 2 */
    ord             integer not null,      /* 3 */
    mod             integer not null,      /* 4 */
    usn             integer not null,      /* 5 */
    type            integer not null,      /* 6 */
    queue           integer not null,      /* 7 */
    due             integer not null,      /* 8 */
    ivl             integer not null,      /* 9 */
    factor          integer not null,      /* 10 */
    reps            integer not null,      /* 11 */
    lapses          integer not null,      /* 12 */
    left            integer not null,      /* 13 */
    odue            integer not null,      /* 14 */
    odid            integer not null,      /* 15 */
    flags           integer not null,      /* 16 */
    data            text not null          /* 17 */
);
CREATE TABLE revlog (
    id              integer primary key,
    cid             integer not null,
    usn             integer not null,
    ease            integer not null,
    ivl             integer not null,
    lastIvl         integer not null,
    factor          integer not null,
    time            integer not null,
    type            integer not null
);
CREATE TABLE graves (
    usn             integer not null,
    oid             integer not null,
    type            integer not null
);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
COMMIT;
`;
