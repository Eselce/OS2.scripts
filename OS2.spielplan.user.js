// ==UserScript==
// @name OS2.spielplan
// @namespace  http://os.ongapo.com/
// @version    0.4
// @copyright  2013+
// @author     Sven Loges (SLC)
// @description Spielplan-Abschnitt aus dem Master-Script fuer Online Soccer 2.0
// @include http://os.ongapo.com/st.php?s=*
// @include http://os.ongapo.com/showteam.php?s=*
// @include http://www.os.ongapo.com/st.php?s=*
// @include http://www.os.ongapo.com/showteam.php?s=*
// @include http://online-soccer.eu/st.php?s=*
// @include http://online-soccer.eu/showteam.php?s=*
// @include http://www.online-soccer.eu/st.php?s=*
// @include http://www.online-soccer.eu/showteam.php?s=*
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_registerMenuCommand
// ==/UserScript==

// ECMAScript 6: Erlaubt 'const'...
/* jshint esnext: true */
/* jshint moz: true */

// Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
var sepMonths = true;    // Im Spielplan Trennstriche zwischen den Monaten
var shortKom  = true;    // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
var showStats = true;    // Ergebnisse aufaddieren und Stand anzeigen
var longStats = false;   // Detailliertere Ausgabe des Stands

var __BORDERSTRING = "solid white 1px";
var borderString = __BORDERSTRING;                // Format der Trennlinie zwischen den Monaten

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    var indexS = url.lastIndexOf("s=");
    var st = url.match(/st\.php/);              // Teamansicht Popupfenster
    var showteam = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    var s = -1;                                 // Seitenindex (Rueckgabewert)

    // Wert von s (Seitenindex) ermitteln...
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "s=" und ggf. von '&'
    if (indexS < 0) {
        s = 0;
    } else if (showteam) {
        // Wert von s setzt sich aus allen Zeichen hinter "s=" zusammen
        s = parseInt(url.substring(indexS + 2, url.length), 10);
    } else {
        // Wert von s setzt sich aus allen Zeichen zwischen "s=" und '&' zusammen
        s = parseInt(url.substring(indexS + 2, url.indexOf('&', indexS)), 10);
    }

    return s;
}

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// saisons Alle "option"-Eintraege der Combo-Box
function getSaisonFromComboBox(saisons) {
    var saison = 0;
    var i;

    for (i = 0; i < saisons.length; i++) {
        if (saisons[i].outerHTML.match(/selected/)) {
            saison = saisons[i].textContent;
        }
    }

    return saison;
}

// Setzt eine Option dauerhaft und laedt die Seite neu
// name Name der Option als Speicherort
// value Zu setzender Wert
// return Gesetzter Wert
function setOption(name, value) {
    GM_setValue(name, value);
    window.location.reload();

    return value;
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
// option Derzeitiger Wert der Option
// menuOn Text zum Setzen im Menu
// funOn Funktion zum Setzen
// keyOn Hotkey zum Setzen im Menu
// menuOff Text zum Ausschalten im Menu
// funOff Funktion zum Ausschalten
// keyOff Hotkey zum Ausschalten im Menu
function registerMenuOption(opt, menuOn, funOn, keyOn, menuOff, funOff, keyOff) {
    var on  = (opt ? '*' : "");
    var off = (opt ? "" : '*');

    console.log("OPTION " + on + menuOn + on + " / " + off + menuOff + off);
    if (opt) {
        GM_registerMenuCommand(menuOff, funOff, keyOff);
    } else {
        GM_registerMenuCommand(menuOn, funOn, keyOn);
    }
}

// Baut das Benutzermenu fuer den Spielplan auf
function registerSpielplanMenu() {
    console.log("registerSpielplanMenu()");
    registerMenuOption(longStats, "Lange Stats", setLongStats, 'L', "Kurze Stats", setShortStats, 'K');
    registerMenuOption(showStats, "Stats ein", setShowStats, 'S', "Stats aus", setShowNoStats, 'S');
    registerMenuOption(shortKom, "Kurze Texte", setShortKom, 'T', "Lange Texte", setFullKom, 'T');
    registerMenuOption(sepMonths, "Monate trennen", setSepMonths, 'M', "Keine Monate", setNoSepMonths, 'M');
    GM_registerMenuCommand("Standard-Optionen", resetSpielplanOptions, 'O');
}

// Setzt die Optionen fuer Spielplan auf die "Werkseinstellungen" des Skripts
function resetSpielplanOptions() {
    GM_deleteValue("longStats");
    GM_deleteValue("showStats");
    GM_deleteValue("shortKom");
    GM_deleteValue("sepMonths");
    window.location.reload();
}

// Laedt die permament (ueber Menu) gesetzten Optionen fuer Spielplan
function loadSpielplanOptions() {
    sepMonths = GM_getValue("sepMonths", sepMonths);   // Im Spielplan Trennstriche zwischen den Monaten
    shortKom  = GM_getValue("shortKom",  shortKom);    // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
    showStats = GM_getValue("showStats", showStats);   // Ergebnisse aufaddieren und Stand anzeigen
    longStats = GM_getValue("longStats", longStats);   // Detailliertere Ausgabe des Stands
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

// Liefert einen vor den ersten ZAT zurueckgesetzten Spielplanzeiger
// saison Enthaelt die Nummer der laufenden Saison
// 0: Saison
// 1: ZAT
// 2: GameTypeID
// 3: Heim/Auswärts
// 4: Ligaspieltag
// 5: Pokalrunde
// 6: Eurorunde
// 7: Hin/Rueck
// 8: ZAT Rueck
// 9: ZAT Korr
function firstZAT(saison) {
    return [ saison, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
}

// Liefert den ZAT als String
// nextZAT Enthaelt den Spielplanzeiger auf den ZAT
function getStats(nextZAT) {
    return (longStats ? nextZAT[2] + ' ' + (nextZAT[3] ? "Ausw\xE4rts" : "Heim") + ' ' : "") +
           (longStats ? '[' + nextZAT[4] + ' ' + nextZAT[5] + ' ' + nextZAT[6] + "] " : "") +
           (longStats ? '[' + (nextZAT[7] ? "R\xFCck" : "Hin") + ' ' + nextZAT[8] +
                        ' ' + ((nextZAT[9] < 0) ? "" : '+') + nextZAT[9] : "") +
           'S' + nextZAT[0] + 'Z' + ((nextZAT[1] < 10) ? '0' : "") + nextZAT[1];
}

// Liefert eine auf 0 zurueckgesetzte Ergebnissumme
// stats Enthaelt die summierten Stats
// 0: Siege
// 1: Unentschieden
// 2: Niederlagen
// 3: Tore
// 4: Gegentore
// 5: Siegpunkte
function emptyStats() {
    return [ 0, 0, 0, 0, 0, 0 ];
}

// Liefert die Stats als String
// stats Enthaelt die summierten Stats
function getStats(stats) {
    return (longStats ? '[' + stats[0] + ' ' + stats[1] + ' ' + stats[2] + "] " : "/ ") +
           stats[3] + ':' + stats[4] + ' ' + ((stats[3] < stats[4]) ? "" : (stats[3] > stats[4]) ? '+' : "") +
           (stats[3] - stats[4]) + " (" + stats[5] + ')';
}

// Summiert ein Ergebnis auf die Stats und liefert den neuen Text zurueck
// stats Enthaelt die summierten Stats
// ergebnis Spielergebnis [ Eigene Tore, Gegentore ]
function addResultToStats(stats, ergebnis) {
    var ret = "";
    var sgn;
    var gfor;
    var gagainst;

    if (ergebnis.length == 2) {
        gfor = parseInt(ergebnis[0], 10);
        gagainst = parseInt(ergebnis[1], 10);
        sgn = ((gfor > gagainst) ? 0 : (gfor == gagainst) ? 1 : 2);
        stats[sgn]++;
        stats[3] += gfor;
        stats[4] += gagainst;
        stats[5] += ((sgn > 0) ? 2 - sgn : 3);

        ret = getStats(stats);
    }

    return ret;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle, etwa "2 : 1" und liefert zwei Werte zurueck
// cell Tabellenzelle mit Eintrag "2 : 1"
// return { '2', '1' } im Beispiel
function getErgebnisFromCell(cell) {
    var ret = cell.textContent.split(" : ", 2);

    return ret;
}

// Ermittelt die Spielart aus einer Tabellenzelle, etwa "Liga : Heim" und liefert zwei Werte zurueck
// cell Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
// return { "Liga", "Heim" } im Beispiel
function getSpielArtFromCell(cell) {
    var ret = cell.textContent.split(' ', 2);

    if (ret.length > 1) {
        // Alle ':' und ' ' raus...
        ret[1] = ret[1].replace(':', "").replace(' ', "");
    }

    return ret;
}

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// gameType Name des Wettbewerbs eines Spiels
// return OS2-ID fuer den Spieltyp (1 bis 7)
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
// return HTML-Link auf die Preview-Seite fuer diesen Spielbericht
function getBilanzLinkFromCell(cell, gameType, label) {
    var bericht = cell.textContent;
    var gameTypeID = getGameTypeID(gameType);
    var ret = "";

    if (bericht != "Vorschau") {   // Nur falls Link nicht bereits vorhanden
        if (gameTypeID > 1) {      // nicht moeglich fuer "Friendly" bzw. "spielfrei"
            var __SEARCHFUN = ":os_bericht(";
            var paarung = cell.innerHTML.substr(cell.innerHTML.indexOf(__SEARCHFUN) + __SEARCHFUN.length);

            paarung = paarung.substr(0, paarung.indexOf(')'));
            paarung = paarung.substr(0, paarung.lastIndexOf(','));
            paarung = paarung.substr(0, paarung.lastIndexOf(','));
            ret = ' <a href="javascript:spielpreview(' + paarung + ',' + gameTypeID + ')">' + label + "</a>";
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

    if (bilanzLink !== "") {
        cell.innerHTML += bilanzLink;
    }
}

// Verarbeitet Ansicht "Saisonplan"
function procSpielplan() {
    var __POKALRUNDEN = [ "1. Runde", "2. Runde", "3. Runde", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
    var __QUALIRUNDEN = [ "Quali 1", "Quali 2", "Quali 3" ];
    var __OSCRUNDEN = [ "Viertelfinale", "Halbfinale", "Finale" ];
    var __OSERUNDEN = [ "Runde 1", "Runde 2", "Runde 3", "Runde 4", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
    var __HINRUECK = [ " Hin", " R\xFCck", "" ];

    var table = document.getElementsByTagName("table")[2];
    var saisons = document.getElementsByTagName("option");
    var __SAISON = getSaisonFromComboBox(saisons);

    var __ANZZATPERMONTH = ((__SAISON < 2) ? 7 : 6);    // Erste Saison 7, danach 6...

    var __ROWOFFSETUPPER = 1;
    var __ROWOFFSETLOWER = 0;

    var __COLUMNINDEXART = 1;
    var __COLUMNINDEXGEG = 2;
    var __COLUMNINDEXERG = 3;
    var __COLUMNINDEXBER = 4;
    var __COLUMNINDEXZUS = 5;
    var __COLUMNINDEXKOM = 6;

    var ligaSpieltag = 0;
    var pokalRunde = 0;
    var euroRunde = -1;
    var hinrueckspiel = 0;
    var ZATrueck = 0;
    var ZATkorr = 0;
    var ZAT = 1;

    var zusatz;

    var stats;
    var ligaStats;
    var euroStats;

    var spielart;
    var ergebnis;
    var gameType;
    var gruppenPhase;

    var i;
    var j;

    loadSpielplanOptions();
    registerSpielplanMenu();

    ligaStats = emptyStats();

    for (i = __ROWOFFSETUPPER; i < table.rows.length - __ROWOFFSETLOWER; i++, ZAT++) {
        if (shortKom) {
            var kommentar = table.rows[i].cells[__COLUMNINDEXKOM].innerHTML;

            kommentar = kommentar.replace("Vorbericht(e)", 'V').replace("Kommentar(e)", 'K').replace("&amp;", '/').replace('&', '/');
            table.rows[i].cells[__COLUMNINDEXKOM].innerHTML = kommentar;
        }
        if ((ZAT > 12) && (ZAT % 10 == 5)) {    // passt fuer alle Saisons: 12, 20, 30, 40, 48, 58, 68 / 3, 15, 27, 39, 51, 63, 69
            pokalRunde++;
        }
        if ((ZAT + ZATkorr) % 6 == 4) {
            if (ZAT < 63) {
                ZATrueck = ZAT + 2;
                euroRunde++;
                hinrueckspiel = 0;
            } else {
                euroRunde = 10;    // Finale
                hinrueckspiel = 2;
            }
        }
        if (ZAT == ZATrueck) {
            hinrueckspiel = 1;   // 5, 7; 11, 13;  (17, 19)  / 23,   25; 29, 31; 35,  37; 41,  43; 47, 49; 53,  55; 59,  61; 69
            if (__SAISON < 3) {    // 4, 6; 10, 14*; (16, 22*) / 24**, 26; 34, 36; 38*, 42; 44*, 50; 52, 54; 56*, 60; 62*, 66; 70
                if (ZAT == 22) {
                    ZATkorr = 4;
                } else if ((ZAT - 6) % 20 > 6) {
                    ZATkorr = 2;
                } else {
                    ZATkorr = 0;
                }
                if ((ZAT == 22) || (ZAT == 30)) {
                    euroRunde--;    // Frueher: 3. Quali-Rueckspiel erst knapp vor 1. Hauptrunde
                }
            }
        }
        stats = "";
        spielart = getSpielArtFromCell(table.rows[i].cells[__COLUMNINDEXART]);
        ergebnis = getErgebnisFromCell(table.rows[i].cells[__COLUMNINDEXERG]);
        if (shortKom) {
            var cellArt = table.rows[i].cells[__COLUMNINDEXART]

            cellArt.innerHTML = cellArt.innerHTML.replace(": Heim", "(H)").replace(": Ausw\xE4rts", "(A)").replace("Friendly", "FSS");
        }
        table.rows[i].cells[__COLUMNINDEXZUS].className = table.rows[i].cells[__COLUMNINDEXART].className;
        if (table.rows[i].cells[__COLUMNINDEXZUS].textContent === "") {
            var cellBer = table.rows[i].cells[__COLUMNINDEXBER];

            zusatz = "";
            gameType = spielart[0];
            addBilanzLinkToCell(cellBer, gameType, "Bilanz");
            if (shortKom) {
                cellBer.innerHTML = cellBer.innerHTML.replace("Klick", "(*)").replace("Bilanz", 'V').replace("Vorschau", 'V');
            }
            if (gameType == "Liga") {
                if (ZAT < 70) {
                    stats = addResultToStats(ligaStats, ergebnis);
                    zusatz = ++ligaSpieltag + ". Spieltag";
                } else {
                    zusatz = "Relegation";
                }
            } else if (gameType == "LP") {
                zusatz = __POKALRUNDEN[pokalRunde];
            } else if ((gameType == "OSCQ") || (gameType == "OSEQ")) {
                if (hinrueckspiel != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                zusatz = __QUALIRUNDEN[euroRunde] + __HINRUECK[hinrueckspiel];
            } else if (gameType == "OSC") {
                if ((hinrueckspiel != 1) && ((euroRunde >= 8) || ((euroRunde - 2) % 3 === 0))) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                if (euroRunde < 8) {
                    gruppenPhase = ((euroRunde < 5) ? "HR-Grp. " : "ZR-Grp. ");
                    zusatz = gruppenPhase + "Spiel " + (((euroRunde - 2) % 3) * 2 + 1 + hinrueckspiel);
                } else {
                    zusatz = __OSCRUNDEN[euroRunde - 8] + __HINRUECK[hinrueckspiel];
                }
            } else if (gameType == "OSE") {
                if (hinrueckspiel != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                zusatz = __OSERUNDEN[euroRunde - 3] + __HINRUECK[hinrueckspiel];
            } else if (gameType == "Friendly") {
                zusatz = "";    // irgendwie besser lesbar!
            }
            if (showStats && (stats !== "")) {
                zusatz = zusatz + ' ' + stats;
            }
            table.rows[i].cells[__COLUMNINDEXZUS].textContent = zusatz;
        }
        if (sepMonths && (ZAT % __ANZZATPERMONTH === 0) && (i < table.rows.length - __ROWOFFSETLOWER - 1)) {
            for (j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].style.borderBottom = borderString;
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