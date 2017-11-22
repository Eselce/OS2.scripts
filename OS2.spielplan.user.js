// ==UserScript==
// @name        OS2.spielplan
// @namespace   http://os.ongapo.com/
// @version     0.60
// @copyright   2013+
// @author      Sven Loges (SLC)
// @description Spielplan-Abschnitt aus dem Master-Script fuer Online Soccer 2.0
// @include     http*://os.ongapo.com/st.php?s=*
// @include     http*://os.ongapo.com/showteam.php?s=*
// @include     http*://www.os.ongapo.com/st.php?s=*
// @include     http*://www.os.ongapo.com/showteam.php?s=*
// @include     http*://online-soccer.eu/st.php?s=*
// @include     http*://online-soccer.eu/showteam.php?s=*
// @include     http*://www.online-soccer.eu/st.php?s=*
// @include     http*://www.online-soccer.eu/showteam.php?s=*
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
    'longStats' : {       // Detailliertere Ausgabe des Stands
                   'Name'      : "longStats",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Lange Stats",
                   'Hotkey'    : 'L',
                   'AltLabel'  : "Kurze Stats",
                   'AltHotkey' : 'K',
                   'FormLabel' : "Lange Stats"
               },
    'showStats' : {       // Ergebnisse aufaddieren und Stand anzeigen
                   'Name'      : "showStats",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Stats ein",
                   'Hotkey'    : 'S',
                   'AltLabel'  : "Stats aus",
                   'AltHotkey' : 'S',
                   'FormLabel' : "Statistik"
               },
    'shortKom' : {        // "Vorbericht(e) & Kommentar(e)" nicht ausschreiben
                   'Name'      : "shortKom",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Kurze Texte",
                   'Hotkey'    : 'T',
                   'AltLabel'  : "Lange Texte",
                   'AltHotkey' : 'T',
                   'FormLabel' : "Abk\xFCrzungen"
               },
    'sepMonths' : {       // Im Spielplan Trennstriche zwischen den Monaten
                   'Name'      : "sepMonths",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Monate trennen",
                   'Hotkey'    : 'M',
                   'AltLabel'  : "Keine Monate",
                   'AltHotkey' : 'M',
                   'FormLabel' : "Monate trennen"
               },
    'sepStyle' : {        // Stil der Trennlinie
                   'Name'      : "sepStyle",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'Choice'    : [ "solid", "hidden", "dotted", "dashed", "double", "groove", "ridge",
                                   "inset", "outset", "none" ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Stil: $",
                   'Hotkey'    : 'i',
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
    'ligaSize' : {        // Ligengroesse
                   'Name'      : "ligaSize",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "Number",
                   'Choice'    : [ 10, 18, 20 ],
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Liga: $er",
                   'Hotkey'    : 'i',
                   'FormLabel' : "Liga:|$er"
               },
    'reset' : {           // Optionen auf die "Werkseinstellungen" zuruecksetzen
                   'Name'      : "reset",
                   'Type'      : __OPTTYPES.SI,
                   'Action'    : __OPTACTION.RST,
                   'Label'     : "Standard-Optionen",
                   'Hotkey'    : 'O',
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
                   'Hotkey'    : 'a',
                   'AltLabel'  : "Optionen verbergen",
                   'AltHotkey' : 'v',
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
// 'Tab': Tabelle mit dem Spielplan
// 'Zei': Startzeile des Spielplans mit dem ersten ZAT
// 'Spa': Spalte der Tabellenzelle mit der Spielart (z.B. "Liga : Heim")
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { 'hideMenu' : false }) {
    const __BOXSAISONS = document.getElementsByTagName("option");

    optSet = initOptions(optConfig, optSet);

    runStored(optSet, true);
    loadOptions(optSet);

    // Werte aus der HTML-Seite ermitteln...
    const __SAISON = getSaisonFromComboBox(__BOXSAISONS);
    const __LIGASIZE = getLigaSizeFromSpielplan(optParams.Tab.rows, optParams.Zei, optParams.Spa, getOptValue(optSet.saison));

    // ... und abspeichern...
    setOpt(optSet.saison, __SAISON, false);
    setOpt(optSet.ligaSize, __LIGASIZE, false);

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

// ==================== Abschnitt fuer Spielplan und ZATs ====================

// Beschreibungstexte aller Runden
const __POKALRUNDEN = [ "", "1. Runde", "2. Runde", "3. Runde", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
const __QUALIRUNDEN = [ "", "Quali 1", "Quali 2", "Quali 3" ];
const __OSCRUNDEN   = [ "", "Viertelfinale", "Halbfinale", "Finale" ];
const __OSERUNDEN   = [ "", "Runde 1", "Runde 2", "Runde 3", "Runde 4", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale" ];
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
        'pokalRunde'   : 1,
        'euroRunde'    : 0,
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
        if ((currZAT.ZAT > 12) && ((currZAT.ZAT % 10) === 5)) {    // passt fuer alle Saisons: 12, 20, 30, 40, 48, 58, 68 / 3, 15, 27, 39, 51, 63, 69
            currZAT.pokalRunde++;
        }
        if (((currZAT.ZAT + currZAT.ZATkorr) % 6) === 4) {
            if (currZAT.ZAT < 63) {
                currZAT.ZATrueck = currZAT.ZAT + 2;
                currZAT.euroRunde++;
                currZAT.hinRueck = 0;
            } else {
                currZAT.euroRunde = 11;    // Finale
                currZAT.hinRueck = 2;
            }
        }
        if (currZAT.ZAT === currZAT.ZATrueck) {
            currZAT.hinRueck = 1;        // 5, 7; 11, 13;  (17, 19)  / 23,   25; 29, 31; 35,  37; 41,  43; 47, 49; 53,  55; 59,  61; 69
            if (currZAT.saison < 3) {    // 4, 6; 10, 14*; (16, 22*) / 24**, 26; 34, 36; 38*, 42; 44*, 50; 52, 54; 56*, 60; 62*, 66; 70
                if (currZAT.ZAT === 22) {
                    currZAT.ZATkorr = 4;
                } else if ((currZAT.ZAT - 6) % 20 > 6) {
                    currZAT.ZATkorr = 2;
                } else {
                    currZAT.ZATkorr = 0;
                }
                if ((currZAT.ZAT === 22) || (currZAT.ZAT === 30)) {
                    currZAT.euroRunde--;    // Frueher: 3. Quali-Rueckspiel erst knapp vor 1. Hauptrunde
                }
            }
        }
    }
}

// Liefert die Beschreibung des Spiels am aktuellen ZAT
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// showLink: Angabe, ob ein Link eingefuegt werden soll
// return Beschreibung des Spiels
function getZusatz(currZAT, showLink = true) {
    const __NAMESPACE = "http://os.ongapo.com/";
    let zusatz = "";
    let href = "";
    let prop = "stauswahl";
    let runde = 0;

    if (currZAT.gameType === "Liga") {
        href = "ls";
        runde = currZAT.ligaSpieltag;
        if (currZAT.ZAT < 70) {
            zusatz = runde + ". Spieltag";
        } else {
            prop = "";
            zusatz = "Relegation";
        }
    } else if (currZAT.gameType === "LP") {
        href = "lp";
        runde = currZAT.pokalRunde;
        zusatz = __POKALRUNDEN[runde];
    } else if ((currZAT.gameType === "OSCQ") || (currZAT.gameType === "OSEQ")) {
        href = ((currZAT.gameType === "OSCQ") ? "oscq" : "oseq");
        prop = "runde";
        runde = currZAT.euroRunde;
        zusatz = __QUALIRUNDEN[runde] + __HINRUECK[currZAT.hinRueck];
    } else if (currZAT.gameType === "OSC") {
        if (currZAT.euroRunde < 9) {
            const __GRUPPENPHASE = ((currZAT.euroRunde < 6) ? "HR-Grp. " : "ZR-Grp. ");

            href = ((currZAT.euroRunde < 6) ? "oschr" : "osczr");
            runde = ((currZAT.euroRunde % 3) * 2 + 1 + currZAT.hinRueck);
            zusatz = __GRUPPENPHASE + "Spiel " + runde;
        } else {
            href = "oscfr";
            runde = currZAT.euroRunde - 8;
            zusatz = __OSCRUNDEN[runde] + __HINRUECK[currZAT.hinRueck];
        }
        prop = "";
    } else if (currZAT.gameType === "OSE") {
        href = "ose";
        prop = "runde";
        runde = currZAT.euroRunde - 3;
        zusatz = __OSERUNDEN[runde] + __HINRUECK[currZAT.hinRueck];
    } else {
        prop = "";
        zusatz = "";    // irgendwie besser lesbar! ("Friendly" bzw. "spielfrei"/"Frei"/"reserviert")
    }

    if (showLink && (runde > 0) && (href !== "")) {
        if (zusatz === "") {
            zusatz = "Link";
        }
        if (prop !== "") {
            prop = '&' + prop + '=' + runde;
        }
        prop = '?' + 'erganzeigen' + '=' + 1 + '&' + 'saauswahl' + '=' + currZAT.saison +
               '&' + 'landauswahl' + '=' + 20 + '&' + 'ligaauswahl' + '=' + 1 + prop +
               '&' + 'stataktion' + '=' + "Statistik+ausgeben";
        zusatz = '<a href="' + __NAMESPACE + href + '.php' + prop + '" target="_blank">' + zusatz + '</a>';
    }

    return zusatz;
}

// ==================== Abschnitt fuer Statistiken des Spielplans ====================

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
        } else if (currZAT.gFor === currZAT.gAga) {
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

// ==================== Abschnitt fuer Daten des Spielplans ====================

// Ermittelt den Spielgegner aus einer Tabellenzelle und liefert den Namen zurueck
// cell: Tabellenzelle mit dem Namen des Gegners
// return Der Name des Gegners
function getGegnerFromCell(cell) {
    const __GEGNER = cell.textContent;
    const __POS = __GEGNER.indexOf(" (");

    if (__POS > -1) {
        return __GEGNER.substr(0, __POS);
    } else {
        return __GEGNER;
    }
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle, etwa "2 : 1", und liefert zwei Werte zurueck
// cell: Tabellenzelle mit Eintrag "2 : 1"
// return { '2', '1' } im Beispiel
function getErgebnisFromCell(cell) {
    const __ERGEBNIS = cell.textContent.split(" : ", 2);

    return __ERGEBNIS;
}

// Ermittelt die Spielart aus einer Tabellenzelle, etwa "Liga : Heim", und liefert zwei Werte zurueck
// cell: Tabellenzelle mit Eintrag "Liga : Heim" (Spielplan) oder "Liga  Heim: " (Managerbuero)
// return { "Liga", "Heim" } im Beispiel
function getSpielArtFromCell(cell) {
    const __TEXT = cell.textContent.replace('\xA0', "").replace(':', "").replace("  ", ' ');
    const __SPIELART = __TEXT.split(' ', 2);

    return __SPIELART;
}

// Ermittelt den Namen des Spielgegners aus einer Tabellenzelle und setzt gegner im Spielplanzeiger
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell: Tabellenzelle mit dem Namen des Gegners
function setGegnerFromCell(currZAT, cell) {
    const __GEGNER = getGegnerFromCell(cell);

    currZAT.gegner = __GEGNER;
}

// Ermittelt das Spiel-Ergebnis aus einer Tabellenzelle und setzt tore/gtore im Spielplanzeiger
// currZAT: Enthaelt den Spielplanzeiger auf den aktuellen ZAT
// cell: Tabellenzelle mit Eintrag "2 : 1"
function setErgebnisFromCell(currZAT, cell) {
    const __ERGEBNIS = getErgebnisFromCell(cell);

    if (__ERGEBNIS.length === 2) {
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

    if (cell.textContent !== "Vorschau") {   // Nur falls Link nicht bereits vorhanden
        if (__GAMETYPEID > 1) {              // nicht moeglich fuer "Friendly" bzw. "spielfrei"/"Frei"/"reserviert"
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

    if (__TEST20ER[0] === "Liga") {
        return 20;
    } else if (__TEST10ER[0] === "Liga") {
        return 10;
    } else {
        return 18;
    }
}

// ==================== Ende Abschnitt fuer Spielplan und ZATs ====================

// ==================== Abschnitt fuer sonstige Parameter ====================

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url: Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    const __SUCH = "s=";
    const __INDEXS = url.lastIndexOf(__SUCH);
    const __SHOWTEAM = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    const __ST = url.match(/st\.php/);              // Teamansicht Popupfenster
    let page = -1;                                  // Seitenindex (Rueckgabewert)

    // Wert von page (Seitenindex) ermitteln...
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "s=" und ggf. von '&'
    if (__SHOWTEAM || __ST) {
        if (__INDEXS < 0) {
            page = 0;
        } else if (url.indexOf('&', __INDEXS) < 0) {
            // Wert von page setzt sich aus allen Zeichen hinter "s=" zusammen
            page = parseInt(url.substring(__INDEXS + __SUCH.length, url.length), 10);
        } else {
            // Wert von page setzt sich aus allen Zeichen zwischen "s=" und '&' zusammen
            page = parseInt(url.substring(__INDEXS + __SUCH.length, url.indexOf('&', __INDEXS)), 10);
        }
    }

    return page;
}

// ==================== Ende Abschnitt fuer sonstige Parameter ====================

// ==================== Hauptprogramm ====================

// Verarbeitet Ansicht "Saisonplan"
function procSpielplan() {
    const __ROWOFFSETUPPER = 1;     // Header-Zeile
    const __ROWOFFSETLOWER = 0;

    const __COLUMNINDEX = {
        'Art' : 1,
        'Geg' : 2,
        'Erg' : 3,
        'Ber' : 4,
        'Zus' : 5,
        'Kom' : 6
    };

    buildOptions(__OPTCONFIG, __OPTSET, {
                     'Tab'        : getTable(2),
                     'Zei'        : __ROWOFFSETUPPER,
                     'Spa'        : __COLUMNINDEX.Art,
                     'menuAnchor' : getTable(0, "div"),
                     'formWidth'  : 3,
                     'formBreak'  : 4
                 });

    const __ZAT = firstZAT(getOptValue(__OPTSET.saison), getOptValue(__OPTSET.ligaSize));

    const __ROWS = getRows(2);

    let ligaStats = emptyStats();
    let euroStats = emptyStats();

    for (let i = __ROWOFFSETUPPER; i < __ROWS.length - __ROWOFFSETLOWER; i++) {
        const __CELLS = __ROWS[i].cells;    // Aktuelle Eintraege

        incZAT(__ZAT);

        setGegnerFromCell(__ZAT, __CELLS[__COLUMNINDEX.Geg]);
        setSpielArtFromCell(__ZAT, __CELLS[__COLUMNINDEX.Art]);
        setErgebnisFromCell(__ZAT, __CELLS[__COLUMNINDEX.Erg]);

        if (getOptValue(__OPTSET.shortKom)) {
            const __CELLKOM = __CELLS[__COLUMNINDEX.Kom];
            const __CELLART = __CELLS[__COLUMNINDEX.Art];

            __CELLKOM.innerHTML = __CELLKOM.innerHTML.replace("Vorbericht(e)", 'V').replace("Kommentar(e)", 'K').replace("&amp;", '/').replace('&', '/');
            __CELLART.innerHTML = __CELLART.innerHTML.replace(": Heim", "(H)").replace(": Ausw\xE4rts", "(A)").replace("Friendly", "FSS");
        }

        __CELLS[__COLUMNINDEX.Zus].className = __CELLS[__COLUMNINDEX.Art].className;

        if (__CELLS[__COLUMNINDEX.Zus].textContent === "") {
            const __CELLBER = __CELLS[__COLUMNINDEX.Ber];
            let stats = "";

            addBilanzLinkToCell(__CELLBER, __ZAT.gameType, "Bilanz");

            if (getOptValue(__OPTSET.shortKom)) {
                __CELLBER.innerHTML = __CELLBER.innerHTML.replace("Klick", "(*)").replace("Bilanz", 'V').replace("Vorschau", 'V');
            }

            if (__ZAT.gameType === "Liga") {
                if (__ZAT.ZAT < 70) {
                    stats = addResultToStats(ligaStats, getOptValue(__OPTSET.longStats), __ZAT);
                }
            } else if ((__ZAT.gameType === "OSCQ") || (__ZAT.gameType === "OSEQ") || (__ZAT.gameType === "OSE")) {
                if (__ZAT.hinRueck !== 1) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, getOptValue(__OPTSET.longStats), __ZAT);
            } else if (__ZAT.gameType === "OSC") {
                if ((__ZAT.hinRueck !== 1) && ((__ZAT.euroRunde >= 9) || ((__ZAT.euroRunde % 3) === 0))) {
                    euroStats = emptyStats();
                }
                stats = addResultToStats(euroStats, getOptValue(__OPTSET.longStats), __ZAT);
            }

            if (getOptValue(__OPTSET.showStats)) {
                if (stats !== "") {
                    stats = ' ' + stats;
                }
            } else {
                stats = "";
            }
            __CELLS[__COLUMNINDEX.Zus].innerHTML = getZusatz(__ZAT, true) + stats;
        }

        if (getOptValue(__OPTSET.sepMonths) && (__ZAT.ZAT % __ZAT.anzZATpMonth === 0) && (i < __ROWS.length - __ROWOFFSETLOWER - 1)) {
            // Format der Trennlinie zwischen den Monaten...
            const __BORDERSTRING = getOptValue(__OPTSET.sepStyle) + ' ' + getOptValue(__OPTSET.sepColor) + ' ' + getOptValue(__OPTSET.sepWidth);

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

console.log("SCRIPT END");

// *** EOF ***
