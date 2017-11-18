// ==UserScript==
// @name        OS2.jugendV4
// @namespace   http://os.ongapo.com/
// @version     0.42
// @copyright   2013+
// @author      Andreas Eckes (Strindheim BK)
// @author      Sven Loges (SLC)
// @description Jugendteam-Script fuer Online Soccer 2.0
// @include     http*://os.ongapo.com/haupt.php
// @include     http*://os.ongapo.com/haupt.php?changetosecond=*
// @include     http*://os.ongapo.com/ju.php
// @include     http*://os.ongapo.com/ju.php?page=*
// @include     http*://www.os.ongapo.com/haupt.php
// @include     http*://www.os.ongapo.com/haupt.php?changetosecond=*
// @include     http*://www.os.ongapo.com/ju.php
// @include     http*://www.os.ongapo.com/ju.php?page=*
// @include     http*://online-soccer.eu/haupt.php
// @include     http*://online-soccer.eu/haupt.php?changetosecond=*
// @include     http*://online-soccer.eu/ju.php
// @include     http*://online-soccer.eu/ju.php?page=*
// @include     http*://www.online-soccer.eu/haupt.php
// @include     http*://www.online-soccer.eu/haupt.php?changetosecond=*
// @include     http*://www.online-soccer.eu/ju.php
// @include     http*://www.online-soccer.eu/ju.php?page=*
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
    'SD' : "simple data",
    'SI' : "simple option"
};

// Options-Typen
const __OPTACTION = {
    'SET' : "set option value",
    'NXT' : "set next option value",
    'RST' : "reset options"
};

// Moegliche Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __OPTCONFIG = {
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
    'anzahlOpti' : {      // Gibt die Anzahl der Opti-Spalten an / 1: nur bester Opti, 2: die beiden besten, ..., 6: Alle inklusive TOR
                          // Bei Torhuetern wird immer nur der TOR-Opti angezeigt / Werte < 1 oder > 6 schalten die Anzeige aus
                   'Name'      : "anzOpti",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
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
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
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
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
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
                   'Choice'    : [ 1, 2, 3, 4, 5, 6, 0 ],
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
                   'Choice'    : [ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ],
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
                                  70, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71 ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "ZAT: $",
                   'Hotkey'    : 'Z',
                   'FormLabel' : "ZAT:|$"
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
    'tclasses' : {        // Datenspeicher fuer Talente der Jugendspieler (-1=wenig, 0=normal, +1=hoch)
                   'Name'      : "tclasses",
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
    'team' : {            // Datenspeicher fuer Daten des Erst- bzw. Zweitteams
                   'Name'      : "team",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'Permanent' : true,
                   'Default'   : { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined },
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 5,
                   'Replace'   : null,
                   'Space'     : 1,
                   'Label'     : "Verein:"
               },
    'reset' : {           // Optionen auf die "Werkseinstellungen" zuruecksetzen
                   'Name'      : "reset",
                   'Type'      : __OPTTYPES.SI,
                   'Action'    : __OPTACTION.RST,
                   'Label'     : "Standard-Optionen",
                   'Hotkey'    : 'r',
                   'FormLabel' : ""
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

// Gibt einen Wert zurueck. Ist dieser nicht definiert, wird ein Alternativwert geliefert
// value: Ein Wert. Ist dieser nicht undefined, wird er zurueckgeliefert
// defValue: Default-Wert fuer den Fall, dass nichts gesetzt ist
// retValue: Falls definiert, Rueckgabe-Wert fuer den Fall, dass value nicht undefined ist
// return Der Wert. Sind weder value noch defValue definiert, dann undefined
function getValue(value, defValue = undefined, retValue = undefined) {
    return (value === undefined) ? defValue : (retValue === undefined) ? value : retValue;
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

    if ((__STREAM !== undefined) && (__STREAM.length !== 0)) {
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
// optSet: Set mit den Optionen
// session: true = bis Browserende gespeichert (sessionStorage), false = unbegrenzt gespeichert (localStorage)
function runStored(optSet, session = true) {
    const __STORAGE = (session ? sessionStorage : localStorage);
    const __CMD = ((__STORAGE !== undefined) ? __STORAGE.getItem('runcmd') : undefined);

    if (__CMD !== undefined) {
        const __KEY = __STORAGE.getItem('runkey');
        let value = __STORAGE.getItem('runval');

        try {
            value = JSON.parse(value);
        } catch (ex) {
            console.error("runStored(): " + __CMD + " '" + __KEY + "' hat illegalen Wert '" + value + "'");
            // ... meist kann man den String selber aber speichern, daher kein "return"...
        }

        const __VAL = value;

        switch (__OPTACTION[__CMD]) {
        case __OPTACTION.SET : console.log("SET '" + __KEY + "' " + __VAL);
                               setStored(__KEY, __VAL, false, false);
                               break;
        case __OPTACTION.NXT : console.log("SETNEXT '" + __KEY + "' " + __VAL);
                               //setNextStored(__CONFIG.Choice, __KEY, __VAL, false, false);
                               setStored(__KEY, __VAL, false, false);
                               break;
        case __OPTACTION.RST : console.log("RESET");
                               resetOptions(optSet, false);
                               break;
        default :              break;
        }
    }

    __STORAGE.removeItem('runcmd');
    __STORAGE.removeItem('runkey');
    __STORAGE.removeItem('runval');
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
// return Gesetzter Wert
function getOptValue(opt, defValue = undefined) {
    return getValue((opt !== undefined) ? opt.Value : undefined, defValue);
}

// ==================== Ende Abschnitt fuer diverse Utilities ====================

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
    var fun;

    if (optAction !== undefined) {
        const __CONFIG = getOptConfig(getOptByName(optSet, item));
        const __RELOAD = ((__CONFIG !== undefined) ? __CONFIG.ActionReload : false);

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

// Initialisiert die gesetzten Optionen
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// return Gefuelltes Objekt mit den gesetzten Optionen
function initOptions(optConfig, optSet = undefined) {
    var value;

    if (optSet === undefined) {
        optSet = { };
    }

    for (let opt in optConfig) {
        const __CONFIG = optConfig[opt];
        const __ALTACTION = getValue(__CONFIG.AltAction, __CONFIG.Action);

        optSet[opt] = {
            'Config'    : __CONFIG,
            'Value'     : initOptValue(__CONFIG),
            'SetValue'  : undefined,
            'Action'    : initOptAction(__CONFIG.Action, opt, optSet),
            'AltAction' : initOptAction(__ALTACTION, opt, optSet)
        };
    }

    return optSet;
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
    const __VALUE = getOptValue(opt, value);

    return setOpt(opt, getNextOpt(opt, __VALUE), reload);
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

// Laedt eine (ueber Menu) gesetzte Option
// opt: Zu ladende Option
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Gesetzter Wert der gelandenen Option
function loadOption(opt, force = false) {
    const __CONFIG = getOptConfig(opt);

    if (! force && __CONFIG.AutoReset) {
        return setOptValue(opt, initOptValue(__CONFIG));
    } else if (__CONFIG.Serial) {
        return setOptValue(opt, deserialize(getOptName(opt), getOptValue(opt)));
    } else {
        return setOptValue(opt, GM_getValue(getOptName(opt), getOptValue(opt)));
    }
}

// Laedt die (ueber Menu) gesetzten Optionen
// optSet: Set mit den Optionen
// force: Laedt auch Optionen mit 'AutoReset'-Attribut
// return Set mit den geladenen Optionen
function loadOptions(optSet, force = false) {
    for (let opt in optSet) {
        loadOption(optSet[opt], force);
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
        GM_deleteValue(getOptName(opt));

        if (reset) {
            setOptValue(opt, initOptValue(__CONFIG));
        }
    }
}

// Entfernt die (ueber Menu) gesetzten Optionen (falls nicht 'Permanent')
// optSet: Gesetzte Optionen
// force: Entfernt auch Optionen mit 'Permanent'-Attribut
// reset: Setzt bei Erfolg auf Initialwert der Option
function deleteOptions(optSet, force = false, reset = true) {
    for (let opt in optSet) {
        deleteOption(optSet[opt], force, reset);
    }
}

// Entfernt eine (ueber Menu) gesetzte Option
// opt: Gesetzte Option
// name: Neu zu setzender Name (Speicheradresse)
// reload: Wert nachladen statt beizubehalten
// return Umbenannte Option
function renameOption(opt, name, reload = false) {
    const __NAME = getOptName(opt);

    if (__NAME !== name) {
        deleteOption(opt, true, ! reload);

        setOptName(opt, name);

        if (reload) {
            loadOption(opt);
        }
    }

    return opt;
}

// Setzt die Optionen in optSet auf die "Werkseinstellungen" des Skripts
// reload: Seite mit "Werkseinstellungen" neu laden
// optSet: Gesetzte Optionen
function resetOptions(optSet, reload = true) {
    // Alle (nicht 'Permanent') gesetzten Optionen entfernen...
    deleteOptions(optSet, false, true);

    if (reload) {
        // ... und Seite neu laden (mit "Werkseinstellungen")...
        window.location.reload();
    }
}

// ==================== Spezialisierter Abschnitt fuer Optionen ====================

// Gesetzte Optionen (wird von initOptions() angelegt und von loadOptions() gefuellt):
const __OPTSET = { };

// Teamparameter fuer getrennte Speicherung der Optionen fuer Erst- und Zweitteam...
const __MYTEAM = { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined };

// Behandelt die Optionen und laedt das Benutzermenu
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'hideMenu': Optionen werden zwar geladen und genutzt, tauchen aber nicht im Benutzermenu auf
// 'teamParams': Getrennte "ligaSize"-Option wird genutzt, hier: __MYTEAM mit 'Land' des Erst- bzw. Zweitteams
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { 'hideMenu' : false }) {
    const __TEAMPARAMS = optParams.teamParams;  // Ermittelte Parameter

    optSet = initOptions(optConfig, optSet);

    runStored(optSet, true);
    loadOptions(optSet);

    if (__TEAMPARAMS !== undefined) {
        __MYTEAM.Team = __TEAMPARAMS.Team;
        __MYTEAM.Liga = __TEAMPARAMS.Liga;
        __MYTEAM.Land = __TEAMPARAMS.Land;
        console.log("Ermittelt: " + JSON.stringify(__MYTEAM));
        // ... und abspeichern...
        setOpt(optSet.team, __MYTEAM, false);
    } else {
        const __TEAM = getOptValue(optSet.team);  // Gespeicherte Parameter

        if ((__TEAM !== undefined) && (__TEAM.Land !== undefined)) {
            __MYTEAM.Team = __TEAM.Team;
            __MYTEAM.Liga = __TEAM.Liga;
            __MYTEAM.Land = __TEAM.Land;
            console.log("Gespeichert: " + JSON.stringify(__MYTEAM));
        } else {
            console.error("Unbekannt: " + JSON.stringify(__TEAM));
        }
    }

    if (__MYTEAM.Land !== undefined) {
        // Prefix fuer die Optionen "birthdays", "tclasses" und "progresses"...
        renameOption(optSet.birthdays, __MYTEAM.Land + getOptName(optSet.birthdays), true);
        renameOption(optSet.tclasses, __MYTEAM.Land + getOptName(optSet.tclasses), true);
        renameOption(optSet.progresses, __MYTEAM.Land + getOptName(optSet.progresses), true);
        // ... und nachladen...
        loadOption(optSet.birthdays, true);
        loadOption(optSet.tclasses, true);
        loadOption(optSet.progresses, true);
    }

    if (! optParams.hideMenu) {
        buildMenu(optSet);
    }

    if (optParams.menuAnchor !== undefined) {
        buildForm(optParams.menuAnchor, optSet, optParams);
    }

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

// Helferfunktion fuer alle Browser: Fuegt fuer ein Event eine Reaktion ein
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

// Helferfunktion fuer alle Browser: Entfernt eine Reaktion fuer ein Event
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

// Helferfunktion fuer alle Browser: Fuegt fuer ein Event eine Reaktion ein
// id: ID des betroffenen Eingabeelements
// type: Name des Events, z.B. "click"
// callback: Funktion als Reaktion
// capture: Event fuer Parent zuerst (true) oder Child (false als Default)
// return false bei Misserfolg
function addDocEvent(id, type, callback, capture = false) {
    const __OBJ = document.getElementById(id);

    return addEvent(__OBJ, type, callback, capture);
}

// Helferfunktion fuer alle Browser: Entfernt eine Reaktion fuer ein Event
// id: ID des betroffenen Eingabeelements
// type: Name des Events, z.B. "click"
// callback: Funktion als Reaktion
// capture: Event fuer Parent zuerst (true) oder Child (false als Default)
// return false bei Misserfolg
function removeDocEvent(id, type, callback, capture = false) {
    const __OBJ = document.getElementById(id);

    return removeEvent(__OBJ, type, callback, capture);
}

// Helferfunktion fuer die Ueberpruefung, ob ein Item sichtbar sein soll
// item: Name des betroffenen Items
// showList: Checkliste der sichtbaren Items (true fuer sichtbar)
// hideList: Checkliste der unsichtbaren Items (true fuer unsichtbar)
// return Angabe, ob das Item sichtbar sein soll
function checkVisible(item, showList, hideList = undefined) {
    let show = true;

    if (showList !== undefined) {
        show = (showList[item] === true);  // gesetzt und true
    }
    if (hideList !== undefined) {
        if (hideList[item] === true) {  // gesetzt und true
            show = false;  // NICHT anzeigen
        }
    }

    return show;
}

// Helferfunktion fuer die Ermittlung eines Elements der Seite (Default: Tabelle)
// index: Laufende Nummer des Elements (0-based)
// tag: Tag des Elements ("table")
// doc: Dokument (document)
function getTable(index, tag = "table", doc = document) {
    const __TAGS = document.getElementsByTagName(tag);
    const __TABLE = __TAGS[index];

    return __TABLE;
}

// Helferfunktion fuer die Ermittlung der Zeilen einer Tabelle
// index: Laufende Nummer des Elements (0-based)
// doc: Dokument (document)
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
// return String mit dem (reinen) Funktionsaufruf
function getFormAction(opt, isAlt = false, value = undefined, serial = undefined) {
    const __CONFIG = getOptConfig(opt);
    const __SERIAL = getValue(serial, getValue(__CONFIG.Serial, false));
    const __NAMSTR = "'" + getOptName(opt) + "'";
    const __THISVAL = ((__CONFIG.ValType === "String") ? "'\\x22' + this.value + '\\x22'" : "this.value");
    const __TVALUE = getValue(__CONFIG.ValType, __THISVAL, "new " + __CONFIG.ValType + '(' + __THISVAL + ')');
    const __VALSTR = ((value !== undefined) ? JSON.stringify(value) : __SERIAL ? "JSON.stringify(" + __TVALUE + ')' : __TVALUE);
    const __ACTION = (isAlt ? getValue(__CONFIG.AltAction, __CONFIG.Action) : __CONFIG.Action);

    if (__ACTION !== undefined) {
        switch (__ACTION) {
        case __OPTACTION.SET : //return "doActionSet('" + getOptName(opt) + "', " + getNextOpt(opt, __VALSTR) + ')';
                               return "(sessionStorage.setItem('runcmd', 'SET'), sessionStorage.setItem('runkey', " + __NAMSTR + "), sessionStorage.setItem('runval', " + __VALSTR + "), window.location.reload())";
        case __OPTACTION.NXT : //return "doActionNxt('" + getOptName(opt) + "', " + getNextOpt(opt, __VALSTR) + ')';
                               return "(sessionStorage.setItem('runcmd', 'NXT'), sessionStorage.setItem('runkey', " + __NAMSTR + "), sessionStorage.setItem('runval', " + __VALSTR + "), window.location.reload())";
        case __OPTACTION.RST : //return "doActionRst()";
                               return "(sessionStorage.setItem('runcmd', 'RST'), window.location.reload())";
        default :              break;
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
// return String mit dem (reinen) Funktionsaufruf
function getFormActionEvent(opt, isAlt = false, value = undefined, type = "click", serial = undefined) {
    const __ACTION = getFormAction(opt, isAlt, value, serial);

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
    const __ONSUBMIT = ((__SUBMIT.length > 0) ? ' onKeyDown="' + __SUBMIT + '"': "");
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
        if (checkVisible(opt, __SHOWFORM, optParams.hideForm)) {
            const __ELEMENT = getOptionElement(optSet[opt]);
            const __TDOPT = (__ELEMENT.indexOf('|') < 0) ? ' colspan="2"' : "";

            if (__ELEMENT.length > 0) {
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

// Erschafft die Spieler-Objekte und fuellt sie mit Werten
function init(playerRows, optSet, colIdx, offsetUpper = 1, offsetLower = 0) {
    const __SAISON = getOptValue(optSet.saison);
    const __CURRZAT = getOptValue(optSet.aktuellerZat);
    const __BIRTHDAYS = getOptValue(optSet.birthdays, []);
    const __TCLASSES = getOptValue(optSet.tclasses, []);
    const __PROGRESSES = getOptValue(optSet.progresses, []);
    const __PLAYERS = [];

    for (let i = offsetUpper, j = 0; i < playerRows.length - offsetLower; i++, j++) {
        const __CELLS = playerRows[i].cells;
        const __AGE = getAgeFromHTML(__CELLS, colIdx.Age);
        const __SKILLS = getSkillsFromHTML(__CELLS, colIdx);
        const __ISGOALIE = isGoalieFromHTML(__CELLS, colIdx.Age);
        const __NEWPLAYER = new PlayerRecord(__AGE, __SKILLS, __ISGOALIE);

        __NEWPLAYER.initPlayer(__SAISON, __CURRZAT, __BIRTHDAYS[j], __TCLASSES[j], __PROGRESSES[j]);
        __PLAYERS[j] = __NEWPLAYER;
    }

    return __PLAYERS;
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

function ColumnManager(optSet) {
    this.geb = getOptValue(optSet.zeigeGeb);
    this.tal = getOptValue(optSet.zeigeTal);
    this.quo = getOptValue(optSet.zeigeQuote);
    this.aufw = getOptValue(optSet.zeigeAufw);
    this.alter = getOptValue(optSet.zeigeAlter);
    this.skill = getOptValue(optSet.zeigeSkill);
    this.pos = getOptValue(optSet.zeigePosition);
    this.opti = ((getOptValue(optSet.anzahlOpti) >= 1) && (getOptValue(optSet.anzahlOpti) <= 6));
    this.mw = ((getOptValue(optSet.anzahlMW) >= 1) && (getOptValue(optSet.anzahlMW) <= 6));
    this.anzOpti = getOptValue(optSet.anzahlOpti);
    this.anzMw = getOptValue(optSet.anzahlMW);
    this.skillE = getOptValue(optSet.zeigeSkillEnde);
    this.optiE = ((getOptValue(optSet.anzahlOptiEnde) >= 1) && (getOptValue(optSet.anzahlOptiEnde) <= 6));
    this.mwE = ((getOptValue(optSet.anzahlMWEnde) >= 1) && (getOptValue(optSet.anzahlMWEnde) <= 6));
    this.anzOptiE = getOptValue(optSet.anzahlOptiEnde);
    this.anzMwE = getOptValue(optSet.anzahlMWEnde);
    this.kennzE = getOptValue(optSet.kennzeichenEnde);

    this.toString = function() {
        let result = "Skillschnitt\t\t" + this.skill + '\n';
        result += "Beste Position\t" + this.pos + '\n';
        result += "Optis\t\t\t" + this.opti + " (" + this.anzOpti + ")\n";
        result += "Marktwerte\t\t" + this.mw + " (" + this.anzMw + ")\n";
        result += "Skillschnitt Ende\t" + this.skillE + '\n';
        result += "Optis Ende\t\t" + this.optiE + " (" + this.anzOptiE + ")\n";
        result += "Marktwerte Ende\t" + this.mwE + " (" + this.anzMwE + ")\n";

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
        if (this.opti) {
            for (let i = 1; i <= this.anzOpti; i++) {
                this.addAndFillCell(headers, "Opti " + i, titleColor);
                if (this.mw && (this.anzMw >= i)) {
                    this.addAndFillCell(headers, "MW " + i, titleColor);
                }
            }
            if (this.mw) {
                for (let i = this.anzOpti + 1; i <= this.anzMw; i++) {
                    // Mehr MW- als Opti-Spalten
                    this.addAndFillCell(headers, "MW " + i, titleColor);
                }
            }
        } else if (this.mw) {
            // Keine Opti-, dafuer MW-Spalten
            for (let i = 1; i <= this.anzMw; i++) {
                this.addAndFillCell(headers, "MW " + i, titleColor);
            }
        }

        // Titel fuer die Werte mit Ende 18
        if (this.skillE) {
            this.addAndFillCell(headers, "Skill" + this.kennzE, titleColor);
        }
        if (this.optiE) {
            for (let i = 1; i <= this.anzOptiE; i++) {
                this.addAndFillCell(headers, "Opti " + i + this.kennzE, titleColor);
                if (this.mwE && (this.anzMwE >= i)) {
                    this.addAndFillCell(headers, "MW " + i + this.kennzE, titleColor);
                }
            }
            if (this.mwE) {
                for (let i = this.anzOptiE + 1; i <= this.anzMwE; i++) {
                    this.addAndFillCell(headers, "MW " + i + this.kennzE, titleColor);
                }
            }
        } else if (this.mwE) {
            for (let i = 1; i <= this.anzMwE; i++) {
                this.addAndFillCell(headers, "MW " + i + this.kennzE, titleColor);
            }
        }
    };  // Ende addTitles()

    this.addValues = function(player, playerRow, color = "#FFFFFF") {
        const __COLOR = (player.isGoalie ? getColor("TOR") : color);
        const __POS1COLOR = (player.isGoalie ? getColor("TOR") : getColor(player.getPos(1)));

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
            this.addAndFillCell(playerRow, player.getPos(1), __POS1COLOR);
        }
        if (this.opti) {
            for (let i = 1; i <= this.anzOpti; i++) {
                if (player.isGoalie) {
                    if (i === 1) {
                        // TOR-Opti anzeigen
                        this.addAndFillCell(playerRow, player.getOpti("TOR"), getColor("TOR"), 2);
                    } else {
                        // TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
                        this.addCell(playerRow);
                    }
                } else {
                    // Feld-Opti anzeigen
                    this.addAndFillCell(playerRow, player.getOpti(player.getPos(i)), getColor(player.getPos(i)), 2);
                }
                if (this.mw && (this.anzMw >= i)) {
                    if (player.isGoalie) {
                        if (i === 1) {
                            // TOR-MW anzeigen
                            this.addAndFillCell(playerRow, player.getMarketValue("TOR"), getColor("TOR"), 0);
                        } else {
                            // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                            this.addCell(playerRow);
                        }
                    } else {
                        // Feld-MW anzeigen
                        this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i)), getColor(player.getPos(i)), 0);
                    }
                }
            }
            // Verbleibende MW anzeigen
            if (this.mw) {
                for (let i = this.anzOpti + 1; i <= this.anzMw; i++) {
                    if (player.isGoalie) {
                        if (i === 1) {
                            // TOR-MW anzeigen
                            this.addAndFillCell(playerRow, player.getMarketValue("TOR"), getColor("TOR"), 0);
                        } else {
                            // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                            this.addCell(playerRow);
                        }
                    } else {
                        // Feld-MW anzeigen
                        this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i)), getColor(player.getPos(i)), 0);
                    }
                }
            }
        } else if (this.mw) {
            // Opti soll nicht angezeigt werden, dafuer aber MW
            for (let i = 1; i <= this.anzMw; i++) {
                if (player.isGoalie) {
                    if (i === 1) {
                        // TOR-MW anzeigen
                        this.addAndFillCell(playerRow, player.getMarketValue("TOR"), getColor("TOR"), 0);
                    } else {
                        // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                        this.addCell(playerRow);
                    }
                } else {
                    // Feld-MW anzeigen
                    this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i)), getColor(player.getPos(i)), 0);
                }
            }
        }

        // Werte mit Ende 18
        if (this.skillE) {
            this.addAndFillCell(playerRow, player.getSkill(__TIME.end), __COLOR, 2);
        }
        if (this.optiE) {
            for (let i = 1; i <= this.anzOptiE; i++) {
                if (player.isGoalie) {
                    if (i === 1) {
                        // TOR-Opti anzeigen
                        this.addAndFillCell(playerRow, player.getOpti("TOR", __TIME.end), getColor("TOR"), 2);
                    } else {
                        // TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
                        this.addCell(playerRow);
                    }
                } else {
                    // Feld-Opti anzeigen
                    this.addAndFillCell(playerRow, player.getOpti(player.getPos(i), __TIME.end), getColor(player.getPos(i)), 2);
                }
                if (this.mwE && (this.anzMwE >= i)) {
                    if (player.isGoalie) {
                        if (i === 1) {
                            // TOR-MW anzeigen
                            this.addAndFillCell(playerRow, player.getMarketValue("TOR", __TIME.end), getColor("TOR"), 0);
                        } else {
                            // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                            this.addCell(playerRow);
                        }
                    } else {
                        // Feld-MW anzeigen
                        this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), __TIME.end), getColor(player.getPos(i)), 0);
                    }
                }
            }
            // Verbleibende MW anzeigen
            if (this.mwE) {
                for (let i = this.anzOptiE + 1; i <= this.anzMwE; i++) {
                    if (player.isGoalie) {
                        if (i === 1) {
                            // TOR-MW anzeigen
                            this.addAndFillCell(playerRow, player.getMarketValue("TOR", __TIME.end), getColor("TOR"), 0);
                        } else {
                             // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                            this.addCell(playerRow);
                        }
                    } else {
                        // Feld-MW anzeigen
                        this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), __TIME.end), getColor(player.getPos(i)), 0);
                    }
                }
            }
        } else if (this.mwE) {
            // Opti soll nicht angezeigt werden, dafuer aber MW
            for (let i = 1; i <= this.anzMwE; i++) {
                if (player.isGoalie) {
                    if (i === 1) {
                        // TOR-MW anzeigen
                        this.addAndFillCell(playerRow, player.getMarketValue("TOR", __TIME.end), getColor("TOR"), 0);
                    } else {
                        // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                        this.addCell(playerRow);
                    }
                } else {
                    // Feld-MW anzeigen
                    this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), __TIME.end), getColor(player.getPos(i)), 0);
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

        const __RATIO = this.getAufwertungsSchnitt();
        const __ADDRATIO = __RATIO * (this.getZatAge(__TIME.end) - this.getZatAge());

        for (let i in this.skills) {
            const __SKILL = this.skills[i];
            let progSkill = __SKILL;

            if (isTrainableSkill(i)) {
                // Auf ganze Zahl runden und parseInt(), da das sonst irgendwie als String interpretiert wird
                const __ADDSKILL = parseInt((__SKILL * __ADDRATIO / this.getZatAge()).toFixed(0), 10);

                progSkill += __ADDSKILL;
            }

            this.skillsEnd[i] = progSkill;
        }
    };  // Ende this.iniPlayer()

    this.getGeb = function() {
        return (this.zatGeb < 0) ? '?' : this.zatGeb;
    };

    this.calcZatAge = function(currZAT) {
        if (this.age < 13) {
            return 0;  // noch nicht trainiert
        } else {
            let ZATs = (this.age - ((currZAT < this.zatGeb) ? 12 : 13)) * 72;  // Basiszeit fuer die Jahre seit Jahrgang 13

            if (this.zatGeb < 0) {
                return ZATs + currZAT;  // Zaehlung begann Anfang der Saison (und der Geburtstag wird erst nach dem Ziehen bestimmt)
            } else {
                return ZATs + currZAT - this.zatGeb;  // Verschiebung relativ zum Geburtstag (von -zatGeb, ..., 0, ..., 71 - zatGeb)
            }
        }
    };

    this.getZatAge = function(when = __TIME.now) {
        if (when === __TIME.end) {
            return (18 - 12) * 72 - 1;  // (max.) Trainings-ZATs bis Ende 18
        } else {
            return this.zatAge;
        }
    };

    this.getAge = function(when = __TIME.now) {
        if (this.mwFormel === __MWFORMEL.alt) {
            return (when === __TIME.end) ? 18 : this.age;
        } else {  // Geburtstage ab Saison 10...
            return (when === __TIME.end) ? 18.00 : (13.00 + this.getZatAge() / 72);
        }
    };

    this.getTrainierteSkills = function() {
        let sum = 0;

        for (let i in this.skills) {
            if (isTrainableSkill(i)) {
                sum += this.skills[i];
            }
        }

        return sum;
    };

    this.getAufwertungsSchnitt = function() {
        return parseFloat(this.getTrainierteSkills() / this.getZatAge());
    };

    this.getPos = function(idx) {
        const __IDXOFFSET = 1;
        return this.positions[idx - __IDXOFFSET][0];
    };

    this.getTalent = function() {
        return (this.talent < 0) ? "wenig" : (this.talent > 0) ? "hoch" : "normal";
    };

    this.getAufwert = function() {
        return (this.aufwert.length > 0) ? this.aufwert : "keine";
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
            return Math.round(Math.pow((1 + this.getSkill(when)/100) * (1 + this.getOpti(pos, when)/100)*  (2 - __AGE/100), 10) * 2);    // Alte Formel bis Saison 9
        } else {  // MW-Formel ab Saison 10...
            const __MW5TF = 1.00;  // Zwischen 0.97 und 1.03

            return Math.round(Math.pow(1 + this.getSkill(when)/100, 5.65) * Math.pow(1 + this.getOpti(pos, when)/100, 8.1) * Math.pow(1 + (100 - __AGE)/49, 10) * __MW5TF);
        }
    };
}

// Funktionen fuer die HTML-Seite *******************************************************

// Liest das Alter aus
// return Alter als Zahl
function getAgeFromHTML(cells, colIdxAge) {
    return parseInt(cells[colIdxAge].textContent, 10);
}

// Liest das Geburtsdatum aus
// return Geburtsdatum als ZAT
function getGebFromHTML(cells, colIdxGeb) {
    const __TEXT = ((cells[colIdxGeb] === undefined) ? '?' : cells[colIdxGeb].textContent);

    return parseInt((__TEXT === '?') ? -1 : __TEXT, 10);
}

// Liest die Talentklasse ("wenig", "normal", "hoch") aus
// return Talent als Zahl (-1=wenig, 0=normal, +1=hoch)
function getTalentFromHTML(cells, colIdxTal) {
    const __TEXT = ((cells[colIdxTal] === undefined) ? '?' : cells[colIdxTal].textContent);

    return parseInt((__TEXT === "wenig") ? -1 : (__TEXT === "hoch") ? +1 : 0, 10);
}

// Liest die Aufwertungen aus
// return Aufwertungen als String
function getAufwertFromHTML(cells, colIdxAuf) {
    const __TEXT = ((cells[colIdxAuf] === undefined) ? '?' : cells[colIdxAuf].textContent);

    return __TEXT.toString();
}

// Liest die Einzelskills aus
// return Skills als Array von Zahlen
function getSkillsFromHTML(cells, colIdx) {
    const __RESULT = [];

    for (let i = colIdx.Einz; i < colIdx.Zus; i++) {
        __RESULT[i - colIdx.Einz] = parseInt(cells[i].textContent, 10);
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
    let result = false;

    for (let idxTrainable of __TRAINABLESKILLS) {
        if (idx === idxTrainable) {
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

// ==================== Abschnitt fuer sonstige Parameter ====================

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

// Ermittelt, wie das eigene Team heisst und aus welchem Land bzw. Liga es kommt (zur Unterscheidung von Erst- und Zweitteam)
// cell: Tabellenzelle mit den Parametern zum Team "<b>Willkommen im Managerb&uuml;ro von TEAM</b><br>LIGA LAND<a href=..."
// return Im Beispiel { 'Team' : "TEAM", 'Liga' : "LIGA", 'Land' : "LAND" },
//        z.B. { 'Team' : "Choromonets Odessa", 'Liga' : "1. Liga", 'Land' : "Ukraine" }
function getTeamParamsFromCell(cell) {
    const __SEARCHSTART = " von ";
    const __SEARCHMIDDLE = "</b><br>";
    const __SEARCHLIGA = ". Liga ";
    const __SEARCHEND = "<a href=";
    const __INDEXSTART = cell.innerHTML.indexOf(__SEARCHSTART);
    const __INDEXEND = cell.innerHTML.indexOf(__SEARCHEND);

    let teamParams = cell.innerHTML.substring(__INDEXSTART + __SEARCHSTART.length, __INDEXEND);
    const __INDEXLIGA = teamParams.indexOf(__SEARCHLIGA);
    const __INDEXMIDDLE = teamParams.indexOf(__SEARCHMIDDLE);

    let land = (__INDEXLIGA > 0) ? teamParams.substring(__INDEXLIGA + __SEARCHLIGA.length) : undefined;
    const __TEAM = (__INDEXMIDDLE > 0) ? teamParams.substring(0, __INDEXMIDDLE) : undefined;
    let liga = ((__INDEXLIGA > 0) && (__INDEXMIDDLE > 0)) ? teamParams.substring(__INDEXMIDDLE + __SEARCHMIDDLE.length) : undefined;

    if (land !== undefined) {
        if (land.charAt(1) === ' ') {    // Land z.B. hinter "2. Liga A " statt "1. Liga "
            land = land.substr(2);
        }
        if (liga !== undefined) {
            liga = liga.substring(0, liga.length - land.length - 1);
        }
    }

    const __RET = {
        'Team' : __TEAM,
        'Liga' : liga,
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

// ==================== Ende Abschnitt fuer sonstige Parameter ====================

// ==================== Hauptprogramm ====================

// Verarbeitet Ansicht "Haupt" (Managerbuero) zur Ermittlung des aktuellen ZATs
function procHaupt() {
    const __TEAMPARAMS = getTeamParamsFromCell(getRows(1)[0].cells[1]);  // Link mit Team, Liga, Land...

    buildOptions(__OPTCONFIG, __OPTSET, {
                     'teamParams' : __TEAMPARAMS,
                     'hideMenu'   : true
                 });

    const __NEXTZAT = getZATNrFromCell(getRows(0)[2].cells[0]);  // "Der naechste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;

    if (__CURRZAT >= 0) {
        console.log("Aktueller ZAT: " + __CURRZAT);

        setOpt(__OPTSET.aktuellerZat, __CURRZAT, false);
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

    const __BIRTHDAYS = [];
    const __TCLASSES = [];
    const __PROGRESSES = [];

    if (getRows(1) === undefined) {
        console.log("Diese Seite ist ohne Team nicht verf\xFCgbar!");
    } else if (getTable(1).length < 3) {
        console.log("Ziehen-Seite");
    } else {
        buildOptions(__OPTCONFIG, __OPTSET, {
                         'menuAnchor' : getTable(0, "div"),
                         'showForm' : {
                                        'sepStyle'     : true,
                                        'sepColor'     : true,
                                        'sepWidth'     : true,
                                        'aktuellerZat' : true,
                                        'team'         : true,
                                        'reset'        : true,
                                        'showForm'     : true
                                      },
                         'formWidth' : 1
                     });

        const __ROWS = getRows(1);

        for (let i = __ROWOFFSETUPPER; i < __ROWS.length - __ROWOFFSETLOWER; i++) {
            __BIRTHDAYS[i - __ROWOFFSETUPPER] = getGebFromHTML(__ROWS[i].cells, __COLUMNINDEX.Geb);
            __TCLASSES[i - __ROWOFFSETUPPER] = getTalentFromHTML(__ROWS[i].cells, __COLUMNINDEX.Tal);
            __PROGRESSES[i - __ROWOFFSETUPPER] = getAufwertFromHTML(__ROWS[i].cells, __COLUMNINDEX.Auf);
        }

        setOpt(__OPTSET.birthdays, __BIRTHDAYS, false);
        setOpt(__OPTSET.tclasses, __TCLASSES, false);
        setOpt(__OPTSET.progresses, __PROGRESSES, false);

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
                         'formWidth'  : 1
                     });

        const __COLMAN = new ColumnManager(__OPTSET);
        const __ROWS = getRows(1);
        const __HEADERS = __ROWS[0];
        const __TITLECOLOR = getColor("LEI");  // "#FFFFFF"

        __COLMAN.addTitles(__HEADERS, __TITLECOLOR);

        const __PLAYERS = init(__ROWS, __OPTSET, __COLUMNINDEX, __ROWOFFSETUPPER, __ROWOFFSETLOWER);

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
