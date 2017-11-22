// ==UserScript==
// @name        OS2.haupt
// @namespace   http://os.ongapo.com/
// @version     0.12
// @copyright   2016+, Sven Loges (SLC)
// @description Managerbuero-Abschnitt aus dem Master-Script fuer Online Soccer 2.0
// @include     http://os.ongapo.com/haupt.php
// @include     http://os.ongapo.com/haupt.php?changetosecond=*
// @include     http://www.os.ongapo.com/haupt.php
// @include     http://www.os.ongapo.com/haupt.php?changetosecond=*
// @include     http://online-soccer.eu/haupt.php
// @include     http://online-soccer.eu/haupt.php?changetosecond=*
// @include     http://www.online-soccer.eu/haupt.php
// @include     http://www.online-soccer.eu/haupt.php?changetosecond=*
// @grant       none
// ==/UserScript==

// Ermittelt die Spielart aus einer Tabellenzelle, etwa "Liga : Heim" und liefert zwei Werte zurueck
// cell Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
// return { "Liga", "Heim" } im Beispiel
function getSpielArtFromCell(cell) {
    var ret = cell.textContent.split(" ", 2);

    if (ret.length > 1) {
        // Alle ":" und " " raus...
        ret[1] = ret[1].replace(":", "").replace(" ", "");
    }

    return ret;
}

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// gameType Name des Wettbewerbs eines Spiels
// return OS2-ID für den Spieltyp (1 bis 7)
function getGameTypeID(gameType) {
    var ID = -1;

    switch (gameType) {
        case "Friendly":   ID = 1; break;
        case "Liga":       ID = 2; break;
        case "LP":         ID = 3; break;
        case "OSEQ":       ID = 4; break;
        case "OSE":        ID = 5; break;
        case "OSCQ":       ID = 6; break;
        case "OSC":        ID = 7; break;
        default:           ID = 0; break;
    }

    return ID;
}

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// cell Tabellenzelle mit Link auf den Spielberichts-Link
// gameType Name des Wettbewerbs eines Spiels
// label Anzuklickender Text des neuen Links
// return HTML-Link auf die Preview-Seite für diesen Spielbericht
function getBilanzLinkFromCell(cell, gameType, label) {
    var bericht = cell.textContent;
    var gameTypeID = getGameTypeID(gameType);
    var ret = "";

    if (bericht != "Vorschau") {   // Nur falls Link nicht bereits vorhanden
        if (gameTypeID > 1) {      // nicht möglich für "Friendly" bzw. "spielfrei"
            var searchFun = "javascript:os_bericht(";
            var paarung = cell.innerHTML.substr(cell.innerHTML.indexOf(searchFun) + searchFun.length);
            paarung = paarung.substr(0, paarung.indexOf(")"));
            paarung = paarung.substr(0, paarung.lastIndexOf(","));
            paarung = paarung.substr(0, paarung.lastIndexOf(","));
            ret = " <a href=\"javascript:spielpreview(" + paarung + "," + gameTypeID + ")\">" + label + "</a>";
        }
    }

    return ret;
}

// Addiert einen Link auf die Bilanz hinter den Spielberichts-Link
// cell Tabellenzelle mit Link auf den Spielberichts-Link
// gameType Name des Wettbewerbs eines Spiels
// label Anzuklickender Text des neuen Links
function addBilanzLinkToCell(cell, gameType, label) {
    var bilanzLink = getBilanzLinkFromCell(cell, gameType, label);
    if (bilanzLink != "") {
        cell.innerHTML += bilanzLink;
    }
}

// Verarbeitet Ansicht "Haupt" (Managerbuero)
function procHaupt() {
    var table = document.getElementsByTagName("table")[2];

    var columnIndexArt = 1;
    var columnIndexBer = 2;

    var spielart = getSpielArtFromCell(table.rows[0].cells[columnIndexArt]);
    var gameType = spielart[0];

    addBilanzLinkToCell(table.rows[0].cells[columnIndexBer], gameType, "(Bilanz)");
}

procHaupt();

// *** EOF ***
