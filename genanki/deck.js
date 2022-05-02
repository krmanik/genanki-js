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
