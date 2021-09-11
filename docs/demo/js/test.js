/*
  Test basic with 2 notes
 */
function test1() {
    const m = new Model({
        name: "Basic",
        id: "1542906796044",
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

    const d = new Deck(1347617346765, "hi")

    d.addNote(m.note(['hello', 'world']))
    d.addNote(m.note(['this is test', 'for anki']))

    const p = new Package()
    p.addDeck(d)
    p.writeToFile('deck.apkg')
}

/*
  Test basic with 10 notes in loop
 */
function test10() {
    const m = new Model({
        name: "Basic",
        id: "1542906796044",
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

    const d = new Deck(1347617346765, "hi")

    for (i = 0; i < 10; i++) {
        d.addNote(m.note(['front note ' + i, 'back note ' + i]))
    }

    const p = new Package()
    p.addDeck(d)
    p.writeToFile('deck.apkg')
}

/*
  Test basic with 2 chinese decks
 */
function test2() {
    const m = new Model({
        name: "Basic",
        id: "1542906796045",
        flds: [
            { name: "Simplified" },
            { name: "Traditional" },
            { name: "Pinyin" },
            { name: "Meaning" },
        ],
        req: [
            [0, "all", [0]],
        ],
        tmpls: [
            {
                name: "Card 1",
                qfmt: "{{Simplified}}\n\n{{Pinyin}}",
                afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Traditional}}\n\n{{Meaning}}",
            }
        ],
    })

    const d = new Deck(1347617346765, "Chinese New Words")

    d.addNote(m.note(["如", "如", "rú", "according to, in accordance with, such as, as if, like, for example"]))
    d.addNote(m.note(["比如", "譬如", "pìrú", "for example, such as"]))

    const p = new Package()
    p.addDeck(d)
    p.writeToFile('chinese-deck.apkg')
}

/*
  Test add image file
 */

async function testImage() {
    const m = new Model({
        name: "Basic Test",
        id: "3457826374725",
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
                       
    const d = new Deck(1347617346765, "hi")

    var imageFile = "favicon.ico";

    d.addNote(m.note(['This is front and back side contains image.', '<img src="' + imageFile + '"></img>']))

    const p = new Package()
    p.addDeck(d)
    
    let blob = await fetch('favicon.ico').then(response => {
        if (!response.ok) {
            return null;
        }
        return response.blob();
    });

    p.addMedia(blob, imageFile);
    p.writeToFile('deck.apkg')
}

/*
   Test add tags to note data
 */
function test4() {
    var m = new Model({
        name: "Basic (and reversed card) with tags",
        id: "1543634829848",
        flds: [
          { name: "Front" },
          { name: "Back" }
        ],
        req: [
          [ 0, "all", [ 0 ] ],
          [ 1, "all", [ 1 ] ]
        ],
        tmpls: [
          {
            name: "Card 1",
            qfmt: "{{Front}}",
            afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
          },
          {
            name: "Card 2",
            qfmt: "{{Back}}",
            afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Front}}",
          }
        ],
      })
                              
      var d = new Deck(1276438724687, "Test Deck with Tags")
      
      d.addNote(m.note(['this is front', 'this is back'], ['test_tag1', 'test_tag2']))
      
      var p = new Package()
      p.addDeck(d)
      
      p.writeToFile('deck.apkg')
}