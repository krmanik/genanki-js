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
