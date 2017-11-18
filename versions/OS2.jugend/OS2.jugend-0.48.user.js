// ==UserScript==
// @name         OS2.jugend
// @namespace    http://os.ongapo.com/
// @version      0.48
// @copyright    2013+
// @author       Andreas Eckes (Strindheim BK)
// @author       Sven Loges (SLC)
// @description  Jugendteam-Script fuer Online Soccer 2.0
// @include      http*://os.ongapo.com/haupt.php
// @include      http*://os.ongapo.com/haupt.php?changetosecond=*
// @include      http*://os.ongapo.com/ju.php
// @include      http*://os.ongapo.com/ju.php?page=*
// @include      http*://www.os.ongapo.com/haupt.php
// @include      http*://www.os.ongapo.com/haupt.php?changetosecond=*
// @include      http*://www.os.ongapo.com/ju.php
// @include      http*://www.os.ongapo.com/ju.php?page=*
// @include      http*://online-soccer.eu/haupt.php
// @include      http*://online-soccer.eu/haupt.php?changetosecond=*
// @include      http*://online-soccer.eu/ju.php
// @include      http*://online-soccer.eu/ju.php?page=*
// @include      http*://www.online-soccer.eu/haupt.php
// @include      http*://www.online-soccer.eu/haupt.php?changetosecond=*
// @include      http*://www.online-soccer.eu/ju.php
// @include      http*://www.online-soccer.eu/ju.php?page=*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_info
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
    'SD' : "simple data",
    'SI' : "simple option"
};

// Options-Typen
const __OPTACTION = {
    'SET' : "set option value",
    'NXT' : "set next option value",
    'RST' : "reset options"
};

const __OPTMEM = {
    'normal' : {
                   'Name'      : "Session",
                   'Value'     : sessionStorage,
                   'Display'   : "sessionStorage",
                   'Prefix'    : 'run'
               },
    'unbegrenzt' : {
                   'Name'      : "Browser",
                   'Value'     : localStorage,
                   'Display'   : "localStorage",
                   'Prefix'    : 'run'
               },
    'inaktiv' : {
                   'Name'      : "inaktiv",
                   'Value'     : undefined,
                   'Display'   : "",
                   'Prefix'    : ""
               }
};

// Moegliche Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __OPTCONFIG = {
    'zeigeTal' : {        // Spaltenauswahl fuer Talente (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showTclasses",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Talent ein",
                   'Hotkey'    : 'T',
                   'AltLabel'  : "Talent aus",
                   'AltHotkey' : 'T',
                   'FormLabel' : "Talent"
               },
    'zeigeQuote' : {      // Spaltenauswahl fuer Aufwertungsschnitt (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showRatio",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Quote ein",
                   'Hotkey'    : 'T',
                   'AltLabel'  : "Quote aus",
                   'AltHotkey' : 'T',
                   'FormLabel' : "Quote"
               },
    'zeigeAufw' : {       // Spaltenauswahl fuer Aufwertungen (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showProgresses",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Aufw. ein",
                   'Hotkey'    : 'W',
                   'AltLabel'  : "Aufw. aus",
                   'AltHotkey' : 'W',
                   'FormLabel' : "Aufwertung"
               },
    'zeigeGeb' : {        // Spaltenauswahl fuer Geburtstage (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showBirthday",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Geb. ein",
                   'Hotkey'    : 'G',
                   'AltLabel'  : "Geb. aus",
                   'AltHotkey' : 'G',
                   'FormLabel' : "Geburtstag"
               },
    'zeigeAlter' : {        // Spaltenauswahl fuer dezimales Alter (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showAge",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Alter ein",
                   'Hotkey'    : 'A',
                   'AltLabel'  : "Alter aus",
                   'AltHotkey' : 'A',
                   'FormLabel' : "Alter"
               },
    'zeigeSkill' : {      // Spaltenauswahl fuer die aktuellen Werte (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showSkill",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Skill ein",
                   'Hotkey'    : 'S',
                   'AltLabel'  : "Skill aus",
                   'AltHotkey' : 'S',
                   'FormLabel' : "Skill"
               },
    'zeigePosition' : {   // Position anzeigen
                   'Name'      : "showPos",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Position ein",
                   'Hotkey'    : 'P',
                   'AltLabel'  : "Position aus",
                   'AltHotkey' : 'P',
                   'FormLabel' : "Position"
               },
    'anzahlOpti' : {      // Gibt die Anzahl der Opti-Spalten an / 1: nur bester Opti, 2: die beiden besten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-Opti angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzOpti",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 0, 1, 2, 3, 4, 5, 6 ],
                   'Default'   : 1,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Opti: beste $",
                   'Hotkey'    : 'O',
                   'FormLabel' : "Opti:|beste $"
               },
    'anzahlMW' : {        // Gibt die Anzahl der MW-Spalten an / 1: nur hoechsten MW, 2: die beiden hoechsten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-MW angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzMW",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 0, 1, 2, 3, 4, 5, 6 ],
                   'Default'   : 1,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "MW: beste $",
                   'Hotkey'    : 'M',
                   'FormLabel' : "MW:|beste $"
               },
    'zeigeSkillEnde' : {  // Spaltenauswahl fuer die Werte mit Ende 18 (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showSkillEnde",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Skill Ende ein",
                   'Hotkey'    : 'i',
                   'AltLabel'  : "Skill Ende aus",
                   'AltHotkey' : 'i',
                   'FormLabel' : "Skill \u03A9"
               },
    'anzahlOptiEnde' : {  // Spaltenauswahl fuer die Werte mit Ende 18:
                          // Gibt die Anzahl der Opti-Spalten an / 1: nur bester Opti, 2: die beiden besten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-Opti angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzOptiEnde",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 0, 1, 2, 3, 4, 5, 6 ],
                   'Default'   : 1,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Opti Ende: beste $",
                   'Hotkey'    : 't',
                   'FormLabel' : "Opti \u03A9:|beste $"
               },
    'anzahlMWEnde' : {    // Spaltenauswahl fuer die Werte mit Ende 18:
                          // Gibt die Anzahl der MW-Spalten an / 1: nur hoechsten MW, 2: die beiden hoechsten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-MW angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzMWEnde",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 0, 1, 2, 3, 4, 5, 6 ],
                   'Default'   : 1,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "MW Ende: beste $",
                   'Hotkey'    : 'W',
                   'FormLabel' : "MW \u03A9:|beste $"
               },
    'kennzeichenEnde' : { // Markierung fuer Ende 18
                   'Name'      : "charEnde",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'Choice'    : [ " \u03A9", " 18" ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Ende: $",
                   'Hotkey'    : 'E',
                   'FormLabel' : "Ende 18:|$"
               },
    'sepStyle' : {        // Stil der Trennlinie
                   'Name'      : "sepStyle",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'Choice'    : [ "solid", "hidden", "dotted", "dashed", "double", "groove", "ridge",
                                   "inset", "outset", "none" ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Stil: $",
                   'Hotkey'    : 'l',
                   'FormLabel' : "Stil:|$"
               },
    'sepColor' : {        // Farbe der Trennlinie
                   'Name'      : "sepColor",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'Choice'    : [ "white", "yellow", "black", "blue", "cyan", "gold", "grey", "green",
                                   "lime", "magenta", "maroon", "navy", "olive", "orange", "purple",
                                   "red", "teal", "transparent" ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Farbe: $",
                   'Hotkey'    : 'F',
                   'FormLabel' : "Farbe:|$"
               },
    'sepWidth' : {        // Dicke der Trennlinie
                   'Name'      : "sepWidth",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'Choice'    : [ "thin", "medium", "thick" ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Dicke: $",
                   'Hotkey'    : 'D',
                   'FormLabel' : "Dicke:|$"
               },
    'saison' : {          // Laufende Saison
                   'Name'      : "saison",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
                   'Default'   : 10,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Saison: $",
                   'Hotkey'    : 'a',
                   'FormLabel' : "Saison:|$"
               },
    'aktuellerZat' : {    // Laufender ZAT
                   'Name'      : "currZAT",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Permanent' : true,
                   'Choice'    : [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,
                                  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                                  24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
                                  36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                                  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
                                  60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71 ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "ZAT: $",
                   'Hotkey'    : 'Z',
                   'FormLabel' : "ZAT:|$"
               },
    'datenZat' : {        // Stand der Daten zum Team und ZAT
                   'Name'      : "dataZAT",
                   'Type'      : __OPTTYPES.SD,
                   'ValType'   : "Number",
                   'Hidden'    : true,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : undefined,
                   'Action'    : __OPTACTION.SET,
                   'Submit'    : undefined,
                   'Cols'      : 1,
                   'Rows'      : 1,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Daten-ZAT:"
               },
    'birthdays' : {       // Datenspeicher fuer Geburtstage der Jugendspieler
                   'Name'      : "birthdays",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 2,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Geburtstage:"
               },
    'tClasses' : {        // Datenspeicher fuer Talente der Jugendspieler (-1=wenig, 0=normal, +1=hoch)
                   'Name'      : "tClasses",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 2,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Talente:"
               },
    'progresses' : {      // Datenspeicher fuer Aufwertungen der Jugendspieler (als Strings)
                   'Name'      : "progresses",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 7,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Aufwertungen:"
               },
    'zatAges' : {         // Datenspeicher fuer (gebrochene) Alter der Jugendspieler
                   'Name'      : "zatAges",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 2,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "ZAT-Alter:"
               },
    'trainiert' : {        // Datenspeicher fuer Trainingsquoten der Jugendspieler
                   'Name'      : "numProgresses",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 2,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Trainiert:"
               },
    'positions' : {       // Datenspeicher fuer optimale Positionen der Jugendspieler
                   'Name'      : "positions",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 3,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Positionen:"
               },
    'team' : {            // Datenspeicher fuer Daten des Erst- bzw. Zweitteams
                   'Name'      : "team",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'Permanent' : true,
                   'Default'   : { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined, 'LdNr' : 0, 'LgNr' : 0 },
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Replace'   : null,
                   'Space'     : 1,
                   'Label'     : "Verein:"
               },
    'hauptZat' : {
                   'Shared'    : { 'namespace' : "http://os.ongapo.com/", 'module' : "OS2.haupt", 'item' : 'datenZat' },
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Label'     : "Haupt:"
              },
    'haupt' : {
                   'Shared'    : { 'namespace' : "http://os.ongapo.com/", 'module' : "OS2.haupt" },
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Label'     : "Haupt:"
              },
    'data' : {
                   'Shared'    : { 'namespace' : "http://os.ongapo.com/" },
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Label'     : "Data:"
              },
    'reset' : {           // Optionen auf die "Werkseinstellungen" zuruecksetzen
                   'Name'      : "reset",
                   'Type'      : __OPTTYPES.SI,
                   'Action'    : __OPTACTION.RST,
                   'Label'     : "Standard-Optionen",
                   'Hotkey'    : 'r',
                   'FormLabel' : ""
               },
    'storage' : {         // Browserspeicher fuer die Klicks auf Optionen
                   'Name'      : "storage",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'Choice'    : Object.keys(__OPTMEM),
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Speicher: $",
                   'Hotkey'    : 'c',
                   'FormLabel' : "Speicher:|$"
               },
    'oldStorage' : {      // Vorheriger Browserspeicher fuer die Klicks auf Optionen
                   'Name'      : "oldStorage",
                   'Type'      : __OPTTYPES.SD,
                   'PreInit'   : true,
                   'AutoReset' : true,
                   'Hidden'    : true
               },
    'showForm' : {        // Optionen auf der Webseite (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showForm",
                   'Type'      : __OPTTYPES.SW,
                   'FormType'  : __OPTTYPES.SI,
                   'Permanent' : true,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Optionen anzeigen",
                   'Hotkey'    : 'O',
                   'AltLabel'  : "Optionen verbergen",
                   'AltHotkey' : 'O',
                   'FormLabel' : ""
               }
};

// ==================== Invarianter Abschnitt fuer Optionen ====================

// ==================== Abschnitt fuer diverse Utilities ====================

// Gibt einen Wert zurueck. Ist dieser nicht definiert oder null, wird ein Alternativwert geliefert
// value: Ein Wert. Ist dieser nicht undefined oder null, wird er zurueckgeliefert (oder retValue)
// defValue: Default-Wert fuer den Fall, dass nichts gesetzt ist
// retValue: Falls definiert, Rueckgabe-Wert fuer den Fall, dass value nicht undefined oder null ist
// return Der Wert. Sind weder value noch defValue definiert, dann undefined
function getValue(value, defValue = undefined, retValue = undefined) {
    return ((value === undefined) || (value === null)) ? defValue : (retValue === undefined) ? value : retValue;
}

// Gibt einen Wert zurueck. Ist dieser nicht definiert, wird ein Alternativwert geliefert
// value: Ein Wert. Ist dieser definiet und in den Grenzen, wird er zurueckgeliefert
// minValue: Untere Grenze fuer den Wert, falls angegeben
// minValue: Obere Grenze fuer den Wert, falls angegeben
// defValue: Default-Wert fuer den Fall, dass nichts gesetzt ist oder der Wert ausserhalb liegt
// return Der Wert. Sind weder value (in den Grenzen) noch defValue definiert, dann undefined
function getValueIn(value, minValue = undefined, maxValue = undefined, defValue = undefined) {
    const __VALUE = getValue(value, defValue);

    if ((minValue !== undefined) && (__VALUE < minValue)) {
        return defValue;
    }
    if ((maxValue !== undefined) && (__VALUE > maxValue)) {
        return defValue;
    }

    return __VALUE;
}

// Ermittelt den naechsten Wert aus einer Array-Liste
// arr: Array-Liste mit den moeglichen Werte
// value: Vorher gesetzter Wert
// return Naechster Wert in der Array-Liste
function getNextValue(arr, value) {
    const __POS = arr.indexOf(value) + 1;

    return arr[getValueIn(__POS, 0, arr.length - 1, 0)];
}

// Gibt ein Produkt zurueck. Ist einer der Multiplikanten nicht definiert, wird ein Alternativwert geliefert
// valueA: Ein Multipliksnt. Ist dieser undefined, wird als Produkt defValue zurueckgeliefert
// valueB: Ein Multipliksnt. Ist dieser undefined, wird als Produkt defValue zurueckgeliefert
// digits: Anzahl der Stellen nach dem Komma fuer das Produkt (Default: 0)
// defValue: Default-Wert fuer den Fall, dass ein Multiplikant nicht gesetzt ist (Default: NaN)
// return Das Produkt auf digits Stellen genau. Ist dieses nicht definiert, dann defValue
function getMulValue(valueA, valueB, digits = 0, defValue = NaN) {
    let product = defValue;

    if ((valueA !== undefined) && (valueB !== undefined)) {
        product = parseFloat(valueA) * parseFloat(valueB);
    }

    return parseFloat(product.toFixed(digits));
}

// Ueberprueft, ob ein Objekt einer bestimmten Klasse angehoert (ggfs. per Vererbung)
// obj: Ein (generisches) Objekt
// base: Eine Objektklasse (Konstruktor-Funktion)
// return true, wenn der Prototyp rekursiv gefunden werden konnte
function instanceOf(obj, base) {
    while (obj !== null) {
        if (obj === base.prototype)
            return true;
        if ((typeof obj) === 'xml') {  // Sonderfall mit Selbstbezug
            return (base.prototype === XML.prototype);
        }
        obj = Object.getPrototypeOf(obj);
    }

    return false;
}

// Liefert alle Basisklassen des Objekts (inkl. Vererbung)
// obj: Ein (generisches) Objekt
// return true, wenn der Prototyp rekursiv gefunden werden konnte
function getPrototypes(obj) {
    let ret = [];

    while (obj !== null) {
        const __PROTO = Object.getPrototypeOf(obj);

        ret.push(__PROTO);
        if ((typeof obj) === 'xml') {  // Sonderfall mit Selbstbezug
            break;
        }
        obj = __PROTO;
    }

    return ret;
}

// Liefert alle Attribute/Properties des Objekts (inkl. Vererbung)
// obj: Ein (generisches) Objekt
// return Array von Items (Property-Namen)
function getAllProperties(obj) {
    let ret = [];

    for (let o = obj; o !== null; o = Object.getPrototypeOf(o)) {
      ret = ret.concat(Object.getOwnPropertyNames(o));
    }

    return ret;
}

// Ueberpruefung, ob ein Item aktiv ist oder nicht
// item: Name des betroffenen Items
// inList: Checkliste der inkludierten Items (Positivliste, true fuer aktiv)
// exList: Checkliste der exkludierten Items (Negativliste, true fuer inaktiv)
// return Angabe, ob das Item aktiv ist
function checkItem(item, showList = undefined, exList = undefined) {
    let active = true;

    if (inList !== undefined) {
        active = (inList[item] === true);  // gesetzt und true
    }
    if (exList !== undefined) {
        if (exList[item] === true) {  // gesetzt und true
            active = false;  // NICHT anzeigen
        }
    }

    return active;
}

// Fuegt Properties zu einem Objekt hinzu, die in einem zweiten stehen. Doppelte Werte werden ueberschrieben
// data: Objekt, dem Daten hinzugefuegt werden
// addData: Objekt, das zusaetzliche Properties enthaelt
// addList: Checkliste der zu setzenden Items (true fuer kopieren), falls angegeben
// ignList: Checkliste der ignorierten Items (true fuer auslassen), falls angegeben
// return Das gemergete Objekt mit allen Properties
function addProps(data, addData, addList = undefined, ignList = undefined) {
    for (let prop in getValue(addData, { })) {
        if (checkItem(prop, addList, ignList)) {
            data[prop] = addData[prop];
        }
    }

    return data;
}

// Speichert einen beliebiegen (strukturierten) Wert unter einem Namen ab
// name: GM_setValue-Name, unter dem die Daten gespeichert werden
// value: Beliebiger (strukturierter) Wert
// return String-Darstellung des Wertes
function serialize(name, value) {
    const __STREAM = (value !== undefined) ? JSON.stringify(value) : value;

    console.log(name + " >> " + __STREAM);

    GM_setValue(name, __STREAM);

    return __STREAM;
}

// Holt einen beliebiegen (strukturierter) Wert unter einem Namen zurueck
// name: GM_setValue-Name, unter dem die Daten gespeichert werden
// defValue: Default-Wert fuer den Fall, dass nichts gespeichert ist
// return Objekt, das unter dem Namen gespeichert war
function deserialize(name, defValue = undefined) {
    const __STREAM = GM_getValue(name, defValue);

    console.log(name + " << " + __STREAM);

    //if ((__STREAM !== undefined) && (__STREAM.length !== 0)) {
    if (__STREAM) {
        try {
            return JSON.parse(__STREAM);
        } catch (ex) {
            console.error(name + ": " + ex.message);
        }
    }

    return undefined;
}

// Setzt eine Option dauerhaft und laedt die Seite neu
// name: Name der Option als Speicherort
// value: Zu setzender Wert
// reload: Seite mit neuem Wert neu laden
// return Gespeicherter Wert fuer setOptValue()
function setStored(name, value, reload = true, serial = false) {
    if (serial) {
        serialize(name, value);
    } else {
        GM_setValue(name, value);
    }

    if (reload) {
        window.location.reload();
    }

    return value;
}

// Setzt den naechsten Wert aus einer Array-Liste als Option
// arr: Array-Liste mit den moeglichen Optionen
// name: Name der Option als Speicherort
// value: Vorher gesetzter Wert
// reload: Seite mit neuem Wert neu laden
// return Gespeicherter Wert fuer setOptValue()
function setNextStored(arr, name, value, reload = true, serial = false) {
    return setStored(name, getNextValue(arr, value), reload, serial);
}

// Fuehrt die in einem Storage gespeicherte Operation aus
// memory: __OPTMEM.normal = bis Browserende gespeichert (sessionStorage), __OPTMEM.unbegrenzt = unbegrenzt gespeichert (localStorage), __OPTMEM.inaktiv
// return Array von Objekten mit 'cmd' / 'key' / 'val' (derzeit maximal ein Kommando) oder undefined
function getStoredCmds(memory = undefined) {
    const __STORAGE = getMemory(memory);
    const __MEMORY = __STORAGE.Value;
    const __RUNPREFIX = __STORAGE.Prefix;
    const __STOREDCMDS = [];

    if (__MEMORY !== undefined) {
        const __GETITEM = function(item) {
                              return __MEMORY.getItem(__RUNPREFIX + item);
                          };
        const __DELITEM = function(item) {
                              return __MEMORY.removeItem(__RUNPREFIX + item);
                          };
        const __CMD = ((__MEMORY !== undefined) ? __GETITEM('cmd') : undefined);

        if (__CMD !== undefined) {
            const __KEY = __GETITEM('key');
            let value = __GETITEM('val');

            try {
                value = JSON.parse(value);
            } catch (ex) {
                console.error("getStoredCmds(): " + __CMD + " '" + __KEY + "' hat illegalen Wert '" + value + "'");
                // ... meist kann man den String selber aber speichern, daher kein "return"...
            }

            __STOREDCMDS.push({
                                'cmd' : __CMD,
                                'key' : __KEY,
                                'val' : value
                            });
        }

        __DELITEM('cmd');
        __DELITEM('key');
        __DELITEM('val');
    }

    return (__STOREDCMDS.length ? __STOREDCMDS : undefined);
}

// Fuehrt die in einem Storage gespeicherte Operation aus
// storedCmds: Array von Objekten mit 'cmd' / 'key' / 'val' (siehe getStoredCmds())
// optSet: Set mit den Optionen
// beforeLoad: Angabe, ob nach der Speicherung noch loadOptions() aufgerufen wird
// memory: __OPTMEM.normal = bis Browserende gespeichert (sessionStorage), __OPTMEM.unbegrenzt = unbegrenzt gespeichert (localStorage), __OPTMEM.inaktiv
// return Array von Operationen (wie storedCmds), die fuer die naechste Phase uebrig bleiben
function runStoredCmds(storedCmds, optSet = undefined, beforeLoad = undefined) {
    const __BEFORELOAD = getValue(beforeLoad, true);
    const __STOREDCMDS = getValue(storedCmds, []);
    const __LOADEDCMDS = [];

    //if (storedCmds.length > 0) {
    if (storedCmds.length) {
        invalidateOpts(optSet);  // alle Optionen invalidieren
    }
    //while (storedCmds.length > 0) {
    while (storedCmds.length) {
        const __STORED = storedCmds.shift();
        const __CMD = __STORED.cmd;
        const __KEY = __STORED.key;
        const __VAL = __STORED.val;

        if (__BEFORELOAD) {
            switch (__OPTACTION[__CMD]) {
            case __OPTACTION.SET : console.log("SET '" + __KEY + "' " + __VAL);
                                   setStored(__KEY, __VAL, false, false);
                                   break;
            case __OPTACTION.NXT : console.log("SETNEXT '" + __KEY + "' " + __VAL);
                                   //setNextStored(__CONFIG.Choice, __KEY, __VAL, false, false);
                                   setStored(__KEY, __VAL, false, false);
                                   break;
            case __OPTACTION.RST : console.log("RESET (delayed)");
                                   __LOADEDCMDS.push(__STORED);
                                   break;
            default :              break;
            }
        } else {
            switch (__OPTACTION[__CMD]) {
            case __OPTACTION.SET :
            case __OPTACTION.NXT : console.log("SETNEXT (undefined)");
                                   break;
            case __OPTACTION.RST : console.log("RESET");
                                   resetOptions(optSet, false);
                                   loadOptions(optSet);  // Reset auf umbenannte Optionen anwenden!
                                   break;
            default :              break;
            }
        }
    }

    return (__LOADEDCMDS.length ? __LOADEDCMDS : undefined);
}

// Gibt eine Option sicher zurueck
// opt: Config und Value der Option, ggfs. undefined
// defOpt: Rueckgabewert, falls undefined
// return Daten zur Option (oder defOpt)
function getOpt(opt, defOpt = { }) {
    return getValue(opt, defOpt);
}

// Gibt eine Option sicher zurueck (Version mit Key)
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// defOpt: Rueckgabewert, falls nicht zu finden
// return Daten zur Option (oder defOpt)
function getOptByName(optSet, item, defOpt = { }) {
    if ((optSet !== undefined) && (item !== undefined)) {
        return getOpt(optSet[item], defOpt);
    } else {
        return defOpt;
    }
}

// Gibt die Konfigurationsdaten einer Option zurueck
// opt: Config und Value der Option
// defConfig: Rueckgabewert, falls Config nicht zu finden
// return Konfigurationsdaten der Option
function getOptConfig(opt, defConfig = { }) {
    return getValue(getOpt(opt).Config, defConfig);
}

// Setzt den Namen einer Option
// opt: Config und Value der Option
// name: Zu setzender Name der Option
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Name der Option
function setOptName(opt, name) {
    const __NAME = getOptName(opt);

    console.log("RENAME " + __NAME + " => " + name);

    return (getOptConfig(opt).Name = name);
}

// Gibt den Namen einer Option zurueck
// opt: Config und Value der Option
// return Name der Option
function getOptName(opt) {
    return getOptConfig(opt).Name;
}

// Setzt den Wert einer Option
// opt: Config und Value der Option
// name: Zu setzender Wert der Option
// return Gesetzter Wert
function setOptValue(opt, value) {
    return (opt !== undefined) ? (opt.Value = value) : undefined;
}

// Gibt den Wert einer Option zurueck
// opt: Config und Value der Option
// defValue: Default-Wert fuer den Fall, dass nichts gesetzt ist
// load: Laedt die Option per loadOption(), falls noetig
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Gesetzter Wert
function getOptValue(opt, defValue = undefined, load = true, force = false) {
    let value;

    if (opt !== undefined) {
        if (load) {
            const __CONFIG = getOptConfig(opt);

            if (! __CONFIG.Loaded) {
                value = loadOption(opt, force);
            }
        } else {
            value = opt.Value;
        }
    }

    return getValue(value, defValue);
}

// ==================== Ende Abschnitt fuer diverse Utilities ====================

// ==================== Abschnitt fuer Speicher und die Scriptdatenbank ====================

// Namen des Default-, Dauer- und Null-Memories...
const __MEMNORMAL   = 'normal';
const __MEMINFINITE = 'unbegrenzt';
const __MEMINAKTIVE = 'inaktiv';

// Definition des Default-, Dauer- und Null-Memories...
const __OPTMEMNORMAL   = __OPTMEM[__MEMNORMAL];
const __OPTMEMINFINITE = __OPTMEM[__MEMINFINITE];
const __OPTMEMINAKTIVE = __OPTMEM[__MEMINAKTIVE];

// Medium fuer die Datenbank (Speicher)
let myOptMem = __OPTMEMNORMAL;

// Speicher fuer die DB-Daten
const __DBMEM = __OPTMEMNORMAL.Value;

// Infos ueber dieses Script-Modul
const __DBMOD = { };

// Inhaltsverzeichnis der DB-Daten (indiziert durch die Script-Namen)
const __DBTOC = { };

// Daten zu den Modulen (indiziert durch die Script-Namen)
const __DBDATA = { };

// ==================== Abschnitt fuer Speicher ====================

// Ermittelt fuer die uebergebene Speicher-Konfiguration einen Speicher
// memory: __OPTMEM.normal = bis Browserende gespeichert (sessionStorage), __OPTMEM.unbegrenzt = unbegrenzt gespeichert (localStorage), __OPTMEM.inaktiv
// return memory, falls okay, sonst einen Defaultwert
function getMemory(memory = undefined) {
    return getValue(memory, getValue(myOptMem, __OPTMEMNORMAL));
}

// Kompatibilitaetsfunktion: Testet, ob der uebergebene Speicher genutzt werden kann
// memory: __OPTMEM.normal = bis Browserende gespeichert (sessionStorage), __OPTMEM.unbegrenzt = unbegrenzt gespeichert (localStorage), __OPTMEM.inaktiv
function canUseMemory(memory = undefined) {
    const __STORAGE = getMemory(memory);
    const __MEMORY = __STORAGE.Value;
    let ret = false;

    if (__MEMORY !== undefined) {
        const __TESTPREFIX = 'canUseStorageTest';
        const __TESTDATA = Math.random().toString();
        const __TESTITEM = __TESTPREFIX + __TESTDATA;

        __MEMORY.setItem(__TESTITEM, __TESTDATA);
        ret = (__MEMORY.getItem(__TESTITEM) === __TESTDATA);
        __MEMORY.removeItem(__TESTITEM);
    }

    console.log("canUseStorage(" + __STORAGE.Name + ") = " + ret);

    return ret;
}

// Restauriert den vorherigen Speicher (der in einer Option definiert ist)
// opt: Option zur Wahl des Speichers
// return Gesuchter Speicher oder Null-Speicher ('inaktiv')
function restoreMemoryByOpt(opt) {
    // Memory Storage fuer vorherige Speicherung...
    const __STORAGE = getOptValue(opt, __MEMNORMAL, true, true);

    return __OPTMEM[__STORAGE];
}

// Initialisiert den Speicher (der in einer Option definiert ist) und merkt sich diesen ggfs.
// opt: Option zur Wahl des Speichers
// saveOpt: Option zur Speicherung der Wahl des Speichers (fuer restoreMemoryByOpt)
// return Gesuchter Speicher oder Null-Speicher ('inaktiv'), falls speichern nicht moeglich ist
function startMemoryByOpt(opt, saveOpt = undefined) {
    // Memory Storage fuer naechste Speicherung...
    let storage = getOptValue(opt, __MEMNORMAL);
    let optMem = __OPTMEM[storage];

    if (! canUseMemory(optMem)) {
        if (storage !== __MEMINAKTIVE) {
            storage = __MEMINAKTIVE;
            optMem = __OPTMEM[storage];
        }
    }

    if (saveOpt !== undefined) {
        setOpt(saveOpt, storage, false);
    }

    return optMem;
}

// ==================== Ende Abschnitt fuer Speicher ====================

// ==================== Abschnitt fuer die Scriptdatenbank ====================

// Initialisiert die Scriptdatenbank, die einen Datenaustausch zwischen den Scripten ermoeglicht
// optSet: Gesetzte Optionen (und Config)
function initScriptDB(optSet) {
    const __INFO = GM_info;
    const __META = __INFO.script;

    //console.log(__INFO);

    __DBTOC.versions = getValue(JSON.parse(__DBMEM.getItem('__DBTOC.versions')), { });

    // Infos zu diesem Script...
    __DBMOD.name = __META.name;
    __DBMOD.version = __META.version;

    console.log(__DBMOD);

    // Zunaechst den alten Eintrag entfernen...
    __DBTOC.versions[__DBMOD.name] = undefined;

    // ... und die Daten der Fremdscripte laden...
    for (let module in __DBTOC.versions) {
        __DBDATA[module] = getValue(JSON.parse(__DBMEM.getItem('__DBDATA.' + module)), { });
    }
}

// Setzt die Daten dieses Scriptes in der Scriptdatenbank, die einen Datenaustausch zwischen den Scripten ermoeglicht
// optSet: Gesetzte Optionen (und Config)
function updateScriptDB(optSet) {
    // Eintrag ins Inhaltsverzeichnis...
    __DBTOC.versions[__DBMOD.name] = __DBMOD.version;

    // Permanente Speicherung der Eintraege...
    __DBMEM.setItem('__DBTOC.versions', JSON.stringify(__DBTOC.versions));
    __DBMEM.setItem('__DBDATA.' + __DBMOD.name, JSON.stringify(optSet));

    // Jetzt die inzwischen gefuellten Daten *dieses* Scripts ergaenzen...
    __DBDATA[__DBMOD.name] = getValue(optSet, { });

    console.log(__DBDATA);
}

// ==================== Ende Abschnitt fuer die Scriptdatenbank ====================

// ==================== Ende Abschnitt fuer Speicher und die Scriptdatenbank ====================

// ==================== Abschnitt fuer das Benutzermenu ====================

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
// menu: Text zum Setzen im Menu ($ wird durch gesetzten Wert ersetzt)
// fun: Funktion zum Setzen des naechsten Wertes
// key: Hotkey zum Setzen des naechsten Wertes im Menu
function registerNextMenuOption(opt, arr, menu, fun, key) {
    const __MENU = menu.replace('$', opt);
    let options = "OPTION " + __MENU;

    for (let value of arr) {
        if (value === opt) {
            options += " / *" + value + '*';
        } else {
            options += " / " + value;
        }
    }
    console.log(options);

    GM_registerMenuCommand(__MENU, fun, key);
}

// Zeigt den Eintrag im Menu einer Option, falls nicht hidden
// opt: Derzeitiger Wert der Option
// menu: Text zum Setzen im Menu ($ wird durch gesetzten Wert ersetzt)
// fun: Funktion zum Setzen des naechsten Wertes
// key: Hotkey zum Setzen des naechsten Wertes im Menu
// hidden: Angabe, ob Menupunkt nicht sichtbar sein soll (default: sichtbar)
// serial: Serialization fuer komplexe Daten
function registerDataOption(opt, menu, fun, key, hidden = false, serial = true) {
    const __VALUE = ((serial && (opt !== undefined)) ? JSON.stringify(opt) : opt);
    const __MENU = getValue(menu, "").replace('$', __VALUE);
    const __OPTIONS = (hidden ? "HIDDEN " : "") + "OPTION " + __MENU +
                      getValue(__VALUE, "", " = " + __VALUE);

    console.log(__OPTIONS);

    if (! hidden) {
        GM_registerMenuCommand(__MENU, fun, key);
    }
}

// Zeigt den Eintrag im Menu einer Option
// opt: Config und Value der Option
function registerOption(opt) {
    const __CONFIG = getOptConfig(opt);

    if (! __CONFIG.HiddenMenu) {
        switch (__CONFIG.Type) {
        case __OPTTYPES.MC : registerNextMenuOption(getOptValue(opt), __CONFIG.Choice,
                                                                  __CONFIG.Label, opt.Action, __CONFIG.Hotkey);
                             break;
        case __OPTTYPES.SW : registerMenuOption(getOptValue(opt), __CONFIG.Label, opt.Action, __CONFIG.Hotkey,
                                                                  __CONFIG.AltLabel, opt.Action, __CONFIG.AltHotkey);
                             break;
        case __OPTTYPES.TF : registerMenuOption(getOptValue(opt), __CONFIG.Label, opt.Action, __CONFIG.Hotkey,
                                                                  __CONFIG.AltLabel, opt.AltAction, __CONFIG.AltHotkey);
                             break;
        case __OPTTYPES.SD : registerDataOption(getOptValue(opt), __CONFIG.Label, opt.Action, __CONFIG.Hotkey,
                                                                  __CONFIG.HiddenMenu, __CONFIG.Serial);
                             break;
        case __OPTTYPES.SI : registerDataOption(getOptValue(opt), __CONFIG.Label, opt.Action, __CONFIG.Hotkey,
                                                                  __CONFIG.HiddenMenu, __CONFIG.Serial);
                             break;
        default :            break;
        }
    } else {
        // Nur Anzeige im Log...
        registerDataOption(getOptValue(opt), getOptName(opt), opt.Action, __CONFIG.Hotkey, __CONFIG.HiddenMenu, __CONFIG.Serial);
    }
}

// ==================== Ende Abschnitt fuer das Benutzermenu ====================

// Initialisiert die gesetzten Option
// config: Konfiguration der Option
// return Initialwert der gesetzten Option
function initOptValue(config) {
    let value = config.Default;  // Standard

    if (config.SharedData !== undefined) {
        value = config.SharedData;
    }

    switch (config.Type) {
    case __OPTTYPES.MC : if ((value === undefined) && (config.Choice !== undefined)) {
                             value = config.Choice[0];
                         }
                         break;
    case __OPTTYPES.SW : break;
    case __OPTTYPES.TF : break;
    case __OPTTYPES.SD : config.Serial = true;
                         break;
    case __OPTTYPES.SI : break;
    default :            break;
    }

    if (config.Serial || config.Hidden) {
        config.HiddenMenu = true;
    }

    return value;
}

// Initialisiert die Menue-Funktion einer Option
// optAction: Typ der Funktion
// item: Key der Option
// optSet: Platz fuer die gesetzten Optionen (und Config)
// return Funktion fuer die Option
function initOptAction(optAction, item = undefined, optSet = undefined) {
    let fun;

    if (optAction !== undefined) {
        const __CONFIG = getOptConfig(getOptByName(optSet, item));
        const __RELOAD = getValue(getValue(__CONFIG, { }).ActionReload, false);

        switch (optAction) {
        case __OPTACTION.SET : fun = function() {
                                       return setOptByName(optSet, item, optSet.SetValue, __RELOAD);
                                   };
                               break;
        case __OPTACTION.NXT : fun = function() {
                                       return setNextOptByName(optSet, item, optSet.SetValue, __RELOAD);
                                   };
                               break;
        case __OPTACTION.RST : fun = function() {
                                       return resetOptions(optSet, __RELOAD);
                                   };
                               break;
        default :              break;
        }
    }

    return fun;
}

// Gibt diese Config oder, falls 'Shared', ein Referenz-Objekt mit gemeinsamen Daten zurueck
// optConfig: Konfiguration der Option
// return Entweder optConfig oder gemergete Daten auf Basis des in 'Shared' angegebenen Objekts
function getSharedConfig(optConfig) {
    let config = getValue(optConfig, { });
    const __SHARED = config.Shared;

    if (__SHARED !== undefined) {
        const __NAMESPACE = __SHARED.namespace;
        const __MODULE = __SHARED.module;
        const __ITEM = __SHARED.item;
        let ref = __DBDATA;  // Gemeinsame Daten

        if (__NAMESPACE !== undefined) {
            ref = ref;  // [__NAMESPACE]
        }
        if (__MODULE !== undefined) {
            ref = ref[__MODULE];

            if (__ITEM !== undefined) {
                ref = ref[__ITEM];
            }
        }

        if (__ITEM !== undefined) {  // ref ist ein Item
            config = { };  // Neu aufbauen...
            addProps(config, getOptConfig(ref));
            addProps(config, optConfig);
            config.SetValue = getOptValue(ref);
        } else {  // ref enthaelt die Daten selbst
            config.SetValue = ref;
        }
    }

    return config;
}

// Initialisiert die gesetzten Optionen
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// preInit: Vorinitialisierung einzelner Optionen mit 'PreInit'-Attribut
// return Gefuelltes Objekt mit den gesetzten Optionen
function initOptions(optConfig, optSet = undefined, preInit = undefined) {
    let value;

    if (optSet === undefined) {
        optSet = { };
    }

    for (let opt in optConfig) {
        const __OPTCONFIG = optConfig[opt];
        const __PREINIT = getValue(__OPTCONFIG.PreInit, false);

        if ((preInit === undefined) || (__PREINIT === preInit)) {
            const __CONFIG = getSharedConfig(__OPTCONFIG);
            const __ALTACTION = getValue(__CONFIG.AltAction, __CONFIG.Action);
            // Gab es vorher einen Aufruf, der einen Stub-Eintrag erzeugt hat? Wurde ggfs. bereits geaendert...
            const __USESTUB = ((preInit === false) && __PREINIT);
            const __LOADED = (__USESTUB ? optSet[opt].Loaded : false);
            const __VALUE = (__USESTUB ? optSet[opt].Value : initOptValue(__CONFIG));

            optSet[opt] = {
                'Config'    : __CONFIG,
                'Loaded'    : __LOADED,
                'Value'     : __VALUE,
                'SetValue'  : __CONFIG.SetValue,
                'Action'    : initOptAction(__CONFIG.Action, opt, optSet),
                'AltAction' : initOptAction(__ALTACTION, opt, optSet)
            };
        } else if (preInit) {  // erstmal nur Stub
            optSet[opt] = {
                'Config'    : __OPTCONFIG,
                'Loaded'    : false,
                'Value'     : initOptValue(__OPTCONFIG)
            };
        }
    }

    return optSet;
}

    // Abhaengigkeiten:
    // ================
    // initOptions (PreInit):
    // restoreMemoryByOpt: PreInit oldStorage
    // getStoredCmds: restoreMemoryByOpt
    // runStoredCmds: getStoredCmds
    // loadOptions: PreInit
    // startMemoryByOpt: storage oldStorage
    // initScriptDB: startMemoryByOpt
    // initOptions (Rest): PreInit
    // __MYTEAM (initTeam): initOptions
    // getMyTeam callback (getOptPrefix): initTeam
    // renameOptions: getOptPrefix
    // showOptions: startMemoryByOpt renameOptions
    // updateScriptDB: startMemoryByOpt
    // buildMenu: showOptions
    // buildForm: showOptions

// Initialisiert die gesetzten Optionen und den Speicher und laedt die Optionen zum Start
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// return Gefuelltes Objekt mit den gesetzten Optionen
function startOptions(optConfig, optSet = undefined, classification = undefined) {
    optSet = initOptions(optConfig, optSet, true);  // PreInit

    // Memory Storage fuer vorherige Speicherung...
    myOptMem = restoreMemoryByOpt(optSet.oldStorage);

    // Zwischengespeicherte Befehle auslesen...
    const __STOREDCMDS = getStoredCmds(myOptMem);

    // ... ermittelte Befehle ausführen...
    const __LOADEDCMDS = runStoredCmds(__STOREDCMDS, optSet, true);  // BeforeLoad

    loadOptions(optSet);

    // Memory Storage fuer naechste Speicherung...
    myOptMem = startMemoryByOpt(optSet.storage, optSet.oldStorage);

    initScriptDB(optSet);

    optSet = initOptions(optConfig, optSet, false);  // Rest

    if (classification !== undefined) {
        // Classification mit optSet verknuepfen...
        classification.optSet = optSet;

        // Umbenennungen durchfuehren...
        classification.renameOptions();
    }

    // ... ermittelte Befehle ausführen...
    runStoredCmds(__LOADEDCMDS, optSet, false);  // Rest

    return optSet;
}

// Installiert die Visualisierung und Steuerung der Optionen
// optSet: Platz fuer die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'hideMenu': Optionen werden zwar geladen und genutzt, tauchen aber nicht im Benutzermenu auf
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
function showOptions(optSet = undefined, optParams = { 'hideMenu' : false }) {
    updateScriptDB(optSet);

    if (! optParams.hideMenu) {
        buildMenu(optSet);
    }

    if ((optParams.menuAnchor !== undefined) && (myOptMem !== __OPTMEMINAKTIVE)) {
        buildForm(optParams.menuAnchor, optSet, optParams);
    }
}

// Setzt eine Option auf einen vorgegebenen Wert
// Fuer kontrollierte Auswahl des Values siehe setNextOpt()
// opt: Config und vorheriger Value der Option
// value: (Bei allen Typen) Zu setzender Wert
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setOpt(opt, value, reload = false) {
    return setOptValue(opt, setStored(getOptName(opt), value, reload, getOptConfig(opt).Serial));
}

// Ermittelt die naechste moegliche Option
// opt: Config und Value der Option
// value: Ggfs. zu setzender Wert
// return Zu setzender Wert
function getNextOpt(opt, value = undefined) {
    const __CONFIG = getOptConfig(opt);
    const __VALUE = getOptValue(opt, value);

    switch (__CONFIG.Type) {
    case __OPTTYPES.MC : return getValue(value, getNextValue(__CONFIG.Choice, __VALUE));
    case __OPTTYPES.SW : return getValue(value, ! __VALUE);
    case __OPTTYPES.TF : return getValue(value, ! __VALUE);
    case __OPTTYPES.SD : return getValue(value, __VALUE);
    case __OPTTYPES.SI : break;
    default :            break;
    }

    return __VALUE;
}

// Setzt die naechste moegliche Option
// opt: Config und Value der Option
// value: Default fuer ggfs. zu setzenden Wert
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setNextOpt(opt, value = undefined, reload = true) {
    const __CONFIG = getOptConfig(opt);

    return setOpt(opt, getNextOpt(opt, value), reload);
}

// Setzt eine Option auf einen vorgegebenen Wert (Version mit Key)
// Fuer kontrollierte Auswahl des Values siehe setNextOptByName()
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// value: (Bei allen Typen) Zu setzender Wert
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setOptByName(optSet, item, value, reload = false) {
    const __OPT = getOptByName(optSet, item);

    return setOpt(__OPT, value, reload);
}

// Ermittelt die naechste moegliche Option (Version mit Key)
// opt: Config und Value der Option
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// value: Ggfs. zu setzender Wert
// return Zu setzender Wert
function getNextOptByName(optSet, item, value = undefined) {
    const __OPT = getOptByName(optSet, item);

    return getNextOpt(__OPT, value);
}

// Setzt die naechste moegliche Option (Version mit Key)
// opt: Config und Value der Option
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// value: Ggfs. zu setzender Wert
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setNextOptByName(optSet, item, value = undefined, reload = true) {
    const __OPT = getOptByName(optSet, item);

    return setNextOpt(__OPT, value, reload);
}

// Baut das Benutzermenu auf
// optSet: Gesetzte Optionen
function buildMenu(optSet) {
    console.log("buildMenu()");

    for (let opt in optSet) {
        registerOption(optSet[opt]);
    }
}

// Invalidiert eine (ueber Menu) gesetzte Option
// opt: Zu invalidierende Option
// force: Invalidiert auch Optionen mit 'AutoReset'-Attribut
function invalidateOpt(opt, force = false) {
    const __CONFIG = getOptConfig(opt);

    // Wert "ungeladen"...
    opt.Loaded = (force || ! __CONFIG.AutoReset);

    if (opt.Loaded) {
        // Nur zuruecksetzen, gilt als geladen...
        setOptValue(opt, initOptValue(__CONFIG));
    }
}

// Invalidiert die (ueber Menu) gesetzten Optionen
// optSet: Set mit den Optionen
// force: Invalidiert auch Optionen mit 'AutoReset'-Attribut
// return Set mit den geladenen Optionen
function invalidateOpts(optSet, force = false) {
    for (let opt in optSet) {
        const __OPT = optSet[opt];

        if (__OPT.Loaded) {
            invalidateOpt(__OPT, force);
        }
    }

    return optSet;
}

// Laedt eine (ueber Menu) gesetzte Option
// opt: Zu ladende Option
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Gesetzter Wert der gelandenen Option
function loadOption(opt, force = false) {
    const __CONFIG = getOptConfig(opt);
    let value;

    if (! force && __CONFIG.AutoReset) {
        value = setOptValue(opt, initOptValue(__CONFIG));
    } else if (__CONFIG.Serial) {
        value = setOptValue(opt, deserialize(getOptName(opt), getOptValue(opt)));
    } else {
        value = setOptValue(opt, GM_getValue(getOptName(opt), getOptValue(opt)));
    }

    // Wert geladen...
    opt.Loaded = true;

    return value;
}

// Laedt die (ueber Menu) gesetzten Optionen
// optSet: Set mit den Optionen
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Set mit den geladenen Optionen
function loadOptions(optSet, force = false) {
    for (let opt in optSet) {
        const __OPT = optSet[opt];

        if (! __OPT.Loaded) {
            loadOption(__OPT, force);
        }
    }

    return optSet;
}

// Entfernt eine (ueber Menu) gesetzte Option (falls nicht 'Permanent')
// opt: Gesetzte Option
// force: Entfernt auch Optionen mit 'Permanent'-Attribut
// reset: Setzt bei Erfolg auf Initialwert der Option
function deleteOption(opt, force = false, reset = true) {
    const __CONFIG = getOptConfig(opt);

    if (force || ! __CONFIG.Permanent) {
        const __NAME = getOptName(opt);

        console.log("DELETE " + __NAME);

        GM_deleteValue(__NAME);

        if (reset) {
            setOptValue(opt, initOptValue(__CONFIG));
        }
    }
}

// Entfernt die (ueber Menu) gesetzten Optionen (falls nicht 'Permanent')
// optSet: Gesetzte Optionen
// optSelect: Liste von ausgewaehlten Optionen, true = entfernen, false = nicht entfernen
// force: Entfernt auch Optionen mit 'Permanent'-Attribut
// reset: Setzt bei Erfolg auf Initialwert der Option
function deleteOptions(optSet, optSelect = undefined, force = false, reset = true) {
    const __DELETEALL = (optSelect === undefined) || (optSelect === true);
    const __OPTSELECT = getValue(optSelect, { });

    for (let opt in optSet) {
        if (getValue(__OPTSELECT[opt], __DELETEALL)) {
            deleteOption(optSet[opt], force, reset);
        }
    }
}

// Benennt eine Option um und laedt sie ggfs. nach
// opt: Gesetzte Option
// name: Neu zu setzender Name (Speicheradresse)
// reload: Wert nachladen statt beizubehalten
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Umbenannte Option
function renameOption(opt, name, reload = false, force = false) {
    const __NAME = getOptName(opt);

    if (__NAME !== name) {
        deleteOption(opt, true, ! reload);

        setOptName(opt, name);

        if (reload) {
            loadOption(opt, force);
        }
    }

    return opt;
}

// Ermittelt einen neuen Namen mit einem Prefix. Parameter fuer renameOptions()
// name: Gesetzter Name (Speicheradresse)
// prefix: Prefix, das vorangestellt werden soll
// return Neu zu setzender Name (Speicheradresse)
function prefixName(name, prefix) {
    return (prefix + name);
}

// Ermittelt einen neuen Namen mit einem Postfix. Parameter fuer renameOptions()
// name: Gesetzter Name (Speicheradresse)
// postfix: Postfix, das angehaengt werden soll
// return Neu zu setzender Name (Speicheradresse)
function postfixName(name, postfix) {
    return (name + postfix);
}

// Benennt selektierte Optionen nach einem Schema um und laedt sie ggfs. nach
// optSet: Gesetzte Optionen
// optSelect: Liste von ausgewaehlten Optionen, true = nachladen, false = nicht nachladen
// 'reload': Option nachladen?
// 'force': Option auch mit 'AutoReset'-Attribut nachladen?
// renameParam: Wird an renameFun uebergeen
// renameFun: function(name, param) zur Ermittlung des neuen Namens
// name: Neu zu setzender Name (Speicheradresse)
// reload: Wert nachladen statt beizubehalten
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Umbenannte Option
function renameOptions(optSet, optSelect, renameParam = undefined, renameFun = prefixName) {
    if (renameFun === undefined) {
        console.error("RENAME: Illegale Funktion!");
    }
    for (let opt in optSelect) {
        const __OPTPARAMS = optSelect[opt];
        const __OPT = optSet[opt];

        if (__OPT === undefined) {
            console.error("RENAME: Option '" + opt + "' nicht gefunden!");
        } else {
            const __NAME = getOptName(__OPT);
            const __NEWNAME = renameFun(__NAME, renameParam);
            const __ISSCALAR = (typeof __OPTPARAMS === 'boolean');
            // Laedt die unter dem neuen Namen gespeicherten Daten nach?
            const __RELOAD = (__ISSCALAR ? __OPTPARAMS : __OPTPARAMS.reload);
            // Laedt auch Optionen mit 'AutoReset'-Attribut?
            const __FORCE = (__ISSCALAR ? true : __OPTPARAMS.force);

            renameOption(__OPT, __NEWNAME, __RELOAD, __FORCE);
        }
    }
}

// Setzt die Optionen in optSet auf die "Werkseinstellungen" des Skripts
// optSet: Gesetzte Optionen
// reload: Seite mit "Werkseinstellungen" neu laden
function resetOptions(optSet, reload = true) {
    // Alle (nicht 'Permanent') gesetzten Optionen entfernen...
    deleteOptions(optSet, true, false, ! reload);

    if (reload) {
        // ... und Seite neu laden (mit "Werkseinstellungen")...
        window.location.reload();
    }
}

// ==================== Abschnitt fuer Klasse Classification ====================

// Basisklasse fuer eine Klassifikation der Optionen nach Kriterium (z.B. Erst- und Zweitteam oder Fremdteam)
function Classification() {
    this.renameFun = prefixName;
    //this.renameParamFun = undefined;
    this.optSet = undefined;
    this.optSelect = { };

    this.renameOptions = function() {
        const __PARAM = this.renameParamFun();

        if (__PARAM !== undefined) {
            // Klassifizierte Optionen umbenennen...
            renameOptions(this.optSet, this.optSelect, __PARAM, this.renameFun);
        }
    };

    this.deleteOptions = function() {
        return deleteOptions(this.optSet, this.optSelect, true, true);
    };
}

// ==================== Ende Abschnitt fuer Klasse Classification ====================

// ==================== Abschnitt fuer Klasse TeamClassification ====================

// Klasse fuer die Klassifikation der Optionen nach Team (Erst- und Zweitteam oder Fremdteam)
function TeamClassification() {
    this.team = new Team();
    this.teamParams = { };

    this.renameParamFun = function() {
        const __MYTEAM = this.team;

        getMyTeam(this.optSet, this.teamParams, __MYTEAM);

        if (__MYTEAM.LdNr !== undefined) {
            // Prefix fuer die Optionen mit gesonderten Behandlung...
            return __MYTEAM.LdNr.toString() + __MYTEAM.LgNr.toString();
        } else {
            return undefined;
        }
    };
}

TeamClassification.prototype = new Classification();

// ==================== Ende Abschnitt fuer Klasse TeamClassification ====================

// ==================== Abschnitt fuer Klasse Team ====================

// Klasse fuer Teamdaten
function Team() {
    this.Team = undefined;
    this.Liga = undefined;
    this.Land = undefined;
    this.LdNr = 0;
    this.LgNr = 0;
}

// Items, die in Team als Teamdaten gesetzt werden...
Team.prototype.__TEAMITEMS = {
                       'Team'       : true,
                       'Liga'       : true,
                       'Land'       : true,
                       'LdNr'       : true,
                       'LgNr'       : true
                   };

// ==================== Ende Abschnitt fuer Klasse Team ====================

// ==================== Spezialisierter Abschnitt fuer Optionen ====================

// Gesetzte Optionen (wird von initOptions() angelegt und von loadOptions() gefuellt):
const __OPTSET = { };

// Teamparameter fuer getrennte Speicherung der Optionen fuer Erst- und Zweitteam...
//const __MYTEAM = { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined, 'LdNr' : 0, 'LgNr' : 0 };
//const __MYTEAM = new Team();

const __TEAMCLASS = new TeamClassification();

// Optionen mit Daten, die ZAT- und Team-bezogen gemerkt werden...
__TEAMCLASS.optSelect = {
                       'datenZat'   : true,
                       'birthdays'  : true,
                       'tClasses'   : true,
                       'progresses' : true,
                       'zatAges'    : true,
                       'trainiert'  : true,
                       'positions'  : true
                   };

// Gibt die Teamdaten zurueck und aktualisiert sie ggfs. in der Option
// optSet: Platz fuer die gesetzten Optionen
// teamParams: Dynamisch ermittelte Teamdaten ('Team', 'Liga', 'Land', 'LdNr' und 'LgNr')
// myTeam: Objekt fuer die Teamdaten
// return Die Teamdaten oder undefined bei Fehler
function getMyTeam(optSet = undefined, teamParams = { }, myTeam = { }) {
    if (teamParams !== undefined) {
        addProps(myTeam, teamParams, __TEAMITEMS);
        console.log("Ermittelt: " + JSON.stringify(myTeam));
        // ... und abspeichern...
        setOpt(optSet.team, myTeam, false);
    } else {
        const __TEAM = getOptValue(optSet.team);  // Gespeicherte Parameter

        if ((__TEAM !== undefined) && (__TEAM.Land !== undefined)) {
            addProps(myTeam, __TEAM, __TEAMITEMS);
            console.log("Gespeichert: " + JSON.stringify(myTeam));
        } else {
            console.error("Unbekannt: " + JSON.stringify(__TEAM));
        }
    }

    //return ((myTeam.length > 0) ? myTeam : undefined);
    return myTeam;
}

// Ermittelt Teamprefix und laedt dafuer die Teamdaten nach __MYTEAM
// optSet: Platz fuer die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'teamParams': Getrennte Daten-Option wird genutzt, hier: __MYTEAM mit 'LdNr'/'LgNr' des Erst- bzw. Zweitteams
// return Prefix fuer die teambezogenen Daten
function getMyTeamPrefix(optSet = undefined, optParams = { }) {
    const __TEAMPARAMS = optParams.teamParams;  // Ermittelte Parameter
    const __MYTEAM = __TEAMCLASS.team;

    getMyTeam(optSet, __TEAMPARAMS, __MYTEAM);

    if (__MYTEAM.LdNr !== undefined) {
        // Prefix fuer die Optionen 'datenZat', 'birthdays', 'tClasses', 'progresses',
        // 'zatAges', 'trainiert' und 'positions' zur gesonderten Behandlung...
        return __MYTEAM.LdNr.toString() + __MYTEAM.LgNr.toString();
    } else {
        return undefined;
    }
}

// Behandelt die Optionen und laedt das Benutzermenu
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'hideMenu': Optionen werden zwar geladen und genutzt, tauchen aber nicht im Benutzermenu auf
// 'teamParams': Getrennte Daten-Option wird genutzt, hier: __MYTEAM mit 'LdNr'/'LgNr' des Erst- bzw. Zweitteams
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { 'hideMenu' : false }) {
    __TEAMCLASS.teamParams = optParams.teamParams;  // Ermittelte Parameter

    optSet = startOptions(optConfig, optSet);

    showOptions(optSet, optParams);

    return optSet;
}

// ==================== Abschnitt fuer diverse Utilities ====================

// Legt Input-Felder in einem Form-Konstrukt an, falls noetig
// form: <form>...</form>
// props: Map von name:value-Paaren
// type: Typ der Input-Felder (Default: unsichtbare Daten)
// return Ergaenztes Form-Konstrukt
function addInputField(form, props, type = "hidden") {
    for (let fieldName in props) {
        let field = form[fieldName];
        if (! field) {
            field = document.createElement("input");
            field.type = type;
            field.name = fieldName;
            form.appendChild(field);
        }
        field.value = props[fieldName];
    }

    return form;
}

// Legt unsichtbare Input-Daten in einem Form-Konstrukt an, falls noetig
// form: <form>...</form>
// props: Map von name:value-Paaren
// return Ergaenztes Form-Konstrukt
function addHiddenField(form, props) {
    return addInputField(form, props, "hidden");
}

// Hilfsfunktion fuer alle Browser: Fuegt fuer ein Event eine Reaktion ein
// obj: Betroffenes Objekt, z.B. ein Eingabeelement
// type: Name des Events, z.B. "click"
// callback: Funktion als Reaktion
// capture: Event fuer Parent zuerst (true) oder Child (false als Default)
// return false bei Misserfolg
function addEvent(obj, type, callback, capture = false) {
    if (obj.addEventListener) {
        return obj.addEventListener(type, callback, capture);
    } else if (obj.attachEvent) {
        return obj.attachEvent("on" + type, callback);
    } else {
        console.log("Could not add " + type + " event:");
        console.log(callback);

        return false;
    }
}

// Hilfsfunktion fuer alle Browser: Entfernt eine Reaktion fuer ein Event
// obj: Betroffenes Objekt, z.B. ein Eingabeelement
// type: Name des Events, z.B. "click"
// callback: Funktion als Reaktion
// capture: Event fuer Parent zuerst (true) oder Child (false als Default)
// return false bei Misserfolg
function removeEvent(obj, type, callback, capture = false) {
    if (obj.removeEventListener) {
        return obj.removeEventListener(type, callback, capture);
    } else if (obj.detachEvent) {
        return obj.detachEvent("on" + type, callback);
    } else {
        console.log("Could not remove " + type + " event:");
        console.log(callback);

        return false;
    }
}

// Hilfsfunktion fuer alle Browser: Fuegt fuer ein Event eine Reaktion ein
// id: ID des betroffenen Eingabeelements
// type: Name des Events, z.B. "click"
// callback: Funktion als Reaktion
// capture: Event fuer Parent zuerst (true) oder Child (false als Default)
// return false bei Misserfolg
function addDocEvent(id, type, callback, capture = false) {
    const __OBJ = document.getElementById(id);

    return addEvent(__OBJ, type, callback, capture);
}

// Hilfsfunktion fuer alle Browser: Entfernt eine Reaktion fuer ein Event
// id: ID des betroffenen Eingabeelements
// type: Name des Events, z.B. "click"
// callback: Funktion als Reaktion
// capture: Event fuer Parent zuerst (true) oder Child (false als Default)
// return false bei Misserfolg
function removeDocEvent(id, type, callback, capture = false) {
    const __OBJ = document.getElementById(id);

    return removeEvent(__OBJ, type, callback, capture);
}

// Hilfsfunktion fuer die Ermittlung eines Elements der Seite
// name: Name des Elements (siehe "name=")
// index: Laufende Nummer des Elements (0-based), Default: 0
// doc: Dokument (document)
// return Gesuchtes Element mit der lfd. Nummer index oder undefined (falls nicht gefunden)
function getElement(name, index = 0, doc = document) {
    const __TAGS = document.getElementsByName(name);
    const __TABLE = (__TAGS === undefined) ? undefined : __TAGS[index];

    return __TABLE;
}

// Hilfsfunktion fuer die Ermittlung eines Elements der Seite (Default: Tabelle)
// index: Laufende Nummer des Elements (0-based)
// tag: Tag des Elements ("table")
// doc: Dokument (document)
// return Gesuchtes Element oder undefined (falls nicht gefunden)
function getTable(index, tag = "table", doc = document) {
    const __TAGS = document.getElementsByTagName(tag);
    const __TABLE = (__TAGS === undefined) ? undefined : __TAGS[index];

    return __TABLE;
}

// Hilfsfunktion fuer die Ermittlung der Zeilen einer Tabelle
// index: Laufende Nummer des Elements (0-based)
// doc: Dokument (document)
// return Gesuchte Zeilen oder undefined (falls nicht gefunden)
function getRows(index, doc = document) {
    const __TABLE = getTable(index, "table", doc);
    const __ROWS = (__TABLE === undefined) ? undefined : __TABLE.rows;

    return __ROWS;
}

// ==================== Abschnitt fuer Optionen auf der Seite ====================

// Liefert den Funktionsaufruf zur Option als String
// opt: Auszufuehrende Option
// isAlt: Angabe, ob AltAction statt Action gemeint ist
// value: Ggfs. zu setzender Wert
// serial: Serialization fuer String-Werte (Select, Textarea)
// memory: __OPTMEM.normal = bis Browserende gespeichert (sessionStorage), __OPTMEM.unbegrenzt = unbegrenzt gespeichert (localStorage), __OPTMEM.inaktiv
// return String mit dem (reinen) Funktionsaufruf
function getFormAction(opt, isAlt = false, value = undefined, serial = undefined, memory = undefined) {
    const __STORAGE = getMemory(memory);
    const __MEMORY = __STORAGE.Value;
    const __MEMSTR = __STORAGE.Display;
    const __RUNPREFIX = __STORAGE.Prefix;

    if (__MEMORY !== undefined) {
        const __RELOAD = "window.location.reload()";
        const __SETITEM = function(item, val, quotes = true) {
                              return (__MEMSTR + ".setItem('" + __RUNPREFIX + item + "', " + (quotes ? "'" + val + "'" : val) + "),");
                          };
        const __SETITEMS = function(cmd, key = undefined, val = undefined) {
                              return ('(' + __SETITEM('cmd', cmd) + ((key === undefined) ? "" :
                                      __SETITEM('key', key) + __SETITEM('val', val, false)) + __RELOAD + ')');
                          };
        const __CONFIG = getOptConfig(opt);
        const __SERIAL = getValue(serial, getValue(__CONFIG.Serial, false));
        const __THISVAL = ((__CONFIG.ValType === "String") ? "'\\x22' + this.value + '\\x22'" : "this.value");
        const __TVALUE = getValue(__CONFIG.ValType, __THISVAL, "new " + __CONFIG.ValType + '(' + __THISVAL + ')');
        const __VALSTR = ((value !== undefined) ? JSON.stringify(value) : __SERIAL ? "JSON.stringify(" + __TVALUE + ')' : __TVALUE);
        const __ACTION = (isAlt ? getValue(__CONFIG.AltAction, __CONFIG.Action) : __CONFIG.Action);

        if (__ACTION !== undefined) {
            switch (__ACTION) {
            case __OPTACTION.SET : //return "doActionSet('" + getOptName(opt) + "', " + getNextOpt(opt, __VALSTR) + ')';
                                   return __SETITEMS('SET', getOptName(opt), __VALSTR);
            case __OPTACTION.NXT : //return "doActionNxt('" + getOptName(opt) + "', " + getNextOpt(opt, __VALSTR) + ')';
                                   return __SETITEMS('NXT', getOptName(opt), __VALSTR);
            case __OPTACTION.RST : //return "doActionRst()";
                                   return __SETITEMS('RST');
            default :              break;
            }
        }
    }

    return undefined;
}

// Liefert die Funktionsaufruf zur Option als String
// opt: Auszufuehrende Option
// isAlt: Angabe, ob AltAction statt Action gemeint ist
// value: Ggfs. zu setzender Wert
// type: Event-Typ fuer <input>, z.B. "click" fuer "onclick="
// serial: Serialization fuer String-Werte (Select, Textarea)
// memory: __OPTMEM.normal = bis Browserende gespeichert (sessionStorage), __OPTMEM.unbegrenzt = unbegrenzt gespeichert (localStorage), __OPTMEM.inaktiv
// return String mit dem (reinen) Funktionsaufruf
function getFormActionEvent(opt, isAlt = false, value = undefined, type = "click", serial = undefined, memory = undefined) {
    const __ACTION = getFormAction(opt, isAlt, value, serial, memory);

    return getValue(__ACTION, "", ' on' + type + '="' + __ACTION + '"');
}

// Zeigt eine Option auf der Seite als Auswahlbox an
// opt: Anzuzeigende Option
// return String mit dem HTML-Code
function getOptionSelect(opt) {
    const __CONFIG = getOptConfig(opt);
    const __NAME = getOptName(opt);
    const __VALUE = getOptValue(opt);
    const __ACTION = getFormActionEvent(opt, false, undefined, "change", undefined);
    const __FORMLABEL = getValue(__CONFIG.FormLabel, __CONFIG.Label);
    const __LABEL = '<label for="' + __NAME + '">' + __FORMLABEL + '</label>';
    let element = '<select name="' + __NAME + '" id="' + __NAME + '"' + __ACTION + '>';

    for (let value of __CONFIG.Choice) {
        element += '\n<option value="' + value + '"' +
                   ((value === __VALUE) ? ' SELECTED' : "") +
                   '>' + value + '</option>';
    }
    element += '\n</select>';

    return __LABEL.replace('$', element);
}

// Zeigt eine Option auf der Seite als Radiobutton an
// opt: Anzuzeigende Option
// return String mit dem HTML-Code
function getOptionRadio(opt) {
    const __CONFIG = getOptConfig(opt);
    const __NAME = getOptName(opt);
    const __VALUE = getOptValue(opt, false);
    const __ACTION = getFormActionEvent(opt, false, true, "click", false);
    const __ALTACTION = getFormActionEvent(opt, true, false, "click", false);
    const __ELEMENTON  = '<input type="radio" name="' + __NAME +
                         '" id="' + __NAME + 'ON" value="1"' +
                         (__VALUE ? ' CHECKED' : __ACTION) +
                         ' /><label for="' + __NAME + 'ON">' +
                         __CONFIG.Label + '</label>';
    const __ELEMENTOFF = '<input type="radio" name="' + __NAME +
                         '" id="' + __NAME + 'OFF" value="0"' +
                         (__VALUE ? __ALTACTION : ' CHECKED') +
                         ' /><label for="' + __NAME + 'OFF">' +
                         __CONFIG.AltLabel + '</label>';

    return [ __ELEMENTON, __ELEMENTOFF ];
}

// Zeigt eine Option auf der Seite als Checkbox an
// opt: Anzuzeigende Option
// return String mit dem HTML-Code
function getOptionCheckbox(opt) {
    const __CONFIG = getOptConfig(opt);
    const __NAME = getOptName(opt);
    const __VALUE = getOptValue(opt, false);
    const __ACTION = getFormActionEvent(opt, __VALUE, ! __VALUE, "click", false);
    const __FORMLABEL = getValue(__CONFIG.FormLabel, __CONFIG.Label);

    return '<input type="checkbox" name="' + __NAME +
           '" id="' + __NAME + '" value="' + __VALUE + '"' +
           (__VALUE ? ' CHECKED' : "") + __ACTION + ' /><label for="' +
           __NAME + '">' + __FORMLABEL + '</label>';
}

// Zeigt eine Option auf der Seite als Daten-Textfeld an
// opt: Anzuzeigende Option
// return String mit dem HTML-Code
function getOptionTextarea(opt) {
    const __CONFIG = getOptConfig(opt);
    const __NAME = getOptName(opt);
    const __VALUE = getOptValue(opt);
    const __ACTION = getFormActionEvent(opt, false, undefined, "submit", undefined);
    const __SUBMIT = getValue(__CONFIG.Submit, "");
    //const __ONSUBMIT = ((__SUBMIT.length > 0) ? ' onKeyDown="' + __SUBMIT + '"': "");
    const __ONSUBMIT = (__SUBMIT ? ' onKeyDown="' + __SUBMIT + '"': "");
    const __FORMLABEL = getValue(__CONFIG.FormLabel, __CONFIG.Label);
    const __ELEMENTLABEL = '<label for="' + __NAME + '">' + __FORMLABEL + '</label>';
    const __ELEMENTTEXT = '<textarea name="' + __NAME + '" id="' + __NAME + '" cols="' + __CONFIG.Cols +
                           '" rows="' + __CONFIG.Rows + '"' + __ONSUBMIT + __ACTION + '>' +
                           JSON.stringify(__VALUE, __CONFIG.Replace, __CONFIG.Space) + '</textarea>';

    return [ __ELEMENTLABEL, __ELEMENTTEXT ];
}

// Zeigt eine Option auf der Seite als Button an
// opt: Anzuzeigende Option
// return String mit dem HTML-Code
function getOptionButton(opt) {
    const __CONFIG = getOptConfig(opt);
    const __NAME = getOptName(opt);
    const __VALUE = getOptValue(opt, false);
    const __ACTION = getFormActionEvent(opt, __VALUE, ! __VALUE, "click", false);
    const __BUTTONLABEL = (__VALUE ? __CONFIG.AltLabel : __CONFIG.Label);
    const __FORMLABEL = getValue(__CONFIG.FormLabel, __CONFIG.Label);

    return '<label for="' + __NAME + '">' + __FORMLABEL +
           '</label><input type="button" name="' + __NAME +
           '" id="' + __NAME + '" value="' + __BUTTONLABEL + '"' +
           __ACTION + '/>';
}

// Zeigt eine Option auf der Seite an (je nach Typ)
// opt: Anzuzeigende Option
// return String mit dem HTML-Code
function getOptionElement(opt) {
    const __CONFIG = getOptConfig(opt);
    const __TYPE = getValue(__CONFIG.FormType, __CONFIG.Type);
    let element = "";

    if (! __CONFIG.Hidden) {
        switch (__TYPE) {
        case __OPTTYPES.MC : element = getOptionSelect(opt);
                             break;
        case __OPTTYPES.SW : if (__CONFIG.FormLabel !== undefined) {
                                 element = getOptionCheckbox(opt);
                             } else {
                                 element = getOptionRadio(opt);
                             }
                             break;
        case __OPTTYPES.TF : element = getOptionCheckbox(opt);
                             break;
        case __OPTTYPES.SD : element = getOptionTextarea(opt);
                             break;
        case __OPTTYPES.SI : element = getOptionButton(opt);
                             break;
        default :            break;
        }

        if (element.length === 2) {
            element = '<div>' + element[0] + '<br />' + element[1] + '</div>';
        }
    }

    return element;
}

// Baut das Benutzermenu auf der Seite auf
// optSet: Gesetzte Optionen
// optParams: Eventuell notwendige Parameter
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
// return String mit dem HTML-Code
function getForm(optSet, optParams = { }) {
    const __FORM = '<form id="options" method="POST"><table><tbody><tr>';
    const __FORMEND = '</tr></tbody></table></form>';
    const __FORMWIDTH = getValue(optParams.formWidth, 3);
    const __FORMBREAK = getValue(optParams.formBreak, __FORMWIDTH);
    const __SHOWFORM = getOptValue(optSet.showForm, true) ? optParams.showForm : { 'showForm' : true };
    let form = __FORM;
    let count = 0;   // Bisher angezeigte Optionen
    let column = 0;  // Spalte der letzten Option (1-basierend)

    for (let opt in optSet) {
        if (checkItem(opt, __SHOWFORM, optParams.hideForm)) {
            const __ELEMENT = getOptionElement(optSet[opt]);
            const __TDOPT = (__ELEMENT.indexOf('|') < 0) ? ' colspan="2"' : "";

            //if (__ELEMENT.length > 0) {
            if (__ELEMENT) {
                if (++count > __FORMBREAK) {
                    if (++column > __FORMWIDTH) {
                        column = 1;
                    }
                }
                if (column === 1) {
                    form += '</tr><tr>';
                }
                form += '\n<td' + __TDOPT + '>' + __ELEMENT.replace('|', '</td><td>') + '</td>';
            }
        }
    }
    form += '\n' + __FORMEND;

    return form;
}

// Fuegt das Script in die Seite ein
// optSet: Gesetzte Optionen
// optParams: Eventuell notwendige Parameter
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// return String mit dem HTML-Code fuer das Script
function getScript(optSet, optParams = { }) {
    //const __SCRIPT = '<script type="text/javascript">function activateMenu() { console.log("TADAAA!"); }</script>';
    //const __SCRIPT = '<script type="text/javascript">\n\tfunction doActionNxt(key, value) { alert("SET " + key + " = " + value); }\n\tfunction doActionNxt(key, value) { alert("SET " + key + " = " + value); }\n\tfunction doActionRst(key, value) { alert("RESET"); }\n</script>';
    //const __FORM = '<form method="POST"><input type="button" id="showOpts" name="showOpts" value="Optionen anzeigen" onclick="activateMenu()" /></form>';
    const __SCRIPT = "";

    //window.eval('function activateMenu() { console.log("TADAAA!"); }');

    return __SCRIPT;
}

// Zeigt das Optionsmenu auf der Seite an (im Gegensatz zum Benutzermenu)
// anchor: Element, das als Anker fuer die Anzeige dient
// optSet: Gesetzte Optionen
// optParams: Eventuell notwendige Parameter
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
function buildForm(anchor, optSet, optParams = { }) {
    console.log("buildForm()");

    const __FORM = getForm(optSet, optParams);
    const __SCRIPT = getScript(optSet, optParams);

    addForm(anchor, __FORM, __SCRIPT);
}

// Informationen zu hinzugefuegten Forms
const __FORMS = { };

// Zeigt das Optionsmenu auf der Seite an (im Gegensatz zum Benutzermenu)
// anchor: Element, das als Anker fuer die Anzeige dient
// form: HTML-Form des Optionsmenu (hinten angefuegt)
// script: Script mit Reaktionen
function addForm(anchor, form = "", script = "") {
    const __OLDFORM = __FORMS[anchor];
    const __REST = (__OLDFORM === undefined) ? anchor.innerHTML :
                   anchor.innerHTML.substring(0, anchor.innerHTML.length - __OLDFORM.Script.length - __OLDFORM.Form.length);

    __FORMS[anchor] = { 'Script' : script, 'Form' : form };

    anchor.innerHTML = __REST + script + form;
}

// ==================== Ende Abschnitt fuer Optionen ====================

// ==================== Abschnitt genereller Code zur Anzeige der Jugend ====================

// Zeitpunktangaben
const __TIME = {
    'cre' : 0,  // Jugendspieler angelegt (mit 12 Jahren)
    'beg' : 1,  // Jugendspieler darf trainieren (wird 13 Jahre alt)
    'now' : 2,  // Aktueller ZAT
    'end' : 3   // Jugendspieler wird Ende 18 gezogen (Geb. - 1 bzw. ZAT 71 fuer '?')
};

// Funktionen ***************************************************************************

// Erschafft die Spieler-Objekte und fuellt sie mit Werten (reloadData: true = Teamuebersicht, false = Spielereinzelwerte)
function init(playerRows, optSet, colIdx, offsetUpper = 1, offsetLower = 0, reloadData = false) {
    const __SAISON = getOptValue(optSet.saison);
    const __CURRZAT = getOptValue(optSet.aktuellerZat);
    const __BIRTHDAYS = getOptValue(optSet.birthdays, []);
    const __TCLASSES = getOptValue(optSet.tClasses, []);
    const __PROGRESSES = getOptValue(optSet.progresses, []);
    const __ZATAGES = getOptValue(optSet.zatAges, []);
    const __TRAINIERT = getOptValue(optSet.trainiert, []);
    const __POSITIONS = getOptValue(optSet.positions, []);
    const __PLAYERS = [];

    for (let i = offsetUpper, j = 0; i < playerRows.length - offsetLower; i++, j++) {
        const __CELLS = playerRows[i].cells;
        const __AGE = getIntFromHTML(__CELLS, colIdx.Age);
        const __SKILLS = getSkillsFromHTML(__CELLS, colIdx);
        const __ISGOALIE = isGoalieFromHTML(__CELLS, colIdx.Age);
        const __NEWPLAYER = new PlayerRecord(__AGE, __SKILLS, __ISGOALIE);

        __NEWPLAYER.initPlayer(__SAISON, __CURRZAT, __BIRTHDAYS[j], __TCLASSES[j], __PROGRESSES[j]);

        if (reloadData) {
            __NEWPLAYER.setZusatz(__ZATAGES[j], __TRAINIERT[j], __POSITIONS[j]);
        }

        __PLAYERS[j] = __NEWPLAYER;
    }

    if (reloadData) {
        storePlayerData(__PLAYERS, playerRows, optSet, colIdx, offsetUpper, offsetLower);
    } else {
        calcPlayerData(__PLAYERS, optSet);
    }

    return __PLAYERS;
}

// Berechnet die abgeleiteten Werte in den Spieler-Objekten neu und speichert diese
function calcPlayerData(players, optSet) {
    const __ZATAGES = [];
    const __TRAINIERT = [];
    const __POSITIONS = [];

    for (let i = 0; i < players.length; i++) {
        const __ZUSATZ = players[i].calcZusatz();

        __ZATAGES[i]   = __ZUSATZ.zatAge;
        __TRAINIERT[i] = __ZUSATZ.trainiert;
        __POSITIONS[i] = __ZUSATZ.bestPos;
    }

    setOpt(optSet.zatAges, __ZATAGES, false);
    setOpt(optSet.trainiert, __TRAINIERT, false);
    setOpt(optSet.positions, __POSITIONS, false);
}

// Berechnet die abgeleiteten Werte in den Spieler-Objekten neu und speichert diese
function storePlayerData(players, playerRows, optSet, colIdx, offsetUpper = 1, offsetLower = 0) {
    const __BIRTHDAYS = [];
    const __TCLASSES = [];
    const __PROGRESSES = [];

    for (let i = offsetUpper; i < playerRows.length - offsetLower; i++) {
        const __CELLS = playerRows[i].cells;

        __BIRTHDAYS[i - offsetUpper] = getIntFromHTML(__CELLS, colIdx.Geb);
        __TCLASSES[i - offsetUpper] = getTalentFromHTML(__CELLS, colIdx.Tal);
        __PROGRESSES[i - offsetUpper] = getStringFromHTML(__CELLS, colIdx.Auf);
    }

    setOpt(optSet.birthdays, __BIRTHDAYS, false);
    setOpt(optSet.tClasses, __TCLASSES, false);
    setOpt(optSet.progresses, __PROGRESSES, false);
}

// Trennt die Gruppen (z.B. Jahrgaenge) mit Linien
function separateGroups(rows, borderString, colIdxSort = 0, offsetUpper = 1, offsetLower = 0, offsetLeft = -1, offsetRight = 0) {
    if (offsetLeft < 0) {
        offsetLeft = colIdxSort;  // ab Sortierspalte
    }

    for (let i = offsetUpper; i < rows.length - offsetLower - 1; i++) {
        if (rows[i].cells[colIdxSort].textContent !== rows[i + 1].cells[colIdxSort].textContent) {
            for (let j = offsetLeft; j < rows[i].cells.length - offsetRight; j++) {
                rows[i].cells[j].style.borderBottom = borderString;
            }
        }
    }
}

// Klasse ColumnManager *****************************************************************

function ColumnManager(optSet, showCol = undefined) {
    const __SHOWALL = (showCol === undefined) || (showCol === true);
    const __SHOWCOL = getValue(showCol, { });

    this.geb = getValue(__SHOWCOL.zeigeGeb, __SHOWALL) && getOptValue(optSet.zeigeGeb);
    this.tal = getValue(__SHOWCOL.zeigeTal, __SHOWALL) && getOptValue(optSet.zeigeTal);
    this.quo = getValue(__SHOWCOL.zeigeQuote, __SHOWALL) && getOptValue(optSet.zeigeQuote);
    this.aufw = getValue(__SHOWCOL.zeigeAufw, __SHOWALL) && getOptValue(optSet.zeigeAufw);
    this.alter = getValue(__SHOWCOL.zeigeAlter, __SHOWALL) && getOptValue(optSet.zeigeAlter);
    this.skill = getValue(__SHOWCOL.zeigeSkill, __SHOWALL) && getOptValue(optSet.zeigeSkill);
    this.pos = getValue(__SHOWCOL.zeigePosition, __SHOWALL) && getOptValue(optSet.zeigePosition);
    this.anzOpti = getValue(__SHOWCOL.zeigeOpti, __SHOWALL) ? getOptValue(optSet.anzahlOpti) : 0;
    this.anzMw = getValue(__SHOWCOL.zeigeMW, __SHOWALL) ? getOptValue(optSet.anzahlMW) : 0;
    this.skillE = getValue(__SHOWCOL.zeigeSkillEnde, __SHOWALL) && getOptValue(optSet.zeigeSkillEnde);
    this.anzOptiE = getValue(__SHOWCOL.zeigeOptiEnde, __SHOWALL) ? getOptValue(optSet.anzahlOptiEnde) : 0;
    this.anzMwE = getValue(__SHOWCOL.zeigeMWEnde, __SHOWALL) ? getOptValue(optSet.anzahlMWEnde) : 0;
    this.kennzE = getOptValue(optSet.kennzeichenEnde);

    this.toString = function() {
        let result = "Skillschnitt\t\t" + this.skill + '\n';
        result += "Beste Position\t" + this.pos + '\n';
        result += "Optis\t\t\t" + this.anzOpti + '\n';
        result += "Marktwerte\t\t" + this.anzMw + '\n';
        result += "Skillschnitt Ende\t" + this.skillE + '\n';
        result += "Optis Ende\t\t" + this.anzOptiE + '\n';
        result += "Marktwerte Ende\t" + this.anzMwE + '\n';

        return result;
    };

    this.addCell = function(tableRow) {
        tableRow.insertCell(-1);
        return tableRow.cells.length - 1;
    };

    this.addAndFillCell = function(tableRow, value, color, digits = 2) {
        if (isFinite(value) && (value !== true) && (value !== false)) {
            // Zahl einfuegen
            if (value < 1000) {
                // Mit Nachkommastellen darstellen
                tableRow.cells[this.addCell(tableRow)].textContent = parseFloat(value).toFixed(digits);
            } else {
                // Mit Tausenderpunkten darstellen
                tableRow.cells[this.addCell(tableRow)].textContent = getNumberString(value.toString());
            }
        } else {
            // String einfuegen
            tableRow.cells[this.addCell(tableRow)].textContent = value;
        }
        tableRow.cells[tableRow.cells.length - 1].style.color = color;
    };

    this.addTitles = function(headers, titleColor = "#FFFFFF") {
        // Spaltentitel zentrieren
        headers.align = "center";

        // Titel fuer die aktuellen Werte
        if (this.tal) {
            this.addAndFillCell(headers, "Talent", titleColor);
        }
        if (this.quo) {
            this.addAndFillCell(headers, "Quote", titleColor);
        }
        if (this.aufw) {
            this.addAndFillCell(headers, "Aufwertung", titleColor);
        }
        if (this.geb) {
            this.addAndFillCell(headers, "Geb.", titleColor);
        }
        if (this.alter) {
            this.addAndFillCell(headers, "Alter", titleColor);
        }
        if (this.skill) {
            this.addAndFillCell(headers, "Skill", titleColor);
        }
        if (this.pos) {
            this.addAndFillCell(headers, "Pos", titleColor);
        }
        for (let i = 1; i <= 6; i++) {
            if (i <= this.anzOpti) {
                this.addAndFillCell(headers, "Opti " + i, titleColor);
            }
            if (i <= this.anzMw) {
                this.addAndFillCell(headers, "MW " + i, titleColor);
            }
        }

        // Titel fuer die Werte mit Ende 18
        if (this.skillE) {
            this.addAndFillCell(headers, "Skill" + this.kennzE, titleColor);
        }
        for (let i = 1; i <= 6; i++) {
            if (i <= this.anzOptiE) {
                this.addAndFillCell(headers, "Opti " + i + this.kennzE, titleColor);
            }
            if (i <= this.anzMwE) {
                this.addAndFillCell(headers, "MW " + i + this.kennzE, titleColor);
            }
        }
    };  // Ende addTitles()

    this.addValues = function(player, playerRow, color = "#FFFFFF") {
        const __COLOR = (player.isGoalie ? getColor("TOR") : color);
        const __POS1COLOR = getColor(player.getPos());

        // Aktuelle Werte
        if (this.tal) {
            this.addAndFillCell(playerRow, player.getTalent(), __COLOR);
        }
        if (this.quo) {
            this.addAndFillCell(playerRow, player.getAufwertungsSchnitt(), __COLOR, 2);
        }
        if (this.aufw) {
            this.addAndFillCell(playerRow, player.getAufwert(), __COLOR);
        }
        if (this.geb) {
            this.addAndFillCell(playerRow, player.getGeb(), __COLOR, 0);
        }
        if (this.alter) {
            this.addAndFillCell(playerRow, player.getAge(), __COLOR, 2);
        }
        if (this.skill) {
            this.addAndFillCell(playerRow, player.getSkill(), __COLOR, 2);
        }
        if (this.pos) {
            this.addAndFillCell(playerRow, player.getPos(), __POS1COLOR);
        }
        for (let i = 1; i <= 6; i++) {
            const __POSI = ((i === 1) ? player.getPos() : player.getPos(i));
            const __COLI = getColor(__POSI);

            if (i <= this.anzOpti) {
                if ((i === 1) || ! player.isGoalie) {
                    // Opti anzeigen
                    this.addAndFillCell(playerRow, player.getOpti(__POSI), __COLI, 2);
                } else {
                    // TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
                    this.addCell(playerRow);
                }
            }
            if (i <= this.anzMw) {
                if ((i === 1) || ! player.isGoalie) {
                    // MW anzeigen
                    this.addAndFillCell(playerRow, player.getMarketValue(__POSI), __COLI, 0);
                } else {
                    // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                    this.addCell(playerRow);
                }
            }
        }

        // Werte mit Ende 18
        if (this.skillE) {
            this.addAndFillCell(playerRow, player.getSkill(__TIME.end), __COLOR, 2);
        }
        for (let i = 1; i <= 6; i++) {
            const __POSI = ((i === 1) ? player.getPos() : player.getPos(i));
            const __COLI = getColor(__POSI);

            if (i <= this.anzOptiE) {
                if ((i === 1) || ! player.isGoalie) {
                    // Opti anzeigen
                    this.addAndFillCell(playerRow, player.getOpti(__POSI, __TIME.end), __COLI, 2);
                } else {
                    // TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
                    this.addCell(playerRow);
                }
            }
            if (i <= this.anzMwE) {
                if ((i === 1) || ! player.isGoalie) {
                    // MW anzeigen
                    this.addAndFillCell(playerRow, player.getMarketValue(__POSI, __TIME.end), __COLI, 0);
                } else {
                    // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                    this.addCell(playerRow);
                }
            }
        }
    };  // Ende addValues(player, playerRow)
}

// Klasse PlayerRecord ******************************************************************

function PlayerRecord(age, skills, isGoalie) {
    // Zu benutzende Marktwertformel
    const __MWFORMEL = {
        'alt' : 0,  // Marktwertformel bis Saison 9 inklusive
        'S10' : 1   // Marktwertformel MW5 ab Saison 10
    };

    this.mwFormel = __MWFORMEL.S10;  // Neue Formel, genauer in initPlayer()

    this.age = age;
    this.skills = skills;
    this.isGoalie = isGoalie;

    // in this.initPlayer() definiert:
    // this.zatGeb: ZAT, an dem der Spieler Geburtstag hat, -1 fuer "noch nicht zugewiesen", also '?'
    // this.zatAge: Bisherige erfolgte Trainings-ZATs
    // this.talent: Talent als Zahl (-1=wenig, 0=normal, +1=hoch)
    // this.aufwert: Aufwertungsstring
    // this.mwFormel: Benutzte MW-Formel, siehe __MWFORMEL
    // this.positions[][]: Positionstext und Opti; TOR-Index ist 5
    // this.skillsEnd[]: Berechnet aus this.skills, this.age und aktuellerZat

    // in this calcZusatz()/setZusatz() definiert:
    // this.trainiert: Anzahl der erfolgreichen Trainingspunkte
    // this.bestPos: erster (bester) Positionstext

    this.toString = function() {
        let result = "Alter\t\t" + this.age + "\n\n";
        result += "Aktuelle Werte\n";
        result += "Skillschnitt\t" + this.getSkill().toFixed(2) + '\n';
        result += "Optis und Marktwerte";

        for (let pos of this.positions) {
            result += "\n\t" + pos + '\t';
            result += this.getOpti(pos).toFixed(2) + '\t';
            result += getNumberString(this.getMarketValue(pos).toString());
        }

        result += "\n\nWerte mit Ende 18\n";
        result += "Skillschnitt\t" + this.getSkill(__TIME.end).toFixed(2) + '\n';
        result += "Optis und Marktwerte";

        for (let pos of this.positions) {
            result += "\n\t" + this.getPos()[i] + '\t';
            result += this.getOpti(pos, __TIME.end).toFixed(2) + '\t';
            result += getNumberString(this.getMarketValue(pos, __TIME.end).toString());
        }

        return result;
    };  // Ende this.toString()

    // Berechnet die Opti-Werte, sortiert das Positionsfeld und berechnet die Einzelskills mit Ende 18
    this.initPlayer = function(saison, currZAT, gebZAT, tclass, progresses) {
        this.zatGeb = gebZAT;
        this.zatAge = this.calcZatAge(currZAT);
        this.talent = tclass;
        this.aufwert = progresses;
        this.mwFormel = (saison < 10) ? __MWFORMEL.alt : __MWFORMEL.S10;

        this.positions = [];
        // ABW
        this.positions[0] = [];
        this.positions[0][0] = "ABW";
        this.positions[0][1] = this.getOpti("ABW");
        // DMI
        this.positions[1] = [];
        this.positions[1][0] = "DMI";
        this.positions[1][1] = this.getOpti("DMI");
        // MIT
        this.positions[2] = [];
        this.positions[2][0] = "MIT";
        this.positions[2][1] = this.getOpti("MIT");
        // OMI
        this.positions[3] = [];
        this.positions[3][0] = "OMI";
        this.positions[3][1] = this.getOpti("OMI");
        // STU
        this.positions[4] = [];
        this.positions[4][0] = "STU";
        this.positions[4][1] = this.getOpti("STU");
        // TOR
        this.positions[5] = [];
        this.positions[5][0] = "TOR";
        this.positions[5][1] = this.getOpti("TOR");

        // Sortieren
        sortPositionArray(this.positions);

        // Einzelskills mit Ende 18 berechnen
        this.skillsEnd = [];

        const __ADDRATIO = (this.getZatDone(__TIME.end) - this.getZatDone()) / this.getZatDone();

        for (let i in this.skills) {
            const __SKILL = this.skills[i];
            let progSkill = __SKILL;

            if (isTrainableSkill(i)) {
                // Auf ganze Zahl runden und parseInt(), da das sonst irgendwie als String interpretiert wird
                const __ADDSKILL = getMulValue(__ADDRATIO, __SKILL, 0, NaN);

                progSkill += __ADDSKILL;
            }

            this.skillsEnd[i] = Math.min(progSkill, 99);
        }
    };  // Ende this.initPlayer()

    // Setzt Nebenwerte fuer den Spieler (geht ohne initPlayer())
    this.setZusatz = function(zatAge, trainiert, bestPos) {
        this.zatAge = zatAge;
        this.trainiert = trainiert;
        this.bestPos = bestPos;
    };

    // Ermittelt Nebenwerte fuer den Spieler und gibt sie alle zurueck (nach initPlayer())
    this.calcZusatz = function() {
        // this.zatAge bereits in initPlayer() berechnet
        this.trainiert = this.getTrainiert(true);  // neu berechnet aus Skills
        this.bestPos = this.getPos(-1);  // hier: -1 explizit angeben, da neu ermittelt (this.bestPos noch nicht belegt)

        return {
                   zatAge    : this.zatAge,
                   trainiert : this.trainiert,
                   bestPos   : this.bestPos
               };
    };

    this.getGeb = function() {
        return (this.zatGeb < 0) ? '?' : this.zatGeb;
    };

    this.calcZatAge = function(currZAT) {
        let ZATs = (this.age - ((currZAT < this.zatGeb) ? 12 : 13)) * 72;  // Basiszeit fuer die Jahre seit Jahrgang 13

        if (this.zatGeb < 0) {
            return ZATs + currZAT;  // Zaehlung begann Anfang der Saison (und der Geburtstag wird erst nach dem Ziehen bestimmt)
        } else {
            return ZATs + currZAT - this.zatGeb;  // Verschiebung relativ zum Geburtstag (von -zatGeb, ..., 0, ..., 71 - zatGeb)
        }
    };

    this.getZatAge = function(when = __TIME.now) {
        if (when === __TIME.end) {
            return (18 - 12) * 72 - 1;  // (max.) Trainings-ZATs bis Ende 18
        } else {
            return this.zatAge;
        }
    };

    this.getZatDone = function(when = __TIME.now) {
        return Math.max(0, this.getZatAge(when));
    };

    this.getAge = function(when = __TIME.now) {
        if (this.mwFormel === __MWFORMEL.alt) {
            return (when === __TIME.end) ? 18 : this.age;
        } else {  // Geburtstage ab Saison 10...
            return (13.00 + this.getZatAge(when) / 72);
        }
    };

    this.getTrainiert = function(recalc = false) {
        let sum = 0;

        if (recalc || (this.trainiert === undefined)) {
            for (let i in this.skills) {
                if (isTrainableSkill(i)) {
                    sum += this.skills[i];
                }
            }
        } else {
            sum += this.trainiert;
        }

        return sum;
    };

    this.getAufwertungsSchnitt = function() {
        return parseFloat(this.getTrainiert() / this.getZatDone());
    };

    this.getPos = function(idx = undefined) {
        const __IDXOFFSET = 1;

        switch (getValue(idx, 0)) {
        case -1 : return (this.bestPos = this.positions[isGoalie ? 5 : 0][0]);
        case  0 : return this.bestPos;
        default : return this.positions[idx - __IDXOFFSET][0];
        }
    };

    this.getTalent = function() {
        return (this.talent < 0) ? "wenig" : (this.talent > 0) ? "hoch" : "normal";
    };

    this.getAufwert = function() {
        //return (this.aufwert.length > 0) ? this.aufwert : "keine";
        return (this.aufwert || "keine");
    };

    this.getSkill = function(when = __TIME.now) {
        const __SKILLS = (when === __TIME.end) ? this.skillsEnd : this.skills;
        let result = 0;

        for (let skill of __SKILLS) {
            result += skill;
        }

        return result / __SKILLS.length;
    };

    this.getOpti = function(pos, when = __TIME.now) {
        const __SKILLS = (when === __TIME.end) ? this.skillsEnd : this.skills;
        const __IDXPRISKILLS = getIdxPriSkills(pos);
        const __IDXSECSKILLS = getIdxSecSkills(pos);
        let sumPriSkills = 0;
        let sumSecSkills = 0;

        for (let idx of __IDXPRISKILLS) {
            sumPriSkills += __SKILLS[idx];
        }
        for (let idx of __IDXSECSKILLS) {
            sumSecSkills += __SKILLS[idx];
        }

        return (5 * sumPriSkills + sumSecSkills) / 27;
    };

    this.getMarketValue = function(pos, when = __TIME.now) {
        const __AGE = this.getAge(when);

        if (this.mwFormel === __MWFORMEL.alt) {
            return Math.round(Math.pow((1 + this.getSkill(when)/100) * (1 + this.getOpti(pos, when)/100) * (2 - __AGE/100), 10) * 2);    // Alte Formel bis Saison 9
        } else {  // MW-Formel ab Saison 10...
            const __MW5TF = 1.00;  // Zwischen 0.97 und 1.03

            return Math.round(Math.pow(1 + this.getSkill(when)/100, 5.65) * Math.pow(1 + this.getOpti(pos, when)/100, 8.1) * Math.pow(1 + (100 - __AGE)/49, 10) * __MW5TF);
        }
    };
}

// Funktionen fuer die HTML-Seite *******************************************************

// Liest eine Zahl aus der Spalte einer Zeile der Tabelle aus (z.B. Alter, Geburtsdatum)
// cells: Die Zellen einer Zeile
// colIdxInt: Spaltenindex der gesuchten Werte
// return Spalteneintrag als Zahl (-1 fuer "keine Zahl", undefined fuer "nicht gefunden")
function getIntFromHTML(cells, colIdxInt) {
    const __CELL = cells[colIdxInt];
    const __TEXT = getValue(__CELL, { }).textContent;

    if (__TEXT !== undefined) {
        try {
            const __VALUE = parseInt(__TEXT, 10);

            if (! isNaN(__VALUE)) {
                return __VALUE;
            }
        } catch (ex) { }

        return -1;
    }

    return undefined;
}

// Liest eine Dezimalzahl aus der Spalte einer Zeile der Tabelle aus
// cells: Die Zellen einer Zeile
// colIdxInt: Spaltenindex der gesuchten Werte
// return Spalteneintrag als Dezimalzahl (undefined fuer "keine Zahl" oder "nicht gefunden")
function getFloatFromHTML(cells, colIdxFloat) {
    const __CELL = cells[colIdxFloat];
    const __TEXT = getValue(__CELL, { }).textContent;

    if (__TEXT !== undefined) {
        try {
            return parseFloat(__TEXT);
        } catch (ex) { }
    }

    return undefined;
}

// Liest einen String aus der Spalte einer Zeile der Tabelle aus
// cells: Die Zellen einer Zeile
// colIdxStr: Spaltenindex der gesuchten Werte
// return Spalteneintrag als String ("" fuer "nicht gefunden")
function getStringFromHTML(cells, colIdxStr) {
    const __CELL = cells[colIdxStr];
    const __TEXT = getValue(__CELL, { }).textContent;

    return getValue(__TEXT.toString(), "");
}

// Liest die Talentklasse ("wenig", "normal", "hoch") aus der Spalte einer Zeile der Tabelle aus
// cells: Die Zellen einer Zeile
// colIdxStr: Spaltenindex der gesuchten Werte
// return Talent als Zahl (-1=wenig, 0=normal, +1=hoch)
function getTalentFromHTML(cells, colIdxTal) {
    const __TEXT = getStringFromHTML(cells, colIdxTal);

    return parseInt((__TEXT === "wenig") ? -1 : (__TEXT === "hoch") ? +1 : 0, 10);
}

// Liest die Einzelskills aus der Spalte einer Zeile der Tabelle aus
// cells: Die Zellen einer Zeile
// colIdx: Liste von Spaltenindices der gesuchten Werte mit den Eintraegen
// 'Einz' (erste Spalte) und 'Zus' (Spalte hinter dem letzten Eintrag)
// return Skills als Array von Zahlen
function getSkillsFromHTML(cells, colIdx) {
    const __RESULT = [];

    for (let i = colIdx.Einz; i < colIdx.Zus; i++) {
        __RESULT[i - colIdx.Einz] = getIntFromHTML(cells, i);
    }

    return __RESULT;
}

// Liest aus, ob der Spieler Torwart oder Feldspieler ist
// return Angabe, der Spieler Torwart oder Feldspieler ist
function isGoalieFromHTML(cells, colIdxClass) {
    return (cells[colIdxClass].className === "TOR");
}

// Hilfsfunktionen **********************************************************************

// Sortiert das Positionsfeld per BubbleSort
function sortPositionArray(array) {
    const __TEMP = [];
    let transposed = true;
    // TOR soll immer die letzte Position im Feld sein, deshalb - 1
    let length = array.length - 1;

    while (transposed && (length > 1)) {
        transposed = false;
        for (let i = 0; i < length - 1; i++) {
            // Vergleich Opti-Werte:
            if (array[i][1] < array[i + 1][1]) {
                // vertauschen
                __TEMP[0] = array[i][0];
                __TEMP[1] = array[i][1];
                array[i][0] = array[i + 1][0];
                array[i][1] = array[i + 1][1];
                array[i + 1][0] = __TEMP[0];
                array[i + 1][1] = __TEMP[1];
                transposed = true;
            }
        }
        length--;
    }
}

// Fuegt in die uebergebene Zahl Tausender-Trennpunkte ein
// Wandelt einen etwaig vorhandenen Dezimalpunkt in ein Komma um
function getNumberString(numberString) {
    if (numberString.lastIndexOf(".") !== -1) {
        // Zahl enthaelt Dezimalpunkt
        const __VORKOMMA = numberString.substring(0, numberString.lastIndexOf("."));
        const __NACHKOMMA = numberString.substring(numberString.lastIndexOf(".") + 1, numberString.length);

        return getNumberString(__VORKOMMA) + "," + __NACHKOMMA;
    } else {
        // Kein Dezimalpunkt, fuege Tausender-Trennpunkte ein:
        // String umdrehen, nach jedem dritten Zeichen Punkt einfuegen, dann wieder umdrehen:
        const __TEMP = reverseString(numberString);
        let result = "";

        for (let i = 0; i < __TEMP.length; i++) {
            if ((i > 0) && (i % 3 === 0)) {
                result += ".";
            }
            result += __TEMP.substr(i, 1);
        }

        return reverseString(result);
    }
}

// Dreht den uebergebenen String um
function reverseString(string) {
    let result = "";

    for (let i = string.length - 1; i >= 0; i--) {
        result += string.substr(i, 1);
    }

    return result;
}

// Schaut nach, ob der uebergebene Index zu einem trainierbaren Skill gehoert
// Die Indizes gehen von 0 (SCH) bis 16 (EIN)
function isTrainableSkill(idx) {
    const __TRAINABLESKILLS = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 15];
    const __IDX = parseInt(idx, 10);
    let result = false;

    for (let idxTrainable of __TRAINABLESKILLS) {
        if (__IDX === idxTrainable) {
            result = true;
            break;
        }
    }

    return result;
}

// Gibt die Indizes der Primaerskills zurueck
function getIdxPriSkills(pos) {
    switch (pos) {
        case "TOR" : return new Array(2, 3, 4, 5);
        case "ABW" : return new Array(2, 3, 4, 15);
        case "DMI" : return new Array(1, 4, 9, 11);
        case "MIT" : return new Array(1, 3, 9, 11);
        case "OMI" : return new Array(1, 5, 9, 11);
        case "STU" : return new Array(0, 2, 3, 5);
        default : return [];
    }
}

// Gibt die Indizes der Sekundaerskills zurueck
function getIdxSecSkills(pos) {
    switch (pos) {
        case "TOR" : return new Array(0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
        case "ABW" : return new Array(0, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16);
        case "DMI" : return new Array(0, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16);
        case "MIT" : return new Array(0, 2, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16);
        case "OMI" : return new Array(0, 2, 3, 4, 6, 7, 8, 10, 12, 13, 14, 15, 16);
        case "STU" : return new Array(1, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
        default : return [];
    }
}

// Gibt die zur Position gehoerige Farbe zurueck
function getColor(pos) {
    switch (pos) {
        case "TOR" : return "#FFFF00";
        case "ABW" : return "#00FF00";
        case "DMI" : return "#3366FF";
        case "MIT" : return "#66FFFF";
        case "OMI" : return "#FF66FF";
        case "STU" : return "#FF0000";
        case "LEI" : return "#FFFFFF";
        default : return "";
    }
}

// ==================== Ende Abschnitt genereller Code zur Anzeige der Jugend ====================

// ==================== Abschnitt fuer interne IDs auf den Seiten ====================

const __GAMETYPES = {    // "Blind FSS gesucht!"
        'unbekannt'  : -1,
        "reserviert" :  0,
        "Frei"       :  0,
        "spielfrei"  :  0,
        "Friendly"   :  1,
        "Liga"       :  2,
        "LP"         :  3,
        "OSEQ"       :  4,
        "OSE"        :  5,
        "OSCQ"       :  6,
        "OSC"        :  7
    };

const __LIGANRN = {
        'unbekannt'  :  0,
        '1. Liga'    :  1,
        '2. Liga A'  :  2,
        '2. Liga B'  :  3,
        '3. Liga A'  :  4,
        '3. Liga B'  :  5,
        '3. Liga C'  :  6,
        '3. Liga D'  :  7
    };

const __LANDNRN = {
        'unbekannt'              :   0,
        'Albanien'               :  45,
        'Andorra'                :  95,
        'Armenien'               :  83,
        'Aserbaidschan'          : 104,
        'Belgien'                :  12,
        'Bosnien-Herzegowina'    :  66,
        'Bulgarien'              :  42,
        'D\xE4nemark'            :   8,
        'Deutschland'            :   6,
        'England'                :   1,
        'Estland'                :  57,
        'Far\xF6er'              :  68,
        'Finnland'               :  40,
        'Frankreich'             :  32,
        'Georgien'               :  49,
        'Griechenland'           :  30,
        'Irland'                 :   5,
        'Island'                 :  29,
        'Israel'                 :  23,
        'Italien'                :  10,
        'Kasachstan'             : 105,
        'Kroatien'               :  24,
        'Lettland'               :  97,
        'Liechtenstein'          :  92,
        'Litauen'                :  72,
        'Luxemburg'              :  93,
        'Malta'                  :  69,
        'Mazedonien'             :  86,
        'Moldawien'              :  87,
        'Niederlande'            :  11,
        'Nordirland'             :   4,
        'Norwegen'               :   9,
        '\xD6sterreich'          :  14,
        'Polen'                  :  25,
        'Portugal'               :  17,
        'Rum\xE4nien'            :  28,
        'Russland'               :  19,
        'San Marino'             :  98,
        'Schottland'             :   2,
        'Schweden'               :  27,
        'Schweiz'                :  37,
        'Serbien und Montenegro' :  41,
        'Slowakei'               :  70,
        'Slowenien'              :  21,
        'Spanien'                :  13,
        'Tschechien'             :  18,
        'T\xFCrkei'              :  39,
        'Ukraine'                :  20,
        'Ungarn'                 :  26,
        'Wales'                  :   3,
        'Weissrussland'          :  71,
        'Zypern'                 :  38
    };

// ==================== Abschnitt fuer Daten des Spielplans ====================

// Gibt die ID fuer den Namen eines Wettbewerbs zurueck
// gameType: Name des Wettbewerbs eines Spiels
// return OS2-ID fuer den Spieltyp (1 bis 7), 0 fuer spielfrei/Frei/reserviert, -1 fuer ungueltig
function getGameTypeID(gameType) {
    return getValue(__GAMETYPES[gameType], __GAMETYPES.unbekannt);
}

// Gibt die ID des Landes mit dem uebergebenen Namen zurueck.
// land: Name des Landes
// return OS2-ID des Landes, 0 fuer ungueltig
function getLandNr(land) {
    return getValue(__LANDNRN[land], __LANDNRN.unbekannt);
}

// Gibt die ID der Liga mit dem uebergebenen Namen zurueck.
// land: Name der Liga
// return OS2-ID der Liga, 0 fuer ungueltig
function getLigaNr(liga) {
    return getValue(__LIGANRN[liga], __LIGANRN.unbekannt);
}

// ==================== Abschnitt fuer sonstige Parameter ====================

const __TEAMSEARCHHAUPT = {  // Parameter zum Team "<b>Willkommen im Managerb&uuml;ro von TEAM</b><br>LIGA LAND<a href=..."
        'Zeile'  : 0,
        'Spalte' : 1,
        'start'  : " von ",
        'middle' : "</b><br>",
        'liga'   : ". Liga",
        'land'   : ' ',
        'end'    : "<a href="
    };

const __TEAMSEARCHTEAM = {  // Parameter zum Team "<b>TEAM - LIGA <a href=...>LAND</a></b>"
        'Zeile'  : 0,
        'Spalte' : 0,
        'start'  : "<b>",
        'middle' : " - ",
        'liga'   : ". Liga",
        'land'   : 'target="_blank">',
        'end'    : "</a></b>"
    };

// Ermittelt, wie das eigene Team heisst und aus welchem Land bzw. Liga es kommt (zur Unterscheidung von Erst- und Zweitteam)
// cell: Tabellenzelle mit den Parametern zum Team "startTEAMmiddleLIGA...landLANDend", LIGA = "#liga[ (A|B|C|D)]"
// teamSeach: Muster fuer die Suche, die Eintraege fuer 'start', 'middle', 'liga', 'land' und 'end' enthaelt
// return Im Beispiel { 'Team' : "TEAM", 'Liga' : "LIGA", 'Land' : "LAND", 'LdNr' : LAND-NUMMER, 'LgNr' : LIGA-NUMMER },
//        z.B. { 'Team' : "Choromonets Odessa", 'Liga' : "1. Liga", 'Land' : "Ukraine", 'LdNr' : 20, 'LgNr' : 1 }
function getTeamParamsFromTable(table, teamSearch = undefined) {
    const __TEAMSEARCH   = getValue(teamSearch, __TEAMSEARCHHAUPT);
    const __TEAMCELLROW  = getValue(__TEAMSEARCH.Zeile, 0);
    const __TEAMCELLCOL  = getValue(__TEAMSEARCH.Spalte, 0);
    const __TEAMCELLSTR  = table.rows[__TEAMCELLROW].cells[__TEAMCELLCOL].innerHTML;
    const __SEARCHSTART  = __TEAMSEARCH.start;
    const __SEARCHMIDDLE = __TEAMSEARCH.middle;
    const __SEARCHLIGA   = __TEAMSEARCH.liga;
    const __SEARCHLAND   = __TEAMSEARCH.land;
    const __SEARCHEND    = __TEAMSEARCH.end;
    const __INDEXSTART   = __TEAMCELLSTR.indexOf(__SEARCHSTART);
    const __INDEXEND     = __TEAMCELLSTR.indexOf(__SEARCHEND);

    let teamParams = __TEAMCELLSTR.substring(__INDEXSTART + __SEARCHSTART.length, __INDEXEND);
    const __INDEXLIGA = teamParams.indexOf(__SEARCHLIGA);
    const __INDEXMIDDLE = teamParams.indexOf(__SEARCHMIDDLE);

    let land = (__INDEXLIGA > 0) ? teamParams.substring(__INDEXLIGA + __SEARCHLIGA.length) : undefined;
    const __TEAM = (__INDEXMIDDLE > 0) ? teamParams.substring(0, __INDEXMIDDLE) : undefined;
    let liga = ((__INDEXLIGA > 0) && (__INDEXMIDDLE > 0)) ? teamParams.substring(__INDEXMIDDLE + __SEARCHMIDDLE.length) : undefined;

    if (land !== undefined) {
        if (land.charAt(2) === ' ') {    // Land z.B. hinter "2. Liga A " statt "1. Liga "
            land = land.substr(2);
        }
        if (liga !== undefined) {
            liga = liga.substring(0, liga.length - land.length);
        }
        const __INDEXLAND = land.indexOf(__SEARCHLAND);
        if (__INDEXLAND > -1) {
            land = land.substr(__INDEXLAND + __SEARCHLAND.length);
        }
    }

    const __RET = {
        'Team' : __TEAM,
        'Liga' : liga,
        'Land' : land,
        'LdNr' : getLandNr(land),
        'LgNr' : getLigaNr(liga)
    };

    return __RET;
}

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url: Adresse der Seite
// return Parameter aus der URL der Seite als Nummer
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    const __SUCH = "page=";
    const __INDEXS = url.lastIndexOf(__SUCH);
    const __HAUPT = url.match(/haupt\.php/);        // Ansicht "Haupt" (Managerbuero)
    const __JU = url.match(/ju\.php/);              // Ansicht "Jugendteam"
    let page = -1;                                  // Seitenindex (Rueckgabewert)

    // Wert von page (Seitenindex) ermitteln...
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "page=" und ggf. von '&'
    if (__HAUPT) {
        page = 0;
    } else if (__JU) {
        if (__INDEXS < 0) {
            page = 1;
        } else if (url.indexOf('&', __INDEXS) < 0) {
            // Wert von page setzt sich aus allen Zeichen hinter "page=" zusammen
            page = parseInt(url.substring(__INDEXS + __SUCH.length, url.length), 10);
        } else {
            // Wert von page setzt sich aus allen Zeichen zwischen "page=" und '&' zusammen
            page = parseInt(url.substring(__INDEXS + __SUCH.length, url.indexOf('&', __INDEXS)), 10);
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
    const __TEAMPARAMS = getTeamParamsFromTable(getTable(1), __TEAMSEARCHHAUPT);  // Link mit Team, Liga, Land...

    buildOptions(__OPTCONFIG, __OPTSET, {
                     'teamParams' : __TEAMPARAMS,
                     'hideMenu'   : true
                 });

    const __NEXTZAT = getZATNrFromCell(getRows(0)[2].cells[0]);  // "Der naechste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;
    const __DATAZAT = getOptValue(__OPTSET.datenZat);

    if (__CURRZAT >= 0) {
        console.log("Aktueller ZAT: " + __CURRZAT);

        // Neuen aktuellen ZAT speichern...
        setOpt(__OPTSET.aktuellerZat, __CURRZAT, false);

        if (__CURRZAT !== __DATAZAT) {
            console.log(__DATAZAT + " => " + __CURRZAT);

            // ... und ZAT-bezogene Daten als veraltet markieren
            __TEAMCLASS.deleteOptions();

            // Neuen Daten-ZAT speichern...
            setOpt(__OPTSET.datenZat, __CURRZAT, false);
        }
    }
}

// Verarbeitet Ansicht "Teamuebersicht"
function procTeamuebersicht() {
    const __ROWOFFSETUPPER = 1;     // Header-Zeile
    const __ROWOFFSETLOWER = 1;     // Ziehen-Button

    const __COLUMNINDEX = {
        'Age'   : 0,
        'Geb'   : 1,
        'Flg'   : 2,
        'Land'  : 3,
        'U'     : 4,
        'Skill' : 5,
        'Tal'   : 6,
        'Akt'   : 7,
        'Auf'   : 8,
        'Zus'   : 9
    };

    if (getElement('transfer') !== undefined) {
        console.log("Ziehen-Seite");
    } else if (getRows(1) === undefined) {
        console.log("Diese Seite ist ohne Team nicht verf\xFCgbar!");
    } else {
        buildOptions(__OPTCONFIG, __OPTSET, {
                         'menuAnchor' : getTable(0, "div"),
                         'showForm' : {
                                        'sepStyle'      : true,
                                        'sepColor'      : true,
                                        'sepWidth'      : true,
                                        'aktuellerZat'  : true,
                                        'team'          : true,
                                        'zeigeAlter'    : true,
                                        'zeigeQuote'    : true,
                                        'zeigePosition' : true,
                                        'zatAges'       : true,
                                        'trainiert'     : true,
                                        'positions'     : true,
                                        'reset'         : true,
                                        'showForm'      : true
                                      },
                         'formWidth' : 1
                     });

        const __COLMAN = new ColumnManager(__OPTSET, {
                                        'zeigeAlter'    : getOptValue(__OPTSET.zatAges, false, true),
                                        'zeigeQuote'    : getOptValue(__OPTSET.trainiert, false, true),
                                        'zeigePosition' : getOptValue(__OPTSET.positions, false, true)
                                    });
        const __ROWS = getRows(1);
        const __HEADERS = __ROWS[0];
        const __TITLECOLOR = getColor("LEI");  // "#FFFFFF"

        __COLMAN.addTitles(__HEADERS, __TITLECOLOR);

        const __PLAYERS = init(__ROWS, __OPTSET, __COLUMNINDEX, __ROWOFFSETUPPER, __ROWOFFSETLOWER, true);

        for (let i = 0; i < __PLAYERS.length; i++) {
            __COLMAN.addValues(__PLAYERS[i], __ROWS[i + __ROWOFFSETUPPER], __TITLECOLOR);
        }

        // Format der Trennlinie zwischen den Monaten...
        const __BORDERSTRING = getOptValue(__OPTSET.sepStyle) + ' ' + getOptValue(__OPTSET.sepColor) + ' ' + getOptValue(__OPTSET.sepWidth);

        separateGroups(__ROWS, __BORDERSTRING, __COLUMNINDEX.Age, __ROWOFFSETUPPER, __ROWOFFSETLOWER, -1, 0);
    }
}

// Verarbeitet Ansicht "Spielereinzelwerte"
function procSpielereinzelwerte() {
    const __ROWOFFSETUPPER = 1;     // Header-Zeile
    const __ROWOFFSETLOWER = 0;

    const __COLUMNINDEX = {
        'Flg'   : 0,
        'Land'  : 1,
        'U'     : 2,
        'Age'   : 3,
        'Einz'  : 4,    // ab hier die Einzelskills
        'SCH'   : 4,
        'ABS'   : 4,    // TOR
        'BAK'   : 5,
        'STS'   : 5,    // TOR
        'KOB'   : 6,
        'FAN'   : 6,    // TOR
        'ZWK'   : 7,
        'STB'   : 7,    // TOR
        'DEC'   : 8,
        'SPL'   : 8,    // TOR
        'GES'   : 9,
        'REF'   : 9,    // TOR
        'FUQ'   : 10,
        'ERF'   : 11,
        'AGG'   : 12,
        'PAS'   : 13,
        'AUS'   : 14,
        'UEB'   : 15,
        'WID'   : 16,
        'SEL'   : 17,
        'DIS'   : 18,
        'ZUV'   : 19,
        'EIN'   : 20,
        'Zus'   : 21     // Zusaetze hinter den Einzelskills
    };

    if (getRows(1) === undefined) {
        console.log("Diese Seite ist ohne Team nicht verf\xFCgbar!");
    } else {
        buildOptions(__OPTCONFIG, __OPTSET, {
                         'menuAnchor' : getTable(0, "div"),
                         'hideForm' : {
                                        'zatAges'       : true,
                                        'trainiert'     : true,
                                        'positions'     : true
                                      },
                         'formWidth'  : 1
                     });

        const __COLMAN = new ColumnManager(__OPTSET);
        const __ROWS = getRows(1);
        const __HEADERS = __ROWS[0];
        const __TITLECOLOR = getColor("LEI");  // "#FFFFFF"

        __COLMAN.addTitles(__HEADERS, __TITLECOLOR);

        const __PLAYERS = init(__ROWS, __OPTSET, __COLUMNINDEX, __ROWOFFSETUPPER, __ROWOFFSETLOWER, false);

        for (let i = 0; i < __PLAYERS.length; i++) {
            __COLMAN.addValues(__PLAYERS[i], __ROWS[i + __ROWOFFSETUPPER], __TITLECOLOR);
        }

        // Format der Trennlinie zwischen den Monaten...
        const __BORDERSTRING = getOptValue(__OPTSET.sepStyle) + ' ' + getOptValue(__OPTSET.sepColor) + ' ' + getOptValue(__OPTSET.sepWidth);

        separateGroups(__ROWS, __BORDERSTRING, __COLUMNINDEX.Age, __ROWOFFSETUPPER, __ROWOFFSETLOWER, -1, 0);
    }
}

// URL-Legende:
// page=0: Managerbuero
// page=1: Teamuebersicht
// page=2: Spielereinzelwerte

// Verzweige in unterschiedliche Verarbeitungen je nach Wert von page:
switch (getPageIdFromURL(window.location.href)) {
    case 0: procHaupt(); break;
    case 1: procTeamuebersicht(); break;
    case 2: procSpielereinzelwerte(); break;
    default: break;
}

console.log("SCRIPT END");

// *** EOF ***
