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
