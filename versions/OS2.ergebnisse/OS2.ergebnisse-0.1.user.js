// ==UserScript==
// @name        OS2.ergebnisse
// @namespace   http://os.ongapo.com/
// @version     0.1
// @copyright   2016+
// @author      Sven Loges (SLC)
// @description Aktiviert als Standard die Option "Ergebnisse anzeigen" fuer Online Soccer 2.0
// @include     http://os.ongapo.com/ls.php
// @include     http://os.ongapo.com/ls.php?*
// @include     http://os.ongapo.com/lp.php
// @include     http://os.ongapo.com/lp.php?*
// @include     http://os.ongapo.com/oseq.php
// @include     http://os.ongapo.com/oseq.php?*
// @include     http://os.ongapo.com/ose.php
// @include     http://os.ongapo.com/ose.php?*
// @include     http://os.ongapo.com/oscq.php
// @include     http://os.ongapo.com/oscq.php?*
// @include     http://os.ongapo.com/oschr.php
// @include     http://os.ongapo.com/oschr.php?*
// @include     http://os.ongapo.com/osczr.php
// @include     http://os.ongapo.com/osczr.php?*
// @include     http://os.ongapo.com/oscfr.php
// @include     http://os.ongapo.com/oscfr.php?*
// @include     http://os.ongapo.com/zer.php
// @include     http://os.ongapo.com/zer.php?*
// @include     http://www.os.ongapo.com/ls.php
// @include     http://www.os.ongapo.com/ls.php?*
// @include     http://www.os.ongapo.com/lp.php
// @include     http://www.os.ongapo.com/lp.php?*
// @include     http://www.os.ongapo.com/oseq.php
// @include     http://www.os.ongapo.com/oseq.php?*
// @include     http://www.os.ongapo.com/ose.php
// @include     http://www.os.ongapo.com/ose.php?*
// @include     http://www.os.ongapo.com/oscq.php
// @include     http://www.os.ongapo.com/oscq.php?*
// @include     http://www.os.ongapo.com/oschr.php
// @include     http://www.os.ongapo.com/oschr.php?*
// @include     http://www.os.ongapo.com/osczr.php
// @include     http://www.os.ongapo.com/osczr.php?*
// @include     http://www.os.ongapo.com/oscfr.php
// @include     http://www.os.ongapo.com/oscfr.php?*
// @include     http://www.os.ongapo.com/zer.php
// @include     http://www.os.ongapo.com/zer.php?*
// @include     http://online-soccer.eu/ls.php
// @include     http://online-soccer.eu/ls.php?*
// @include     http://online-soccer.eu/lp.php
// @include     http://online-soccer.eu/lp.php?*
// @include     http://online-soccer.eu/oseq.php
// @include     http://online-soccer.eu/oseq.php?*
// @include     http://online-soccer.eu/ose.php
// @include     http://online-soccer.eu/ose.php?*
// @include     http://online-soccer.eu/oscq.php
// @include     http://online-soccer.eu/oscq.php?*
// @include     http://online-soccer.eu/oschr.php
// @include     http://online-soccer.eu/oschr.php?*
// @include     http://online-soccer.eu/osczr.php
// @include     http://online-soccer.eu/osczr.php?*
// @include     http://online-soccer.eu/oscfr.php
// @include     http://online-soccer.eu/oscfr.php?*
// @include     http://online-soccer.eu/zer.php
// @include     http://online-soccer.eu/zer.php?*
// @include     http://www.online-soccer.eu/ls.php
// @include     http://www.online-soccer.eu/ls.php?*
// @include     http://www.online-soccer.eu/lp.php
// @include     http://www.online-soccer.eu/lp.php?*
// @include     http://www.online-soccer.eu/oseq.php
// @include     http://www.online-soccer.eu/oseq.php?*
// @include     http://www.online-soccer.eu/ose.php
// @include     http://www.online-soccer.eu/ose.php?*
// @include     http://www.online-soccer.eu/oscq.php
// @include     http://www.online-soccer.eu/oscq.php?*
// @include     http://www.online-soccer.eu/oschr.php
// @include     http://www.online-soccer.eu/oschr.php?*
// @include     http://www.online-soccer.eu/osczr.php
// @include     http://www.online-soccer.eu/osczr.php?*
// @include     http://www.online-soccer.eu/oscfr.php
// @include     http://www.online-soccer.eu/oscfr.php?*
// @include     http://www.online-soccer.eu/zer.php
// @include     http://www.online-soccer.eu/zer.php?*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

// ECMAScript 6: Erlaubt 'const', 'let', ...
/* jshint esnext: true */
/* jshint moz: true */

// Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __SHOWERGS = true;    // Ergebnisse anzeigen

// Optionen (mit Standardwerten initialisiert und per loadOptions() geladen):
let showErgs = __SHOWERGS;  // Im Spielplan Trennstriche zwischen den Monaten

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

// Setzt die Ergebnisanzeige neu auf an/aus
function setErgsShown(visible) {
    showErgs = setOption("showErgs", visible);
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

// Baut das Benutzermenu auf
function registerMenu() {
    console.log("registerMenu()");

    registerMenuOption(showErgs, "Ergebnisse anzeigen", setShowErgs, 'E', "Keine Ergebnisse", setShowNoErgs, 'K');

    GM_registerMenuCommand("Standard-Optionen", resetOptions, 'O');
}

// Setzt die Optionen auf die "Werkseinstellungen" des Skripts
function resetOptions() {
    GM_deleteValue("showErgs");

    window.location.reload();
}

// Laedt die permament (ueber Menu) gesetzten Optionen
function loadOptions() {
     showErgs = GM_getValue("showErgs", showErgs);
}

// Setzt die Ergebnisanzeige neu auf aus
function setShowNoErgs() {
    setErgsShown(false);
}

// Setzt die Ergebnisanzeige neu auf an
function setShowErgs() {
    setErgsShown(true);
}

// Verarbeitet eine Ergebnis-Ansicht
function procErgebnisse() {
    loadOptions();
    registerMenu();

    const __ITAGS = document.getElementsByTagName("input");
    const __SHOWERGBOX = __ITAGS[0];

    __SHOWERGBOX.checked = showErgs;
}

procErgebnisse();

// *** EOF ***
