// ==UserScript==
// @name OS2.training
// @description OS 2.0 - Berechnet die Trainingswahrscheinlichkeiten abhängig von der Art des Einsatzes
// @include http://os.ongapo.com/training.php
// @include http://online-soccer.eu/training.php
// @include http://www.online-soccer.eu/training.php
// ==/UserScript==

var trainingTable = document.getElementsByTagName("table")[2];
var titleProb1 = "Bankeinsatz";
var titleProb2 = "Teilweise";
var titleProb3 = "Durchgehend";

procTraining();
addWarning();

// Fuegt einen Hinweis zur maximalen Trainingswahrscheinlichkeit in den Textbereich ueber der Tabelle hinzu
function addWarning() {
    var warning1 = "Die in den Spalten \"" + titleProb1 + "\", \"" + titleProb2 + "\" und \"" + titleProb3 + "\" angegebenen Wahrscheinlichkeiten dienen nur zur Orientierung!"
    var warning2 = "Die maximale Wahrscheinlichkeit einer Aufwertung ist immer 99.00 %!";

    var table = document.getElementsByTagName("table")[1];
    var newCell1 = table.insertRow(-1).insertCell(-1);
    newCell1.setAttribute("colspan", 4, false);
    newCell1.textContent = warning1;
    //newCell1.style.color = "#FFFF00";
    var newCell2 = table.insertRow(-1).insertCell(-1);
    newCell2.setAttribute("colspan", 3, false);
    newCell2.textContent = warning2;
}

// Verarbeitet die Trainings-Seite
function procTraining() {
    var colIdxChance = 7;
    var colWidth = 80;

    // Ueberschriften hinzufuegen
    var titleRow = trainingTable.rows[0];
    appendCell(titleRow, titleProb1);
    appendCell(titleRow, titleProb2);
    appendCell(titleRow, titleProb3);

    // Breite der neuen Spalten festlegen
    for (var i = colIdxChance + 1; i < titleRow.cells.length; i++) {
        titleRow.cells[i].setAttribute("width", colWidth, false);
    }

    // Wahrscheinlichkeiten eintragen
    var currentRow;
    var color;
    var chance;
    for (var i = 1; i < trainingTable.rows.length; i++) {
        currentRow = trainingTable.rows[i];
        color = getColor(currentRow.cells[colIdxChance].className);
        probString = currentRow.cells[colIdxChance].textContent;
        for (var j = 1; j <= 3; j++) {
            appendCell(currentRow, getProbability(probString, j), color);
        }
    }
}

// Fuegt eine Zelle ans Ende der uebergebenen Zeile hinzu und fuellt sie
// row: Zeile, die verlaengert wird
// text: Textinhalt der neuen Zelle
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color) {
    row.insertCell(-1);
    var colIdx = row.cells.length - 1;
    row.cells[colIdx].textContent = content;
    row.cells[colIdx].style.color = color;
}

// Gibt die Trainingswahrscheinlichkeit zurueck
// Format der Rueckgabe: "aaa.bb %", "aa.bb %" bzw. "a.bb %" (keine Deckelung bei 99.00 %)
// probString: Basis-Wahrscheinlichkeit (= Tribuene) als Prozent-String
// mode: Art des Einsatzes: 0 - Tribuene, 1 - Bank, 2 - Teilweiser Einsatz, 3 - Volleinsatz
function getProbability(probString, mode) {
    var prob1 = 1.1;
    var prob2 = 1.25;
    var prob3 = 1.35;

    prob = parseFloat(probString);
    var returnValue = prob;
    switch(mode) {
        case 0: break;
        case 1: returnValue *= prob1; break;
        case 2: returnValue *= prob2; break;
        case 3: returnValue *= prob3; break;
    }

    returnValue = returnValue.toFixed(2).toString() + " %";
    if (returnValue == "0.00 %") { returnValue = ""; }
    return returnValue;
}

// Gibt die zur Position gehoerige Farbe zurueck
function getColor(pos) {
    switch (pos) {
        case "TOR": return "#FFFF00";
        case "ABW": return "#00FF00";
        case "DMI": return "#3366FF";
        case "MIT": return "#66FFFF";
        case "OMI": return "#FF66FF";
        case "STU": return "#FF0000";
        case "LEI": return "#FFFFFF";
        default:    return "";
    }
}
