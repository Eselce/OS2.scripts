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
// ==/UserScript==

// Optionen (hier editieren):
var sepMonths = true;	// Im Spielplan Striche zwischen den Monaten
var shortKom = true;	// Vorbericht(e) & Kommentar(e) nicht ausschreiben
var showStats = true;	// Ergebnisse aufaddieren und Stand anzeigen
var longStats = false;	// Detailliertere Ausgabe des Stands

var borderString = "solid white 1px";

//registerMenu();

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewünschten Unterseite
// url Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    var indexS = url.lastIndexOf("s=");
    var st = url.match(/st\.php/);              // Teamansicht Popupfenster
    var showteam = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    var s = -1;                                 // Seitenindex (Rückgabewert)
    
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

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewünschten Unterseite
// saisons Alle "option"-Einträge der Combo-Box
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

// Baut das User-Menü auf
function registerMenu() {

    GM_registerMenuCommand("Short format", setShortStats, "s");

    GM_registerMenuCommand("Long format", setLongStats, "l");
}

// Setzt das Stats-Format neu auf short/long
function setLongStatsFormat(long) {

    longStats = long;

    registerMenu();
}

// Setzt das Stats-Format neu auf short
function setShortStats() {

    setLongStatsFormat(false);
}

// Setzt das Stats-Format neu auf long
function setLongStats() {

    setLongStatsFormat(true);
}

// Liefert eine auf 0 zurückgesetzte Ergebnissumme
// stats Enthält die summierten Stats
function emptyStats(stats) {
    return [ 0, 0, 0, 0, 0, 0 ];
}

// Liefert die Stats als String
// stats Enthält die summierten Stats
function getStats(stats) {
    return (longStats ? "[" + stats[0] + " " + stats[1] + " " + stats[2] + "] " : "/ ") + stats[3] + ":" + stats[4] + " "
    + ((stats[3] < stats[4]) ? "" : ((stats[3] > stats[4]) ? "+" : "")) + (stats[3] - stats[4]) + " (" + stats[5] + ")";
}

// Summiert ein Ergebnis auf die Stats und liefert den neuen Text zurück
// stats Enthält die summierten Stats
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

// Verarbeitet Ansicht "Saisonplan"
// sepMonths Im Spielplan Striche zwischen den Monaten
// shortKom Vorbericht(e) & Kommentar(e) nicht ausschreiben
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
    
    var ligaStats;
    var euroStats;
    
    var spielart;
    var ergebnis;
    var bericht;
    var paarung;
    var kommentar;
    var stats;
    var zusatz;
    var zusatzID;
    var gruppenPhase;
    
    var i;
    var j;

    ligaStats = emptyStats();
    
    for (i = rowOffsetUpper; i < table.rows.length - rowOffsetLower; i++, ZAT++) {
        if ((ZAT > 12) && (ZAT % 10 == 5)) {	// paßt für alle Saisons: 12, 20, 30, 40, 48, 58, 68 / 3, 15, 27, 39, 51, 63, 69
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
                    euroRunde--;	// Früher: 3. Quali-Rückspiel erst knapp vor 1. Hauptrunde
                }
            }
        }
        if (shortKom) {
            kommentar = table.rows[i].cells[columnIndexKom].innerHTML;
            table.rows[i].cells[columnIndexKom].innerHTML = kommentar.replace("Vorbericht(e)", "V").replace("Kommentar(e)", "K").replace("&amp;", "/").replace("&", "/");
        }
        stats = "";
        spielart = table.rows[i].cells[columnIndexArt].textContent.split(" : ", 2);
        ergebnis = table.rows[i].cells[columnIndexErg].textContent.split(" : ", 2);
        bericht = table.rows[i].cells[columnIndexBer].textContent;
        table.rows[i].cells[columnIndexZus].className = table.rows[i].cells[columnIndexArt].className;
        if (table.rows[i].cells[columnIndexZus].textContent == "") {
            zusatz = spielart[0];
            zusatzID = -1;
            switch (zusatz) {
                case "Liga":   zusatzID = 2; break;
                case "LP":     zusatzID = 3; break;
                case "OSEQ":   zusatzID = 4; break;
                case "OSE":    zusatzID = 5; break;
                case "OSCQ":   zusatzID = 6; break;
                case "OSC":    zusatzID = 7; break;
                default:       zusatzID = 0; break;
            }
            if (zusatz == "Liga") {
                if (ZAT < 70) {
                    stats = addResultToStats(ligaStats, ergebnis);
                    zusatz = ++ligaSpieltag + ". Spieltag";
                } else {
                    zusatz = "Relegation";
                }
            } else if (zusatz == "LP") {
                zusatz = pokalRunden[pokalRunde];
            } else if ((zusatz == "OSCQ") || (zusatz == "OSEQ")) {
                if (hinrueckspiel != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                zusatz = qualiRunden[euroRunde] + hinrueck[hinrueckspiel];
            } else if (zusatz == "OSC") {
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
            } else if (zusatz == "OSE") {
                if (hinrueckspiel != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, ergebnis);
                zusatz = oseRunden[euroRunde - 3] + hinrueck[hinrueckspiel];
            } else if (zusatz == "Friendly") {
                zusatz = "";	// irgendwie besser lesbar!
            }
            if (showStats && (stats != "")) {
                zusatz = zusatz + " " + stats;
            }
            if (zusatzID > 0) {
                if (bericht != "Vorschau") {
                    bericht = table.rows[i].cells[columnIndexBer].innerHTML;
                    paarung = bericht.substr(bericht.indexOf("(") + 1);
                    paarung = paarung.substr(0, paarung.lastIndexOf(","));
                    paarung = paarung.substr(0, paarung.lastIndexOf(","));
                    bericht = bericht + " <a href=\"javascript:spielpreview(" + paarung + "," + zusatzID + ")\">B</a>";
                    table.rows[i].cells[columnIndexBer].innerHTML = bericht;
                }
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
// s=0Teamübersicht
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