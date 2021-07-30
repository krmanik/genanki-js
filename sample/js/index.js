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

const m = new Model({
    name: "Basic",
    id: "2156341623643",
    flds: [
        { name: "Front" },
        { name: "Back" }
    ],
    req: [
        [0, "all", [0]],
    ],
    tmpls: [
        {
            name: "Card 1",
            qfmt: "{{Front}}",
            afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
        }
    ],
})

const d = new Deck(1347617346765, "New deck")
const p = new Package()

// add note to deck
function addNote() {
    var front = document.getElementById("noteFront").value;
    var back = document.getElementById("noteBack").value;

    d.addNote(m.note([front, back]))

    document.getElementById("noteBack").value = "";
    document.getElementById("noteFront").value = "";
}

// add deck to package and export
function exportDeck() {
    p.addDeck(d)
    p.writeToFile('deck.apkg')
}