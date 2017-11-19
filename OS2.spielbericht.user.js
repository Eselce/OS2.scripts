// ==UserScript==
// @name OS2.spielbericht
// @version 1.0
// @description OS 2.0 - Ergänzt Summen- und Durchschnittswerte bei den Spielerstatistiken im Spielbericht
// @include http://os.ongapo.com/rep/saison/*
// @include http://online-soccer.eu/rep/saison/*
// @include http://www.online-soccer.eu/rep/saison/*
// @grant none
// ==/UserScript==

var borderString = "solid white 1px";
var playerStatistics = document.getElementsByTagName("table")[4];
var offsetsHorizontal = new Array(0, 0); // Linien in gesamter Breite zeichnen
var offsetsVertical = new Array(1, 2); // 1 Titel-Zeile und die 2 neuen Zeilen auslassen
// Die einfach zu berechnenden Spalten als Array
// ZK-% werden mit Summenprodukt-Funktion berechnet (3 = Index ZK% Heim, 14 = Index ZK% Auswaerts)
var simpleCols = new Array(2, 4, 5, 6, 7, 9, 10, 11, 12, 13);
var colsZkH = new Array(2, 3); // ZK und ZK-% Heim-Mannschaft
var colsZkA = new Array(13, 14); // ZK und ZK-% Auswaerts-Mannschaft
// Neue Zeilen
var sumRow = playerStatistics.insertRow(-1); // Summenzeile
var avgRow = playerStatistics.insertRow(-1); // Durchschnittszeile

// Zellen in den neuen Zeilen erzeugen
inflateRow(sumRow, playerStatistics.rows[0].cells.length);
inflateRow(avgRow, playerStatistics.rows[0].cells.length);
// Zeilenbeschriftung einfuegen
sumRow.cells[0].textContent = "Summe";
sumRow.cells[sumRow.cells.length - 1].textContent = "Summe";
avgRow.cells[0].textContent = "Durchschnitt";
avgRow.cells[avgRow.cells.length - 1].textContent = "Durchschnitt";
// Summe und Durchschnitt der "einfachen" Spalten berechnen und eintragen
var colIdx = 0;
var nonEmptyCellCount = 0;
var sumValue = 0;
var avgValue = 0.00;
for (var i = 0; i < simpleCols.length; i++) {
    colIdx = simpleCols[i];
    nonEmptyCellCount = getNonEmptyCellCount(playerStatistics, colIdx, offsetsVertical);
    // Summe
    sumValue = getColSum(playerStatistics, colIdx, offsetsVertical);
    sumRow.cells[colIdx].textContent = sumValue;
    // Durchschnitt
    avgValue = getColAvg(playerStatistics, colIdx, offsetsVertical);
    //avgRow.cells[colIdx].textContent = avgValue.toFixed(2);
}

// Durchschnitt der ZK-%-Spalten berechnen und eintragen
// Dazu die Zahl der gewonnenen Zweikaempfe berechnen und summieren und das Verhaeltnis zur Zahl der Zweikaempfe insgesamt bilden
var numberOfDuels = 0;
var numberOfDuelsWon = 0;
// Heim
numberOfDuels = getColSum(playerStatistics, colsZkH[0], offsetsVertical);
numberOfDuelsWon = Math.round(getColSumProduct(playerStatistics, colsZkH, offsetsVertical, true) / 100);
avgRow.cells[colsZkH[1]].textContent = (numberOfDuelsWon / numberOfDuels * 100).toFixed(2);
// Auswaerts
numberOfDuels = getColSum(playerStatistics, colsZkA[0], offsetsVertical);
numberOfDuelsWon = Math.round(getColSumProduct(playerStatistics, colsZkA, offsetsVertical, true) / 100);
avgRow.cells[colsZkA[1]].textContent = (numberOfDuelsWon / numberOfDuels * 100).toFixed(2);;

// Linien zeichnen
drawHorizontalLine(playerStatistics, 0, offsetsHorizontal);
drawHorizontalLine(playerStatistics, playerStatistics.rows.length - 1 - offsetsVertical[1], offsetsHorizontal);


// **************************************************************************************
// Hilfsfunktionen
// **************************************************************************************

// Erzeugt die uebergebene Anzahl von Zellen in der uebergebenen Zeile.
// row: Zeile, die aufgepumpt werden soll
// length: Anzahl der zu erzeugenden Zellen
function inflateRow(row, length) {
    for (var i = 0; i < length; i++) {
        row.insertCell(-1);
    }
}

// Liefert die Anzahl nichtleerer Zellen einer Spalte.
// table: Tabelle, in der die fragliche Spalte ist
// col: Index der Spalte, die inspiziert werden soll
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden
function getNonEmptyCellCount(table, col, offsets) {
    var returnValue = 0;
    for (var i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        if (table.rows[i].cells[col].textContent != "") { returnValue += 1; }
    }
    return returnValue;
}

// Liefert das Summenprodukt (wie in der Excel-Formel) von Spalten einer Tabelle.
// table: Tabelle, in der die fraglichen Spalten sind
// cols: Feld mit den Indizes der Spalten, deren Werte zeilenweise multipliziert werden sollen
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden
// round: Ob jeder Summand kaufmaennisch auf Ganzzahl gerundet werden soll
function getColSumProduct(table, cols, offsets, round) {
    var returnValue = 0;
    var product = 1;
    for (var i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        product = 1;
        for (var j = 0; j < cols.length; j++) {
            product *= stringToNumber(table.rows[i].cells[cols[j]].textContent);
        }
        if (round) { returnValue += Math.round(product); }
        else { returnValue += product; }
    }
    return returnValue;
}

// Liefert die Summe der Werte einer Spalte.
// table: Tabelle, in der die fragliche Spalte ist
// col: Index der Spalte, deren Werte summiert werden sollen
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden
function getColSum(table, col, offsets) {
    var returnValue = 0;
    for (var i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        returnValue += stringToNumber(table.rows[i].cells[col].textContent);
    }
    return returnValue;
}

// Liefert den Mittelwert der Werte einer Spalte. Leere Zellen werden ignoriert.
// table: Tabelle, in der die fragliche Spalte ist
// col: Index der Spalte, deren Mittelwert berechnet werden soll
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden
function getColAvg(table, col, offsets) {
    var returnValue = 0.0;
    var countValues = 0;
    var cellContent = "";
    for (var i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        cellContent = table.rows[i].cells[col].textContent;
        if (cellContent != "") {
            returnValue += stringToNumber(cellContent);
            countValues += 1;
        }
    }
    if (countValues != 0) { return returnValue / countValues; }
    else { return ""; }
}

// Zeichnet eine horizontale Linie in eine Tabelle.
// table: Tabelle, in der die Linie gezeichnet werden soll
// row: Index der Zeile, unterhalb derer die Linie gezeichnet werden soll
// offsets[0]/[1]: Anzahl Spalten links/rechts, in denen keine Linie gezeichnet werden soll
function drawHorizontalLine(table, rowIdx, offsets) {
    var row = table.rows[rowIdx];
    for (var i = offsets[0]; i < row.cells.length - offsets[1]; i++) {
        row.cells[i].style.borderBottom = borderString;
    }
}

// Wandelt einen String in eine Zahl um.
// Prozentzahlen-Strings werden als Zahl interpretiert (d.h. "100%" -> 1).
// Ganze Zahlen mit Tausenderpunkten werden erkannt, wenn sie mit "." gefolgt von 3 Ziffern enden.
// Dezimalzahlen werden erkannt, wenn sie mit "." gefolgt von beliebig vielen Ziffern enden.
// Da zuerst auf ganze Zahlen geprueft wird, koennen Dezimalzahlen nicht 3 Nachkommaziffern haben.
function stringToNumber(string) {
    // parseXXX interpretiert einen Punkt immer als Dezimaltrennzeichen
    var returnValue = "";
    var percent = false;
    // Buchstaben und Whitespaces entfernen
    string = string.replace(/[\sa-zA-Z]/g, "");
    // Auf % pruefen und % entfernen
    if (string.lastIndexOf("%") != -1) {
        percent = true;
        string = string.replace(/%/g, "");
    }
    var regexpWholeSimple = /^\d+$/;
    var regexpWholeWithDots = /^\d+(\.\d{3}){1,}$/;
    var regexpDecimal = /^\d*\.\d{1,}$/;
    if (regexpWholeSimple.test(string)) {
        // Einfache ganze Zahl
        returnValue = parseInt(string);
    } else if (regexpWholeWithDots.test(string)) {
        // Ganze Zahl mit Tausenderpunkten
        returnValue = parseInt(string.replace(/\./g, ""));
    } else if (regexpDecimal.test(string)) {
        // Dezimalzahl mit Punkt als Trennzeichen
        returnValue = parseFloat(string);
    } else {
        // Kein gueltiger String
        percent = false;
        returnValue = "";
    }
    if (percent) { returnValue /= 100; }
    return returnValue;
}
