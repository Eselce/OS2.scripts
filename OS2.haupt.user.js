// ==UserScript==
// @name        OS2.haupt
// @namespace   http://os.ongapo.com/
// @version     0.2
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

// ECMAScript 6: Erlaubt 'const', 'let', ...
/* jshint esnext: true */
/* jshint moz: true */

const __POKALRUNDEN = [ "1. Runde", "2. Runde", "3. Runde", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
const __QUALIRUNDEN = [ "Quali 1", "Quali 2", "Quali 3" ];
const __OSCRUNDEN   = [ "Viertelfinale", "Halbfinale", "Finale" ];
const __OSERUNDEN   = [ "Runde 1", "Runde 2", "Runde 3", "Runde 4", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
const __HINRUECK    = [ " Hin", " R\xFCck", "" ];

// Liefert einen vor den ersten ZAT zurueckgesetzten Spielplanzeiger
// saison Enthaelt die Nummer der laufenden Saison
// ligaSize Anzahl der Teams in dieser Liga (Gegner + 1)
// - ZAT pro Abrechnungsmonat
// - Saison
// - ZAT
// - GameType
// - Heim/Auswaerts
// - Gegner
// - Tore
// - Gegentore
// - Ligengroesse
// - Ligaspieltag
// - Pokalrunde
// - Eurorunde
// - Hin/Rueck
// - ZAT Rueck
// - ZAT Korr
function firstZAT(saison, ligaSize) {
    return {
        'anzZATpMonth' : ((saison < 2) ? 7 : 6),    // Erste Saison 7 ZAT, danach 6 ZAT...
        'saison'       : saison,
        'ZAT'          : 0,
        'gameType'     : 'spielfrei',
        'heim'         : true,
        'gegner'       : "",
        'gFor'         : 0,
        'gAga'         : 0,
        'ligaSize'     : ligaSize,
        'ligaSpieltag' : 0,
        'pokalRunde'   : 0,
        'euroRunde'    : -1,
        'hinRueck'     : 2,    // 0: Hin, 1: Rueck, 2: unbekannt
        'ZATrueck'     : 0,
        'ZATkorr'      : 0
    };
}

// Liefert den ZAT als String
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// longStats Formatiert die Langversion des Textes
function getZAT(currZAT, longStats) {
    return (longStats ? currZAT.gameType + ' ' + (currZAT.heim ? "Heim" : "Ausw\xE4rts") + ' ' : "") +
           (longStats ? '[' + currZAT.ligaSpieltag + ' ' + currZAT.pokalRunde + ' ' + currZAT.euroRunde + "] " : "") +
           (longStats ? '[' + currZAT.ZATrueck + __HINRUECK[currZAT.hinRueck] +
                        ' ' + ((currZAT.ZATkorr < 0) ? "" : '+') + currZAT.ZATkorr + "] " : "") +
           (longStats ? currZAT.gegner + ((currZAT.gFor > -1) ? " (" + currZAT.gFor + " : " + currZAT.gAga + ')' : "") + ' ' : "") +
           'S' + currZAT.saison + "-Z" + ((currZAT.ZAT < 10) ? '0' : "") + currZAT.ZAT;
}

// Spult die Daten um anzZAT ZAT vor und schreibt Parameter
// anhand des Spielplans fort. Also Spieltag, Runde, etc.
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// anzZAT Anzahl der ZAT, um die vorgespult wird
function incZAT(currZAT, anzZAT) {
    for (let i = 0; i < anzZAT; i++) {
        currZAT.ZAT++;
    }
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle, etwa "2 : 1" und liefert zwei Werte zurueck
// cell Tabellenzelle mit Eintrag "2 : 1"
// return { '2', '1' } im Beispiel
function getErgebnisFromCell(cell) {
    const __ERGEBNIS = cell.textContent.split(" : ", 2);

    return __ERGEBNIS;
}

// Ermittelt die Spielart aus einer Tabellenzelle, etwa "Liga : Heim" und liefert zwei Werte zurueck
// cell Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
// return { "Liga", "Heim" } im Beispiel
function getSpielArtFromCell(cell) {
    const __TEXT = cell.textContent.replace('\xA0', "").replace(':', "").replace("  ", ' ');
    const __SPIELART = __TEXT.split(' ', 2);

    return __SPIELART;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle und setzt tore/gtore im Spielplanzeiger
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell Tabellenzelle mit Eintrag "2 : 1"
function setErgebnisFromCell(currZAT, cell) {
    const __ERGEBNIS = getErgebnisFromCell(cell);

    if (__ERGEBNIS.length == 2) {
        currZAT.gFor = parseInt(__ERGEBNIS[0], 10);
        currZAT.gAga = parseInt(__ERGEBNIS[1], 10);
    } else {
        currZAT.gFor = -1;
        currZAT.gAga = -1;
    }
}

// Ermittelt die Spielart aus einer Tabellenzelle und setzt gameType/heim im Spielplanzeiger
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
function setSpielArtFromCell(currZAT, cell) {
    const __SPIELART = getSpielArtFromCell(cell);

    currZAT.gameType = __SPIELART[0];
    currZAT.heim     = (__SPIELART.length < 2) || (__SPIELART[1] === "Heim");
}

const __GAMETYPES = {
    "spielfrei" : 0,
    "Friendly"  : 1,
    "Liga"      : 2,
    "LP"        : 3,
    "OSEQ"      : 4,
    "OSE"       : 5,
    "OSCQ"      : 6,
    "OSC"       : 7
};

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// gameType Name des Wettbewerbs eines Spiels
// return OS2-ID fuer den Spieltyp (1 bis 7), 0 fuer spielfrei, -1 fuer ungueltig
function getGameTypeID(gameType) {
    const __ID = __GAMETYPES[gameType];

    return (__ID === undefined) ? -1 : __ID;
}

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// cell Tabellenzelle mit Link auf den Spielberichts-Link
// gameType Name des Wettbewerbs eines Spiels
// label Anzuklickender Text des neuen Links
// return HTML-Link auf die Preview-Seite fuer diesen Spielbericht
function getBilanzLinkFromCell(cell, gameType, label) {
    const __GAMETYPEID = getGameTypeID(gameType);
    let ret = "";

    if (cell.textContent != "Vorschau") {   // Nur falls Link nicht bereits vorhanden
        if (__GAMETYPEID > 1) {             // nicht moeglich fuer "Friendly" bzw. "spielfrei"
            const __SEARCHFUN = ":os_bericht(";
            let paarung = cell.innerHTML.substr(cell.innerHTML.indexOf(__SEARCHFUN) + __SEARCHFUN.length);

            paarung = paarung.substr(0, paarung.indexOf(')'));
            paarung = paarung.substr(0, paarung.lastIndexOf(','));
            paarung = paarung.substr(0, paarung.lastIndexOf(','));
            ret = ' <a href="javascript:spielpreview(' + paarung + ',' + __GAMETYPEID + ')">' + label + "</a>";
        }
    }

    return ret;
}

// Addiert einen Link auf die Bilanz hinter den Spielberichts-Link
// cell Tabellenzelle mit Link auf den Spielberichts-Link
// gameType Name des Wettbewerbs eines Spiels
// label Anzuklickender Text des neuen Links
function addBilanzLinkToCell(cell, gameType, label) {
    const __BILANZLINK = getBilanzLinkFromCell(cell, gameType, label);

    if (__BILANZLINK !== "") {
        cell.innerHTML += __BILANZLINK;
    }
}

// Gibt die laufende Nummer des ZAT im Text einer Zelle zurueck
// cell Tabellenzelle mit der ZAT-Nummer im Text
// return ZAT-Nummer im Text
function getZATNrFromCell(cell) {
    const __TEXT = cell.textContent.split(' ');
    let ZATNr = 0;

    for (let i = 1; (ZATNr === 0) && (i < __TEXT.length); i++) {
        if (__TEXT[i - 1] === "ZAT") {
            if (__TEXT[i] !== "ist") {
                ZATNr = parseInt(__TEXT[i], 10);
            }
        }
    }

    return ZATNr;
}

// Verarbeitet Ansicht "Haupt" (Managerbuero)
function procHaupt() {
    const __TTAGS = document.getElementsByTagName("table");
    const __TABLE = __TTAGS[2];
    const __CELLS = __TABLE.rows[0].cells;    // Aktuelle Eintraege

    const __SAISON = 10;
    const __LIGASIZE = 10;

    const __COLUMNINDEX = {
        'Art' : 1,
        'Geg' : 2,
        'Ber' : 2
    };

    const __ZAT = firstZAT(__SAISON, __LIGASIZE);
    const __NEXTZAT = getZATNrFromCell(__TTAGS[0].rows[2].cells[0]);    // "Der nächste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;

    __ZAT.gegner = __CELLS[__COLUMNINDEX.Geg].textContent;
    __ZAT.gegner = __ZAT.gegner.substr(0, __ZAT.gegner.indexOf(" ("));

    setSpielArtFromCell(__ZAT, __CELLS[__COLUMNINDEX.Art]);

    addBilanzLinkToCell(__CELLS[__COLUMNINDEX.Ber], __ZAT.gameType, "(Bilanz)");

    incZAT(__ZAT, __CURRZAT);

    console.log(__ZAT);
}

procHaupt();

// *** EOF ***
