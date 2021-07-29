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
