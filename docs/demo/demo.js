function changePage(page) {
    document.getElementById("exportMsg").innerHTML = "";
    switch (page) {
        case 'example':
            document.getElementById("run_example").style.display = "block";
            document.getElementById("csv_to_apkg").style.display = "none";
            break;
        case 'csv_apkg':
            document.getElementById("run_example").style.display = "none";
            document.getElementById("csv_to_apkg").style.display = "block";
            break;
    }
}


var isInit = false;
var isShownDevTools = false;
function turnOnDevTools() {

    if (!isInit) {
        isInit = true;
        var script = document.createElement('script');
        script.src = "js/eruda.js";
        document.body.appendChild(script);
        script.onload = function () {
            eruda.init();
            eruda.show();
        }
    }

    if (isShownDevTools) {
        isShownDevTools = false;
        eruda.hide();

        document.getElementById("run_example").style.paddingBottom = "0%";
        document.getElementById("csv_to_apkg").style.paddingBottom = "0%";
    } else {
        isShownDevTools = true;    
        eruda.show();
        
        document.getElementById("run_example").style.paddingBottom = "50%";
        document.getElementById("csv_to_apkg").style.paddingBottom = "50%";
    }
}

// https://stackoverflow.com/questions/13243563/execute-javascript-from-textarea
function runCode() {
    var oldScript = document.getElementById('scriptContainer');
    var newScript;

    if (oldScript) {
        oldScript.parentNode.removeChild(oldScript);
    }

    newScript = document.createElement('script');
    newScript.id = 'scriptContainer';

    // get code text from code mirror
    newScript.text = editor.getValue();
    document.body.appendChild(newScript);
}


function changeCode(code) {
    var codeTitle = document.getElementById("codeTitle");

    switch (code) {
        case "code1":
            editor.setValue(code1);
            codeTitle.innerHTML = "Basic and reversed card";
            break;
        case "code2":
            editor.setValue(code2);
            codeTitle.innerHTML = "Two notes";
            break;
        case "code3":
            editor.setValue(code3);
            codeTitle.innerHTML = "Ten notes in loop";
            break;
        case "code4":
            editor.setValue(code4);
            codeTitle.innerHTML = "Two Chinese notes";
            break;
        case "code5":
            editor.setValue(code5);
            codeTitle.innerHTML = "Add image file";
            break;
    }
}

/**
 * Basic and reversed card
 */
var code1 = String.raw`var m = new Model({
    name: "Basic (and reversed card)",
    id: "1543634829843",
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
                          
  var d = new Deck(1276438724672, "Test Deck")
  
  d.addNote(m.note(['this is front', 'this is back']))
  
  var p = new Package()
  p.addDeck(d)
  
  p.writeToFile('deck.apkg')`;

/**
 * Two notes
 */
var code2 = String.raw`var m = new Model({
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

var d = new Deck(1347617346765, "Two notes")

d.addNote(m.note(['hello', 'world']))
d.addNote(m.note(['this is test', 'for anki']))

var p = new Package()
p.addDeck(d)
p.writeToFile('deck.apkg')`;

/**
 * Ten notes in loop
 */
var code3 = String.raw`var m = new Model({
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

var d = new Deck(1347617346765, "Ten notes in loop")

for (i = 0; i < 10; i++) {
    d.addNote(m.note(['front note ' + i, 'back note ' + i]))
}

var p = new Package()
p.addDeck(d)
p.writeToFile('deck.apkg')`;

/**
 * Two Chinese notes
 */
var code4 = String.raw`var m = new Model({
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

var d = new Deck(1347617346765, "Chinese New Words")

d.addNote(m.note(["如", "如", "rú", "according to, in accordance with, such as, as if, like, for example"]))
d.addNote(m.note(["比如", "譬如", "pìrú", "for example, such as"]))

var p = new Package()
p.addDeck(d)
p.writeToFile('chinese-deck.apkg')`;

/**
 * Add image file
 */
var code5 = String.raw`var m = new Model({
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
                    
var d = new Deck(1347617346765, "Add image file")

var imageFile = "favicon.ico";

d.addNote(m.note(['This is front and back side contains image.', '<img src="' + imageFile + '"></img>']))

var p = new Package()
p.addDeck(d)

fetch('favicon.ico').then(response => {
    if (!response.ok) {
        return null;
    }

    p.addMedia(response.blob(), imageFile);
    p.writeToFile('deck.apkg')
});`;


function showSnackbar(msg) {
    var x = document.getElementById("snackbar");

    x.innerHTML = msg;
    x.className = "show";

    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}