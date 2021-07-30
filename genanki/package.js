/****************************************************************************************
 * Copyright (c) 2021 Mani <infinyte01@gmail.com>                                       *
 *                                                                                      *
 *                                                                                      *
 * This program is free software; you can redistribute it and/or modify it under        *
 * the terms of the GNU General Public License as published by the Free Software        *
 * Foundation; either version 3 of the License, or (at your option) any later           *
 * version.                                                                             *
 *                                                                                      *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY      *
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A      *
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.             *
 *                                                                                      *
 * You should have received a copy of the GNU General Public License along with         *
 * this program.  If not, see <http://www.gnu.org/licenses/>.                           *
 *                                                                                      *
 * This file incorporates work covered by the following copyright and permission        *
 * notice:                                                                              *
 *                                                                                      *
 *      mkanki - generate decks for the Anki spaced-repetition software.                *
 *      Copyright (c) 2018  Jeremy Apthorp <nornagon@nornagon.net>                      *
 *                                                                                      *
 *      This program is free software: you can redistribute it and/or modify            *
 *      it under the terms of the GNU Affero General Public License (version 3) as      *
 *      published by the Free Software Foundation.                                      *
 *                                                                                      *
 *      This program is distributed in the hope that it will be useful,                 *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of                  *
 *      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                   *
 *      GNU Affero General Public License for more details.                             *
 *                                                                                      *
 *      You should have received a copy of the GNU Affero General Public License        *
 *      along with this program.  If not, see <https://www.gnu.org/licenses/>.          *
 ****************************************************************************************/

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

        // read file from emiscripten FS, emiscripten returns Uint8Array

        this.media.forEach((m, i) => {
            if (m.filename != null) {
                zip.file(i.toString(), m.filename)
            } else {
                zip.file(i.toString(), m.data)
            }

            media_info[i] = m.name
        })

        zip.file('media', JSON.stringify(media_info))

        zip.generateAsync({ type: "blob" }).then(function (content) {
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

        var note_id = -1;
        for (const deck of this.decks) {
            for (const note of deck.notes) {
                note_id++;

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