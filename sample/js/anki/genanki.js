const MODEL_STD = 0
const MODEL_CLOZE = 1

class Model {
    constructor(props) {
        this.props = {
            ...defaultModel,
            ...props,
            flds: props.flds.map((f, i) => ({ ...defaultField, ord: i, ...f })),
            tmpls: props.tmpls.map((t, i) => ({ ...defaultTemplate, ord: i, name: `Card ${i + 1}`, ...t })),
        }
        this.fieldNameToOrd = {}
        this.props.flds.forEach(f => { this.fieldNameToOrd[f.name] = f.ord })
    }

    note(fields, guid = null) {
        if (Array.isArray(fields)) {
            if (fields.length !== this.props.flds.length) {
                throw new Error(`Expected ${this.props.flds.length} fields for model '${this.props.name}' but got ${fields.length}`)
            }
            return new Note(this, fields, guid)
        } else {
            const field_names = Object.keys(fields)
            const fields_list = []
            field_names.forEach(field_name => {
                const ord = this.fieldNameToOrd[field_name]
                if (ord == null) throw new Error(`Field '${field_name}' does not exist in the model`)
                fields_list[ord] = fields[field_name]
            })
            return new Note(this, fields_list, guid)
        }
    }
}

class ClozeModel extends Model {
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

const defaultModel = {
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

const defaultField = {
    name: "",
    ord: null,
    sticky: false,
    rtl: false,
    font: "Arial",
    size: 20,
    media: [],
}

const defaultTemplate = {
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

const defaultConf = {
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

const defaultDeckConf = {
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

const defaultDeck = {
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

class Deck {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.notes = []
    }

    addNote(note) {
        this.notes.push(note)
    }
}

class Note {
    constructor(model, fields, guid = null) {
        this.model = model
        this.fields = fields
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

class Package {
    constructor() {
        this.decks = []
        this.media = []
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
        var db = new SQL.Database();
        db.run(APKG_SCHEMA);
        
        this.write(db)

        var zip = new JSZip();

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
        this.decks.forEach(d => {
            d.notes.forEach(n => models[n.model.props.id] = n.model.props)
            decks[d.id] = {
                ...defaultDeck,
                id: d.id,
                name: d.name,
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
                insert_notes.run(
                    [
                        note.guid,                  // guid
                        note.model.props.id,        // mid
                        (+now / 1000) | 0,          // mod
                        -1,                         // usn
                        '',                         // tags
                        note.fields.join('\x1f'),   //flds
                        0,                          // sfld
                    ])

                var rowID = db.exec("select last_insert_rowid();")
                var note_id = rowID[0]['values'][0][0];

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

const APKG_SCHEMA = `
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

var APKG_COL = `
INSERT INTO col VALUES(
    null,
    1411124400,
    1425279151694,
    1425279151690,
    11,
    0,
    0,
    0,
    '{
        "activeDecks": [
            1
        ],
        "addToCur": true,
        "collapseTime": 1200,
        "curDeck": 1,
        "curModel": "1425279151691",
        "dueCounts": true,
        "estTimes": true,
        "newBury": true,
        "newSpread": 0,
        "nextPos": 1,
        "sortBackwards": false,
        "sortType": "noteFld",
        "timeLim": 0
    }',
    '{}',
    '{
        "1": {
            "collapsed": false,
            "conf": 1,
            "desc": "",
            "dyn": 0,
            "extendNew": 10,
            "extendRev": 50,
            "id": 1,
            "lrnToday": [
                0,
                0
            ],
            "mod": 1425279151,
            "name": "Default",
            "newToday": [
                0,
                0
            ],
            "revToday": [
                0,
                0
            ],
            "timeToday": [
                0,
                0
            ],
            "usn": 0
        }
    }',
    '{
        "1": {
            "autoplay": true,
            "id": 1,
            "lapse": {
                "delays": [
                    10
                ],
                "leechAction": 0,
                "leechFails": 8,
                "minInt": 1,
                "mult": 0
            },
            "maxTaken": 60,
            "mod": 0,
            "name": "Default",
            "new": {
                "bury": true,
                "delays": [
                    1,
                    10
                ],
                "initialFactor": 2500,
                "ints": [
                    1,
                    4,
                    7
                ],
                "order": 1,
                "perDay": 20,
                "separate": true
            },
            "replayq": true,
            "rev": {
                "bury": true,
                "ease4": 1.3,
                "fuzz": 0.05,
                "ivlFct": 1,
                "maxIvl": 36500,
                "minSpace": 1,
                "perDay": 100
            },
            "timer": 0,
            "usn": 0
        }
    }',
    '{}'
);
`;