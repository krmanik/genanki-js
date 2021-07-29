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