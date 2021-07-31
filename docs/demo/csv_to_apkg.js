var content = null;
var firstLine = null;
var fieldsCount = null;
var file = null;
var reader = null;
var delimiter = null;

function inputFile() {
    file = document.getElementById("file").files[0];
    reader = new FileReader();
}

function importFile() {
    try {

        delimiter = document.getElementById('fieldSeparatedBy').value;

        if (delimiter == "tab") {
            delimiter = "\t";
        } else if (delimiter == "comma") {
            delimiter = ",";
        }

        reader.readAsText(file);
        reader.onload = evt => {
            content = evt.target.result;
            //console.log(content);

            firstLine = content.split('\n').shift();
            console.log(firstLine);



            document.getElementById("firstEntry").innerHTML = `<div class='card' style='margin: 10px;'>
                                        <div class='card-body'>
                                                <div><h4>First Line of the file<h4></div>`
                + firstLine +
                `</div></div>`;

            fieldsCount = firstLine.split(delimiter).length;
            // console.log(fieldsCount);

            var fields = "";
            var j = 0;



            for (i = 0; i < fieldsCount; i++) {
                j = i + 1;
                fields += `<div  style='margin: 10px;'><div style="display: inline;">
                <label for='field`+ i + `'>Field ` + j + `</label>
                <input id='field`+ i + `' type='text'></input>
                <br>
                <div style="display: inline;">
                  <input class="form-check-input" type="checkbox" value="" id="checkFront`+ i + `">
                  <label class="form-check-label" for="checkFront`+ i + `">
                    Front
                  </label>
                </div>
          
                  <div style="display: inline; margin-left: 20px;">
                  <input class="form-check-input" type="checkbox" value="" id="checkBack`+ i + `">
                  <label class="form-check-label" for="checkBack`+ i + `">
                    Back
                  </label>
                </div>
              </div>
              </div>
              <br>
              `
            }

            document.getElementById('fields').innerHTML = fields;

            document.getElementById("fields-card").style.display = "block";
            document.getElementById("fields-msg").innerHTML = "<h5>Enter fields name</h5>";
        }

    } catch (error) {
        console.error(error);
        document.getElementById("fields-card").style.display = "none";
        showSnackbar("Failed to import file. Check file or try again");
    }

}


function exportDeck() {
    // type conversion from javascript to python
    var field;
    var fields = [];

    var front = "";
    var back = "";

    for (i = 0; i < fieldsCount; i++) {
        checkFront = document.getElementById("checkFront" + i).checked;
        checkBack = document.getElementById("checkBack" + i).checked;

        field = "field" + i
        fl = document.getElementById(field).value;

        if (fl == "") {
            showSnackbar("fields are empty");
            return;
        }

        fields.push({ name: fl });

        if (!checkFront && !checkBack) {
            showSnackbar("select fields as front, back or both");
            return;
        }

        if (checkFront) {
            front += "{{" + fl + "}}\n<br>\n"
        }

        if (checkBack) {
            back += "{{" + fl + "}}\n<br>\n"
        }
    }

    const m = new Model({
        name: "Basic",
        id: "3765467234656",
        flds: fields,
        req: [
            [0, "all", [0]],
        ],
        tmpls: [
            {
                name: "Card 1",
                qfmt: front,
                afmt: back,
            }
        ],
    })

    deckName = document.getElementById("deckName").value;
    if (deckName == "" || deckName == undefined) {
        showSnackbar("Enter a valid deck name")
        return;
    }

    try {
        document.getElementById("exportMsg").innerHTML = "Wait... Decks are exporting";

        const d = new Deck(1347617346765, deckName)

        var lines = content.split("\n");
        var notAddedCount = 0;
        var addedCount = 0;
        var notAddedTxt = "";
        for (l of lines) {
            // console.log(l);
            var noteData = l.split("\t");

            if (noteData.length == fieldsCount) {
                addedCount++;
                d.addNote(m.note(noteData))
            } else {
                notAddedCount++;
                notAddedTxt += l + "\n";
                showSnackbar(notAddedCount + " card not added. View notAdded.txt files");
            }

            document.getElementById("exportMsg").innerHTML = addedCount + " card added and exporetd to the decks";
        }

        // not added text
        if (notAddedTxt.trim() != "") {
            var filename = "notAdded.txt";
            var blob = new Blob([notAddedTxt], {
                type: "text/plain;charset=utf-8"
            });
            setTimeout(function(){ saveAs(blob, filename); }, 500);
        }

        const p = new Package()
        p.addDeck(d)

        p.writeToFile('Export-Deck.apkg')
    } catch (err) {
        console.error(err)
        document.getElementById("exportMsg").innerHTML = err;
        showSnackbar("Error exporting deck, check tsv file's fields")
    }

}