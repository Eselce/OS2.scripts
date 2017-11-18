// ==UserScript==
// @name        OS2.jugendV4
// @namespace   http://os.ongapo.com/
// @version     0.40
// @copyright   2013+
// @author      Andreas Eckes (Strindheim BK)
// @author      Sven Loges (SLC)
// @description Jugendteam-Script fuer Online Soccer 2.0
// @include     http://os.ongapo.com/haupt.php
// @include     http://os.ongapo.com/haupt.php?changetosecond=*
// @include     http://os.ongapo.com/ju.php
// @include     http://os.ongapo.com/ju.php?page=*
// @include     http://www.os.ongapo.com/haupt.php
// @include     http://www.os.ongapo.com/haupt.php?changetosecond=*
// @include     http://www.os.ongapo.com/ju.php
// @include     http://www.os.ongapo.com/ju.php?page=*
// @include     http://online-soccer.eu/haut.php
// @include     http://online-soccer.eu/haupt.php?changetosecond=*
// @include     http://online-soccer.eu/ju.php
// @include     http://online-soccer.eu/ju.php?page=*
// @include     http://www.online-soccer.eu/haupt.php
// @include     http://www.online-soccer.eu/haupt.php?changetosecond=*
// @include     http://www.online-soccer.eu/ju.php
// @include     http://www.online-soccer.eu/ju.php?page=*
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
    'zeigePosition' : {   // Position anzeigen
                   'Name'      : "showPos",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : switchShowPos,
                   'Label'     : "Position ein",
                   'Hotkey'    : 'P',
                   'AltLabel'  : "Position aus",
                   'AltHotkey' : 'P'
               },
    'zeigeSkill' : {      // Spaltenauswahl fuer die aktuellen Werte (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showSkill",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : switchShowSkill,
                   'Label'     : "Skill ein",
                   'Hotkey'    : 'S',
                   'AltLabel'  : "Skill aus",
                   'AltHotkey' : 'S'
               },
    'anzahlOpti' : {      // Gibt die Anzahl der Opti-Spalten an / 1: nur bester Opti, 2: die beiden besten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-Opti angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzOpti",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
                   'Action'    : setNextAnzOpti,
                   'Label'     : "Opti: beste $",
                   'Hotkey'    : 'O'
               },
    'anzahlMW' : {        // Gibt die Anzahl der MW-Spalten an / 1: nur hoechsten MW, 2: die beiden hoechsten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-MW angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzMW",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
                   'Action'    : setNextAnzMW,
                   'Label'     : "MW: beste $",
                   'Hotkey'    : 'M'
               },
    'zeigeSkillEnde' : {  // Spaltenauswahl fuer die Werte mit Ende 18 (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showSkillEnde",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : switchShowSkillEnde,
                   'Label'     : "Skill Ende ein",
                   'Hotkey'    : 'i',
                   'AltLabel'  : "Skill Ende aus",
                   'AltHotkey' : 'i'
               },
    'anzahlOptiEnde' : {  // Spaltenauswahl fuer die Werte mit Ende 18:
                          // Gibt die Anzahl der Opti-Spalten an / 1: nur bester Opti, 2: die beiden besten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-Opti angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzOptiEnde",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
                   'Action'    : setNextAnzOptiEnde,
                   'Label'     : "Opti Ende: beste $",
                   'Hotkey'    : 't'
               },
    'anzahlMWEnde' : {    // Spaltenauswahl fuer die Werte mit Ende 18:
                          // Gibt die Anzahl der MW-Spalten an / 1: nur hoechsten MW, 2: die beiden hoechsten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-MW angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzMWEnde",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
                   'Action'    : setNextAnzMWEnde,
                   'Label'     : "MW Ende: beste $",
                   'Hotkey'    : 'W'
               },
    'kennzeichenEnde' : { // Markierung fuer Ende 18
                   'Name'      : "charEnde",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ " \u03A9", " 18" ],
                   'Action'    : setNextCharEnde,
                   'Label'     : "Ende: $",
                   'Hotkey'    : 'E'
               },
    'sepStyle' : {        // Stil der Trennlinie
                   'Name'      : "sepStyle",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ "solid", "hidden", "dotted", "dashed", "double", "groove", "ridge",
                                   "inset", "outset", "none" ],
                   'Action'    : setNextSepStyle,
                   'Label'     : "Stil: $",
                   'Hotkey'    : 'l'
               },
    'sepColor' : {        // Farbe der Trennlinie
                   'Name'      : "sepColor",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ "white", "yellow", "black", "blue", "cyan", "gold", "grey", "green",
                                   "lime", "magenta", "maroon", "navy", "olive", "orange", "purple",
                                   "red", "teal", "transparent" ],
                   'Action'    : setNextSepColor,
                   'Label'     : "Farbe: $",
                   'Hotkey'    : 'F'
               },
    'sepWidth' : {        // Dicke der Trennlinie
                   'Name'      : "sepWidth",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ "thin", "medium", "thick" ],
                   'Action'    : setNextSepWidth,
                   'Label'     : "Dicke: $",
                   'Hotkey'    : 'D'
               },
    'saison' : {          // Laufende Saison
                   'Name'      : "saison",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ],
                   'Action'    : setNextSaison,
                   'Label'     : "Saison: $",
                   'Hotkey'    : 'a'
               },
    'aktuellerZat' : {    // Laufender ZAT
                   'Name'      : "currZAT",
                   'Type'      : __OPTTYPES.MC,
                   'Choice'    : [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,
                                  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                                  24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
                                  36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                                  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
                                  70, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71 ],
                   'Action'    : setNextZAT,
                   'Label'     : "ZAT: $",
                   'Hotkey'    : 'Z'
               },
    'reset' : {           // Optionen auf die "Werkseinstellungen" zuruecksetzen
                   'Name'      : "reset",
                   'Type'      : __OPTTYPES.SI,
                   'Action'    : resetOptions,
                   'Label'     : "Standard-Optionen",
                   'Hotkey'    : 'r',
                   'AltLabel'  : ""
               }
};

// ==================== Invarianter Abschnitt fuer Optionen ====================

// Initialisiert die gesetzten Optionen
// optConfig: Konfiguration der Optionen
// optSet: Platz für die gesetzten Optionen
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
                             if (__CONFIG.AltAction === undefined) {
                                 __CONFIG.AltAction = __CONFIG.Action;
                             }
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
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setOption(name, value, reload = true) {
    GM_setValue(name, value);

    if (reload) {
        window.location.reload();
    }

    return value;
}

// Setzt den naechsten Wert aus einer Array-Liste als Option
// arr: Array-Liste mit den moeglichen Optionen
// name: Name der Option als Speicherort
// value: Zu setzender Wert
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setNextOption(arr, name, value, reload = true) {
    const __POS = arr.indexOf(value) + 1;

    return setOption(name, arr[(__POS < arr.length) ? __POS : 0], reload);
}

// Setzt eine Option auf einen vorgegebenen Wert
// Fuer kontrollierte Auswahl des Values siehe setNextOpt()
// opt: Config und vorheriger Value der Option
// value: (Bei allen Typen) zu setzender Wert
// reload: Seite mit neuem Wert neu laden
function setOpt(opt, value, reload = false) {
    opt.Value = setOption(opt.Config.Name, value, reload);
}

// Setzt die naechste moegliche Option
// opt: Config und Value der Option
// value: Bei __OPTTYPES.TF zu setzender Wert
// reload: Seite mit neuem Wert neu laden
function setNextOpt(opt, value = undefined, reload = true) {
    const __CONFIG = opt.Config;

    switch (__CONFIG.Type) {
    case __OPTTYPES.MC : opt.Value = setNextOption(__CONFIG.Choice, __CONFIG.Name, opt.Value, reload);
                         break;
    case __OPTTYPES.SW : opt.Value = setOption(__CONFIG.Name, ! opt.Value, reload);
                         break;
    case __OPTTYPES.TF : opt.Value = setOption(__CONFIG.Name, (value !== undefined) ? value : ! opt.Value, reload);
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
    const __CURRZAT = __OPTSET.aktuellerZat.Value;	// Aktuellen ZAT beibehalten (sichern)

    for (let opt in __OPTSET) {
        GM_deleteValue(__OPTSET[opt].Config.Name);
    }

    setOpt(__OPTSET.aktuellerZat, __CURRZAT, false);	// Aktuellen ZAT wiederherstellen

    window.location.reload();
}

// Behandelt die Optionen und laedt das Benutzermenu
// optConfig: Konfiguration der Optionen
// optSet: Platz für die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'Tab': Tabelle mit dem Spielplan
// 'Zei': Startzeile des Spielplans mit dem ersten ZAT
// 'Spa': Spalte der Tabellenzelle mit der Spielart (z.B. "Liga : Heim")
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { showMenu : true }) {
    optSet = initOptions(optConfig, optSet);

    loadOptions(optSet);

    if (optParams.showMenu) {
        buildMenu(optSet);
    }

    return optSet;
}

// ==================== Abschnitt mit Reaktionen auf Optionen ====================

// Wechselt die Anzeige der Position zwischen an und aus
function switchShowPos() {
    setNextOpt(__OPTSET.zeigePosition);
}

// Wechselt die Anzeige des Skills zwischen an und aus
function switchShowSkill() {
    setNextOpt(__OPTSET.zeigeSkill);
}

// Setzt die naechste moegliche Anzahl Opti-Spalten als Option
function setNextAnzOpti() {
    setNextOpt(__OPTSET.anzahlOpti);
}

// Setzt die naechste moegliche Anzahl MW-Spalten als Option
function setNextAnzMW() {
    setNextOpt(__OPTSET.anzahlMW);
}

// Wechselt die Anzeige des Skills Ende 18 zwischen an und aus
function switchShowSkillEnde() {
    setNextOpt(__OPTSET.zeigeSkillEnde);
}

// Setzt die naechste moegliche Anzahl Opti-Spalten Ende 18 als Option
function setNextAnzOptiEnde() {
    setNextOpt(__OPTSET.anzahlOptiEnde);
}

// Setzt die naechste moegliche Anzahl MW-Spalten Ende 18 als Option
function setNextAnzMWEnde() {
    setNextOpt(__OPTSET.anzahlMWEnde);
}

// Setzt das naechste moegliche Kennzeichen fuer Ende 18 als Option
function setNextCharEnde() {
    setNextOpt(__OPTSET.kennzeichenEnde);
}

// Setzt den naechsten Stil der Trennlinie als Option
function setNextSepStyle() {
    setNextOpt(__OPTSET.sepStyle);
}

// Setzt die naechste Farbe der Trennlinie als Option
function setNextSepColor() {
    setNextOpt(__OPTSET.sepColor);
}

// Setzt die naechste Dicke der Trennlinie als Option
function setNextSepWidth() {
    setNextOpt(__OPTSET.sepWidth);
}

// Setzt die naechste moegliche Saison als Option
function setNextSaison() {
    setNextOpt(__OPTSET.saison);
}

// Setzt den naechsten ZAT als Option
function setNextZAT() {
    setNextOpt(__OPTSET.aktuellerZat);
}

// ==================== Ende Abschnitt fuer Optionen ====================

// ==================== Abschnitt genereller Code zur Anzeige der Jugend ====================

// Variablen ****************************************************************************

var titleColor = "#FFFFFF";
var rowOffset = 1;
var players = [];
var playerRows = document.getElementsByTagName("table")[1].getElementsByTagName("tr");

// Funktionen ***************************************************************************

// Erschafft die Spieler-Objekte und fuellt sie mit Werten
//
function init() {
	var playerRow;
	var age;
	var skills;
	var isGoalie;
	for (var i = rowOffset; i < playerRows.length; i++) {
		playerRow = playerRows[i];
		age = getAgeFromHTML(playerRow);
		skills = getSkillsFromHTML(playerRow);
		isGoalie = isGoalieFromHTML(playerRow);
		players[i - rowOffset] = new PlayerRecord(age, skills, isGoalie);
		players[i - rowOffset].initPlayer();
	}
}

// Trennt die Jahrgaenge mit Linien
//
function separateAgeGroups() {
    // Format der Trennlinie zwischen den Monaten...
    const __BORDERSTRING = __OPTSET.sepStyle.Value + ' ' + __OPTSET.sepColor.Value + ' ' + __OPTSET.sepWidth.Value;

	var colIdxAge = 3;
	var playerTable = document.getElementsByTagName("table")[1];

	for (var i = rowOffset; i < playerTable.rows.length - 1; i++) {
		if (playerTable.rows[i].cells[colIdxAge].textContent != playerTable.rows[i + 1].cells[colIdxAge].textContent) {
			for (var j = colIdxAge; j < playerTable.rows[i].cells.length; j++) {
				playerTable.rows[i].cells[j].style.borderBottom = __BORDERSTRING;
			}
		}
	}
}

// Klasse ColumnManager *****************************************************************

function ColumnManager() {
	this.skill = __OPTSET.zeigeSkill.Value;
	this.pos = __OPTSET.zeigePosition.Value;
	this.opti = ((__OPTSET.anzahlOpti.Value >= 1) && (__OPTSET.anzahlOpti.Value <= 6)) ? true : false;
	this.mw = ((__OPTSET.anzahlMW.Value >= 1) && (__OPTSET.anzahlMW.Value <= 6)) ? true : false;
	this.anzOpti = __OPTSET.anzahlOpti.Value;
	this.anzMw = __OPTSET.anzahlMW.Value;
	this.skillE = __OPTSET.zeigeSkillEnde.Value;
	this.optiE = ((__OPTSET.anzahlOptiEnde.Value >= 1) && (__OPTSET.anzahlOptiEnde.Value <= 6)) ? true : false;
	this.mwE = ((__OPTSET.anzahlMWEnde.Value >= 1) && (__OPTSET.anzahlMWEnde.Value <= 6)) ? true : false;
	this.anzOptiE = __OPTSET.anzahlOptiEnde.Value;
	this.anzMwE = __OPTSET.anzahlMWEnde.Value;
	this.kennzE = __OPTSET.kennzeichenEnde.Value;

	this.toString = function() {
		var result = "Skillschnitt\t\t" + this.skill + "\n";
		result += "Beste Position\t" + this.pos + "\n";
		result += "Optis\t\t\t" + this.opti + " (" + this.anzOpti + ")\n";
		result += "Marktwerte\t\t" + this.mw + " (" + this.anzMw + ")\n";
		result += "Skillschnitt Ende\t" + this.skillE + "\n";
		result += "Optis Ende\t\t" + this.optiE + " (" + this.anzOptiE + ")\n";
		result += "Marktwerte Ende\t" + this.mwE + " (" + this.anzMwE + ")\n";
		return result;
	}

	this.addCell = function(tableRow) {
		tableRow.insertCell(-1);
		return tableRow.cells.length - 1;
	}

	this.addAndFillCell = function(tableRow, value, color) {
		if (isFinite(value) && (value !== true) && (value !== false)) {
			// Zahl einfuegen
			if (value < 1000) {
				// Mit 2 Nachkommastellen darstellen
				tableRow.cells[this.addCell(tableRow)].textContent = value.toFixed(2);
			} else {
				// Mit Tausenderpunkten darstellen
				tableRow.cells[this.addCell(tableRow)].textContent = getNumberString(value.toString());
			}
		} else {
			// String einfuegen
			tableRow.cells[this.addCell(tableRow)].textContent = value;
		}
		tableRow.cells[tableRow.cells.length - 1].style.color = color;
	}

	this.addTitles = function() {
		// Titel fuer die aktuellen Werte
		if (this.skill) { this.addAndFillCell(playerRows[0], "Skill", titleColor); }
		if (this.pos) { this.addAndFillCell(playerRows[0], "Pos", titleColor); }
		if (this.opti) {
			for (var i = 1; i <= this.anzOpti; i++) {
				this.addAndFillCell(playerRows[0], "Opti " + i, titleColor);
				if (this.mw && (this.anzMw >= i)) {
					this.addAndFillCell(playerRows[0], "MW " + i, titleColor);
				}
			}
			if (this.mw) {
				for (var i = this.anzOpti + 1; i <= this.anzMw; i++) {
					// Mehr MW- als Opti-Spalten
					this.addAndFillCell(playerRows[0], "MW " + i, titleColor);
				}
			}
		} else if (this.mw) {
			// Keine Opti-, dafuer MW-Spalten
			for (var i = 1; i <= this.anzMw; i++) {
				this.addAndFillCell(playerRows[0], "MW " + i, titleColor);
			}
		}

		// Titel fuer die Werte mit Ende 18
		if (this.skillE) { this.addAndFillCell(playerRows[0], "Skill" + this.kennzE, titleColor); }
		if (this.optiE) {
			for (var i = 1; i <= this.anzOptiE; i++) {
				this.addAndFillCell(playerRows[0], "Opti " + i + this.kennzE, titleColor);
				if (this.mwE && (this.anzMwE >= i)) {
					this.addAndFillCell(playerRows[0], "MW " + i + this.kennzE, titleColor);
				}
			}
			if (this.mwE) {
				for (var i = this.anzOptiE + 1; i <= this.anzMwE; i++) {
					this.addAndFillCell(playerRows[0], "MW " + i + this.kennzE, titleColor);
				}
			}
		} else if (this.mwE) {
			for (var i = 1; i <= this.anzMwE; i++) {
				this.addAndFillCell(playerRows[0], "MW " + i + this.kennzE, titleColor);
			}
		}
	} // Ende addTitles()

	this.addValues = function(player, playerRow) {
		// Aktuelle Werte
		if (this.skill) {
			if (player.isGoalie) { this.addAndFillCell(playerRow, player.getSkill(true), getColor("TOR")); }
			else { this.addAndFillCell(playerRow, player.getSkill(true), titleColor); }
		}
		if (this.pos) {
			if (player.isGoalie) { this.addAndFillCell(playerRow, "TOR", getColor("TOR")); }
			else { this.addAndFillCell(playerRow, player.getPos(1), getColor(player.getPos(1))); }
		}
		if (this.opti) {
			for (var i = 1; i <= this.anzOpti; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-Opti anzeigen
						this.addAndFillCell(playerRow, player.getOpti("TOR", true), getColor("TOR"));
					} else {
						// TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-Opti anzeigen
					this.addAndFillCell(playerRow, player.getOpti(player.getPos(i), true), getColor(player.getPos(i)));
				}
				if (this.mw && (this.anzMw >= i)) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", true), getColor("TOR"));
						} else {
							// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), true), getColor(player.getPos(i)));
					}
				}
			}
			// Verbleibende MW anzeigen
			if (this.mw) {
				for (var i = this.anzOpti + 1; i <= this.anzMw; i++) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", true), getColor("TOR"));
						} else {
							// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), true), getColor(player.getPos(i)));
					}
				}
			}
		} else if (this.mw) {
			// Opti soll nicht angezeigt werden, dafuer aber MW
			for (var i = 1; i <= this.anzMw; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue("TOR", true), getColor("TOR"));
					} else {
						// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-MW anzeigen
					this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), true), getColor(player.getPos(i)));
				}
			}
		}

		// Werte mit Ende 18
		if (this.skillE) {
			if (player.isGoalie) { this.addAndFillCell(playerRow, player.getSkill(false), getColor("TOR")); }
			else { this.addAndFillCell(playerRow, player.getSkill(false), titleColor); }
		}
		if (this.optiE) {
			for (var i = 1; i <= this.anzOptiE; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-Opti anzeigen
						this.addAndFillCell(playerRow, player.getOpti("TOR", false), getColor("TOR"));
					} else {
						// TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-Opti anzeigen
					this.addAndFillCell(playerRow, player.getOpti(player.getPos(i), false), getColor(player.getPos(i)));
				}
				if (this.mwE && (this.anzMwE >= i)) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", false), getColor("TOR"));
						} else {
							// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), false), getColor(player.getPos(i)));
					}
				}
			}
			// Verbleibende MW anzeigen
			if (this.mwE) {
				for (var i = this.anzOptiE + 1; i <= this.anzMwE; i++) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", false), getColor("TOR"));
						} else {
						 	// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), false), getColor(player.getPos(i)));
					}
				}
			}
		} else if (this.mwE) {
			// Opti soll nicht angezeigt werden, dafuer aber MW
			for (var i = 1; i <= this.anzMwE; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue("TOR", false), getColor("TOR"));
					} else {
						// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-MW anzeigen
					this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), false), getColor(player.getPos(i)));
				}
			}
		}
	} // Ende addValues(player, playerRow)
}

// Klasse PlayerRecord ******************************************************************

function PlayerRecord(age, skills, isGoalie) {
	// in this.initPlayer() definiert:
	// this.positions[][]: Positionstext und Opti; TOR-Index ist 5
	// this.skillsEnd[]: Berechnet aus this.skills, this.age und aktuellerZat
	this.age = age;
	this.skills = skills;
	this.isGoalie = isGoalie;

	this.toString = function() {
		var result = "Alter\t\t" + this.age + "\n\n";
		result += "Aktuelle Werte\n";
		result += "Skillschnitt\t" + this.getSkill(true).toFixed(2) + "\n";
		result += "Optis und Marktwerte";
		for (var i = 0; i < this.positions.length; i++) {
			result += "\n\t" + this.getPos()[i] + " \t";
			result += this.getOpti(this.getPos()[i], true).toFixed(2) + "\t";
			result += getNumberString(this.getMarketValue(this.getPos()[i], true).toString());
		}
		result += "\n\nWerte mit Ende 18\n"
		result += "Skillschnitt\t" + this.getSkill(false).toFixed(2) + "\n";
		result += "Optis und Marktwerte";
		for (var i = 0; i < this.positions.length; i++) {
			result += "\n\t" + this.getPos()[i] + " \t";
			result += this.getOpti(this.getPos()[i], false).toFixed(2) + "\t";
			result += getNumberString(this.getMarketValue(this.getPos()[i], false).toString());
		}
		return result;
	} // Ende this.toString()

	// Berechnet die Opti-Werte, sortiert das Positionsfeld und berechnet die Einzelskills mit Ende 18
	//
	this.initPlayer = function() {
		this.positions = [];
		// ABW
		this.positions[0] = [];
		this.positions[0][0] = "ABW";
		this.positions[0][1] = this.getOpti("ABW", true);
		// DMI
		this.positions[1] = [];
		this.positions[1][0] = "DMI";
		this.positions[1][1] = this.getOpti("DMI", true);
		// MIT
		this.positions[2] = [];
		this.positions[2][0] = "MIT";
		this.positions[2][1] = this.getOpti("MIT", true);
		// OMI
		this.positions[3] = [];
		this.positions[3][0] = "OMI";
		this.positions[3][1] = this.getOpti("OMI", true);
		// STU
		this.positions[4] = [];
		this.positions[4][0] = "STU";
		this.positions[4][1] = this.getOpti("STU", true);
		// TOR
		this.positions[5] = [];
		this.positions[5][0] = "TOR";
		this.positions[5][1] = this.getOpti("TOR", true);
		// Sortieren
		sortPositionArray(this.positions);

		// Einzelskills mit Ende 18 berechnen
		this.skillsEnd = [];
		var zatSoFar = (this.age - 13) * 72 + __OPTSET.aktuellerZat.Value;
		var zatTillEnd = (18 - this.age) * 72 + (71 - __OPTSET.aktuellerZat.Value);
		for (var i = 0; i < this.skills.length; i++) {
			if (isTrainableSkill(i)) {
				// Auf ganze Zahl runden und parseInt, da das sonst irgendwie als String interpretiert wird
				this.skillsEnd[i] = parseInt((this.skills[i] * (1 + zatTillEnd / zatSoFar)).toFixed(0));
			} else {
				this.skillsEnd[i] = this.skills[i];
			}
		}
	} // Ende this.iniPlayer()

	this.getSkill = function(now) {
		var temp = (now) ? this.skills : this.skillsEnd;
		var result = 0;
		for (var i = 0; i < temp.length; i++) {
			result += temp[i];
		}
		return result / temp.length;
	}

	this.getPos = function(idx) {
		var idxOffset = 1;
		return this.positions[idx - idxOffset][0];
	}

	this.getOpti = function(pos, now) {
		var temp = (now) ? this.skills : this.skillsEnd;
		var idxPriSkills = getIdxPriSkills(pos);
		var idxSecSkills = getIdxSecSkills(pos);
		var sumPriSkills = 0;
		var sumSecSkills = 0;
		for (var i = 0; i < idxPriSkills.length; i++) {
			sumPriSkills += temp[idxPriSkills[i]];
		}
		for (var i = 0; i < idxSecSkills.length; i++) {
			sumSecSkills += temp[idxSecSkills[i]];
		}
		return (5 * sumPriSkills + sumSecSkills) / 27;
	}

	this.getMarketValue = function(pos, now) {
		var age = (now) ? this.age : 18;

		if (__OPTSET.saison.Value < 10) {
			return Math.round(Math.pow((1 + this.getSkill(now)/100) * (1 + this.getOpti(pos, now)/100)*  (2 - age/100), 10) * 2);	// Alte Formel bis Saison 9
		} else {	// MW-Formel ab Saison 10...
			const __MW5TF = 1.00;	// Zwischen 0.97 und 1.03

			return Math.round(Math.pow(1 + this.getSkill(now)/100, 5.65) * Math.pow(1 + this.getOpti(pos, now)/100, 8.1) * Math.pow(1 + (100 - age)/49, 10) * __MW5TF);
		}
	}
}

// Funktionen fuer die HTML-Seite *******************************************************

// Liest das Alter aus
//
function getAgeFromHTML(playerRow) {
	var colIndexAge = 3;
	return parseInt(playerRow.cells[colIndexAge].textContent);
}

// Liest die Einzelskills aus
//
function getSkillsFromHTML(playerRow) {
	var numberOfSkills = 17;
	var colOffset = 4;
	var result = [];
	for (var i = 0; i < numberOfSkills; i++) {
		result[i] = parseInt(playerRow.cells[i + colOffset].textContent);
	}
	return result;
}

// Liest aus, ob der Spieler Torwart oder Feldspieler ist
//
function isGoalieFromHTML(playerRow) {
	var colIndexAge = 3;
	return (playerRow.cells[colIndexAge].className == "TOR");
}

// Hilfsfunktionen **********************************************************************

// Sortiert das Positionsfeld per BubbleSort
//
function sortPositionArray(array) {
	var temp = [];
	var transposed = true;
	// TOR soll immer die letzte Position im Feld sein, deshalb - 1
	var length = array.length - 1;

	while (transposed && (length > 1)) {
		transposed = false;
		for (var i = 0; i < length - 1; i++) {
			// Vergleich Opti-Werte:
			if (array[i][1] < array[i + 1][1]) {
				// vertauschen
				temp[0] = array[i][0];
				temp[1] = array[i][1];
				array[i][0] = array[i + 1][0];
				array[i][1] = array[i + 1][1];
				array[i + 1][0] = temp[0];
				array[i + 1][1] = temp[1];
				transposed = true;
			}
		}
		length -= 1;
	}
}

// Fuegt in die uebergebene Zahl Tausender-Trennpunkte ein
// Wandelt einen etwaig vorhandenen Dezimalpunkt in ein Komma um
//
function getNumberString(numberString) {
	if (numberString.lastIndexOf(".") != -1) {
		// Zahl enthaelt Dezimalpunkt
		var wholePart = numberString.substring(0, numberString.lastIndexOf("."));
		var decimalPart = numberString.substring(numberString.lastIndexOf(".") + 1, numberString.length);
		return getNumberString(wholePart) + "," + decimalPart;
	} else {
		// Kein Dezimalpunkt, fuege Tausender-Trennpunkte ein:
		// String umdrehen, nach jedem dritten Zeichen Punkt einfuegen, dann wieder umdrehen:
		var temp = reverseString(numberString);
		var result = "";
		for (var i = 0; i < temp.length; i++) {
			if ((i > 0) && (i % 3 == 0)) { result += "."; }
			result += temp.substr(i, 1);
		}
		return reverseString(result);
	}
}

// Dreht den uebergebenen String um
//
function reverseString(string) {
	var result = "";
	for (var i = string.length - 1; i >= 0; i--) {
		result += string.substr(i, 1);
	}
	return result;
}

// Schaut nach, ob der uebergebene Index zu einem trainierbaren Skill gehoert
// Die Indizes gehen von 0 (SCH) bis 16 (EIN)
//
function isTrainableSkill(idx) {
	var trainableSkills = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 15];
	var result = false;
	for (var i = 0; i < trainableSkills.length; i++) {
		if (idx == trainableSkills[i]) { result = true; break; }
	}
	return result;
}

// Gibt die Indizes der Primaerskills zurueck
//
function getIdxPriSkills(pos) {
	switch(pos) {
		case "TOR": return new Array(2, 3, 4, 5);
		case "ABW": return new Array(2, 3, 4, 15);
		case "DMI": return new Array(1, 4, 9, 11);
		case "MIT": return new Array(1, 3, 9, 11);
		case "OMI": return new Array(1, 5, 9, 11);
		case "STU": return new Array(0, 2, 3, 5);
		default: return new Array();
	}
}

// Gibt die Indizes der Sekundaerskills zurueck
//
function getIdxSecSkills(pos) {
	switch(pos) {
		case "TOR": return new Array(0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
		case "ABW": return new Array(0, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16);
		case "DMI": return new Array(0, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16);
		case "MIT": return new Array(0, 2, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16);
		case "OMI": return new Array(0, 2, 3, 4, 6, 7, 8, 10, 12, 13, 14, 15, 16);
		case "STU": return new Array(1, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
		default: return new Array();
	}
}

// Gibt die zur Position gehoerige Farbe zurueck
//
function getColor(pos) {
	switch (pos) {
		case "TOR": return "#FFFF00";
		case "ABW": return "#00FF00";
		case "DMI": return "#3366FF";
		case "MIT": return "#66FFFF";
		case "OMI": return "#FF66FF";
		case "STU": return "#FF0000";
		case "LEI": return "#FFFFFF";
		default: return "";
	}
}

// ==================== Ende Abschnitt genereller Code zur Anzeige der Jugend ====================

// ==================== Abschnitt fuer sonstige Parameter ====================

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url: Adresse der Seite
function getPageIdFromURL(url) {
	// Variablen zur Identifikation der Seite
	const __INDEXS = url.lastIndexOf("page=");
	const __HAUPT = url.match(/haupt\.php/);		// Ansicht "Haupt" (Managerbuero)
	const __JU = url.match(/ju\.php/);				// Ansicht "Jugendteam"
	let page = -1;									// Seitenindex (Rueckgabewert)

	// Wert von page (Seitenindex) ermitteln...
	// Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "page=" und ggf. von '&'
	if (__HAUPT) {
		page = 0;
	} else if (__JU) {
		if (__INDEXS < 0) {
			page = 1;
		} else if (url.indexOf('&', __INDEXS) < 0) {
			// Wert von page setzt sich aus allen Zeichen hinter "page=" zusammen
			page = parseInt(url.substring(__INDEXS + 5, url.length), 10);
		} else {
			// Wert von page setzt sich aus allen Zeichen zwischen "page=" und '&' zusammen
			page = parseInt(url.substring(__INDEXS + 5, url.indexOf('&', __INDEXS)), 10);
		}
	}

	return page;
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

// ==================== Ende Abschnitt fuer sonstige Parameter ====================

// ==================== Hauptprogramm ====================

// Verarbeitet Ansicht "Haupt" (Managerbuero) zur Ermittlung des aktuellen ZATs
function procHaupt() {
    const __TTAGS = document.getElementsByTagName("table");

	buildOptions(__OPTCONFIG, __OPTSET, { showMenu : false });

    const __NEXTZAT = getZATNrFromCell(__TTAGS[0].rows[2].cells[0]); // "Der naechste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;

    if (__CURRZAT >= 0) {
        console.log("Aktueller ZAT: " + __CURRZAT);

        setOpt(__OPTSET.aktuellerZat, __CURRZAT, false);
    }
}

// Verarbeitet Ansicht "Teamuebersicht"
function procTeamuebersicht() {
}

// Verarbeitet Ansicht "Spielereinzelwerte"
function procSpielereinzelwerte() {
	buildOptions(__OPTCONFIG, __OPTSET);

	var colMan = new ColumnManager();

	colMan.addTitles();

	init();

	for (var i = 0; i < players.length; i++) {
		colMan.addValues(players[i], playerRows[i + rowOffset]);
	}

	separateAgeGroups();

	// Spaltentitel zentrieren
	playerRows[0].align = "center";
}

// URL-Legende:
// page=1: Teamuebersicht
// page=2: Spielereinzelwerte

// Verzweige in unterschiedliche Verarbeitungen je nach Wert von s:
switch (getPageIdFromURL(window.location.href)) {
	case 0: procHaupt(); break;
	case 1: procTeamuebersicht(); break;
	case 2: procSpielereinzelwerte(); break;
	default: break;
}

console.log("SCRIPT END");

// *** EOF ***
