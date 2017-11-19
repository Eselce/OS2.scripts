// ==UserScript==
// @name OS2.spielbericht.XXL
// @version 0.6
// @description Zählt Textbausteine
// @description OS 2.0 - Ergänzt Summen- und Durchschnittswerte bei den Spielerstatistiken im Spielbericht
// @include http://os.ongapo.com/rep/saison/*
// @include http://online-soccer.eu/rep/saison/*
// @include http://www.online-soccer.eu/rep/saison/*
// @grant none
// ==/UserScript==

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


// ==================== Funktionen neu für Textbausteine ====================

var gruppen = [ "Pass", "ZWK_ov","SCH", "Erfolg_l_TB"];
gruppen.Pass = [/spielt/i, /pass /i, / passt/i, /flankt/i, /zieht den Ball/i];
gruppen.ZWK_ov = [/versucht/i, /erk\u00E4mpft/i, /nicht vorbei/i, /nicht umspielen/i, /nicht \u00FCberspielen/i, /nicht mit einem/i];
gruppen.SCH = [/e eck/i, /link/i, /recht/i, /richtung/i, /aufs Tor/i, /kopfball/i, /volley/i, /zieht ab/i];
// gruppen.Ecken = [/zieht den Ball/i];
gruppen.Erfolg_l_TB = [/Keeper/i, /ABSEITS/i, /gefahrenzone/i, /der Ball/i, /kann den Ball/i, /Bein in/i, /streckt/i]; // TB überprüfen

var kopfz = [ "ZWKo", "ZWKo %","ZWKd", "ZWKd %","Pass", "P\u00E4sse %","Ansp."]; //der Tabelle berichtsstatistik
var kategorien = [ "Z_o_v", "Z_d_g","P_e", "P_f","Ansp_e", "Ansp_f","Sch_e","Sch_f"]; //zu zählende Elemente

function regexsuche (begriff) {
    var ergebnis = false;
    var x = 0;
    var y = 0;
    var temp = "";
    for (x = 0; x < gruppen.length - 1; x++) {
        temp = gruppen[x];
        for (y = 0; y < gruppen[temp].length; y++) {
            suche = gruppen[temp][y];
            ergebnis = suche.test(begriff.textContent);
            if (ergebnis === true) { break; }
        }
        if (ergebnis === true) {
            return temp;
        }
    }
    return "";
}

function tabelleneu () {
    node = document.getElementsByTagName("table")[4];
    node.parentNode.insertBefore(document.createElement("div"), node.nextSibling );
    node1 = document.getElementsByTagName("div")[6];
    node1.innerHTML = "<br><br><b>Es folgen die Berichtsstatistiken</b><br><br>";
    node1.parentNode.insertBefore(document.createElement("table"), node1.nextSibling );
    node2 = document.getElementsByTagName("table")[5];
    node2.innerHTML = node.innerHTML;
    node2.setAttribute("cellspacing", 2);
    node2.setAttribute("cellpadding", 2);
    node2.setAttribute("border", 0);

    for (var i = 0; i < kopfz.length; i++) {
        node2.rows[0].cells[i+1].textContent = kopfz[i];
        node2.rows[0].cells[i+kopfz.length+2].textContent = kopfz[i];
        for (var j = 1; j < node2.rows.length; j++) {
            node2.rows[j].cells[i+1].textContent = "";
            node2.rows[j].cells[i+kopfz.length+2].textContent = "";
        }
    }
}

function textbausteine(){
    var spielernamen = ["A", "B"];

    for (var j = 0; j < spielbericht.rows.length; j++) {     //Zeilen des Spielberichts
        var ergebnis = regexsuche(spielbericht.rows[j].cells[1]);
        spielerakt[j] = ["", "a"];
        ereignis[j] = ["", 0];
        if (ergebnis !== "") {  //SCH, PASS, ZWK_ov registriert
            // TB-Spalten inflateRow(spielbericht.rows[j], 4);

            spielernamen = spielbericht.rows[j].getElementsByTagName ("b");

            for (var i = 0; i < Math.min(2, spielernamen.length); i++) { // aktiven und passiven Spieler feststellen
                if ((/erk\u00E4mpft sich den Ball/i).test(spielbericht.rows[j].cells[1].textContent) === true) {
                    // TB-Spalten spielbericht.rows[j].cells[4-i].textContent = spielernamen[i].textContent;
                    // TB-Spalten spielbericht.rows[j].cells[3].textContent = spielbericht.rows[j-1].cells[4].textContent; // Zweikampfgegener aus der letzten Zeile
                    spielerakt[j][1-i] = spielernamen[i].textContent;
                    spielerakt[j][0] = spielerakt[j-1][1];
                }
                else if ((/nicht vorbei/i).test(spielbericht.rows[j].cells[1].textContent) === true) {
                    // TB-Spalten spielbericht.rows[j].cells[4-i].textContent = spielernamen[i].textContent;
                    spielerakt[j][1-i] = spielernamen[i].textContent;
                }
                else if ((/zieht den Ball/i).test(spielbericht.rows[j].cells[1].textContent) === true) {
                    // TB-Spalten spielbericht.rows[j].cells[4-i].textContent = spielernamen[i].textContent;
                    spielerakt[j][1-i] = spielernamen[i].textContent;
                }
                else {
                    // TB-Spalten spielbericht.rows[j].cells[3+i].textContent = spielernamen[i].textContent;
                    spielerakt[j][0+i] = spielernamen[i].textContent;
                }
            }

            // TB-Spalten spielbericht.rows[j].cells[2].textContent = ergebnis;
            ereignis[j][0] = ergebnis;

            if (ereignis[j][0] == "ZWK_ov") {
                // TB-Spalten spielbericht.rows[j].cells[5].textContent = "0";
                ereignis[j][1] = 0;
            }
            else {
                // TB-Spalten spielbericht.rows[j].cells[5].textContent = "1";
                ereignis[j][1] = 1;
            }
            if ((/TOR/).test(spielbericht.rows[j].cells[1].textContent) === true) { //Erfolgsmeldung zweiter Halbsatz
                // Erfolg! (TOR)
            }
            else {
                if ((/ - /).test(spielbericht.rows[j].cells[1].textContent) === true) { //Misserfolgsmeldung zweiter Halbsatz
                    // TB-Spalten spielbericht.rows[j].cells[5].textContent = "0";
                    ereignis[j][1] = 0;
                }
                else if ((/ABSEITS/).test(spielbericht.rows[j+1].cells[1].textContent) === true) { //Abseits Folgesatz
                    // TB-Spalten spielbericht.rows[j].cells[5].textContent = "0";
                    ereignis[j][1] = 0;
                }
                else if ((/ - /).test(spielbericht.rows[j+1].cells[1].textContent) === false) { //Erfolgsmeldung Folgesatz
                    ergebnis = false;
                    var x = 0;
                    var y = 0;
                    var temp = "Erfolg_l_TB";
                    for (y = 0; y < gruppen[temp].length; y++) {
                        suche = gruppen[temp][y];
                        ergebnis = suche.test(spielbericht.rows[j+1].cells[1].textContent);
                        if (ergebnis === true) {
                            // TB-Spalten spielbericht.rows[j].cells[5].textContent = "0";
                            ereignis[j][1] = 0;
                            break;
                        }
                    }
                }

                // hier weiter mit Erfolg (wovon? SCH?)--------------------------------------------------------------------------------------------------------------------------------
            }
        }
    }
}

function berstatistik () {
    for (i = 0; i < spielbericht.rows.length; i++) {  // Berichtszeilen
        switch (ereignis[i][0]) {
            case "Pass":
                for (j = 1; j < tabberstat.rows.length; j++) {  // Spieler
                    if (tabberstat.rows[j].cells[0].textContent == spielerakt[i][0]) {
                        tabberstat.rows[j].cells[5].textContent ++;
                        tabberstat.rows[j].cells[6].textContent = tabberstat.rows[j].cells[6].textContent * 1 + ereignis[i][1];
                    }
                    if (tabberstat.rows[j].cells[16].textContent == spielerakt[i][0]) {
                        tabberstat.rows[j].cells[13].textContent ++;
                        tabberstat.rows[j].cells[14].textContent = tabberstat.rows[j].cells[14].textContent * 1 + ereignis[i][1];
                    }
                    if (tabberstat.rows[j].cells[0].textContent == spielerakt[i][1]) {
                        tabberstat.rows[j].cells[7].textContent ++;
                    }
                    if (tabberstat.rows[j].cells[16].textContent == spielerakt[i][1]) {
                        tabberstat.rows[j].cells[15].textContent ++;
                    }
                }
                break;

            case "ZWK_ov":
                for (j = 1; j < tabberstat.rows.length; j++) {  // Spieler
                    if (tabberstat.rows[j].cells[0].textContent == spielerakt[i][0]) {
                        tabberstat.rows[j].cells[2].textContent ++;
                    }
                    if (tabberstat.rows[j].cells[16].textContent == spielerakt[i][0]) {
                        tabberstat.rows[j].cells[10].textContent ++;
                    }
                    if (tabberstat.rows[j].cells[0].textContent == spielerakt[i][1]) {
                        tabberstat.rows[j].cells[4].textContent ++;
                    }
                    if (tabberstat.rows[j].cells[16].textContent == spielerakt[i][1]) {
                        tabberstat.rows[j].cells[12].textContent ++;
                    }
                }
                break;

            case "SCH":
                // Anweisungen werden ausgeführt,
                // falls expression mit valueN übereinstimmt
                break;
            default:
                // nichts
        }
    }
    for (j = 1; j < tabberstat.rows.length; j++) {  // Spieler
        if (tabberstat.rows[j].cells[6].textContent !== "") tabberstat.rows[j].cells[6].textContent = (100 * tabberstat.rows[j].cells[6].textContent / tabberstat.rows[j].cells[5].textContent).toFixed(2);
        if (tabberstat.rows[j].cells[14].textContent !== "") tabberstat.rows[j].cells[14].textContent = (100 * tabberstat.rows[j].cells[14].textContent / tabberstat.rows[j].cells[13].textContent).toFixed(2);

        // Anzahl ZWK
        if (tabberstat.rows[j].cells[0].textContent !== "") tabberstat.rows[j].cells[1].textContent = (tabspielstat.rows[j].cells[2].textContent * tabspielstat.rows[j].cells[3].textContent / 100).toFixed(0) - tabberstat.rows[j].cells[4].textContent + tabberstat.rows[j].cells[2].textContent * 1;
        if (tabberstat.rows[j].cells[0].textContent !== "") tabberstat.rows[j].cells[3].textContent = (tabspielstat.rows[j].cells[2].textContent * (100 - tabspielstat.rows[j].cells[3].textContent) / 100).toFixed(0) - tabberstat.rows[j].cells[2].textContent + tabberstat.rows[j].cells[4].textContent * 1;
        if (tabberstat.rows[j].cells[16].textContent !== "") tabberstat.rows[j].cells[9].textContent = (tabspielstat.rows[j].cells[13].textContent * tabspielstat.rows[j].cells[14].textContent / 100).toFixed(0) - tabberstat.rows[j].cells[12].textContent + tabberstat.rows[j].cells[10].textContent * 1;
        if (tabberstat.rows[j].cells[16].textContent !== "") tabberstat.rows[j].cells[11].textContent = (tabspielstat.rows[j].cells[13].textContent * (100 - tabspielstat.rows[j].cells[14].textContent) / 100).toFixed(0) - tabberstat.rows[j].cells[10].textContent + tabberstat.rows[j].cells[12].textContent * 1;

        // ZWKo %
        if (tabberstat.rows[j].cells[1].textContent === "0") tabberstat.rows[j].cells[2].textContent = 0;
        else if (tabberstat.rows[j].cells[1].textContent === "") tabberstat.rows[j].cells[2].textContent = "";
        else tabberstat.rows[j].cells[2].textContent = (100 - tabberstat.rows[j].cells[2].textContent / tabberstat.rows[j].cells[1].textContent * 100).toFixed(2);
        if (tabberstat.rows[j].cells[9].textContent === "0") tabberstat.rows[j].cells[10].textContent = 0;
        else if (tabberstat.rows[j].cells[9].textContent === "") tabberstat.rows[j].cells[10].textContent = "";
        else tabberstat.rows[j].cells[10].textContent = (100 - tabberstat.rows[j].cells[10].textContent / tabberstat.rows[j].cells[9].textContent * 100).toFixed(2);

        // ZWKd %
        if (tabberstat.rows[j].cells[3].textContent === "0") tabberstat.rows[j].cells[4].textContent = 0;
        else if (tabberstat.rows[j].cells[3].textContent === "") tabberstat.rows[j].cells[4].textContent = "";
        else tabberstat.rows[j].cells[4].textContent = (tabberstat.rows[j].cells[4].textContent / tabberstat.rows[j].cells[3].textContent * 100).toFixed(2);
        if (tabberstat.rows[j].cells[11].textContent === "0") tabberstat.rows[j].cells[12].textContent = 0;
        else if (tabberstat.rows[j].cells[11].textContent === "") tabberstat.rows[j].cells[12].textContent = "";
        else tabberstat.rows[j].cells[12].textContent = (tabberstat.rows[j].cells[12].textContent / tabberstat.rows[j].cells[11].textContent * 100).toFixed(2);

        // Zellen nullen
        if (tabberstat.rows[j].cells[5].textContent === "") tabberstat.rows[j].cells[5].textContent = 0;
        if (tabberstat.rows[j].cells[6].textContent === "") tabberstat.rows[j].cells[6].textContent = 0;
        if (tabberstat.rows[j].cells[7].textContent === "") tabberstat.rows[j].cells[7].textContent = 0;
        if (tabberstat.rows[j].cells[13].textContent === "") tabberstat.rows[j].cells[13].textContent = 0;
        if (tabberstat.rows[j].cells[14].textContent === "") tabberstat.rows[j].cells[14].textContent = 0;
        if (tabberstat.rows[j].cells[15].textContent === "") tabberstat.rows[j].cells[15].textContent = 0;

    }
}

// ==================== Ende Funktionen für Textbausteine ====================



// ==================== Code neu für Textbausteine ====================

spielbericht = document.getElementsByTagName("table")[2];
spielerakt = Array(spielbericht.rows.length); // Beteiligte je Zeile
ereignis = Array(spielbericht.rows.length); // Ereignis, Erfolg je Zeile

textbausteine();
tabelleneu();

tabspielstat = document.getElementsByTagName("table")[4];
tabberstat = document.getElementsByTagName("table")[5];

berstatistik();



console.log("End of script");

// ==================== Ende Code für Textbausteine ====================








var borderString = "solid white 1px";
var playerStatistics = document.getElementsByTagName("table")[4];
var playerStatistics2 = document.getElementsByTagName("table")[5];
var offsetsHorizontal = new Array(0, 0); // Linien in gesamter Breite zeichnen
var offsetsVertical = new Array(1, 2); // 1 Titel-Zeile und die 2 neuen Zeilen auslassen
// Die einfach zu berechnenden Spalten als Array
// ZK-% werden mit Summenprodukt-Funktion berechnet (3 = Index ZK% Heim, 14 = Index ZK% Auswaerts)
var simpleCols = new Array(2, 4, 5, 6, 7, 9, 10, 11, 12, 13);
var colsZkH = new Array(2, 3); // ZK und ZK-% Heim-Mannschaft
var colsZkA = new Array(13, 14); // ZK und ZK-% Auswaerts-Mannschaft
var simpleCols2 = new Array(1, 3, 5, 7, 9, 11, 13, 15);
var colsZkH2 = new Array(1, 2); // ZK und ZK-% Heim-Mannschaft
var colsZkA2 = new Array(9, 10); // ZK und ZK-% Auswaerts-Mannschaft
var colsZkH3 = new Array(3, 4); // ZK und ZK-% Heim-Mannschaft
var colsZkA3 = new Array(11, 12); // ZK und ZK-% Auswaerts-Mannschaft
var colsZkH4 = new Array(5, 6); // ZK und ZK-% Heim-Mannschaft
var colsZkA4 = new Array(13, 14); // ZK und ZK-% Auswaerts-Mannschaft
// Neue Zeilen
var sumRow = playerStatistics.insertRow(-1); // Summenzeile
var avgRow = playerStatistics.insertRow(-1); // Durchschnittszeile
var sumRow2 = playerStatistics2.insertRow(-1); // Summenzeile
var avgRow2 = playerStatistics2.insertRow(-1); // Durchschnittszeile

// Zellen in den neuen Zeilen erzeugen
inflateRow(sumRow, playerStatistics.rows[0].cells.length);
inflateRow(avgRow, playerStatistics.rows[0].cells.length);
inflateRow(sumRow2, playerStatistics2.rows[0].cells.length);
inflateRow(avgRow2, playerStatistics2.rows[0].cells.length);
// Zeilenbeschriftung einfuegen
sumRow.cells[0].textContent = "Summe";
sumRow.cells[sumRow.cells.length - 1].textContent = "Summe";
avgRow.cells[0].textContent = "Durchschnitt";
avgRow.cells[avgRow.cells.length - 1].textContent = "Durchschnitt";
sumRow2.cells[0].textContent = "Summe";
sumRow2.cells[sumRow.cells.length - 1].textContent = "Summe";
avgRow2.cells[0].textContent = "Durchschnitt";
avgRow2.cells[avgRow.cells.length - 1].textContent = "Durchschnitt";
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
var colIdx2 = 0;
var nonEmptyCellCount2 = 0;
var sumValue2 = 0;
var avgValue2 = 0.00;
for (var i = 0; i < simpleCols2.length; i++) {
    colIdx2 = simpleCols2[i];
    nonEmptyCellCount2 = getNonEmptyCellCount(playerStatistics2, colIdx2, offsetsVertical);
    // Summe
    sumValue2 = getColSum(playerStatistics2, colIdx2, offsetsVertical);
    sumRow2.cells[colIdx2].textContent = sumValue2;
    // Durchschnitt
    avgValue2 = getColAvg(playerStatistics2, colIdx2, offsetsVertical);
    //avgRow.cells[colIdx].textContent = avgValue.toFixed(2);
}

// Durchschnitt der ZK-%-Spalten berechnen und eintragen
// Dazu die Zahl der gewonnenen Zweikaempfe berechnen und summieren und das Verhaeltnis zur Zahl der Zweikaempfe insgesamt bilden
var numberOfDuels = 0;
var numberOfDuelsWon = 0;
var numberOfDuels2 = 0;
var numberOfDuelsWon2 = 0;
// Heim
numberOfDuels = getColSum(playerStatistics, colsZkH[0], offsetsVertical);
numberOfDuelsWon = Math.round(getColSumProduct(playerStatistics, colsZkH, offsetsVertical, true) / 100);
avgRow.cells[colsZkH[1]].textContent = (numberOfDuelsWon / numberOfDuels * 100).toFixed(2);
numberOfDuels2 = getColSum(playerStatistics2, colsZkH2[0], offsetsVertical);
numberOfDuelsWon2 = Math.round(getColSumProduct(playerStatistics2, colsZkH2, offsetsVertical, true) / 100);
avgRow2.cells[colsZkH2[1]].textContent = (numberOfDuelsWon2 / numberOfDuels2 * 100).toFixed(2);
numberOfDuels2 = getColSum(playerStatistics2, colsZkH3[0], offsetsVertical);
numberOfDuelsWon2 = Math.round(getColSumProduct(playerStatistics2, colsZkH3, offsetsVertical, true) / 100);
avgRow2.cells[colsZkH3[1]].textContent = (numberOfDuelsWon2 / numberOfDuels2 * 100).toFixed(2);
numberOfDuels2 = getColSum(playerStatistics2, colsZkH4[0], offsetsVertical);
numberOfDuelsWon2 = Math.round(getColSumProduct(playerStatistics2, colsZkH4, offsetsVertical, true) / 100);
avgRow2.cells[colsZkH4[1]].textContent = (numberOfDuelsWon2 / numberOfDuels2 * 100).toFixed(2);
// Auswaerts
numberOfDuels = getColSum(playerStatistics, colsZkA[0], offsetsVertical);
numberOfDuelsWon = Math.round(getColSumProduct(playerStatistics, colsZkA, offsetsVertical, true) / 100);
avgRow.cells[colsZkA[1]].textContent = (numberOfDuelsWon / numberOfDuels * 100).toFixed(2);
numberOfDuels2 = getColSum(playerStatistics2, colsZkA2[0], offsetsVertical);
numberOfDuelsWon2 = Math.round(getColSumProduct(playerStatistics2, colsZkA2, offsetsVertical, true) / 100);
avgRow2.cells[colsZkA2[1]].textContent = (numberOfDuelsWon2 / numberOfDuels2 * 100).toFixed(2);
numberOfDuels2 = getColSum(playerStatistics2, colsZkA3[0], offsetsVertical);
numberOfDuelsWon2 = Math.round(getColSumProduct(playerStatistics2, colsZkA3, offsetsVertical, true) / 100);
avgRow2.cells[colsZkA3[1]].textContent = (numberOfDuelsWon2 / numberOfDuels2 * 100).toFixed(2);
numberOfDuels2 = getColSum(playerStatistics2, colsZkA4[0], offsetsVertical);
numberOfDuelsWon2 = Math.round(getColSumProduct(playerStatistics2, colsZkA4, offsetsVertical, true) / 100);
avgRow2.cells[colsZkA4[1]].textContent = (numberOfDuelsWon2 / numberOfDuels2 * 100).toFixed(2);

// Linien zeichnen
drawHorizontalLine(playerStatistics, 0, offsetsHorizontal);
drawHorizontalLine(playerStatistics, playerStatistics.rows.length - 1 - offsetsVertical[1], offsetsHorizontal);
drawHorizontalLine(playerStatistics2, 0, offsetsHorizontal);
drawHorizontalLine(playerStatistics2, playerStatistics2.rows.length - 1 - offsetsVertical[1], offsetsHorizontal);


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
