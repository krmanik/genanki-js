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
