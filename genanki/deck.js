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
