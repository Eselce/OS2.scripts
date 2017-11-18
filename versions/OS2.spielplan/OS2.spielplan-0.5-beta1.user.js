// ==UserScript==
// @name OS2.spielplan
// @namespace  http://os.ongapo.com/
// @version    0.5
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

// ECMAScript 6: Erlaubt 'const', 'let', ...
/* jshint esnext: true */
/* jshint moz: true */

// Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __SEPMONTHS = true;    // Im Spielplan Trennstriche zwischen den Monaten
const __SHORTKOM  = true;    // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
const __SHOWSTATS = true;    // Ergebnisse aufaddieren und Stand anzeigen
const __LONGSTATS = false;   // Detailliertere Ausgabe des Stands

// Trennlinie zwischen den Monaten
const __BORDERSTYLE = "solid";         // Stil der Trennlinie
const __BORDERCOLOR = "white";         // Farbe der Trennlinie
const __BORDERWIDTH = "1px";           // Dicke der Trennlinie

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    var indexS = url.lastIndexOf("s=");
    var st = url.match(/st\.php/);              // Teamansicht Popupfenster
    var showteam = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    let s = -1;                                 // Seitenindex (Rueckgabewert)

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
    let saison = 0;

    for (let entry of saisons) {
        if (entry.outerHTML.match(/selected/)) {
            saison = entry.textContent;
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

// Optionen (mit Standardwerten initialisiert und per loadSpielplanOptions() geladen):
let sepMonths = __SEPMONTHS;    // Im Spielplan Trennstriche zwischen den Monaten
let shortKom  = __SHORTKOM;     // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
let showStats = __SHOWSTATS;    // Ergebnisse aufaddieren und Stand anzeigen
let longStats = __LONGSTATS;    // Detailliertere Ausgabe des Stands

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

// Liefert eine auf 0 zurueckgesetzte Ergebnissumme
// stats Enthaelt die summierten Stats
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
// stats Enthaelt die summierten Stats
// longStats Formatiert die Langversion des Textes
function getStats(stats, longStats) {
    return (longStats ? '[' + stats.S + ' ' + stats.U + ' ' + stats.N + "] " : "/ ") +
           stats.gFor + ':' + stats.gAga + ' ' + ((stats.gFor < stats.gAga) ? "" : (stats.gFor > stats.gAga) ? '+' : "") +
           (stats.gFor - stats.gAga) + " (" + stats.P + ')';
}

// Summiert ein Ergebnis auf die Stats und liefert den neuen Text zurueck
// stats Enthaelt die summierten Stats
// longStats Formatiert die Langversion des Textes
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT (mit dem Ergebnis)
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

    console.log(getZAT(currZAT, true) + ' ' + getStats(stats, true));

    return ret;
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
    const __TEXT = cell.textContent.replace("&nbsp;", "").replace(':', "").replace("  ", " ");
    const __SPIELART = __TEXT.split(' ', 2);

    return __SPIELART;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle und setzt tore/gtore im Spielplanzeiger
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell Tabellenzelle mit Eintrag "2 : 1"
// return { '2', '1' } im Beispiel
function setErgebnisFromCell(currZAT, cell) {
    const __ERGEBNIS = getErgebnisFromCell(cell);

    if (__ERGEBNIS.length == 2) {
        currZAT.gFor  = parseInt(__ERGEBNIS[0], 10);
        currZAT.gAga = parseInt(__ERGEBNIS[1], 10);
    } else {
        currZAT.gFor = -1;
        currZAT.gAga = -1;
    }
}

// Ermittelt die Spielart aus einer Tabellenzelle und setzt gameType/heim im Spielplanzeiger
// currZAT Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell Tabellenzelle mit Eintrag "Liga : Heim" oder "Liga Heim"
// return { "Liga", "Heim" } im Beispiel
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
// return OS2-ID fuer den Spieltyp (1 bis 7), 0 fuer spielfrei
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

// Verarbeitet Ansicht "Saisonplan"
function procSpielplan() {
    const __TABLE = document.getElementsByTagName("table")[2];
    const __SAISONS = document.getElementsByTagName("option");
    const __SAISON = getSaisonFromComboBox(__SAISONS);

    const __LIGASIZE = 10;

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

    let borderString = __BORDERSTYLE + ' ' + __BORDERCOLOR + ' ' + __BORDERWIDTH;    // Format der Trennlinie zwischen den Monaten

    loadSpielplanOptions();

    let ZAT = firstZAT(__SAISON, __LIGASIZE);

    let ligaStats = emptyStats();
    let euroStats = emptyStats();

    registerSpielplanMenu();

    for (let i = __ROWOFFSETUPPER; i < __TABLE.rows.length - __ROWOFFSETLOWER; i++) {
        const __CELLS = __TABLE.rows[i].cells;    // Aktuelle Eintraege
        let stats = "";
        let zusatz = "";

        ZAT.ZAT++;
        ZAT.gegner = __CELLS[__COLUMNINDEX.Geg].textContent;

        setSpielArtFromCell(ZAT, __CELLS[__COLUMNINDEX.Art]);
        setErgebnisFromCell(ZAT, __CELLS[__COLUMNINDEX.Erg]);

        if (shortKom) {
            let kommentar = __CELLS[__COLUMNINDEX.Kom].innerHTML;

            kommentar = kommentar.replace("Vorbericht(e)", 'V').replace("Kommentar(e)", 'K').replace("&amp;", '/').replace('&', '/');
            __CELLS[__COLUMNINDEX.Kom].innerHTML = kommentar;
        }
        if ((ZAT.ZAT > 12) && (ZAT.ZAT % 10 == 5)) {    // passt fuer alle Saisons: 12, 20, 30, 40, 48, 58, 68 / 3, 15, 27, 39, 51, 63, 69
            ZAT.pokalRunde++;
        }
        if ((ZAT.ZAT + ZAT.ZATkorr) % 6 == 4) {
            if (ZAT.ZAT < 63) {
                ZAT.ZATrueck = ZAT.ZAT + 2;
                ZAT.euroRunde++;
                ZAT.hinRueck = 0;
            } else {
                ZAT.euroRunde = 10;    // Finale
                ZAT.hinRueck = 2;
            }
        }
        if (ZAT.ZAT == ZAT.ZATrueck) {
            ZAT.hinRueck = 1;        // 5, 7; 11, 13;  (17, 19)  / 23,   25; 29, 31; 35,  37; 41,  43; 47, 49; 53,  55; 59,  61; 69
            if (ZAT.saison < 3) {    // 4, 6; 10, 14*; (16, 22*) / 24**, 26; 34, 36; 38*, 42; 44*, 50; 52, 54; 56*, 60; 62*, 66; 70
                if (ZAT.ZAT == 22) {
                    ZAT.ZATkorr = 4;
                } else if ((ZAT.ZAT - 6) % 20 > 6) {
                    ZAT.ZATkorr = 2;
                } else {
                    ZAT.ZATkorr = 0;
                }
                if ((ZAT.ZAT == 22) || (ZAT.ZAT == 30)) {
                    ZAT.euroRunde--;    // Frueher: 3. Quali-Rueckspiel erst knapp vor 1. Hauptrunde
                }
            }
        }
        if (shortKom) {
            const __CELLART = __CELLS[__COLUMNINDEX.Art];

            __CELLART.innerHTML = __CELLART.innerHTML.replace(": Heim", "(H)").replace(": Ausw\xE4rts", "(A)").replace("Friendly", "FSS");
        }
        __CELLS[__COLUMNINDEX.Zus].className = __CELLS[__COLUMNINDEX.Art].className;
        if (__CELLS[__COLUMNINDEX.Zus].textContent === "") {
            const __CELLBER = __CELLS[__COLUMNINDEX.Ber];

            addBilanzLinkToCell(__CELLBER, ZAT.gameType, "Bilanz");

            if (shortKom) {
                __CELLBER.innerHTML = __CELLBER.innerHTML.replace("Klick", "(*)").replace("Bilanz", 'V').replace("Vorschau", 'V');
            }

            if (ZAT.gameType == "Liga") {
                if (ZAT.ZAT < 70) {
                    stats = addResultToStats(ligaStats, longStats, ZAT);
                    zusatz = ++ZAT.ligaSpieltag + ". Spieltag";
                } else {
                    zusatz = "Relegation";
                }
            } else if (ZAT.gameType == "LP") {
                zusatz = __POKALRUNDEN[ZAT.pokalRunde];
            } else if ((ZAT.gameType == "OSCQ") || (ZAT.gameType == "OSEQ")) {
                if (ZAT.hinRueck != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, longStats, ZAT);
                zusatz = __QUALIRUNDEN[ZAT.euroRunde] + __HINRUECK[ZAT.hinRueck];
            } else if (ZAT.gameType == "OSC") {
                if ((ZAT.hinRueck != 1) && ((ZAT.euroRunde >= 8) || ((ZAT.euroRunde - 2) % 3 === 0))) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, longStats, ZAT);
                if (ZAT.euroRunde < 8) {
                    const __GRUPPENPHASE = ((ZAT.euroRunde < 5) ? "HR-Grp. " : "ZR-Grp. ");
                    zusatz = __GRUPPENPHASE + "Spiel " + (((ZAT.euroRunde - 2) % 3) * 2 + 1 + ZAT.hinRueck);
                } else {
                    zusatz = __OSCRUNDEN[ZAT.euroRunde - 8] + __HINRUECK[ZAT.hinRueck];
                }
            } else if (ZAT.gameType == "OSE") {
                if (ZAT.hinRueck != 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, longStats, ZAT);
                zusatz = __OSERUNDEN[ZAT.euroRunde - 3] + __HINRUECK[ZAT.hinRueck];
            } else if (ZAT.gameType == "Friendly") {
                zusatz = "";    // irgendwie besser lesbar!
            }

            if (showStats && (stats !== "")) {
                zusatz = zusatz + ' ' + stats;
            }
            __CELLS[__COLUMNINDEX.Zus].textContent = zusatz;
        }
        if (sepMonths && (ZAT.ZAT % ZAT.anzZATpMonth === 0) && (i < __TABLE.rows.length - __ROWOFFSETLOWER - 1)) {
            for (let entry of __CELLS) {
                entry.style.borderBottom = borderString;
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