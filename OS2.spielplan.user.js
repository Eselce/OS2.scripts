// ==UserScript==
// @name OS2.spielplan
// @namespace  http://os.ongapo.com/
// @version    0.4
// @copyright  2013+, Sven Loges (SLC)
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
// @grant GM_registerMenuCommand
// ==/UserScript==

// Optionen (hier editieren):
var sepMonths = GM_getValue("sepMonths", true);    // Im Spielplan Striche zwischen den Monaten
var shortKom  = GM_getValue("shortKom",  true);    // Vorbericht(e) & Kommentar(e) nicht ausschreiben
var showStats = GM_getValue("showStats", true);    // Ergebnisse aufaddieren und Stand anzeigen
var longStats = GM_getValue("longStats", false);   // Detailliertere Ausgabe des Stands

var borderString = "solid white 1px";

registerMenu();

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    var indexS = url.lastIndexOf("s=");
    var st = url.match(/st\.php/);              // Teamansicht Popupfenster
    var showteam = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    var s = -1;                                 // Seitenindex (Rueckgabewert)

    // Wert von s (Seitenindex) ermitteln...
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "s=" und ggf. von "&"
    if (indexS < 0) {
        s = 0;
    } else if (showteam) {
        // Wert von s setzt sich aus allen Zeichen hinter "s=" zusammen
        s = parseInt(url.substring(indexS + 2, url.length), 10);
    } else {
        // Wert von s setzt sich aus allen Zeichen zwischen "s=" und "&" zusammen
        s = parseInt(url.substring(indexS + 2, url.indexOf("&", indexS)), 10);
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

// Baut das User-Menue auf
function registerMenu() {
    GM_registerMenuCommand("Short format", setShortStats, "S");
    GM_registerMenuCommand("Long format", setLongStats, "L");
    GM_registerMenuCommand("No stats", setShowNoStats, "N");
    GM_registerMenuCommand("Show stats", setShowStats, "h");
    GM_registerMenuCommand("Short links", setShortKom, "l");
    GM_registerMenuCommand("Full links", setFullKom, "F");
    GM_registerMenuCommand("Mark months", setSepMonths, "M");
    GM_registerMenuCommand("Unmark months", setNoSepMonths, "U");
}

// Setzt das Stats-Format neu auf short/long
function setLongStatsFormat(long) {
    longStats = long;
    GM_setValue("longStats", longStats);
}

// Setzt das Stats-Format neu auf an/aus
function setStatsShown(visible) {
    showStats = visible;
    GM_setValue("showStats", showStats);
}

// Setzt das Kommentar-Link neu auf gekürzt/lang
function setKomLength(isShort) {
    shortKom = isShort;
    GM_setValue("shortKom", shortKom);
}

// Setzt die Trennung der Monate neu auf an/aus
function setMonthsSeparated(on) {
    sepMonths = on;
    GM_setValue("sepMonths", sepMonths);
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

// Setzt das Kommentar-Link neu auf gekürzt
function setShortKom() {
    setKomLength(true);
}

// Setzt das Kommentar-Link neu auf lang
function setFullKom() {
    setKomLength(false);
}

// Setzt zwischen den Monaten Trennungslinien
function setSepMonths() {
    setMonthsSeparated(true);
}

// Entfernt die Trennungslinien zwischen den Monaten
function setNoSepMonths() {
    setMonthsSeparated(false);
}

// Liefert eine auf 0 zurueckgesetzte Ergebnissumme
// stats Enthaelt die summierten Stats
function emptyStats(stats) {
    return [ 0, 0, 0, 0, 0, 0 ];
}

// Liefert die Stats als String
// stats Enthaelt die summierten Stats
function getStats(stats) {
    return (longStats ? "[" + stats[0] + " " + stats[1] + " " + stats[2] + "] " : "/ ") + stats[3] + ":" + stats[4] + " "
    + ((stats[3] < stats[4]) ? "" : ((stats[3] > stats[4]) ? "+" : "")) + (stats[3] - stats[4]) + " (" + stats[5] + ")";
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
        sgn = (gfor > gagainst) ? 0 : (gfor == gagainst) ? 1 : 2;
        stats[sgn]++;
        stats[3] += gfor;
        stats[4] += gagainst;
        stats[5] += (sgn > 0) ? 2 - sgn : 3;

        ret = getStats(stats);
    }

    return ret;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle, etwa "2 : 1" und liefert zwei Werte zurueck
// cell Tabellenzelle mit Eintrag "2 : 1"
// return { "2", "1" } im Beispiel
function getErgebnisFromCell(cell) {
    var ret = cell.textContent.split(" : ", 2);

    return ret;
}

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
// return OS2-ID fÃ¼r den Spieltyp (1 bis 7)
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
// return HTML-Link auf die Preview-Seite fÃ¼r diesen Spielbericht
function getBilanzLinkFromCell(cell, gameType, label) {
    var bericht = cell.textContent;
    var gameTypeID = getGameTypeID(gameType);
    var ret = "";

    if (bericht != "Vorschau") {   // Nur falls Link nicht bereits vorhanden
        if (gameTypeID > 1) {      // nicht mÃ¶glich fÃ¼r "Friendly" bzw. "spielfrei"
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

// Verarbeitet Ansicht "Saisonplan"
// sepMonths Im Spielplan Striche zwischen den Monaten
// shortKom Vorbericht(e) & Kommentar(e) nicht ausschreiben
// showStats Ergebnisse aufaddieren?
function procSpielplan(sepMonths, shortKom, showStats) {
    var pokalRunden = [ "1. Runde", "2. Runde", "3. Runde", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
    var qualiRunden = [ "Quali 1", "Quali 2", "Quali 3" ];
    var oscRunden = [ "Viertelfinale", "Halbfinale", "Finale" ];
    var oseRunden = [ "Runde 1", "Runde 2", "Runde 3", "Runde 4", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
    var hinrueck = [ " Hin", " Rück", "" ];

    var table = document.getElementsByTagName("table")[2];
    var saisons = document.getElementsByTagName("option");
    var saison = getSaisonFromComboBox(saisons);

    var anzZATperMonth = (saison < 2) ? 7 : 6;	// Erste Saison 7, danach 6...

    var rowOffsetUpper = 1;
    var rowOffsetLower = 0;

    var columnIndexArt = 1;
    var columnIndexErg = 3;
    var columnIndexBer = 4;
    var columnIndexZus = 5;
    var columnIndexKom = 6;

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

    ligaStats = emptyStats();

    for (i = rowOffsetUpper; i < table.rows.length - rowOffsetLower; i++, ZAT++) {
        if (shortKom) {
            var kommentar = table.rows[i].cells[columnIndexKom].innerHTML;
            kommentar = kommentar.replace("Vorbericht(e)", "V").replace("Kommentar(e)", "K").replace("&amp;", "/").replace("&", "/");
            table.rows[i].cells[columnIndexKom].innerHTML = kommentar;
        }
        if ((ZAT > 12) && (ZAT % 10 == 5)) {	// passt fuer alle Saisons: 12, 20, 30, 40, 48, 58, 68 / 3, 15, 27, 39, 51, 63, 69
            pokalRunde++;
        }
        if ((ZAT + ZATkorr) % 6 == 4) {
            if (ZAT < 63) {
                ZATrueck = ZAT + 2;
                euroRunde++;
                hinrueckspiel = 0;
            } else {
                euroRunde = 10;	// Finale
                hinrueckspiel = 2;
            }
        }
        if (ZAT == ZATrueck) {
            hinrueckspiel = 1;	// 5, 7; 11, 13;  (17, 19)  / 23,   25; 29, 31; 35,  37; 41,  43; 47, 49; 53,  55; 59,  61; 69
            if (saison < 3) {	// 4, 6; 10, 14*; (16, 22*) / 24**, 26; 34, 36; 38*, 42; 44*, 50; 52, 54; 56*, 60; 62*, 66; 70
                if (ZAT == 22) {
                    ZATkorr = 4;
                } else if ((ZAT - 6) % 20 > 6) {
                    ZATkorr = 2;
                } else {
                    ZATkorr = 0;
                }
                if ((ZAT == 22) || (ZAT == 30)) {
                    euroRunde--;	// Frueher: 3. Quali-Rueckspiel erst knapp vor 1. Hauptrunde
                }
            }
        }
        stats = "";
        spielart = getSpielArtFromCell(table.rows[i].cells[columnIndexArt]);
        ergebnis = getErgebnisFromCell(table.rows[i].cells[columnIndexErg]);
        table.rows[i].cells[columnIndexZus].className = table.rows[i].cells[columnIndexArt].className;
        if (table.rows[i].cells[columnIndexZus].textContent == "") {
            zusatz = "";
            gameType = spielart[0];
            addBilanzLinkToCell(table.rows[i].cells[columnIndexBer], gameType, shortKom ? "B" : "Bilanz");
            if (gameType == "Liga") {
                if (ZAT < 70) {
                    stats = addResultToStats(ligaStats, ergebnis);
                    zusatz = ++ligaSpieltag + ". Spieltag";
                } else {
                    zusatz = "Relegation";
                }
            } else if (gameType == "LP") {
                zusatz = pokalRunden[pokalRunde];
            } else if ((gameType == "OSCQ") || (gameType == "OSEQ")) {
                if (hinrueckspiel != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                zusatz = qualiRunden[euroRunde] + hinrueck[hinrueckspiel];
            } else if (gameType == "OSC") {
                if ((hinrueckspiel != 1) && ((euroRunde >= 8) || ((euroRunde - 2) % 3 == 0))) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                if (euroRunde < 8) {
                    gruppenPhase = (euroRunde < 5) ? "HR-Grp. " : "ZR-Grp. ";
                    zusatz = gruppenPhase + "Spiel " + (((euroRunde - 2) % 3) * 2 + 1 + hinrueckspiel);
                } else {
                    zusatz = oscRunden[euroRunde - 8] + hinrueck[hinrueckspiel];
                }
            } else if (gameType == "OSE") {
                if (hinrueckspiel != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                zusatz = oseRunden[euroRunde - 3] + hinrueck[hinrueckspiel];
            } else if (gameType == "Friendly") {
                zusatz = "";	// irgendwie besser lesbar!
            }
            if (showStats && (stats != "")) {
                zusatz = zusatz + " " + stats;
            }
            table.rows[i].cells[columnIndexZus].textContent = zusatz;
        }
        if (sepMonths && (ZAT % anzZATperMonth == 0) && (i < table.rows.length - rowOffsetLower - 1)) {
            for (j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].style.borderBottom = borderString;
            }
        }
    }
}

// URL-Legende:
// s=0Teamuebersicht
// s=1Vertragsdaten
// s=2Einzelwerte
// s=3Statistik Saison
// s=4Statistik Gesamt
// s=5Teaminfo
// s=6Saisonplan
// s=7Vereinshistorie
// s=8Transferhistorie
// s=9Leihhistorie

// Verzweige in unterschiedliche Verarbeitungen je nach Wert von s:
switch (getPageIdFromURL(window.location.href)) {
    case 6: procSpielplan(sepMonths, shortKom, showStats); break;
}

// *** EOF ***