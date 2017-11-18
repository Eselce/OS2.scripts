// ==UserScript==
// @name        OS2.spielplan
// @namespace   http://os.ongapo.com/
// @version     0.53
// @copyright   2013+
// @author      Sven Loges (SLC)
// @description Spielplan-Abschnitt aus dem Master-Script fuer Online Soccer 2.0
// @include     http://os.ongapo.com/st.php?s=*
// @include     http://os.ongapo.com/showteam.php?s=*
// @include     http://www.os.ongapo.com/st.php?s=*
// @include     http://www.os.ongapo.com/showteam.php?s=*
// @include     http://online-soccer.eu/st.php?s=*
// @include     http://online-soccer.eu/showteam.php?s=*
// @include     http://www.online-soccer.eu/st.php?s=*
// @include     http://www.online-soccer.eu/showteam.php?s=*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

// ECMAScript 6: Erlaubt 'const', 'let', ...
/* jshint esnext: true */
/* jshint moz: true */

// Moegliche Optionen
const __SAISONS     = [ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ];
const __LIGASIZES   = [ 10, 18, 20 ];

// Trennlinie zwischen den Monaten
const __BORDERSTYLE = [ "solid", "hidden", "dotted", "dashed", "double", "groove", "ridge",
                        "inset", "outset", "none" ];       // Stil der Trennlinie
const __BORDERCOLOR = [ "white", "yellow", "black", "blue", "cyan", "gold", "grey", "green",
                        "lime", "magenta", "maroon", "navy", "olive", "orange", "purple",
                        "red", "teal", "transparent" ];    // Farbe der Trennlinie
const __BORDERWIDTH = [ "thin", "medium", "thick" ];       // Dicke der Trennlinie

// Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __SEPMONTHS = true;    // Im Spielplan Trennstriche zwischen den Monaten
const __SHORTKOM  = true;    // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
const __SHOWSTATS = true;    // Ergebnisse aufaddieren und Stand anzeigen
const __LONGSTATS = false;   // Detailliertere Ausgabe des Stands

const __SEPSTYLE  = __BORDERSTYLE[0];           // Stil der Trennlinie
const __SEPCOLOR  = __BORDERCOLOR[0];           // Farbe der Trennlinie
const __SEPWIDTH  = __BORDERWIDTH[0];           // Dicke der Trennlinie

const __SAISON      = __SAISONS[0];
const __LIGASIZE    = __LIGASIZES[0];

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url: Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    const __INDEXS = url.lastIndexOf("s=");
    const __ST = url.match(/st\.php/);              // Teamansicht Popupfenster
    const __SHOWTEAM = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    let s = -1;                                     // Seitenindex (Rueckgabewert)

    // Wert von s (Seitenindex) ermitteln...
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "s=" und ggf. von '&'
    if (__INDEXS < 0) {
        s = 0;
    } else if (__ST || __SHOWTEAM) {
        // Wert von s setzt sich aus allen Zeichen hinter "s=" zusammen
        s = parseInt(url.substring(__INDEXS + 2, url.length), 10);
    } else {
        // Wert von s setzt sich aus allen Zeichen zwischen "s=" und '&' zusammen
        s = parseInt(url.substring(__INDEXS + 2, url.indexOf('&', __INDEXS)), 10);
    }

    return s;
}

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// saisons: Alle "option"-Eintraege der Combo-Box
function getSaisonFromComboBox(saisons) {
    let saison = 0;

/*
    for (let entry of saisons) {
        if (entry.outerHTML.match(/selected/)) {
            saison = entry.textContent;
        }
    }
*/
    for (i = 0; i < saisons.length; i++) {
        if (saisons[i].outerHTML.match(/selected/)) {
            saison = saisons[i].textContent;
        }
    }

    return saison;
}

// Optionen (mit Standardwerten initialisiert und per loadSpielplanOptions() geladen):
let sepMonths = __SEPMONTHS;    // Im Spielplan Trennstriche zwischen den Monaten
let shortKom  = __SHORTKOM;     // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
let showStats = __SHOWSTATS;    // Ergebnisse aufaddieren und Stand anzeigen
let longStats = __LONGSTATS;    // Detailliertere Ausgabe des Stands

let sepStyle  = __SEPSTYLE;     // Stil der Trennlinie
let sepColor  = __SEPCOLOR;     // Farbe der Trennlinie
let sepWidth  = __SEPWIDTH;     // Dicke der Trennlinie

let saison   = __SAISON;
let ligaSize = __LIGASIZE;

// Setzt eine Option dauerhaft und laedt die Seite neu
// name: Name der Option als Speicherort
// value: Zu setzender Wert
// return Gesetzter Wert
function setOption(name, value) {
    GM_setValue(name, value);
    window.location.reload();

    return value;
}

// Setzt den naechsten Wert aus einer Array-Liste als Option
// arr: Array-Liste mit den moeglichen Optionen
// name: Name der Option als Speicherort
// value: Zu setzender Wert
// return Gesetzter Wert
function setNextOption(arr, name, value) {
    const __POS = arr.indexOf(value) + 1;

    return setOption(name, arr[(__POS < arr.length) ? __POS : 0]);
}

// Setzt das Stats-Format neu auf short/long
function setLongStatsFormat(long) {
    longStats = setOption("longStats", long);
}

// Setzt das Stats-Format neu auf an/aus
function setStatsShown(visible) {
    showStats = setOption("showStats", visible);
}

// Setzt das Kommentar-Link neu auf gekuerzt/lang
function setKomLength(isShort) {
    shortKom = setOption("shortKom", isShort);
}

// Setzt die Trennung der Monate neu auf an/aus
function setMonthsSeparated(on) {
    sepMonths = setOption("sepMonths", on);
}

// Zeigt den Eintrag im Menu einer Option
// opt: Derzeitiger Wert der Option
// menuOn: Text zum Setzen im Menu
// funOn: Funktion zum Setzen
// keyOn: Hotkey zum Setzen im Menu
// menuOff: Text zum Ausschalten im Menu
// funOff: Funktion zum Ausschalten
// keyOff: Hotkey zum Ausschalten im Menu
function registerMenuOption(opt, menuOn, funOn, keyOn, menuOff, funOff, keyOff) {
    const __ON  = (opt ? '*' : "");
    const __OFF = (opt ? "" : '*');

    console.log("OPTION " + __ON + menuOn + __ON + " / " + __OFF + menuOff + __OFF);
    if (opt) {
        GM_registerMenuCommand(menuOff, funOff, keyOff);
    } else {
        GM_registerMenuCommand(menuOn, funOn, keyOn);
    }
}

// Zeigt den Eintrag im Menu einer Option mit Wahl des naechsten Wertes
// opt: Derzeitiger Wert der Option
// arr: Array-Liste mit den moeglichen Optionen
// menu: Text zum Setzen im Menu
// fun: Funktion zum Setzen des naechsten Wertes
// key: Hotkey zum Setzen des naechsten Wertes im Menu
function registerNextMenuOption(opt, arr, menu, fun, key) {
    let options = "OPTION " + menu;

    for (let value of arr) {
        if (value === opt) {
            options += " / *" + value + '*';
        } else {
            options += " / " + value;
        }
    }
    console.log(options);
    GM_registerMenuCommand(menu, fun, key);
}

// Baut das Benutzermenu fuer den Spielplan auf
function registerSpielplanMenu() {
    console.log("registerSpielplanMenu()");
    registerMenuOption(longStats, "Lange Stats", setLongStats, 'L', "Kurze Stats", setShortStats, 'K');
    registerMenuOption(showStats, "Stats ein", setShowStats, 'S', "Stats aus", setShowNoStats, 'S');
    registerMenuOption(shortKom, "Kurze Texte", setShortKom, 'T', "Lange Texte", setFullKom, 'T');
    registerMenuOption(sepMonths, "Monate trennen", setSepMonths, 'M', "Keine Monate", setNoSepMonths, 'M');

    registerNextMenuOption(sepStyle, __BORDERSTYLE, "Stil: " + sepStyle, setNextSepStyle, 'i');
    registerNextMenuOption(sepColor, __BORDERCOLOR, "Farbe: " + sepColor, setNextSepColor, 'F');
    registerNextMenuOption(sepWidth, __BORDERWIDTH, "Dicke: " + sepWidth, setNextSepWidth, 'D');

    registerNextMenuOption(saison, __SAISONS, "Saison: " + saison, setNextSaison, 'a');
    registerNextMenuOption(ligaSize, __LIGASIZES, "Liga: " + ligaSize + "er", setNextLigaSize, 'i');

    GM_registerMenuCommand("Standard-Optionen", resetSpielplanOptions, 'O');
}

// Setzt die Optionen fuer Spielplan auf die "Werkseinstellungen" des Skripts
function resetSpielplanOptions() {
    GM_deleteValue("longStats");
    GM_deleteValue("showStats");
    GM_deleteValue("shortKom");
    GM_deleteValue("sepMonths");

    GM_deleteValue("sepStyle");
    GM_deleteValue("sepColor");
    GM_deleteValue("sepWidth");

    GM_deleteValue("saison");
    GM_deleteValue("ligaSize");

    window.location.reload();
}

// Laedt die permament (ueber Menu) gesetzten Optionen fuer Spielplan
function loadSpielplanOptions() {
    sepMonths = GM_getValue("sepMonths", sepMonths);   // Im Spielplan Trennstriche zwischen den Monaten
    shortKom  = GM_getValue("shortKom",  shortKom);    // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
    showStats = GM_getValue("showStats", showStats);   // Ergebnisse aufaddieren und Stand anzeigen
    longStats = GM_getValue("longStats", longStats);   // Detailliertere Ausgabe des Stands

    sepStyle  = GM_getValue("sepStyle",  sepStyle);    // Stil der Trennlinie
    sepColor  = GM_getValue("sepColor",  sepColor);    // Farbe der Trennlinie
    sepWidth  = GM_getValue("sepWidth",  sepWidth);    // Dicke der Trennlinie

    saison    = GM_getValue("saison",   saison);
    ligaSize  = GM_getValue("ligaSize", ligaSize);
}

// Setzt das Stats-Format neu auf short
function setShortStats() {
    setLongStatsFormat(false);
}

// Setzt das Stats-Format neu auf long
function setLongStats() {
    setLongStatsFormat(true);
}

// Setzt das Stats-Format neu auf aus
function setShowNoStats() {
    setStatsShown(false);
}

// Setzt das Stats-Format neu auf an
function setShowStats() {
    setStatsShown(true);
}

// Setzt das Kommentar-Link neu auf kurz
function setShortKom() {
    setKomLength(true);
}

// Setzt das Kommentar-Link neu auf lang
function setFullKom() {
    setKomLength(false);
}

// Setzt Trennungslinien zwischen die Monate
function setSepMonths() {
    setMonthsSeparated(true);
}

// Entfernt die Trennungslinien zwischen den Monaten
function setNoSepMonths() {
    setMonthsSeparated(false);
}

// Setzt den naechsten Stil der Trennlinie als Option
function setNextSepStyle() {
    sepStyle = setNextOption(__BORDERSTYLE, "sepStyle", sepStyle);
}

// Setzt die naechste Farbe der Trennlinie als Option
function setNextSepColor() {
    sepColor = setNextOption(__BORDERCOLOR, "sepColor", sepColor);
}

// Setzt die naechste Dicke der Trennlinie als Option
function setNextSepWidth() {
    sepWidth = setNextOption(__BORDERWIDTH, "sepWidth", sepWidth);
}

// Setzt die naechste moegliche Saison als Option
function setNextSaison() {
    saison = setNextOption(__SAISONS, "saison", saison);
}

// Setzt die naechste moegliche Ligagroesse als Option
function setNextLigaSize() {
    ligaSize = setNextOption(__LIGASIZES, "ligaSize", ligaSize);
}

// Beschreibungstexte aller Runden
const __POKALRUNDEN = [ "1. Runde", "2. Runde", "3. Runde", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
const __QUALIRUNDEN = [ "Quali 1", "Quali 2", "Quali 3" ];
const __OSCRUNDEN   = [ "Viertelfinale", "Halbfinale", "Finale" ];
const __OSERUNDEN   = [ "Runde 1", "Runde 2", "Runde 3", "Runde 4", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
const __HINRUECK    = [ " Hin", " R\xFCck", "" ];

// Liefert einen vor den ersten ZAT zurueckgesetzten Spielplanzeiger
// saison: Enthaelt die Nummer der laufenden Saison
// ligaSize: Anzahl der Teams in dieser Liga (Gegner + 1)
// - ZATs pro Abrechnungsmonat
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
        'gameType'     : "spielfrei",
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
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// longStats: Formatiert die Langversion des Textes
function getZAT(currZAT, longStats) {
    return (longStats ? currZAT.gameType + ' ' + (currZAT.heim ? "Heim" : "Ausw\xE4rts") + ' ' : "") +
           (longStats ? '[' + currZAT.ligaSpieltag + ' ' + currZAT.pokalRunde + ' ' + currZAT.euroRunde + "] " : "") +
           (longStats ? '[' + currZAT.ZATrueck + __HINRUECK[currZAT.hinRueck] +
                        ' ' + ((currZAT.ZATkorr < 0) ? "" : '+') + currZAT.ZATkorr + "] " : "") +
           (longStats ? currZAT.gegner + ((currZAT.gFor > -1) ? " (" + currZAT.gFor + " : " + currZAT.gAga + ')' : "") + ' ' : "") +
           'S' + currZAT.saison + "-Z" + ((currZAT.ZAT < 10) ? '0' : "") + currZAT.ZAT;
}

// Liefert die ZATs der Sonderspieltage fuer 10er- (2) und 20er-Ligen (4)
// saison: Enthaelt die Nummer der laufenden Saison
// return [ 10erHin, 10erRueck, 20erHin, 20erRueck ], ZAT-Nummern der Zusatzspieltage
function getLigaExtra(saison) {
    if (saison < 3) {
        return [ 8, 64, 32, 46 ];
    } else {
        return [ 9, 65, 33, 57 ];
    }
}

// Spult die Daten um anzZAT ZATs vor und schreibt Parameter
// anhand des Spielplans fort. Also Spieltag, Runde, etc.
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// anzZAT: Anzahl der ZAT, um die vorgespult wird
function incZAT(currZAT, anzZAT = 1) {
    const __LIGAEXTRA = getLigaExtra(currZAT.saison);
    const __LIGAFIRST = 3 - (__LIGAEXTRA[0] % 2);
    let zusatz = "";

    for (let i = anzZAT; i > 0; i--) {
        currZAT.ZAT++;
        if ((currZAT.ZAT - __LIGAFIRST + 1) % 2 === 1) {
            currZAT.ligaSpieltag++;
        } else {
            const __POS = __LIGAEXTRA.indexOf(currZAT.ZAT);

            if (__POS > -1) {
                if (__POS < 2 * (currZAT.ligaSize % 9)) {
                    currZAT.ligaSpieltag++;
                }
            }
        }
        if ((currZAT.ZAT > 12) && (currZAT.ZAT % 10 == 5)) {    // passt fuer alle Saisons: 12, 20, 30, 40, 48, 58, 68 / 3, 15, 27, 39, 51, 63, 69
            currZAT.pokalRunde++;
        }
        if ((currZAT.ZAT + currZAT.ZATkorr) % 6 == 4) {
            if (currZAT.ZAT < 63) {
                currZAT.ZATrueck = currZAT.ZAT + 2;
                currZAT.euroRunde++;
                currZAT.hinRueck = 0;
            } else {
                currZAT.euroRunde = 10;    // Finale
                currZAT.hinRueck = 2;
            }
        }
        if (currZAT.ZAT == currZAT.ZATrueck) {
            currZAT.hinRueck = 1;        // 5, 7; 11, 13;  (17, 19)  / 23,   25; 29, 31; 35,  37; 41,  43; 47, 49; 53,  55; 59,  61; 69
            if (currZAT.saison < 3) {    // 4, 6; 10, 14*; (16, 22*) / 24**, 26; 34, 36; 38*, 42; 44*, 50; 52, 54; 56*, 60; 62*, 66; 70
                if (currZAT.ZAT == 22) {
                    currZAT.ZATkorr = 4;
                } else if ((currZAT.ZAT - 6) % 20 > 6) {
                    currZAT.ZATkorr = 2;
                } else {
                    currZAT.ZATkorr = 0;
                }
                if ((currZAT.ZAT == 22) || (currZAT.ZAT == 30)) {
                    currZAT.euroRunde--;    // Frueher: 3. Quali-Rueckspiel erst knapp vor 1. Hauptrunde
                }
            }
        }
    }
}

// Liefert die Beschreibung des Spiels am aktuellen ZAT
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// return Beschreibung des Spiels
function getZusatz(currZAT) {
    let zusatz = "";

    if (currZAT.gameType == "Liga") {
        if (currZAT.ZAT < 70) {
            zusatz = currZAT.ligaSpieltag + ". Spieltag";
        } else {
            zusatz = "Relegation";
        }
    } else if (currZAT.gameType == "LP") {
        zusatz = __POKALRUNDEN[currZAT.pokalRunde];
    } else if ((currZAT.gameType == "OSCQ") || (currZAT.gameType == "OSEQ")) {
        zusatz = __QUALIRUNDEN[currZAT.euroRunde] + __HINRUECK[currZAT.hinRueck];
    } else if (currZAT.gameType == "OSC") {
        if (currZAT.euroRunde < 8) {
            const __GRUPPENPHASE = ((currZAT.euroRunde < 5) ? "HR-Grp. " : "ZR-Grp. ");
            zusatz = __GRUPPENPHASE + "Spiel " + (((currZAT.euroRunde - 2) % 3) * 2 + 1 + currZAT.hinRueck);
        } else {
            zusatz = __OSCRUNDEN[currZAT.euroRunde - 8] + __HINRUECK[currZAT.hinRueck];
        }
    } else if (currZAT.gameType == "OSE") {
        zusatz = __OSERUNDEN[currZAT.euroRunde - 3] + __HINRUECK[currZAT.hinRueck];
    } else {
        zusatz = "";    // irgendwie besser lesbar! ("Friendly" bzw. "spielfrei"/"Frei"/"reserviert")
    }

    return zusatz;
}

// Liefert eine auf 0 zurueckgesetzte Ergebnissumme
// - Siege
// - Unentschieden
// - Niederlagen
// - Tore
// - Gegentore
// - Siegpunkte
function emptyStats() {
    return {
        'S'    : 0,
        'U'    : 0,
        'N'    : 0,
        'gFor' : 0,
        'gAga' : 0,
        'P'    : 0
    };
}

// Liefert die Stats als String
// stats: Enthaelt die summierten Stats
// longStats: Formatiert die Langversion des Textes
function getStats(stats, longStats) {
    return (longStats ? '[' + stats.S + ' ' + stats.U + ' ' + stats.N + "] " : "/ ") +
           stats.gFor + ':' + stats.gAga + ' ' + ((stats.gFor < stats.gAga) ? "" : (stats.gFor > stats.gAga) ? '+' : "") +
           (stats.gFor - stats.gAga) + " (" + stats.P + ')';
}

// Summiert ein Ergebnis auf die Stats und liefert den neuen Text zurueck
// stats: Enthaelt die summierten Stats
// longStats: Formatiert die Langversion des Textes
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT (mit dem Ergebnis)
function addResultToStats(stats, longStats, currZAT) {
    let ret = "";

    if (currZAT.gFor > -1) {
        let p = 0;

        if (currZAT.gFor > currZAT.gAga) {
            stats.S++;
            p = 3;
        } else if (currZAT.gFor == currZAT.gAga) {
            stats.U++;
            p = 1;
        } else {
            stats.N++;
        }
        stats.P += p;
        stats.gFor += currZAT.gFor;
        stats.gAga += currZAT.gAga;

        ret = getStats(stats, longStats);
    }

    return ret;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle, etwa "2 : 1" und liefert zwei Werte zurueck
// cell: Tabellenzelle mit Eintrag "2 : 1"
// return { '2', '1' } im Beispiel
function getErgebnisFromCell(cell) {
    const __ERGEBNIS = cell.textContent.split(" : ", 2);

    return __ERGEBNIS;
}

// Ermittelt die Spielart aus einer Tabellenzelle, etwa "Liga : Heim" und liefert zwei Werte zurueck
// cell: Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
// return { "Liga", "Heim" } im Beispiel
function getSpielArtFromCell(cell) {
    const __TEXT = cell.textContent.replace("&nbsp;", "").replace(':', "").replace("  ", " ");
    const __SPIELART = __TEXT.split(' ', 2);

    return __SPIELART;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle und setzt tore/gtore im Spielplanzeiger
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell: Tabellenzelle mit Eintrag "2 : 1"
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
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell: Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
function setSpielArtFromCell(currZAT, cell) {
    const __SPIELART = getSpielArtFromCell(cell);

    currZAT.gameType = __SPIELART[0];
    currZAT.heim     = (__SPIELART.length < 2) || (__SPIELART[1] === "Heim");
}

const __GAMETYPES = {    // "Blind FSS gesucht!"
    "reserviert" : 0,
    "Frei"       : 0,
    "spielfrei"  : 0,
    "Friendly"   : 1,
    "Liga"       : 2,
    "LP"         : 3,
    "OSEQ"       : 4,
    "OSE"        : 5,
    "OSCQ"       : 6,
    "OSC"        : 7
};

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// gameType: Name des Wettbewerbs eines Spiels
// return OS2-ID fuer den Spieltyp (1 bis 7), 0 fuer spielfrei/Frei/reserviert, -1 fuer ungueltig
function getGameTypeID(gameType) {
    const __ID = __GAMETYPES[gameType];

    return (__ID === undefined) ? -1 : __ID;
}

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// cell: Tabellenzelle mit Link auf den Spielberichts-Link
// gameType: Name des Wettbewerbs eines Spiels
// label: Anzuklickender Text des neuen Links
// return HTML-Link auf die Preview-Seite fuer diesen Spielbericht
function getBilanzLinkFromCell(cell, gameType, label) {
    const __GAMETYPEID = getGameTypeID(gameType);
    let ret = "";

    if (cell.textContent != "Vorschau") {   // Nur falls Link nicht bereits vorhanden
        if (__GAMETYPEID > 1) {             // nicht moeglich fuer "Friendly" bzw. "spielfrei"/"Frei"/"reserviert"
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
// cell: Tabellenzelle mit Link auf den Spielberichts-Link
// gameType: Name des Wettbewerbs eines Spiels
// label: Anzuklickender Text des neuen Links
function addBilanzLinkToCell(cell, gameType, label) {
    const __BILANZLINK = getBilanzLinkFromCell(cell, gameType, label);

    if (__BILANZLINK !== "") {
        cell.innerHTML += __BILANZLINK;
    }
}

// Ermittelt aus dem Spielplan die Ligengroesse ueber die Sonderspieltage
// rows: Tabellenzeilen mit dem Spielplan
// startIdx: Index der Zeile mit dem ersten ZAT
// colArtIdx: Index der Spalte der Tabellenzelle mit der Spielart (z.B. "Liga : Heim")
// saison: Enthaelt die Nummer der laufenden Saison
// return 10 bei 36 Spielen, 18 bei 34 Spielen, 20 bei 38 Spielen
function getLigaSizeFromSpielplan(rows, startIdx, colArtIdx, saison) {
    const __LIGAEXTRA = getLigaExtra(saison);
    const __TEST10ER = getSpielArtFromCell(rows[startIdx + __LIGAEXTRA[0] - 1].cells[colArtIdx]);
    const __TEST20ER = getSpielArtFromCell(rows[startIdx + __LIGAEXTRA[2] - 1].cells[colArtIdx]);

    if (__TEST20ER[0] == "Liga") {
        return 20;
    } else if (__TEST10ER[0] == "Liga") {
        return 10;
    } else {
        return 18;
    }
}

// Verarbeitet Ansicht "Saisonplan"
function procSpielplan() {
    const __TABLE = document.getElementsByTagName("table")[2];
    const __BOXSAISONS = document.getElementsByTagName("option");

    const __ROWOFFSETUPPER = 1;
    const __ROWOFFSETLOWER = 0;

    const __COLUMNINDEX = {
        'Art' : 1,
        'Geg' : 2,
        'Erg' : 3,
        'Ber' : 4,
        'Zus' : 5,
        'Kom' : 6
    };

    loadSpielplanOptions();

    saison = getSaisonFromComboBox(__BOXSAISONS);
    ligaSize = getLigaSizeFromSpielplan(__TABLE.rows, __ROWOFFSETUPPER, __COLUMNINDEX.Art, saison);

    const __ZAT = firstZAT(saison, ligaSize);

    let ligaStats = emptyStats();
    let euroStats = emptyStats();

    registerSpielplanMenu();

    for (let i = __ROWOFFSETUPPER; i < __TABLE.rows.length - __ROWOFFSETLOWER; i++) {
        const __CELLS = __TABLE.rows[i].cells;    // Aktuelle Eintraege

        incZAT(__ZAT);

        __ZAT.gegner = __CELLS[__COLUMNINDEX.Geg].textContent;

        setSpielArtFromCell(__ZAT, __CELLS[__COLUMNINDEX.Art]);
        setErgebnisFromCell(__ZAT, __CELLS[__COLUMNINDEX.Erg]);

        let zusatz = getZusatz(__ZAT);

        if (shortKom) {
            let kommentar = __CELLS[__COLUMNINDEX.Kom].innerHTML;
            let spielArt  = __CELLS[__COLUMNINDEX.Art].innerHTML;

            kommentar = kommentar.replace("Vorbericht(e)", 'V').replace("Kommentar(e)", 'K').replace("&amp;", '/').replace('&', '/');
            spielArt  = spielArt.replace(": Heim", "(H)").replace(": Ausw\xE4rts", "(A)").replace("Friendly", "FSS");

            __CELLS[__COLUMNINDEX.Kom].innerHTML = kommentar;
            __CELLS[__COLUMNINDEX.Art].innerHTML = spielArt;
        }
        __CELLS[__COLUMNINDEX.Zus].className = __CELLS[__COLUMNINDEX.Art].className;
        if (__CELLS[__COLUMNINDEX.Zus].textContent === "") {
            const __CELLBER = __CELLS[__COLUMNINDEX.Ber];
            let stats = "";

            addBilanzLinkToCell(__CELLBER, __ZAT.gameType, "Bilanz");

            if (shortKom) {
                __CELLBER.innerHTML = __CELLBER.innerHTML.replace("Klick", "(*)").replace("Bilanz", 'V').replace("Vorschau", 'V');
            }

            if (__ZAT.gameType == "Liga") {
                if (__ZAT.ZAT < 70) {
                    stats = addResultToStats(ligaStats, longStats, __ZAT);
                }
            } else if ((__ZAT.gameType == "OSCQ") || (__ZAT.gameType == "OSEQ") || (__ZAT.gameType == "OSE")) {
                if (__ZAT.hinRueck != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, longStats, __ZAT);
            } else if (__ZAT.gameType == "OSC") {
                if ((__ZAT.hinRueck != 1) && ((__ZAT.euroRunde >= 9) || ((__ZAT.euroRunde % 3) === 0))) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, longStats, __ZAT);
            }

            if (showStats && (stats !== "")) {
                zusatz = zusatz + ' ' + stats;
            }
            __CELLS[__COLUMNINDEX.Zus].textContent = zusatz;
        }
        if (sepMonths && (__ZAT.ZAT % __ZAT.anzZATpMonth === 0) && (i < __TABLE.rows.length - __ROWOFFSETLOWER - 1)) {
            const __BORDERSTRING = sepStyle + ' ' + sepColor + ' ' + sepWidth;    // Format der Trennlinie zwischen den Monaten

/*
            for (let entry of __CELLS) {
                entry.style.borderBottom = __BORDERSTRING;
            }
*/
            for (let j = 0; j < __CELLS.length; j++) {
                __CELLS[j].style.borderBottom = __BORDERSTRING;
            }
        }
    }
}

// URL-Legende:
// s=0: Teamuebersicht
// s=1: Vertragsdaten
// s=2: Einzelwerte
// s=3: Statistik Saison
// s=4: Statistik Gesamt
// s=5: Teaminfo
// s=6: Saisonplan
// s=7: Vereinshistorie
// s=8: Transferhistorie
// s=9: Leihhistorie

// Verzweige in unterschiedliche Verarbeitungen je nach Wert von s:
switch (getPageIdFromURL(window.location.href)) {
    case 6: procSpielplan(); break;
}

// *** EOF ***