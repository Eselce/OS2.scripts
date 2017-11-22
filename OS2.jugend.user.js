// ==UserScript==
// @name        OS2.jugendV4
// @namespace   http://os.ongapo.com/
// @version     0.41
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
// @include     http://online-soccer.eu/haupt.php
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
    'SD' : "simple data",
    'SI' : "simple option"
};

// Moegliche Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __OPTCONFIG = {
    'zeigeGeb' : {        // Spaltenauswahl fuer Geburtstage (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showBirthday",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : switchShowBirthday,
                   'Label'     : "Geb. ein",
                   'Hotkey'    : 'G',
                   'AltLabel'  : "Geb. aus",
                   'AltHotkey' : 'G'
               },
    'zeigeAlter' : {        // Spaltenauswahl fuer dezimales Alter (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showAge",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : switchShowAge,
                   'Label'     : "Alter ein",
                   'Hotkey'    : 'A',
                   'AltLabel'  : "Alter aus",
                   'AltHotkey' : 'A'
               },
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
    'birthdays' : {       // Datenspeicher fuer Geburtstage der Jugendspieler
                   'Name'      : "birthdays",
                   'Type'      : __OPTTYPES.SD,
                   'Default'   : [],
                   'Action'    : undefined,
                   'Hidden'    : true,
                   'Serial'    : true
               },
    'team' : {            // Datenspeicher fuer Daten des Erst- bzw. Zweitteams
                   'Name'      : "team",
                   'Type'      : __OPTTYPES.SD,
                   'Default'   : { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined },
                   'Action'    : undefined,
                   'Hidden'    : true,
                   'Serial'    : true
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
        case __OPTTYPES.SD : value = __CONFIG.Default;
                             __CONFIG.Serial = true;
                             break;
        case __OPTTYPES.SI : value = undefined;
                             break;
        default :            break;
        }
        if (__CONFIG.Serial) {
            __CONFIG.Hidden = true;
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
function setOption(name, value, reload = true, serial = false) {
    if (serial) {
        serialize(name, value);
    } else {
        GM_setValue(name, value);
    }
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
function setNextOption(arr, name, value, reload = true, serial = false) {
    const __POS = arr.indexOf(value) + 1;

    return setOption(name, arr[(__POS < arr.length) ? __POS : 0], reload, serial);
}

// Setzt eine Option auf einen vorgegebenen Wert
// Fuer kontrollierte Auswahl des Values siehe setNextOpt()
// opt: Config und vorheriger Value der Option
// value: (Bei allen Typen) zu setzender Wert
// reload: Seite mit neuem Wert neu laden
function setOpt(opt, value, reload = false) {
    opt.Value = setOption(opt.Config.Name, value, reload, opt.Config.Serial);
}

// Setzt die naechste moegliche Option
// opt: Config und Value der Option
// value: Bei __OPTTYPES.TF zu setzender Wert
// reload: Seite mit neuem Wert neu laden
function setNextOpt(opt, value = undefined, reload = true) {
    const __CONFIG = opt.Config;

    switch (__CONFIG.Type) {
    case __OPTTYPES.MC : opt.Value = setNextOption(__CONFIG.Choice, __CONFIG.Name, opt.Value, reload, __CONFIG.Serial);
                         break;
    case __OPTTYPES.SW : opt.Value = setOption(__CONFIG.Name, ! opt.Value, reload, __CONFIG.Serial);
                         break;
    case __OPTTYPES.TF : opt.Value = setOption(__CONFIG.Name, (value !== undefined) ? value : ! opt.Value, reload, __CONFIG.Serial);
                         break;
    case __OPTTYPES.SD : opt.Value = setOption(__CONFIG.Name, (value !== undefined) ? value : opt.Value, reload, __CONFIG.Serial);
                         break;
    case __OPTTYPES.SI : break;
    default :            break;
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
    const __VALUE = ((serial && (opt !== undefined)) ? uneval(opt) : opt);
    const __MENU = ((menu !== undefined) ? menu.replace('$', __VALUE) : "");
    const __OPTIONS = (hidden ? "HIDDEN " : "") + "OPTION " + __MENU +
                      ((__VALUE !== undefined) ? " / *" + __VALUE + '*' : "");

    console.log(__OPTIONS);
    if (! hidden) {
        GM_registerMenuCommand(__MENU, fun, key);
    }
}

// Zeigt den Eintrag im Menu einer Option
// opt: Config und Value der Option
function registerOption(opt) {
    const __CONFIG = opt.Config;

    if (! __CONFIG.Hidden) {
        switch (__CONFIG.Type) {
        case __OPTTYPES.MC : registerNextMenuOption(opt.Value, __CONFIG.Choice,
                                                           __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey);
                             break;
        case __OPTTYPES.SW : registerMenuOption(opt.Value, __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey,
                                                           __CONFIG.AltLabel, __CONFIG.Action, __CONFIG.AltHotkey);
                             break;
        case __OPTTYPES.TF : registerMenuOption(opt.Value, __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey,
                                                           __CONFIG.AltLabel, __CONFIG.AltAction, __CONFIG.AltHotkey);
                             break;
        case __OPTTYPES.SD : registerDataOption(opt.Value, __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey,
                                                           __CONFIG.Hidden, __CONFIG.Serial);
                             break;
        case __OPTTYPES.SI : registerDataOption(opt.Value, __CONFIG.Label, __CONFIG.Action, __CONFIG.Hotkey,
                                                           __CONFIG.Hidden, __CONFIG.Serial);
                             break;
        default :            break;
        }
    } else {
        // Nur Anzeige im Log...
        registerDataOption(opt.Value, __CONFIG.Name, __CONFIG.Action, __CONFIG.Hotkey, __CONFIG.Hidden, __CONFIG.Serial);
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

        if (__OPT.Config.Serial) {
            __OPT.Value = deserialize(__OPT.Config.Name, __OPT.Value);
        } else {
            __OPT.Value = GM_getValue(__OPT.Config.Name, __OPT.Value);
        }
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

// Teamparameter fuer getrennte Speicherung der Optionen fuer Erst- und Zweitteam...
const __MYTEAM = { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined };

// Behandelt die Optionen und laedt das Benutzermenu
// optConfig: Konfiguration der Optionen
// optSet: Platz für die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'teamParams': Getrennte "ligaSize"-Option wird genutzt, hier: __MYTEAM mit 'Land' des Erst- bzw. Zweitteams
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { 'hideMenu' : false }) {
    const __TEAMPARAMS = optParams.teamParams;	// Ermittelte Parameter
    let saveTeam = false;

    optSet = initOptions(optConfig, optSet);

    if (__TEAMPARAMS !== undefined) {
        __MYTEAM.Team = __TEAMPARAMS.Team;
        __MYTEAM.Liga = __TEAMPARAMS.Liga;
        __MYTEAM.Land = __TEAMPARAMS.Land;
        console.log("Ermittelt: " + uneval(__MYTEAM));
        saveTeam = true;
    } else {
        const __TEAM = deserialize(optSet.team.Config.Name);	// Gespeicherte Parameter
        if ((__TEAM !== undefined) && (__TEAM.Land !== undefined)) {
            __MYTEAM.Team = __TEAM.Team;
            __MYTEAM.Liga = __TEAM.Liga;
            __MYTEAM.Land = __TEAM.Land;
            console.log("Gespeichert: " + uneval(__MYTEAM));
        } else {
            console.log("Unbekannt: " + uneval(__MYTEAM));
        }
    }

    if (__MYTEAM.Land !== undefined) {
        // Prefix fuer die Option "birthdays"
        optSet.birthdays.Config.Name = __MYTEAM.Land + optSet.birthdays.Config.Name;
    }

    loadOptions(optSet);

    if (saveTeam) {
        // ... und abspeichern...
        setOpt(optSet.team, __MYTEAM, false);
    }

    if (! optParams.hideMenu) {
        buildMenu(optSet);
    }

    return optSet;
}

// ==================== Abschnitt mit Reaktionen auf Optionen ====================

// Wechselt die Anzeige des Geburtstags zwischen an und aus
function switchShowBirthday() {
    setNextOpt(__OPTSET.zeigeGeb);
}

// Wechselt die Anzeige des dezimalen Alters zwischen an und aus
function switchShowAge() {
    setNextOpt(__OPTSET.zeigeAlter);
}

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

// ==================== Abschnitt fuer diverse Utilities ====================

// Speichert einen beliebiegen Wert bzw. Code unter einem Namen ab
// name: GM_serValue-Name, unter dem die Daten gespeichert werden
// value: Beliebiger Wert oder Code (Vorsicht! Mit Augenmass benutzen!)
function serialize(name, value) {
    GM_setValue(name, uneval(value));
}

// Holt einen beliebiegen Wert bzw. Code unter einem Namen zurueck
// name: GM_serValue-Name, unter dem die Daten gespeichert werden
// defValue: Default-Wert fuer den Fall, dass nichts gespeichert ist
function deserialize(name, defValue = "({})") {
    /* jshint evil: true */
    return eval(GM_getValue(name, defValue));
}

// ==================== Ende Abschnitt fuer Optionen ====================

// ==================== Abschnitt genereller Code zur Anzeige der Jugend ====================

// Zeitpunktangaben
const __TIME = {
    'cre' : 0,	// Jugendspieler angelegt (mit 12 Jahren)
    'beg' : 1,	// Jugendspieler darf trainieren (wird 13 Jahre alt)
    'now' : 2,	// Aktueller ZAT
    'end' : 3	// Jugendspieler wird Ende 18 gezogen (Geb. - 1 bzw. ZAT 71 für '?')
};

// Funktionen ***************************************************************************

// Erschafft die Spieler-Objekte und fuellt sie mit Werten
function init(playerRows, optSet, colIdx, offsetUpper = 1, offsetLower = 0) {
    const __SAISON = optSet.saison.Value;
    const __CURRZAT = optSet.aktuellerZat.Value;
    const __BIRTHDAYS = ((optSet.birthdays.Value !== undefined) ? optSet.birthdays.Value : []);
    const __PLAYERS = [];

    for (let i = offsetUpper, j = 0; i < playerRows.length - offsetLower; i++, j++) {
        const __CELLS = playerRows[i].cells;
        const __AGE = getAgeFromHTML(__CELLS, colIdx.Age);
        const __SKILLS = getSkillsFromHTML(__CELLS, colIdx);
        const __ISGOALIE = isGoalieFromHTML(__CELLS, colIdx.Age);
        const __NEWPLAYER = new PlayerRecord(__AGE, __SKILLS, __ISGOALIE);

        __NEWPLAYER.initPlayer(__SAISON, __CURRZAT, __BIRTHDAYS[j]);
        __PLAYERS[j] = __NEWPLAYER;
    }

    return __PLAYERS;
}

// Trennt die Gruppen (z.B. Jahrgaenge) mit Linien
function separateGroups(rows, borderString, colIdxSort = 0, offsetUpper = 1, offsetLower = 0, offsetLeft = -1, offsetRight = 0) {
    if (offsetLeft < 0) {
        offsetLeft = colIdxSort;	// ab Sortierspalte
    }

    for (let i = offsetUpper; i < rows.length - offsetLower - 1; i++) {
        if (rows[i].cells[colIdxSort].textContent != rows[i + 1].cells[colIdxSort].textContent) {
            for (let j = offsetLeft; j < rows[i].cells.length - offsetRight; j++) {
                rows[i].cells[j].style.borderBottom = borderString;
            }
        }
    }
}

// Klasse ColumnManager *****************************************************************

function ColumnManager(optSet) {
    this.geb = optSet.zeigeGeb.Value;
    this.alter = optSet.zeigeAlter.Value;
    this.skill = optSet.zeigeSkill.Value;
    this.pos = optSet.zeigePosition.Value;
    this.opti = ((optSet.anzahlOpti.Value >= 1) && (optSet.anzahlOpti.Value <= 6));
    this.mw = ((optSet.anzahlMW.Value >= 1) && (optSet.anzahlMW.Value <= 6));
    this.anzOpti = optSet.anzahlOpti.Value;
    this.anzMw = optSet.anzahlMW.Value;
    this.skillE = optSet.zeigeSkillEnde.Value;
    this.optiE = ((optSet.anzahlOptiEnde.Value >= 1) && (optSet.anzahlOptiEnde.Value <= 6));
    this.mwE = ((optSet.anzahlMWEnde.Value >= 1) && (optSet.anzahlMWEnde.Value <= 6));
    this.anzOptiE = optSet.anzahlOptiEnde.Value;
    this.anzMwE = optSet.anzahlMWEnde.Value;
    this.kennzE = optSet.kennzeichenEnde.Value;

    this.toString = function() {
        let result = "Skillschnitt\t\t" + this.skill + "\n";
        result += "Beste Position\t" + this.pos + "\n";
        result += "Optis\t\t\t" + this.opti + " (" + this.anzOpti + ")\n";
        result += "Marktwerte\t\t" + this.mw + " (" + this.anzMw + ")\n";
        result += "Skillschnitt Ende\t" + this.skillE + "\n";
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
    }; // Ende addTitles()

    this.addValues = function(player, playerRow, color = "#FFFFFF") {
        const __COLOR = (player.isGoalie ? getColor("TOR") : color);
        const __POS1COLOR = (player.isGoalie ? getColor("TOR") : getColor(player.getPos(1)));

        // Aktuelle Werte
        if (this.geb) {
            this.addAndFillCell(playerRow, (player.zatGeb < 0) ? '?' : player.zatGeb, __COLOR, 0);
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
                    if (i == 1) {
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
                        if (i == 1) {
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
                        if (i == 1) {
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
                    if (i == 1) {
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
                    if (i == 1) {
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
                        if (i == 1) {
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
                        if (i == 1) {
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
                    if (i == 1) {
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
    }; // Ende addValues(player, playerRow)
}

// Klasse PlayerRecord ******************************************************************

function PlayerRecord(age, skills, isGoalie) {
    // Zu benutzende Marktwertformel
    const __MWFORMEL = {
        'alt' : 0,	// Marktwertformel bis Saison 9 inklusive
        'S10' : 1	// Marktwertformel MW5 ab Saison 10
    };

    this.mwFormel = __MWFORMEL.S10;	// Neue Formel, genauer in initPlayer()

    this.age = age;
    this.skills = skills;
    this.isGoalie = isGoalie;

    // in this.initPlayer() definiert:
    // this.zatGeb: ZAT, an dem der Spieler Geburtstag hat, -1 fuer "noch nicht zugewiesen", also "?"
    // this.zatAge: Bisherige erfolgte Trainings-ZATs
    // this.positions[][]: Positionstext und Opti; TOR-Index ist 5
    // this.skillsEnd[]: Berechnet aus this.skills, this.age und aktuellerZat

    this.toString = function() {
        let result = "Alter\t\t" + this.age + "\n\n";
        result += "Aktuelle Werte\n";
        result += "Skillschnitt\t" + this.getSkill().toFixed(2) + "\n";
        result += "Optis und Marktwerte";

        for (let pos of this.positions) {
            result += "\n\t" + pos + " \t";
            result += this.getOpti(pos).toFixed(2) + "\t";
            result += getNumberString(this.getMarketValue(pos).toString());
        }

        result += "\n\nWerte mit Ende 18\n";
        result += "Skillschnitt\t" + this.getSkill(__TIME.end).toFixed(2) + "\n";
        result += "Optis und Marktwerte";

        for (let pos of this.positions) {
            result += "\n\t" + this.getPos()[i] + " \t";
            result += this.getOpti(pos, __TIME.end).toFixed(2) + "\t";
            result += getNumberString(this.getMarketValue(pos, __TIME.end).toString());
        }

        return result;
    }; // Ende this.toString()

    // Berechnet die Opti-Werte, sortiert das Positionsfeld und berechnet die Einzelskills mit Ende 18
    this.initPlayer = function(saison, currZAT, gebZAT) {
        this.zatGeb = gebZAT;
        this.zatAge = this.getZatAge(currZAT);
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

        const __ZATMAX = (18 - 12) * 72 - 1;
        const __ZATSOFAR = this.zatAge;
        const __ZATTILLEND = __ZATMAX - __ZATSOFAR;

        for (let i in this.skills) {
            const __SKILL = this.skills[i];

            if (isTrainableSkill(i)) {
                // Auf ganze Zahl runden und parseInt, da das sonst irgendwie als String interpretiert wird
                this.skillsEnd[i] = parseInt((__SKILL * (1 + __ZATTILLEND / __ZATSOFAR)).toFixed(0), 10);
            } else {
                this.skillsEnd[i] = __SKILL;
            }
        }
    }; // Ende this.iniPlayer()

    this.getZatAge = function(currZAT) {
        if (this.age < 13) {
            return 0;	// noch nicht trainiert
        } else {
            let ZATs = (this.age - ((currZAT < this.zatGeb) ? 12 : 13)) * 72;	// Basiszeit fuer die Jahre seit Jahrgang 13

            if (this.zatGeb < 0) {
                return ZATs + currZAT;	// Zaehlung begann Anfang der Saison (und der Geburtstag wird erst nach dem Ziehen bestimmt)
            } else {
                return ZATs + currZAT - this.zatGeb;	// Verschiebung relativ zum Geburtstag (von -zatGeb, ..., 0, ..., 71 - zatGeb)
            }
        }
    };

    this.getAge = function(when = __TIME.now) {
        if (this.mwFormel === __MWFORMEL.alt) {
            return (when === __TIME.end) ? 18 : this.age;
        } else {	// Geburtstage ab Saison 10...
            return (when === __TIME.end) ? 18.00 : (13.00 + this.zatAge / 72);
        }
    };

    this.getPos = function(idx) {
        const __IDXOFFSET = 1;
        return this.positions[idx - __IDXOFFSET][0];
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
        } else {	// MW-Formel ab Saison 10...
            const __MW5TF = 1.00;	// Zwischen 0.97 und 1.03

            return Math.round(Math.pow(1 + this.getSkill(when)/100, 5.65) * Math.pow(1 + this.getOpti(pos, when)/100, 8.1) * Math.pow(1 + (100 - __AGE)/49, 10) * __MW5TF);
        }
    };
}

// Funktionen fuer die HTML-Seite *******************************************************

// Liest das Alter aus
function getAgeFromHTML(cells, colIdxAge) {
    return parseInt(cells[colIdxAge].textContent, 10);
}

// Liest das Geburtsdatum aus
function getGebFromHTML(cells, colIdxGeb) {
    const __TEXT = ((cells[colIdxGeb] === undefined) ? '?' : cells[colIdxGeb].textContent);

    return parseInt((__TEXT === '?') ? -1 : __TEXT, 10);
}

// Liest die Einzelskills aus
function getSkillsFromHTML(cells, colIdx) {
    const __RESULT = [];

    for (let i = colIdx.Einz; i < colIdx.Zus; i++) {
        __RESULT[i - colIdx.Einz] = parseInt(cells[i].textContent, 10);
    }

    return __RESULT;
}

// Liest aus, ob der Spieler Torwart oder Feldspieler ist
function isGoalieFromHTML(cells, colIdxClass) {
    return (cells[colIdxClass].className == "TOR");
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
    if (numberString.lastIndexOf(".") != -1) {
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
        if (idx == idxTrainable) {
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

// Ermittelt, wie das eigene Team heisst und aus welchem Land bzw. Liga es kommt (zur Unterscheidung von Erst- und Zweitteam)
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

// ==================== Ende Abschnitt fuer sonstige Parameter ====================

// ==================== Hauptprogramm ====================

// Verarbeitet Ansicht "Haupt" (Managerbuero) zur Ermittlung des aktuellen ZATs
function procHaupt() {
    const __TTAGS = document.getElementsByTagName("table");
    const __TEAMPARAMS = getTeamParamsFromCell(__TTAGS[1].rows[0].cells[1]); // Link mit Team, Liga, Land...

    buildOptions(__OPTCONFIG, __OPTSET, {
                     'teamParams' : __TEAMPARAMS,
                     'hideMenu'   : true
                 });

    const __NEXTZAT = getZATNrFromCell(__TTAGS[0].rows[2].cells[0]); // "Der naechste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;

    if (__CURRZAT >= 0) {
        console.log("Aktueller ZAT: " + __CURRZAT);

        setOpt(__OPTSET.aktuellerZat, __CURRZAT, false);
    }
}

// Verarbeitet Ansicht "Teamuebersicht"
function procTeamuebersicht() {
    const __ROWOFFSETUPPER = 1;		// Header-Zeile
    const __ROWOFFSETLOWER = 1;		// Ziehen-Button

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

    buildOptions(__OPTCONFIG, __OPTSET);

    const __TTAGS = document.getElementsByTagName("table");
    const __TABLE = __TTAGS[1];
    const __ROWS = __TABLE.rows;
    const __BIRTHDAYS = [];

    for (let i = __ROWOFFSETUPPER; i < __ROWS.length - __ROWOFFSETLOWER; i++) {
        __BIRTHDAYS[i - __ROWOFFSETUPPER] = getGebFromHTML(__ROWS[i].cells, __COLUMNINDEX.Geb);
    }

    setOpt(__OPTSET.birthdays, __BIRTHDAYS, false);

    // Format der Trennlinie zwischen den Monaten...
    const __BORDERSTRING = __OPTSET.sepStyle.Value + ' ' + __OPTSET.sepColor.Value + ' ' + __OPTSET.sepWidth.Value;

    separateGroups(__ROWS, __BORDERSTRING, __COLUMNINDEX.Age, __ROWOFFSETUPPER, __ROWOFFSETLOWER, -1, 0);
}

// Verarbeitet Ansicht "Spielereinzelwerte"
function procSpielereinzelwerte() {
    const __ROWOFFSETUPPER = 1;		// Header-Zeile
    const __ROWOFFSETLOWER = 0;

    const __COLUMNINDEX = {
        'Flg'   : 0,
        'Land'  : 1,
        'U'     : 2,
        'Age'   : 3,
        'Einz'  : 4,	// ab hier die Einzelskills
        'SCH'   : 4,
        'ABS'   : 4,	// TOR
        'BAK'   : 5,
        'STS'   : 5,	// TOR
        'KOB'   : 6,
        'FAN'   : 6,	// TOR
        'ZWK'   : 7,
        'STB'   : 7,	// TOR
        'DEC'   : 8,
        'SPL'   : 8,	// TOR
        'GES'   : 9,
        'REF'   : 9,	// TOR
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
        'Zus'   : 21	// Zusaetze hinter den Einzelskills
    };

    const __TTAGS = document.getElementsByTagName("table");
    const __TABLE = __TTAGS[1];
    const __ROWS = __TABLE.rows;
    const __HEADERS = __ROWS[0];

    buildOptions(__OPTCONFIG, __OPTSET);

    const __TITLECOLOR = getColor("LEI");	// "#FFFFFF"
    const __COLMAN = new ColumnManager(__OPTSET);

    __COLMAN.addTitles(__HEADERS, __TITLECOLOR);

    const __PLAYERS = init(__ROWS, __OPTSET, __COLUMNINDEX, __ROWOFFSETUPPER, __ROWOFFSETLOWER);

    for (let i = 0; i < __PLAYERS.length; i++) {
        __COLMAN.addValues(__PLAYERS[i], __ROWS[i + __ROWOFFSETUPPER], __TITLECOLOR);
    }

    // Format der Trennlinie zwischen den Monaten...
    const __BORDERSTRING = __OPTSET.sepStyle.Value + ' ' + __OPTSET.sepColor.Value + ' ' + __OPTSET.sepWidth.Value;

    separateGroups(__ROWS, __BORDERSTRING, __COLUMNINDEX.Age, __ROWOFFSETUPPER, __ROWOFFSETLOWER, -1, 0);
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
