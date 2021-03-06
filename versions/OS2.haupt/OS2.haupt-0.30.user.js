// ==UserScript==
// @name        OS2.haupt
// @namespace   http://os.ongapo.com/
// @version     0.30
// @copyright   2016+
// @author      Sven Loges (SLC)
// @description Managerbuero-Abschnitt aus dem Master-Script fuer Online Soccer 2.0
// @include     http://os.ongapo.com/haupt.php
// @include     http://os.ongapo.com/haupt.php?changetosecond=*
// @include     http://www.os.ongapo.com/haupt.php
// @include     http://www.os.ongapo.com/haupt.php?changetosecond=*
// @include     http://online-soccer.eu/haupt.php
// @include     http://online-soccer.eu/haupt.php?changetosecond=*
// @include     http://www.online-soccer.eu/haupt.php
// @include     http://www.online-soccer.eu/haupt.php?changetosecond=*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

// ECMAScript 6: Erlaubt 'const', 'let', ...
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Konfigurations-Abschnitt fuer Optionen ====================

// Options-Typen
const __OPTTYPES = {
    'MC' : "multiple choice",
    'SW' : "switch",
    'TF' : "true/false",
    'SI' : "simple option"
};

// Moegliche Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __OPTCONFIG = {
    'saison' : {       // Laufende Saison
                   'Name'      : "saison",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ],
                   'Action'    : setNextSaison,
                   'Label'     : "Saison: $",
                   'Hotkey'    : 'S'
               },
    'ligaSize' : {     // Ligengroesse
                   'Name'      : "ligaSize",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 10, 18, 20 ],
                   'Action'    : setNextLigaSize,
                   'Label'     : "Liga: $er",
                   'Hotkey'    : 'L'
               },
    'reset' : {        // Optionen auf die "Werkseinstellungen" zuruecksetzen
                   'Name'      : "reset",
                   'Type'      : __OPTTYPES.SI,
                   'Action'    : resetOptions,
                   'Label'     : "Standard-Optionen",
                   'Hotkey'    : 'O'
               }
};

// ==================== Invarianter Abschnitt fuer Optionen ====================

// Initialisiert die gesetzten Optionen
// optConfig: Konfiguration der Optionen
// optSet: Platz f�r die gesetzten Optionen
// return Gefuelltes Objekt mit den gesetzten Optionen
function initOptions(optConfig, optSet = undefined) {
    var value;

    if (optSet === undefined) {
        optSet = { };
    }

    for (let opt in optConfig) {
        const __CONFIG = optConfig[opt];

        switch (__CONFIG.Type) {
        case __OPTTYPES.MC : value = __CONFIG.Choice[0];
                             break;
        case __OPTTYPES.SW : value = __CONFIG.Default;
                             break;
        case __OPTTYPES.TF : value = __CONFIG.Default;
                             break;
        case __OPTTYPES.SI : value = undefined;
                             break;
        }
        optSet[opt] = {
            'Config' : __CONFIG,
            'Value'  : value
        };
    }

    return optSet;
}

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

// Setzt die naechste moegliche Option
// opt: Config und Value der Option
// value: Bei __OPTTYPES.TF zu setzender Wert
function setNextOpt(opt, value = true) {
    const __CONFIG = opt.Config;

    switch (__CONFIG.Type) {
    case __OPTTYPES.MC : opt.Value = setNextOption(__CONFIG.Choice, __CONFIG.Name, opt.Value);
                         break;
    case __OPTTYPES.SW : opt.Value = setOption(__CONFIG.Name, ! opt.Value);
                         break;
    case __OPTTYPES.TF : opt.Value = setOption(__CONFIG.Name, value);
                         break;
    case __OPTTYPES.SI : break;
    }
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

// Zeigt den Eintrag im Menu einer Option
// opt: Config und Value der Option
function registerOption(opt) {
    const __CONFIG = opt.Config;

    switch (__CONFIG.Type) {
    case __OPTTYPES.MC : registerNextMenuOption(opt.Value, __CONFIG.Choice, __CONFIG.Label.replace('$', opt.Value),
                                                __CONFIG.Action, __CONFIG.Hotkey);
                         break;
    case __OPTTYPES.SW : registerMenuOption(opt.Value, __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey,
                                                __CONFIG.AltLabel, __CONFIG.Action, __CONFIG.AltHotkey);
                         break;
    case __OPTTYPES.TF : registerMenuOption(opt.Value, __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey,
                                                __CONFIG.AltLabel, __CONFIG.AltAction, __CONFIG.AltHotkey);
                         break;
    case __OPTTYPES.SI : GM_registerMenuCommand(__CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey);
                         break;
    }
}

// Baut das Benutzermenu auf
// optSet: Gesetzte Optionen
function buildMenu(optSet) {
    console.log("buildMenu()");

    for (let opt in optSet) {
        registerOption(optSet[opt]);
    }
}

// Laedt die permament (ueber Menu) gesetzten Optionen
// optSet: Gesetzte Optionen
function loadOptions(optSet) {
    for (let opt in optSet) {
        const __OPT = optSet[opt];

        __OPT.Value = GM_getValue(__OPT.Config.Name, __OPT.Value);
    }
}

// ==================== Spezialisierter Abschnitt fuer Optionen ====================

// Gesetzte Optionen (wird von initOptions() angelegt und von loadOptions() gefuellt):
const __OPTSET = { };

// Setzt die Optionen auf die "Werkseinstellungen" des Skripts
function resetOptions() {
    for (let opt in __OPTSET) {
        GM_deleteValue(__OPTSET[opt].Config.Name);
    }

    window.location.reload();
}

// Teamparameter fuer getrennte Speicherung der Optionen fuer Erst- und Zweitteam...
const __MYTEAM = { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined };

// Behandelt die Optionen und laedt das Benutzermenu
// optConfig: Konfiguration der Optionen
// optSet: Platz f�r die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'teamParams': Getrennte "ligaSize"-Option wird genutzt, hier: __MYTEAM mit 'Land' des Erst- bzw. Zweitteams
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { }) {
    __MYTEAM.Team = optParams.teamParams.Team;
    __MYTEAM.Liga = optParams.teamParams.Liga;
    __MYTEAM.Land = optParams.teamParams.Land;
    console.log(__MYTEAM);

    optSet = initOptions(optConfig, optSet);

    // Prefix fuer die Option "ligaSize"
    optSet.ligaSize.Config.Name = __MYTEAM.Land + optSet.ligaSize.Config.Name;

    loadOptions(optSet);
    showOptions(optParams.menuAnchor);
    buildMenu(optSet);

    return optSet;
}

// ==================== Abschnitt mit Reaktionen auf Optionen ====================

// Setzt die naechste moegliche Saison als Option
function setNextSaison() {
    setNextOpt(__OPTSET.saison);
}

// Setzt die naechste moegliche Ligagroesse als Option
function setNextLigaSize() {
    setNextOpt(__OPTSET.ligaSize);
}

// ==================== Abschnitt fuer Optionen auf der Seite ====================

// Startpunkt fuer das Optionsmenu auf der Seite (im Gegensatz zum Benutzermenu)
var menuAnchor;
let menuForm = "";

// Zeigt die Optionen auf der Seite an
// anchor: Element, das als Anker fuer die Anzeige dient
function showOptions(anchor) {
    const __FORM = '<input type="button" value="anzeigen" onclick="activateMenu()">';

    menuAnchor = anchor;

    showMenu(__FORM);
}

// Zeigt das Optionsmenu auf der Seite an (im Gegensatz zum Benutzermenu)
// form: HTML-Form des Optionsmenu
function showMenu(form) {
    const __REST = menuAnchor.innerHTML.substring(0, menuAnchor.innerHTML.length - menuForm.length);

    menuForm = form;

//***    menuAnchor.innerHTML = __REST + menuForm;
}

// ==================== Ende Abschnitt fuer Optionen ====================

// ==================== Abschnitt fuer Spielplan und ZATs ====================

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

// ==================== Abschnitt fuer Statistiken des Spielplans ====================

// ==================== Abschnitt fuer Daten des Spielplans ====================

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
    const __TEXT = cell.textContent.replace('\xA0', "").replace(':', "").replace("  ", ' ');
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

// ==================== Abschnitt fuer sonstige Parameter des Spielplans ====================

// Ermittelt, wie das eigene Team hei�t und aus welchem Land bzw. Liga es kommt (zur Unterscheidung von Erst- und Zweitteam)
// cell: Tabellenzelle mit den Parametern zum Team "<b>Willkommen im Managerb&uuml;ro von TEAM</b><br>LIGA LAND<a href=..."
// return Im Beispiel { 'Team' : "TEAM", 'Liga' : "LIGA", 'Land' : "LAND" },
//        z.B. { 'Team' : "Choromonets Odessa", 'Liga' : "1. Liga", 'Land' : "Ukraine" }
function getTeamParamsFromCell(cell) {
    const __SEARCHSTART = " von ";
    const __SEARCHMIDDLE = "</b><br>";
    const __SEARCHLIGA = ". Liga ";
    const __SEARCHEND = "<a href=";
    let teamParams = cell.innerHTML.substring(cell.innerHTML.indexOf(__SEARCHSTART) + __SEARCHSTART.length, cell.innerHTML.indexOf(__SEARCHEND));
    let land = teamParams.substring(teamParams.indexOf(__SEARCHLIGA) + __SEARCHLIGA.length);

    if (land.charAt(1) == ' ') {    // Land z.B. hinter "2. Liga A " statt "1. Liga "
        land = land.substr(2);
    }

    const __TEAM = teamParams.substring(0, teamParams.indexOf(__SEARCHMIDDLE));
    const __LIGA = teamParams.substring(teamParams.indexOf(__SEARCHMIDDLE) + __SEARCHMIDDLE.length,
                                        teamParams.length - land.length - 1);
    const __RET = {
        'Team' : __TEAM,
        'Liga' : __LIGA,
        'Land' : land
    };

    return __RET;
}

// Gibt die laufende Nummer des ZATs im Text einer Zelle zurueck
// cell: Tabellenzelle mit der ZAT-Nummer im Text
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

// ==================== Ende Abschnitt fuer Spielplan und ZATs ====================

// Fuegt eine Zelle ans Ende der uebergebenen Zeile hinzu und fuellt sie
// row: Zeile, die verlaengert wird
// content: Textinhalt der neuen Zelle
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color) {
	row.insertCell(-1);

	const __COLIDX = row.cells.length - 1;

	row.cells[__COLIDX].textContent = content;
	row.cells[__COLIDX].align = "center";
	row.cells[__COLIDX].style.color = color;
}

// Spult die Daten um anzZAT ZATs vor und schreibt Parameter
// anhand des Spielplans fort. Also Spieltag, Runde, etc.
// row: Zeile mit den Daten zum Spiel (Spielart, Gegner)
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// anzZAT: Anzahl der ZAT, um die vorgespult wird
// bilanz: Angabe, ob Bilanz-Link eingefuegt werden oll
function addZusatz(row, currZAT, anzZAT = 1, bilanz = false) {
    const __CELLS = row.cells;
    const __COLUMNINDEX = {
        'Lbl' : 0,
        'Art' : 1,
        'Geg' : 2,
        'Ber' : 2,
        'Zus' : 3
    };

    currZAT.gegner = __CELLS[__COLUMNINDEX.Geg].textContent;
    currZAT.gegner = currZAT.gegner.substr(0, currZAT.gegner.indexOf(" ("));
    setSpielArtFromCell(currZAT, __CELLS[__COLUMNINDEX.Art]);
    if (bilanz) {
        addBilanzLinkToCell(__CELLS[__COLUMNINDEX.Ber], currZAT.gameType, "(Bilanz)");
    }
    incZAT(currZAT, anzZAT);
    appendCell(row, "\xA0" + getZusatz(currZAT));
    __CELLS[__COLUMNINDEX.Zus].className = __CELLS[__COLUMNINDEX.Art].className;
}

// ==================== Hauptprogramm ====================

// Verarbeitet Ansicht "Haupt" (Managerbuero)
function procHaupt() {
    const __DTAGS = document.getElementsByTagName("div");
    const __TTAGS = document.getElementsByTagName("table");
    const __TEAMPARAMS = getTeamParamsFromCell(__TTAGS[1].rows[0].cells[1]); // Link mit Team, Liga, Land...

    buildOptions(__OPTCONFIG, __OPTSET, {
                     'teamParams' : __TEAMPARAMS,
                     'menuAnchor' : __DTAGS[1]
                 });

    const __ZAT = firstZAT(__OPTSET.saison.Value, __OPTSET.ligaSize.Value);
    const __NEXTZAT = getZATNrFromCell(__TTAGS[0].rows[2].cells[0]); // "Der naechste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;

    addZusatz(__TTAGS[2].rows[0], __ZAT, __CURRZAT, true);           // "Dein letztes Spiel:" (+ __CURRZAT)
    addZusatz(__TTAGS[3].rows[0], __ZAT);                            // "Dein naechstes Spiel:" (+ 1 ZAT)
}

procHaupt();

// *** EOF ***
