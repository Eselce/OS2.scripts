// ==UserScript==
// @name         OS2.jugend
// @namespace    http://os.ongapo.com/
// @version      0.50
// @copyright    2013+
// @author       Andreas Eckes (Strindheim BK) / Sven Loges (SLC)
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

const __LOGLEVEL = 3;

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
                   'Name'      : "Browser",
                   'Value'     : localStorage,
                   'Display'   : "localStorage",
                   'Prefix'    : 'run'
               },
    'begrenzt' : {
                   'Name'      : "Session",
                   'Value'     : sessionStorage,
                   'Display'   : "sessionStorage",
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
    'zeigeGeb' : {        // Spaltenauswahl fuer Geburtstage (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showBirthday",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Geburtstag ein",
                   'Hotkey'    : 'G',
                   'AltLabel'  : "Geburtstag aus",
                   'AltHotkey' : 'G',
                   'FormLabel' : "Geburtstag"
               },
    'zeigeAlter' : {      // Spaltenauswahl fuer dezimales Alter (true = anzeigen, false = nicht anzeigen)
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
    'ersetzeAlter' : {    // Spaltenauswahl fuer dezimales Alter statt ganzzahligen Alters (true = Dezimalbruch, false = ganzzahlig)
                   'Name'      : "substAge",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Alter dezimal",
                   'Hotkey'    : 'd',
                   'AltLabel'  : "Alter ganzzahlig",
                   'AltHotkey' : 'g',
                   'FormLabel' : "Alter ersetzen"
               },
    'zeigeAufw' : {       // Spaltenauswahl fuer Aufwertungen (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showProgresses",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Aufwertungen ein",
                   'Hotkey'    : 'W',
                   'AltLabel'  : "Aufwertungen aus",
                   'AltHotkey' : 'W',
                   'FormLabel' : "Aufwertungen"
               },
    'shortAufw' : {       // Abgekuerzte Aufwertungsanzeige
                   'Name'      : "shortProgresses",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Aufwertungen kurz",
                   'Hotkey'    : 'A',
                   'AltLabel'  : "Aufwertungen lang",
                   'AltHotkey' : 'A',
                   'FormLabel' : "Kurze Aufwertungen"
               },
    'zeigeFixSkills' : {  // Spaltenauswahl fuer die Summe der Fixskills (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showFixSkills",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Fixskills ein",
                   'Hotkey'    : 'F',
                   'AltLabel'  : "Fixskills aus",
                   'AltHotkey' : 'F',
                   'FormLabel' : "Fixskills"
               },
    'zeigeTrainiert' : {  // Spaltenauswahl fuer die aktuellen trainierten Skills (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showTrainiert",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Trainiert ein",
                   'Hotkey'    : 'T',
                   'AltLabel'  : "Trainiert aus",
                   'AltHotkey' : 'T',
                   'FormLabel' : "Trainiert"
               },
    'zeigeAnteilPri' : {  // Spaltenauswahl fuer den prozentualen Anteil der aktuellen Hauptskills (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showAnteilPri",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Anteil Hauptskills ein",
                   'Hotkey'    : 'H',
                   'AltLabel'  : "Anteil Hauptskills aus",
                   'AltHotkey' : 'H',
                   'FormLabel' : "Anteil Hauptskills"
               },
    'zeigeAnteilSec' : {  // Spaltenauswahl fuer den prozentualen Anteil der aktuellen Nebenskills (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showAnteilSec",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Anteil Nebenskills ein",
                   'Hotkey'    : 'N',
                   'AltLabel'  : "Anteil Nebenskills aus",
                   'AltHotkey' : 'N',
                   'FormLabel' : "Anteil Nebenskills"
               },
    'zeigePrios' : {      // Spaltenauswahl fuer den Schnitt der Hauptskills (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showPrios",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Prios ein",
                   'Hotkey'    : 'r',
                   'AltLabel'  : "Prios aus",
                   'AltHotkey' : 'r',
                   'FormLabel' : "Prios"
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
                   'SelValue'  : false,
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
                   'SelValue'  : false,
                   'Choice'    : [ 0, 1, 2, 3, 4, 5, 6 ],
                   'Default'   : 1,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "MW: beste $",
                   'Hotkey'    : 'M',
                   'FormLabel' : "MW:|beste $"
               },
    'zeigeTrainiertEnde' : {  // Spaltenauswahl fuer die trainierten Skills mit Ende 18 (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showTrainiertEnde",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Trainiert Ende ein",
                   'Hotkey'    : 'n',
                   'AltLabel'  : "Trainiert Ende aus",
                   'AltHotkey' : 'n',
                   'FormLabel' : "Trainiert \u03A9"
               },
    'zeigeAnteilPriEnde' : {  // Spaltenauswahl fuer den prozentualen Anteil der Hauptskills mit Ende 18 (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showAnteilPriEnde",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Anteil Hauptskills Ende ein",
                   'Hotkey'    : 'u',
                   'AltLabel'  : "Anteil Hauptskills Ende aus",
                   'AltHotkey' : 'u',
                   'FormLabel' : "Anteil Hauptskills \u03A9"
               },
    'zeigeAnteilSecEnde' : {  // Spaltenauswahl fuer den prozentualen Anteil der Nebenskills mit Ende 18 (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showAnteilSecEnde",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Anteil Nebenskills Ende ein",
                   'Hotkey'    : 'b',
                   'AltLabel'  : "Anteil Nebenskills Ende aus",
                   'AltHotkey' : 'b',
                   'FormLabel' : "Anteil Nebenskills \u03A9"
               },
    'zeigePriosEnde' : {  // Spaltenauswahl fuer den Schnitt der Hauptskills (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "showPriosEnde",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : true,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Prios Ende ein",
                   'Hotkey'    : 'o',
                   'AltLabel'  : "Prios Ende aus",
                   'AltHotkey' : 'o',
                   'FormLabel' : "Prios \u03A9"
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
                   'SelValue'  : false,
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
                   'SelValue'  : false,
                   'Choice'    : [ 0, 1, 2, 3, 4, 5, 6 ],
                   'Default'   : 1,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "MW Ende: beste $",
                   'Hotkey'    : 'W',
                   'FormLabel' : "MW \u03A9:|beste $"
               },
    'kennzeichenEnde' : {  // Markierung fuer Ende 18
                   'Name'      : "charEnde",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : "String",
                   'FreeValue' : true,
                   'MinChoice' : 0,
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
                   'FreeValue' : true,
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
                   'FreeValue' : true,
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
                   'FreeValue' : true,
                   'SelValue'  : false,
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
                   'SelValue'  : false,
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
    'team' : {            // Datenspeicher fuer Daten des Erst- bzw. Zweitteams
                   'Name'      : "team",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'Permanent' : true,
                   'Default'   : undefined,  // new Team() // { 'Team' : undefined, 'Liga' : undefined, 'Land' : undefined, 'LdNr' : 0, 'LgNr' : 0 }
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Replace'   : null,
                   'Space'     : 1,
                   'Label'     : "Verein:"
               },
    'birthdays' : {       // Datenspeicher fuer Geburtstage der Jugendspieler
                   'Name'      : "birthdays",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : true,
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
                   'Hidden'    : true,
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
                   'Hidden'    : true,
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
                   'Hidden'    : true,
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
    'trainiert' : {       // Datenspeicher fuer Trainingsquoten der Jugendspieler
                   'Name'      : "numProgresses",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : true,
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
                   'Hidden'    : true,
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
    'skills' : {          // Datenspeicher fuer aktuelle Einzelskills der Jugendspieler
                   'Name'      : "skills",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : true,
                   'Serial'    : true,
                   'AutoReset' : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 20,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Skills:"
               },
    'hauptLS'  : {        // Option 'ligaSize' aus Modul 'OS2.haupt', hier als 'hauptLS'
                   'Shared'    : { /*'namespace' : "http://os.ongapo.com/",*/ 'module' : "OS2.haupt", 'item' : 'ligaSize' },
                   'Hidden'    : true,
                   'FormLabel' : "Liga:|$er (haupt)"
              },
    'hauptZat' : {        // Option 'datenZat' aus Modul 'OS2.haupt', hier als 'hauptZat'
                   'Shared'    : { /*'namespace' : "http://os.ongapo.com/",*/ 'module' : "OS2.haupt", 'item' : 'datenZat' },
                   'Hidden'    : true,
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Label'     : "ZAT:"
              },
    'haupt' : {           // Alle Optionen des Moduls 'OS2.haupt'
                   'Shared'    : { 'module' : "OS2.haupt", 'item' : '$' },
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : true,
                   'Serial'    : true,
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Replace'   : null,
                   'Space'     : 4,
                   'Label'     : "Haupt:"
              },
    'data' : {            // Optionen aller Module
                   'Shared'    : { 'module' : '$' },
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : true,
                   'Serial'    : true,
                   'Cols'      : 36,
                   'Rows'      : 6,
                   'Replace'   : null,
                   'Space'     : 4,
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

// Kompatibilitaetsfunktion zur Ermittlung des Namens einer Funktion (falle <Function>.name nicht vorhanden ist)
if (Function.prototype.name === undefined) {
    Object.defineProperty(Function.prototype, 'name', {
            get : function() {
                      return /function ([^(\s]*)/.exec(this.toString())[1];
                  }
        });
}

// Ein Satz von Logfunktionen, die je nach Loglevel zur Verfuegung stehen. Aufruf: __LOG[level](text)
const __LOG = {
                  'logFun'   : [
                                   console.error,  // [0] Alert
                                   console.error,  // [1] Error
                                   console.log,    // [2] Log: Release
                                   console.log,    // [3] Log: Info
                                   console.log,    // [4] Log: Debug
                                   console.log,    // [5] Log: Verbose
                                   console.log     // [6] Log: Very verbose
                               ],
                  'init'     : function(win, logLevel = 1) {
                                   for (level = 0; level < this.logFun.length; level++) {
                                       this[level] = ((level > logLevel) ? function() { } : this.logFun[level]);
                                   }
                               },
                  'changed'  : function(oldVal, newVal) {
                                   const __OLDVAL = safeStringify(oldVal);
                                   const __NEWVAL = safeStringify(newVal);

                                   return ((__OLDVAL !== __NEWVAL) ? __OLDVAL + " => " : "") + __NEWVAL;
                               }
              };

__LOG.init(window, __LOGLEVEL);

// Gibt eine Meldung in der Console aus und oeffnet ein Bestaetigungsfenster mit der Meldung
// label: Eine Ueberschrift
// message: Der Meldungs-Text
// data: Ein Wert. Ist er angegeben, wird er in der Console ausgegeben
function showAlert(label, message, data = undefined) {
    __LOG[1](label + ": " + message);

    if (data !== undefined) {
        __LOG[2](data);
    }

    alert(label + "\n\n" + message);
}

// ==================== Abschnitt fuer Klasse Class ====================

function Class(className, baseClass, initFun) {
    'use strict';

    try {
        const __BASE = ((baseClass !== undefined) ? baseClass : Object);
        const __BASEPROTO = (__BASE ? __BASE.prototype : undefined);
        const __BASECLASS = (__BASEPROTO ? __BASEPROTO.__class : undefined);

        this.className = (className || '?');
        this.baseClass = __BASECLASS;
        Object.setConst(this, 'baseProto', __BASEPROTO, false);

        if (! initFun) {
            const __BASEINIT = (__BASECLASS || { }).init;

            if (__BASEINIT) {
                initFun = function() {
                              // Basisklassen-Init aufrufen...
                              return __BASEINIT.call(this, arguments);
                          };
            } else {
                initFun = function() {
                              // Basisklassen-Init fehlt (und Basisklasse ist nicht Object)...
                              return false;
                          };
            }
        }

        console.assert((__BASE === null) || ((typeof __BASE) === 'function'), "No function:", __BASE);
        console.assert((typeof initFun) === 'function', "No function:", initFun);

        this.init = initFun;
    } catch (ex) {
        showAlert('[' + ex.lineNumber + "] Error in Class " + className, ex.message, ex);
    }
}

Class.define = function(subClass, baseClass, members = undefined, initFun = undefined, createProto = true) {
        return (subClass.prototype = subClass.subclass(baseClass, members, initFun, createProto));
    };

Object.setConst = function(obj, item, value, config) {
        return Object.defineProperty(obj, item, {
                        enumerable   : false,
                        configurable : (config || true),
                        writable     : false,
                        value        : value
                    });
    };

Object.setConst(Object.prototype, 'subclass', function(baseClass, members, initFun, createProto) {
        'use strict';

        try {
            const __MEMBERS = (members || { });
            const __CREATEPROTO = ((createProto === undefined) ? true : createProto);

            console.assert((typeof this) === 'function');
            console.assert((typeof __MEMBERS) === 'object');

            const __CLASS = new Class(this.name || __MEMBERS.__name, baseClass, initFun || __MEMBERS.__init);
            const __PROTO = (__CREATEPROTO ? Object.create(__CLASS.baseProto) : this.prototype);

            for (let item in __MEMBERS) {
                if ((item !== '__name') && (item !== '__init')) {
                    Object.setConst(__PROTO, item, __MEMBERS[item]);
                }
            }

            Object.setConst(__PROTO, '__class', __CLASS, ! __CREATEPROTO);

            return __PROTO;
        } catch (ex) {
            showAlert('[' + ex.lineNumber + "] Error in subclassing", ex.message, ex);
        }
    }, false);

Class.define(Object, null, {
                    '__init'       : function() {
                                         // Oberstes Basisklassen-Init...
                                         return true;
                                     },
                    'getClass'     : function() {
                                         return this.__class;
                                     },
                    'getClassName' : function() {
                                         const __CLASS = this.getClass();

                                         return (__CLASS ? __CLASS.getName() : undefined);
                                     },
                    'setConst'     : function(item, value, config = undefined) {
                                         return Object.setConst(this, item, value, config);
                                     }
                }, undefined, false);

Class.define(Function, Object);

Class.define(Class, Object, {
                    'getName'      : function() {
                                         return this.className;
                                     }
                } );

// ==================== Ende Abschnitt fuer Klasse Class ====================

// ==================== Abschnitt fuer Klasse Delims ====================

// Basisklasse fuer die Verwaltung der Trennzeichen und Symbole von Pfaden
// delim: Trennzeichen zwischen zwei Ebenen (oder Objekt/Delims mit entsprechenden Properties)
// back: (Optional) Name des relativen Vaterverzeichnisses
// root: (Optional) Kennung vor dem ersten Trenner am Anfang eines absoluten Pfads
// home: (Optional) Kennung vor dem ersten Trenner am Anfang eines Pfads relativ zu Home
function Delims(delim, back, root, home) {
    'use strict';

    if ((typeof delim) === 'object') {
        // Erster Parameter ist Objekt mit den Properties...
        if (back === undefined) {
            back = delim.back;
        }
        if (root === undefined) {
            root = delim.root;
        }
        if (home === undefined) {
            home = delim.home;
        }
        delim = delim.delim;
    }

    this.setDelim(delim);
    this.setBack(back);
    this.setRoot(root);
    this.setHome(home);
}

Class.define(Delims, Object, {
              'setDelim'       : function(delim = undefined) {
                                     this.delim = delim;
                                 },
              'setBack'        : function(back = undefined) {
                                     this.back = back;
                                 },
              'setRoot'        : function(root = undefined) {
                                     this.root = root;
                                 },
              'setHome'        : function(home = undefined) {
                                     this.home = home;
                                 }
          } );

// ==================== Ende Abschnitt fuer Klasse Delims ====================

// ==================== Abschnitt fuer Klasse UriDelims ====================

// Basisklasse fuer die Verwaltung der Trennzeichen und Symbole von URIs
// delim: Trennzeichen zwischen zwei Ebenen (oder Objekt/Delims mit entsprechenden Properties)
// back: (Optional) Name des relativen Vaterverzeichnisses
// root: (Optional) Kennung vor dem ersten Trenner am Anfang eines absoluten Pfads
// home: (Optional) Kennung vor dem ersten Trenner am Anfang eines Pfads relativ zu Home
// scheme: (Optional) Trennzeichen fuer den Schema-/Protokollnamen vorne
// host: (Optional) Prefix fuer Hostnamen hinter dem Scheme-Trenner
// port: (Optional) Trennzeichen vor der Portangabe, falls vorhanden
// query: (Optional) Trennzeichen fuer die Query-Parameter hinter dem Pfad
// parSep: (Optional) Trennzeichen zwischen je zwei Parametern
// parAss: (Optional) Trennzwischen zwischen Key und Value
// node: (Optional) Trennzeichen fuer den Knotennamen hinten (Fragment, Kapitel)
function UriDelims(delim, back, root, home, scheme, host, port, query, qrySep, qryAss, node) {
    'use strict';

    if ((typeof delim) === 'object') {
        // Erster Parameter ist Objekt mit den Properties...
        if (scheme === undefined) {
            scheme = delim.scheme;
        }
        if (host === undefined) {
            host = delim.host;
        }
        if (port === undefined) {
            port = delim.port;
        }
        if (query === undefined) {
            query = delim.query;
        }
        if (qrySep === undefined) {
            qrySep = delim.qrySep;
        }
        if (qryAss === undefined) {
            qryAss = delim.qryAss;
        }
        if (node === undefined) {
            node = delim.node;
        }
    }

    Delims.call(this, delim, back, root, home);

    this.setScheme(scheme);
    this.setHost(host);
    this.setPort(port);
    this.setQuery(query);
    this.setQrySep(qrySep);
    this.setQryAss(qryAss);
    this.setNode(node);
}

Class.define(UriDelims, Delims, {
              'setScheme'      : function(scheme = undefined) {
                                     this.scheme = scheme;
                                 },
              'setHost'        : function(host = undefined) {
                                     this.host = host;
                                 },
              'setPort'        : function(port = undefined) {
                                     this.port = port;
                                 },
              'setQuery'       : function(query = undefined) {
                                     this.query = query;
                                 },
              'setQrySep'      : function(qrySep = undefined) {
                                     this.qrySep = qrySep;
                                 },
              'setQryAss'      : function(qryAss = undefined) {
                                     this.qryAss = qryAss;
                                 },
              'setNode'        : function(node = undefined) {
                                     this.node = node;
                                 }
          } );

// ==================== Ende Abschnitt fuer Klasse UriDelims ====================

// ==================== Abschnitt fuer Klasse Path ====================

// Basisklasse fuer die Verwaltung eines Pfades
// homePath: Absoluter Startpfad als String
// delims: Objekt mit Trennern und Symbolen als Properties (oder Delims-Objekt)
// 'delim': Trennzeichen zwischen zwei Ebenen
// 'back': Name des relativen Vaterverzeichnisses
// 'root': Kennung vor dem ersten Trenner am Anfang eines absoluten Pfads
// 'home': Kennung vor dem ersten Trenner am Anfang eines Pfads relativ zu Home
function Path(homePath, delims) {
    'use strict';

    this.dirs = [];
    this.setDelims(delims);
    this.homeDirs = this.getDirs(homePath, { 'home' : "" });

    this.home();
}

Class.define(Path, Object, {
                  'root'           : function() {
                                         this.dirs.splice(0, this.dirs.length);
                                     },
                  'home'           : function() {
                                         this.dirs = this.homeDirs.slice();
                                     },
                  'up'             : function() {
                                         this.dirs.pop();
                                     },
                  'down'           : function(subDir) {
                                         this.dirs.push(subDir);
                                     },
                  'setDelims'      : function(delims = undefined) {
                                         this.setConst('delims', new Delims(delims));
                                     },
                  'setDelim'       : function(delim = undefined) {
                                         this.delims.setDelim(delim || '/');
                                     },
                  'setBackDelim'   : function(backDelim = undefined) {
                                         this.delims.setBack(backDelim || "..");
                                     },
                  'setRootDelim'   : function(rootDelim = undefined) {
                                         this.delims.setRoot(rootDelim || "");
                                     },
                  'setHomeDelim'   : function(homeDelim = undefined) {
                                         this.delims.setHome(homeDelim || '~');
                                     },
                  'setSchemeDelim' : function(schemeDelim = undefined) {
                                         this.delims.setScheme(schemeDelim || ':');
                                     },
                  'setHostDelim'   : function(hostDelim = undefined) {
                                         this.delims.setHost(hostDelim || '//');
                                     },
                  'setPortDelim'   : function(portDelim = undefined) {
                                         this.delims.setHost(portDelim || ':');
                                     },
                  'setQueryDelim'  : function(queryDelim = undefined) {
                                         this.delims.setQuery(queryDelim || '?');
                                     },
                  'setParSepDelim' : function(parSepDelim = undefined) {
                                         this.delims.setParSep(parSepDelim || '&');
                                     },
                  'setParAssDelim' : function(parAssDelim = undefined) {
                                         this.delims.setParAss(parAssDelim || '=');
                                     },
                  'setNodeDelim'   : function(nodeDelim = undefined) {
                                         this.delims.setNode(nodeDelim || '#');
                                     },
                  'getLeaf'        : function(dirs = undefined) {
                                         const __DIRS = (dirs || this.dirs);

                                         return ((__DIRS && __DIRS.length) ? __DIRS.slice(-1)[0] : "");
                                     },
                  'getPath'        : function(dirs = undefined, delims = undefined) {
                                         const __DELIMS = new Delims(delims);
                                         const __DELIM = (__DELIMS.delim || this.delims.delim);
                                         const __ROOTDELIM = ((__DELIMS.root !== undefined) ? __DELIMS.root : this.delims.root);
                                         const __DIRS = (dirs || this.dirs);

                                         return __ROOTDELIM + __DELIM + __DIRS.join(__DELIM);
                                     },
                  'getDirs'        : function(path = undefined, delims = undefined) {
                                         const __DELIMS = new Delims(delims);
                                         const __DELIM = (__DELIMS.delim || this.delims.delim);
                                         const __ROOTDELIM = ((__DELIMS.root !== undefined) ? __DELIMS.root : this.delims.root);
                                         const __HOMEDELIM = ((__DELIMS.home !== undefined) ? __DELIMS.home : this.delims.home);
                                         const __DIRS = (path ? path.split(__DELIM) : []);
                                         const __FIRST = __DIRS[0];

                                         if (__FIRST && (__FIRST !== __ROOTDELIM) && (__FIRST !== __HOMEDELIM)) {
                                             showAlert("Kein absoluter Pfad", this.getPath(__DIRS), this);
                                         }

                                         return __DIRS.slice(1);
                                     }
                } );

// ==================== Ende Abschnitt fuer Klasse Path ====================

// ==================== Abschnitt fuer Klasse URI ====================

// Basisklasse fuer die Verwaltung einer URI/URL
// homePath: Absoluter Startpfad als String
// delims: Objekt mit Trennern und Symbolen als Properties (oder Delims-Objekt)
// 'delim': Trennzeichen zwischen zwei Ebenen
// 'back': Name des relativen Vaterverzeichnisses
// 'root': Kennung vor dem ersten Trenner am Anfang eines absoluten Pfads
// 'home': Kennung vor dem ersten Trenner am Anfang eines Pfads relativ zu Home
function URI(homePath, delims) {
    'use strict';

    Path.call(this);

    const __HOSTPORT = this.getHostPort(homePath);

    this.scheme = this.getSchemePrefix(homePath);
    this.host = __HOSTPORT.host;
    this.port = this.parseValue(__HOSTPORT.port);
    this.query = this.parseQuery(this.getQueryString(homePath));
    this.node = this.getNodeSuffix(homePath);

    this.homeDirs = this.getDirs(homePath, { 'home' : "" });

    this.home();
}

Class.define(URI, Path, {
               'setDelims'         : function() {
                                         this.setConst('delims', new UriDelims('/', "..", "", '~', ':', "//", ':', '?', '&', '=', '#'));
                                     },
               'setSchemeDelim'    : function(schemeDelim = undefined) {
                                         this.delims.setScheme(schemeDelim || ':');
                                     },
               'setQueryDelim'     : function(queryDelim = undefined) {
                                         this.delims.setQuery(queryDelim || '?');
                                     },
               'setParSepDelim'    : function(parSepDelim = undefined) {
                                         this.delims.setParSep(parSepDelim || '&');
                                     },
               'setParAssDelim'    : function(parAssDelim = undefined) {
                                         this.delims.setParAss(parAssDelim || '=');
                                     },
               'setNodeDelim'      : function(nodeDelim = undefined) {
                                         this.delims.setNode(nodeDelim || '#');
                                     },
               'getServerPath'     : function(path = undefined) {
                                         return this.stripHostPort(this.stripQueryString(this.stripNodeSuffix(this.stripSchemePrefix(path))));
                                     },
               'getHostPort'       : function(path = undefined) {
                                         const __HOSTDELIM = this.delims.host;
                                         const __PORTDELIM = this.delims.port;
                                         const __ROOTDELIM = this.delims.root + this.delims.delim;
                                         const __NOSCHEME = this.stripSchemePrefix(path);
                                         const __INDEXHOST = (__NOSCHEME ? __NOSCHEME.indexOf(__HOSTDELIM) : -1);
                                         const __PATH = (~ __INDEXHOST) ? __NOSCHEME.substring(__INDEXHOST + __HOSTDELIM.length) : __NOSCHEME;
                                         const __INDEXHOSTPORT = (__PATH ? __PATH.indexOf(__ROOTDELIM) : -1);
                                         const __HOSTPORT = (~ __INDEXHOSTPORT) ? __PATH.substring(0, __INDEXHOSTPORT) : undefined;
                                         const __INDEXPORT = (__HOSTPORT ? __HOSTPORT.indexOf(__PORTDELIM) : -1);
                                         const __HOST = (~ __INDEXPORT) ? __HOSTPORT.substring(0, __INDEXPORT) : __HOSTPORT;
                                         const __PORT = (~ __INDEXPORT) ? __HOSTPORT.substring(__INDEXPORT + __PORTDELIM.length) : undefined;

                                         return {
                                                    'host' : __HOST,
                                                    'port' : __PORT
                                                };
                                     },
               'stripHostPort'     : function(path = undefined) {
                                         const __HOSTDELIM = this.delims.host;
                                         const __ROOTDELIM = this.delims.root + this.delims.delim;
                                         const __INDEXHOST = (path ? path.indexOf(__HOSTDELIM) : -1);
                                         const __PATH = (~ __INDEXHOST) ? path.substring(__INDEXHOST + __HOSTDELIM.length) : path;
                                         const __INDEXHOSTPORT = (__PATH ? __PATH.indexOf(__ROOTDELIM) : -1);

                                         return (~ __INDEXHOSTPORT) ? __PATH.substring(__INDEXHOSTPORT) : __PATH;
                                     },
               'getSchemePrefix'   : function(path = undefined) {
                                         const __SCHEMEDELIM = this.delims.scheme;
                                         const __INDEXSCHEME = (path ? path.indexOf(__SCHEMEDELIM) : -1);

                                         return (~ __INDEXSCHEME) ? path.substring(0, __INDEXSCHEME) : undefined;
                                     },
               'stripSchemePrefix' : function(path = undefined) {
                                         const __SCHEMEDELIM = this.delims.scheme;
                                         const __INDEXSCHEME = (path ? path.indexOf(__SCHEMEDELIM) : -1);

                                         return (~ __INDEXSCHEME) ? path.substring(__INDEXSCHEME + __INDEXSCHEME.length) : path;
                                     },
               'getNodeSuffix'     : function(path = undefined) {
                                         const __NODEDELIM = this.delims.node;
                                         const __INDEXNODE = (path ? path.lastIndexOf(__NODEDELIM) : -1);

                                         return (~ __INDEXNODE) ? path.substring(__INDEXNODE + __NODEDELIM.length) : undefined;
                                     },
               'stripNodeSuffix'   : function(path = undefined) {
                                         const __NODEDELIM = this.delims.node;
                                         const __INDEXNODE = (path ? path.lastIndexOf(__NODEDELIM) : -1);

                                         return (~ __INDEXNODE) ? path.substring(0, __INDEXNODE) : path;
                                     },
               'getQueryString'    : function(path = undefined) {
                                         const __QUERYDELIM = this.delims.query;
                                         const __PATH = this.stripNodeSuffix(path);
                                         const __INDEXQUERY = (__PATH ? __PATH.indexOf(__QUERYDELIM) : -1);

                                         return (~ __INDEXQUERY) ? __PATH.substring(__INDEXQUERY + __QUERYDELIM.length) : undefined;
                                     },
               'stripQueryString'  : function(path = undefined) {
                                         const __QUERYDELIM = this.delims.query;
                                         const __INDEXQUERY = (path ? path.indexOf(__QUERYDELIM) : -1);

                                         return (~ __INDEXQUERY) ? path.substring(0, __INDEXQUERY) : path;
                                     },
               'formatParams'      : function(params, formatFun, delim = ' ', assign = '=') {
                                         const __PARAMS = [];

                                         for (let param in params) {
                                             __PARAMS.push(param + assign + formatFun(params[param]));
                                         }

                                         return __PARAMS.join(delim);
                                     },
               'parseParams'       : function(params, parseFun, delim = ' ', assign = '=') {
                                         const __RET = { };

                                         if (params) {
                                             const __PARAMS = params.split(delim);

                                             for (let index = 0; index < __PARAMS.length; index++) {
                                                 const __PARAM = __PARAMS[index];

                                                 if (__PARAM) {
                                                     const __INDEX = __PARAM.indexOf(assign);
                                                     const __KEY = (~ __INDEX) ? __PARAM.substring(0, __INDEX) : __PARAM;
                                                     const __VAL = (~ __INDEX) ? parseFun(__PARAM.substring(__INDEX + assign.length)) : true;

                                                     __RET[__KEY] = __VAL;
                                                 }
                                             }
                                         }

                                         return __RET;
                                     },
               'rawValue'          : function(value) {
                                         return value;
                                     },
               'parseValue'        : function(value) {
                                         const __VALUE = Number(value);

                                         if (__VALUE == value) {  // schwacher Vergleich true, also Number
                                             return __VALUE;
                                         } else {
                                             const __LOWER = (value ? value.toLowerCase() : undefined);

                                             if ((__LOWER === "true") || (__LOWER === "false")) {
                                                 return (value === "true");
                                             }
                                         }

                                         return value;
                                     },
               'getQuery'          : function(delims = { }) {
                                         const __QRYSEP = ((delims.qrySep !== undefined) ? delims.qrySep : this.delims.qrySep);
                                         const __QRYASS = ((delims.qryAss !== undefined) ? delims.qryAss : this.delims.qryAss);

                                         return this.formatParams(this.query, this.rawValue, __QRYSEP, __QRYASS);
                                     },
               'parseQuery'        : function(path = undefined, delims = { }) {
                                         const __QRYSEP = ((delims.qrySep !== undefined) ? delims.qrySep : this.delims.qrySep);
                                         const __QRYASS = ((delims.qryAss !== undefined) ? delims.qryAss : this.delims.qryAss);

                                         return this.parseParams(path, this.parseValue, __QRYSEP, __QRYASS);
                                     },
               'setQuery'          : function(query) {
                                         this.query = query;
                                     },
               'setQueryPar'       : function(key, value) {
                                         this.query[key] = value;
                                     },
               'getQueryPar'       : function(key) {
                                         return this.query[key];
                                     },
               'getPath'           : function(dirs = undefined, delims = undefined) {
                                         const __DELIMS = new UriDelims(delims);
                                         const __SCHEMEDELIM = ((__DELIMS.scheme !== undefined) ? __DELIMS.scheme : this.delims.scheme);
                                         const __HOSTDELIM = ((__DELIMS.host !== undefined) ? __DELIMS.host : this.delims.host);
                                         const __PORTDELIM = ((__DELIMS.port !== undefined) ? __DELIMS.port : this.delims.port);
                                         const __QUERYDELIM = ((__DELIMS.query !== undefined) ? __DELIMS.query : this.delims.query);
                                         const __NODEDELIM = ((__DELIMS.node !== undefined) ? __DELIMS.node : this.delims.node);
                                         const __SCHEMENAME = this.scheme;
                                         const __SCHEME = (__SCHEMENAME ? __SCHEMENAME + __SCHEMEDELIM : "");
                                         const __HOSTNAME = this.host;
                                         const __HOST = (__HOSTNAME ? __HOSTDELIM + __HOSTNAME : "");
                                         const __PORTNR = this.port;
                                         const __PORT = ((__HOSTNAME && __PORTNR) ? __PORTDELIM + __PORTNR : "");
                                         const __QUERYSTR = this.getQuery();
                                         const __QUERY = (__QUERYSTR ? __QUERYDELIM + __QUERYSTR : "");
                                         const __NODENAME = this.node;
                                         const __NODE = (__NODENAME ? __NODEDELIM + __NODENAME : "");

                                         return __SCHEME + __HOST + __PORT + Path.prototype.getPath.call(this, dirs, delims) + __QUERY + __NODE;
                                     },
               'getDirs'           : function(path = undefined, delims = undefined) {
                                         const __PATH = this.getServerPath(path);

                                         return Path.prototype.getDirs.call(this, __PATH);
                                     }
           } );

// ==================== Ende Abschnitt fuer Klasse URI ====================

// ==================== Abschnitt fuer Klasse Directory ====================

// Basisklasse fuer eine Verzeichnisstruktur
// homePath: Absoluter Startpfad als String
// delims: Objekt mit Trennern und Symbolen als Properties (oder Delims-Objekt)
// 'delim': Trennzeichen zwischen zwei Ebenen
// 'back': Name des relativen Vaterverzeichnisses
// 'root': Kennung vor dem ersten Trenner am Anfang eines absoluten Pfads
// 'home': Kennung vor dem ersten Trenner am Anfang eines Pfads relativ zu Home
function Directory(homePath, delims) {
    'use strict';

    Path.call(this, homePath, delims);
}

Class.define(Directory, Path, {
                    'chDir' : function(subDir = undefined) {
                                  if (subDir === undefined) {
                                      this.root();
                                  } else if ((typeof subDir) === 'object') {
                                      for (let sub of subDir) {
                                          this.chDir(sub);
                                      }
                                  } else {
                                      if (subDir === this.delims.home) {
                                          this.home();
                                      } else if (subDir === this.delims.back) {
                                          this.up();
                                      } else {
                                          this.down(subDir);
                                      }
                                  }
                              },
                    'pwd'   : function() {
                                  return this.getPath();
                              }
                } );

// ==================== Ende Abschnitt fuer Klasse Directory ====================

// ==================== Abschnitt fuer Klasse ObjRef ====================

// Basisklasse fuer eine Objekt-Referenz
function ObjRef(rootObj) {
    'use strict';

    Directory.call(this, undefined, new Delims('/', "..", '/', '~'));

    this.setConst('rootObj', rootObj);  // Wichtig: Verweis nicht verfolgen! Gefahr durch Zyklen!
}

Class.define(ObjRef, Directory, {
                    'valueOf' : function() {
                                    let ret = this.rootObj;

                                    for (let name of this.dirs) {
                                        if (ret === undefined) {
                                            break;
                                        }
                                        ret = ret[name];
                                    }

                                    return ret;
                                }
                } );

// ==================== Ende Abschnitt fuer Klasse ObjRef ====================

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
function checkItem(item, inList = undefined, exList = undefined) {
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
    for (let item in getValue(addData, { })) {
        if (checkItem(item, addList, ignList)) {
            data[item] = addData[item];
        }
    }

    return data;
}

// Gibt den Wert einer Property zurueck. Ist dieser nicht definiert oder null, wird er vorher gesetzt
// obj: Ein Objekt. Ist dieses undefined oder null, wird defValue zurueckgeliefert
// item: Key des Properties
// defValue: Default-Wert fuer den Fall, dass nichts gesetzt ist
// return Der Wert des Properties. Sind das obj oder das Property und defValue undefined oder null, dann undefined
function getProp(obj, item, defValue = undefined) {
    if ((obj === undefined) || (obj === null)) {
        return defValue;
    }

    const __PROP = obj[item];

    if ((__PROP !== undefined) && (__PROP !== null)) {
        return __PROP;
    }

    return (obj[item] = defValue);
}

// Sicheres obj.valueOf() fuer alle Daten
// data: Objekt oder Wert
// return Bei Objekten valueOf() oder das Objekt selber, bei Werten der Wert
function valueOf(data) {
    return (((typeof data) === 'object') ? data.valueOf() : data);
}

// Sicheres JSON.stringify(), das auch mit Zyklen umgehen kann
// value: Auszugebene Daten. Siehe JSON.stringify()
// replacer: Elementersetzer. Siehe JSON.stringify()
// space: Verschoenerung. Siehe JSON.stringify()
// cycleReplacer: Ersetzer im Falle von Zyklen
// return String mit Ausgabe der Objektdaten
function safeStringify(value, replacer = undefined, space = undefined, cycleReplacer = undefined) {
    return JSON.stringify(value, serializer(replacer, cycleReplacer), space);
}

// Hilfsfunktion fuer safeStringify(): Kapselt replacer und einen cycleReplacer fuer Zyklen
// replacer: Elementersetzer. Siehe JSON.stringify()
// cycleReplacer: Ersetzer im Falle von Zyklen
// return Ersetzer-Funktion fuer JSON.stringify(), die beide Ersetzer vereint
function serializer(replacer = undefined, cycleReplacer = undefined) {
    const __STACK = [];
    const __KEYS = [];

    if (! cycleReplacer) {
        cycleReplacer = function(key, value) {
                if (__STACK[0] === value) {
                    return "[~]";
                }
                return "[~." + __KEYS.slice(0, __STACK.indexOf(value)).join('.') + ']';
            };
    }

    return function(key, value) {
            if (__STACK.length) {
                const __THISPOS = __STACK.indexOf(this);

                if (~ __THISPOS) {
                    __STACK.splice(__THISPOS + 1);
                    __KEYS.splice(__THISPOS, Infinity, key);
                } else {
                    __STACK.push(this);
                    __KEYS.push(key);
                }
                if (~ __STACK.indexOf(value)) {
                    value = cycleReplacer.call(this, key, value);
                }
            } else {
                __STACK.push(value);
            }

            return ((! replacer) ? value : replacer.call(this, key, value));
        };
}

// Speichert einen beliebiegen (strukturierten) Wert unter einem Namen ab
// name: GM_setValue-Name, unter dem die Daten gespeichert werden
// value: Beliebiger (strukturierter) Wert
// return String-Darstellung des Wertes
function serialize(name, value) {
    const __STREAM = (value !== undefined) ? safeStringify(value) : value;

    __LOG[4](name + " >> " + __STREAM);

    GM_setValue(name, __STREAM);

    return __STREAM;
}

// Holt einen beliebiegen (strukturierter) Wert unter einem Namen zurueck
// name: GM_setValue-Name, unter dem die Daten gespeichert werden
// defValue: Default-Wert fuer den Fall, dass nichts gespeichert ist
// return Objekt, das unter dem Namen gespeichert war
function deserialize(name, defValue = undefined) {
    const __STREAM = GM_getValue(name, defValue);

    __LOG[4](name + " << " + __STREAM);

    if ((__STREAM !== undefined) && __STREAM.length) {
        try {
            return JSON.parse(__STREAM);
        } catch (ex) {
            __LOG[1](name + ": " + ex.message);
        }
    }

    return undefined;
}

// Setzt eine Option dauerhaft und laedt die Seite neu
// name: Name der Option als Speicherort
// value: Zu setzender Wert
// reload: Seite mit neuem Wert neu laden
// return Gespeicherter Wert fuer setOptValue()
function setStored(name, value, reload = false, serial = false) {
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
function setNextStored(arr, name, value, reload = false, serial = false) {
    return setStored(name, getNextValue(arr, value), reload, serial);
}

// Fuehrt die in einem Storage gespeicherte Operation aus
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
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
                __LOG[1]("getStoredCmds(): " + __CMD + " '" + __KEY + "' hat illegalen Wert '" + value + "'");
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
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
// return Array von Operationen (wie storedCmds), die fuer die naechste Phase uebrig bleiben
function runStoredCmds(storedCmds, optSet = undefined, beforeLoad = undefined) {
    const __BEFORELOAD = getValue(beforeLoad, true);
    const __STOREDCMDS = getValue(storedCmds, []);
    const __LOADEDCMDS = [];
    let invalidated = false;

    while (__STOREDCMDS.length) {
        const __STORED = __STOREDCMDS.shift();
        const __CMD = __STORED.cmd;
        const __KEY = __STORED.key;
        const __VAL = __STORED.val;

        if (__BEFORELOAD) {
            if (__STOREDCMDS.length) {
                invalidateOpts(optSet);  // alle Optionen invalidieren
                invalidated = true;
            }
            switch (__OPTACTION[__CMD]) {
            case __OPTACTION.SET : __LOG[4]("SET '" + __KEY + "' " + __VAL);
                                   setStored(__KEY, __VAL, false, false);
                                   break;
            case __OPTACTION.NXT : __LOG[4]("SETNEXT '" + __KEY + "' " + __VAL);
                                   //setNextStored(__CONFIG.Choice, __KEY, __VAL, false, false);
                                   setStored(__KEY, __VAL, false, false);
                                   break;
            case __OPTACTION.RST : __LOG[4]("RESET (delayed)");
                                   __LOADEDCMDS.push(__STORED);
                                   break;
            default :              break;
            }
        } else {
            switch (__OPTACTION[__CMD]) {
            case __OPTACTION.SET :
            case __OPTACTION.NXT : __LOG[2]("SET/SETNEXT (undefined)");
                                   break;
            case __OPTACTION.RST : __LOG[4]("RESET");
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
    const __CONFIG = getOptConfig(opt);
    const __NAME = getOptName(opt);

    if (__NAME !== name) {
        __LOG[4]("RENAME " + __NAME + " => " + name);

        __CONFIG.Name = name;
    }

    return name;
}

// Gibt den Namen einer Option zurueck
// opt: Config und Value der Option
// return Name der Option
function getOptName(opt) {
    const __CONFIG = getOptConfig(opt);
    const __NAME = __CONFIG.Name;

    if (! __NAME) {
        const __SHARED = __CONFIG.Shared;

        if (__SHARED && ! opt.Loaded) {
            const __OBJREF = getSharedRef(__SHARED, opt.Item);

            return __OBJREF.getPath();
        }

        showAlert("Error", "Option ohne Namen", safeStringify(__CONFIG));
    }

    return __NAME;
}

// Setzt den Wert einer Option
// opt: Config und Value der Option
// name: Zu setzender Wert der Option
// return Gesetzter Wert
function setOptValue(opt, value) {
    if (opt !== undefined) {
        if (! opt.ReadOnly) {
            __LOG[6](getOptName(opt) + ": " + __LOG.changed(opt.Value, value));

            opt.Value = value;
        }
        return opt.Value;
    } else {
        return undefined;
    }
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
        if (load && ! opt.Loaded) {
            value = loadOption(opt, force);
        } else {
            value = opt.Value;
        }
    }

    return valueOf(getValue(value, defValue));
}

// ==================== Ende Abschnitt fuer diverse Utilities ====================

// ==================== Abschnitt fuer Speicher und die Scriptdatenbank ====================

// Namen des Default-, Temporaer- und Null-Memories...
const __MEMNORMAL   = 'normal';
const __MEMSESSION  = 'begrenzt';
const __MEMINAKTIVE = 'inaktiv';

// Definition des Default-, Dauer- und Null-Memories...
const __OPTMEMNORMAL   = __OPTMEM[__MEMNORMAL];
const __OPTMEMSESSION  = __OPTMEM[__MEMSESSION];
const __OPTMEMINAKTIVE = __OPTMEM[__MEMINAKTIVE];

// Medium fuer die Datenbank (Speicher)
let myOptMem = __OPTMEMNORMAL;
let myOptMemSize;

// Infos ueber dieses Script-Modul
const __DBMOD = new ScriptModule();

// Inhaltsverzeichnis der DB-Daten (indiziert durch die Script-Namen)
const __DBTOC = { };

// Daten zu den Modulen (indiziert durch die Script-Namen)
const __DBDATA = { };

// ==================== Abschnitt fuer Speicher ====================

// Ermittelt fuer die uebergebene Speicher-Konfiguration einen Speicher
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
// defMemory: Ersatz-Wert, falls memory undefined. Soll nur memory genutzt werden, dann z.B. null uebergeben!
// return memory, falls okay, sonst einen Defaultwert
function getMemory(memory = undefined, defMemory = getValue(myOptMem, __OPTMEMNORMAL)) {
    return getValue(memory, defMemory);
}

// Kompatibilitaetsfunktion: Testet, ob der uebergebene Speicher genutzt werden kann
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
// return true, wenn der Speichertest erfolgreich war
function canUseMemory(memory = undefined) {
    const __STORAGE = getMemory(memory, { });
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

    __LOG[2]("canUseStorage(" + __STORAGE.Name + ") = " + ret);

    return ret;
}

// Ermittelt die Groesse des benutzten Speichers
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
// return Groesse des genutzten Speichers in Bytes
function getMemSize(memory = undefined) {
    const __STORAGE = getMemory(memory);
    const __MEMORY = __STORAGE.Value;

    //getMemUsage(__MEMORY);

    if (__MEMORY !== undefined) {
        const __SIZE = safeStringify(__MEMORY).length;

        __LOG[2]("MEM: " + __SIZE + " bytes");
        return __SIZE;
    } else {
        return 0;
    }
}

// Gibt rekursiv und detailliert die Groesse des benutzten Speichers fuer ein Objekt aus
// value: (Enumerierbares) Objekt oder Wert, dessen Groesse gemessen wird
// out: Logfunktion, etwa console.log
// depth: Gewuenschte Rekursionstiefe (0 = nur dieses Objekt, -1 = alle Ebenen)
// name: Name des Objekts
function getMemUsage(value = undefined, out = undefined, depth = -1, name = '$') {
    const __OUT = (out || __LOG[4]);

    if ((typeof value) === 'string') {
        const __SIZE = value.length;

        __OUT("USAGE: " + name + '\t' + __SIZE + '\t' + value.substr(0, 255));
    } else if ((typeof value) === 'object') {
        if (depth === 0) {
            const __SIZE = safeStringify(value).length;

            __OUT("USAGE: " + name + '\t' + __SIZE);
        } else {
            depth--;
            for (let sub in value) {
                getMemUsage(value[sub], __OUT, depth, name + '.' + sub);
            }
            getMemUsage(value, __OUT, 0, name);
        }
    } else {
       const __DATA = (((typeof value) === 'function') ? "" : '\t' + value);

        __OUT("USAGE: " + name + '\t' + (typeof value) + __DATA);
    }
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

// Initialisiert das Script-Modul und ermittelt die beschreibenden Daten
// meta: Metadaten des Scripts (Default: GM_info.script)
// return Beschreibende Daten fuer __DBMOD
function ScriptModule(meta) {
    'use strict';

    const __META = getValue(meta, GM_info.script);
    const __PROPS = {
                'name'        : true,
                'version'     : true,
                'namespace'   : true,
                'description' : true
            };

    const __DBMOD = { };

    __LOG[5](__META);

    // Infos zu diesem Script...
    addProps(__DBMOD, __META, __PROPS);

    // Voller Name fuer die Ausgabe...
    Object.defineProperty(__DBMOD, 'Name', {
                    get : function() {
                              return this.name + " (" + this.version + ')';
                          },
                    set : undefined
                });

    __LOG[2](__DBMOD);

    return __DBMOD;
}

Class.define(ScriptModule, Object);

// Initialisiert die Scriptdatenbank, die einen Datenaustausch zwischen den Scripten ermoeglicht
// optSet: Gesetzte Optionen (und Config)
function initScriptDB(optSet) {
     // Speicher fuer die DB-Daten...
    const __DBMEM = myOptMem.Value;

    __DBTOC.versions = getValue((__DBMEM === undefined) ? undefined : JSON.parse(__DBMEM.getItem('__DBTOC.versions')), { });
    __DBTOC.namespaces = getValue((__DBMEM === undefined) ? undefined : JSON.parse(__DBMEM.getItem('__DBTOC.namespaces')), { });

    // Zunaechst den alten Eintrag entfernen...
    delete __DBTOC.versions[__DBMOD.name];
    delete __DBTOC.namespaces[__DBMOD.name];

    if (__DBMEM !== undefined) {
        // ... und die Daten der Fremdscripte laden...
        for (let module in __DBTOC.versions) {
            scriptDB(module, getValue(JSON.parse(__DBMEM.getItem('__DBDATA.' + module)), { }));
        }
    }
}

// Setzt die Daten dieses Scriptes in der Scriptdatenbank, die einen Datenaustausch zwischen den Scripten ermoeglicht
// optSet: Gesetzte Optionen (und Config)
function updateScriptDB(optSet) {
    // Eintrag ins Inhaltsverzeichnis...
    __DBTOC.versions[__DBMOD.name] = __DBMOD.version;
    __DBTOC.namespaces[__DBMOD.name] = __DBMOD.namespace;

    // Speicher fuer die DB-Daten...
    const __DBMEM = myOptMem.Value;

    if (__DBMEM !== undefined) {
        // Permanente Speicherung der Eintraege...
        __DBMEM.setItem('__DBTOC.versions', safeStringify(__DBTOC.versions));
        __DBMEM.setItem('__DBTOC.namespaces', safeStringify(__DBTOC.namespaces));
        __DBMEM.setItem('__DBDATA.' + __DBMOD.name, safeStringify(optSet));

        // Aktualisierung der Speichergroesse...
        myOptMemSize = getMemSize(myOptMem);
    }

    // Jetzt die inzwischen gefuellten Daten *dieses* Scripts ergaenzen...
    scriptDB(__DBMOD.name, getValue(optSet, { }));

    __LOG[2](__DBDATA);
}

// Holt die globalen Daten zu einem Modul aus der Scriptdatenbank
// module: Gesetzte Optionen (und Config)
// initValue: Falls angegeben, zugewiesener Startwert
// return Daten zu diesem Modul
function scriptDB(module, initValue = undefined) {
    const __NAMESPACE = __DBTOC.namespaces[module];
    const __DBMODS = getProp(__DBDATA, __NAMESPACE, { });

    if (initValue !== undefined) {
        return (__DBMODS[module] = initValue);
    } else {
        return getProp(__DBMODS, module, { });
    }
}

// ==================== Ende Abschnitt fuer die Scriptdatenbank ====================

// ==================== Ende Abschnitt fuer Speicher und die Scriptdatenbank ====================

// ==================== Abschnitt fuer das Benutzermenu ====================

// Zeigt den Eintrag im Menu einer Option
// val: Derzeitiger Wert der Option
// menuOn: Text zum Setzen im Menu
// funOn: Funktion zum Setzen
// keyOn: Hotkey zum Setzen im Menu
// menuOff: Text zum Ausschalten im Menu
// funOff: Funktion zum Ausschalten
// keyOff: Hotkey zum Ausschalten im Menu
function registerMenuOption(val, menuOn, funOn, keyOn, menuOff, funOff, keyOff) {
    const __ON  = (val ? '*' : "");
    const __OFF = (val ? "" : '*');

    __LOG[3]("OPTION " + __ON + menuOn + __ON + " / " + __OFF + menuOff + __OFF);

    if (val) {
        GM_registerMenuCommand(menuOff, funOff, keyOff);
    } else {
        GM_registerMenuCommand(menuOn, funOn, keyOn);
    }
}

// Zeigt den Eintrag im Menu einer Option mit Wahl des naechsten Wertes
// val: Derzeitiger Wert der Option
// arr: Array-Liste mit den moeglichen Optionen
// menu: Text zum Setzen im Menu ($ wird durch gesetzten Wert ersetzt)
// fun: Funktion zum Setzen des naechsten Wertes
// key: Hotkey zum Setzen des naechsten Wertes im Menu
function registerNextMenuOption(val, arr, menu, fun, key) {
    const __MENU = menu.replace('$', val);
    let options = "OPTION " + __MENU;

    for (let value of arr) {
        if (value === val) {
            options += " / *" + value + '*';
        } else {
            options += " / " + value;
        }
    }
    __LOG[3](options);

    GM_registerMenuCommand(__MENU, fun, key);
}

// Zeigt den Eintrag im Menu einer Option, falls nicht hidden
// val: Derzeitiger Wert der Option
// menu: Text zum Setzen im Menu ($ wird durch gesetzten Wert ersetzt)
// fun: Funktion zum Setzen des naechsten Wertes
// key: Hotkey zum Setzen des naechsten Wertes im Menu
// hidden: Angabe, ob Menupunkt nicht sichtbar sein soll (Default: sichtbar)
// serial: Serialization fuer komplexe Daten
function registerDataOption(val, menu, fun, key, hidden = false, serial = true) {
    const __VALUE = ((serial && (val !== undefined)) ? safeStringify(val) : val);
    const __MENU = getValue(menu, "").replace('$', __VALUE);
    const __OPTIONS = (hidden ? "HIDDEN " : "") + "OPTION " + __MENU +
                      getValue(__VALUE, "", " = " + __VALUE);

    __LOG[hidden ? 4 : 3](__OPTIONS);

    if (! hidden) {
        GM_registerMenuCommand(__MENU, fun, key);
    }
}

// Zeigt den Eintrag im Menu einer Option
// opt: Config und Value der Option
function registerOption(opt) {
    const __CONFIG = getOptConfig(opt);
    const __VALUE = getOptValue(opt);
    const __LABEL = __CONFIG.Label;
    const __ACTION = opt.Action;
    const __HOTKEY = __CONFIG.Hotkey;
    const __HIDDEN = __CONFIG.HiddenMenu;
    const __SERIAL = __CONFIG.Serial;

    if (! __CONFIG.HiddenMenu) {
        switch (__CONFIG.Type) {
        case __OPTTYPES.MC : registerNextMenuOption(__VALUE, __CONFIG.Choice, __LABEL, __ACTION, __HOTKEY);
                             break;
        case __OPTTYPES.SW : registerMenuOption(__VALUE, __LABEL, __ACTION, __HOTKEY,
                                                __CONFIG.AltLabel, __ACTION, __CONFIG.AltHotkey);
                             break;
        case __OPTTYPES.TF : registerMenuOption(__VALUE, __LABEL, __ACTION, __HOTKEY,
                                                __CONFIG.AltLabel, opt.AltAction, __CONFIG.AltHotkey);
                             break;
        case __OPTTYPES.SD : registerDataOption(__VALUE, __LABEL, __ACTION, __HOTKEY, __HIDDEN, __SERIAL);
                             break;
        case __OPTTYPES.SI : registerDataOption(__VALUE, __LABEL, __ACTION, __HOTKEY, __HIDDEN, __SERIAL);
                             break;
        default :            break;
        }
    } else {
        // Nur Anzeige im Log...
        registerDataOption(__VALUE, __LABEL, __ACTION, __HOTKEY, __HIDDEN, __SERIAL);
    }
}

// ==================== Ende Abschnitt fuer das Benutzermenu ====================

// Initialisiert die gesetzten Option
// config: Konfiguration der Option
// setValue: Zu uebernehmender Default-Wert (z.B. der jetzt gesetzte)
// return Initialwert der gesetzten Option
function initOptValue(config, setValue = undefined) {
    let value = getValue(setValue, config.Default);  // Standard

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
// optConfig: Konfiguration der Option
// return Funktion fuer die Option
function initOptAction(optAction, item = undefined, optSet = undefined, optConfig = undefined) {
    let fun;

    if (optAction !== undefined) {
        const __CONFIG = ((optConfig !== undefined) ? optConfig : getOptConfig(getOptByName(optSet, item)));
        const __RELOAD = getValue(getValue(__CONFIG, { }).ActionReload, true);

        switch (optAction) {
        case __OPTACTION.SET : fun = function() {
                                       return setOptByName(optSet, item, __CONFIG.SetValue, __RELOAD);
                                   };
                               break;
        case __OPTACTION.NXT : fun = function() {
                                       return promptNextOptByName(optSet, item, __CONFIG.SetValue, __RELOAD,
                                                  __CONFIG.FreeValue, __CONFIG.SelValue, __CONFIG.MinChoice);
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

// Gibt fuer einen 'Shared'-Eintrag eine ObjRef zurueck
// shared: Object mit den Angaben 'namespace', 'module' und ggfs. 'item'
// item: Key der Option
// return ObjRef, die das Ziel definiert
function getSharedRef(shared, item = undefined) {
    if (shared === undefined) {
        return undefined;
    }

    const __OBJREF = new ObjRef(__DBDATA);  // Gemeinsame Daten
    const __PROPS = [ 'namespace', 'module', 'item' ];
    const __DEFAULTS = [ __DBMOD.namespace, __DBMOD.name, item ];

    for (let stage in __PROPS) {
        const __DEFAULT = __DEFAULTS[stage];
        const __PROP = __PROPS[stage];
        const __NAME = shared[__PROP];

        if (__NAME === '$') {
            break;
        }

        __OBJREF.chDir(getValue(__NAME, __DEFAULT));
    }

    return __OBJREF;
}

// Gibt diese Config oder, falls 'Shared', ein Referenz-Objekt mit gemeinsamen Daten zurueck
// optConfig: Konfiguration der Option
// item: Key der Option
// return Entweder optConfig oder gemergete Daten auf Basis des in 'Shared' angegebenen Objekts
function getSharedConfig(optConfig, item = undefined) {
    let config = getValue(optConfig, { });
    const __SHARED = config.Shared;

    if (__SHARED !== undefined) {
        const __OBJREF = getSharedRef(__SHARED, item);  // Gemeinsame Daten

        if (getValue(__SHARED.item, '$') !== '$') {  // __REF ist ein Item
            const __REF = valueOf(__OBJREF);

            config = { };  // Neu aufbauen...
            addProps(config, getOptConfig(__REF));
            addProps(config, optConfig);
            config.setConst('SharedData', getOptValue(__REF));
        } else {  // __REF enthaelt die Daten selbst
            if (! config.Name) {
                config.Name = __OBJREF.getPath();
            }
            config.setConst('SharedData', __OBJREF);  // Achtung: Ggfs. zirkulaer!
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
        const __PREINIT = getValue(__OPTCONFIG.PreInit, false, true);
        const __ISSHARED = getValue(__OPTCONFIG.Shared, false, true);

        if ((preInit === undefined) || (__PREINIT === preInit)) {
            const __CONFIG = getSharedConfig(__OPTCONFIG, opt);
            const __ALTACTION = getValue(__CONFIG.AltAction, __CONFIG.Action);
            // Gab es vorher einen Aufruf, der einen Stub-Eintrag erzeugt hat? Wurde ggfs. bereits geaendert...
            const __USESTUB = ((preInit === false) && __PREINIT);
            const __LOADED = (__USESTUB && optSet[opt].Loaded);
            const __VALUE = (__USESTUB ? optSet[opt].Value : undefined);

            optSet[opt] = {
                'Item'      : opt,
                'Config'    : __CONFIG,
                'Loaded'    : (__ISSHARED || __LOADED),
                'Value'     : initOptValue(__CONFIG, __VALUE),
                'SetValue'  : __CONFIG.SetValue,
                'ReadOnly'  : (__ISSHARED || __CONFIG.ReadOnly),
                'Action'    : initOptAction(__CONFIG.Action, opt, optSet, __CONFIG),
                'AltAction' : initOptAction(__ALTACTION, opt, optSet, __CONFIG)
            };
        } else if (preInit) {  // erstmal nur Stub
            optSet[opt] = {
                'Item'      : opt,
                'Config'    : __OPTCONFIG,
                'Loaded'    : false,
                'Value'     : initOptValue(__OPTCONFIG),
                'ReadOnly'  : (__ISSHARED || __OPTCONFIG.ReadOnly)
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
    // runStoredCmds (beforeLoad): getStoredCmds
    // loadOptions (PreInit): PreInit
    // startMemoryByOpt: storage oldStorage
    // initScriptDB: startMemoryByOpt
    // initOptions (Rest): PreInit
    // getMyTeam callback (getOptPrefix): initTeam
    // __MYTEAM (initTeam): initOptions
    // renameOptions: getOptPrefix
    // runStoredCmds (afterLoad): getStoredCmds, renameOptions
    // loadOptions (Rest): PreInit/Rest runStoredCmds
    // updateScriptDB: startMemoryByOpt
    // showOptions: startMemoryByOpt renameOptions
    // buildMenu: showOptions
    // buildForm: showOptions

// Initialisiert die gesetzten Optionen und den Speicher und laedt die Optionen zum Start
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// return Gefuelltes Objekt mit den gesetzten Optionen
function startOptions(optConfig, optSet = undefined, classification = undefined) {
    optSet = initOptions(optConfig, optSet, true);  // PreInit

    // Memory Storage fuer vorherige Speicherung...
    myOptMemSize = getMemSize(myOptMem = restoreMemoryByOpt(optSet.oldStorage));

    // Zwischengespeicherte Befehle auslesen...
    const __STOREDCMDS = getStoredCmds(myOptMem);

    // ... ermittelte Befehle ausführen...
    const __LOADEDCMDS = runStoredCmds(__STOREDCMDS, optSet, true);  // BeforeLoad

    // Bisher noch nicht geladenene Optionen laden...
    loadOptions(optSet);

    // Memory Storage fuer naechste Speicherung...
    myOptMemSize = getMemSize(myOptMem = startMemoryByOpt(optSet.storage, optSet.oldStorage));

    // Globale Daten ermitteln...
    initScriptDB(optSet);

    optSet = initOptions(optConfig, optSet, false);  // Rest

    if (classification !== undefined) {
        // Umbenennungen durchfuehren...
        classification.renameOptions();
    }

    // ... ermittelte Befehle ausführen...
    runStoredCmds(__LOADEDCMDS, optSet, false);  // Rest

    // Als globale Daten speichern...
    updateScriptDB(optSet);

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
function setNextOpt(opt, value = undefined, reload = false) {
    return setOpt(opt, getNextOpt(opt, value), reload);
}

// Setzt die naechste moegliche Option oder fragt ab einer gewissen Anzahl interaktiv ab
// opt: Config und Value der Option
// value: Default fuer ggfs. zu setzenden Wert
// reload: Seite mit neuem Wert neu laden
// freeValue: Angabe, ob Freitext zugelassen ist (Default: false)
// minChoice: Ab wievielen Auswahlmoeglichkeiten soll abgefragt werden? (Default: 3)
// return Gesetzter Wert
function promptNextOpt(opt, value = undefined, reload = false, freeValue = false, selValue = true, minChoice = 3) {
    const __CONFIG = getOptConfig(opt);
    const __CHOICE = __CONFIG.Choice;

    if (value || (! __CHOICE) || (__CHOICE.length < minChoice)) {
        return setNextOpt(opt, value, reload);
    }

    const __VALUE = getOptValue(opt, value);

    try {
        const __NEXTVAL = getNextValue(__CHOICE, __VALUE);
        let message = "";

        if (selValue) {
            for (let index = 0; index < __CHOICE.length; index++) {
                message += (index + 1) + ") " + __CHOICE[index] + '\n';
            }
            message += "\nNummer eingeben:";
        } else {
            message = __CHOICE.join(" / ") + "\n\nWert eingeben:";
        }

        const __ANSWER = prompt(message, __NEXTVAL);

        if (__ANSWER) {
            const __INDEX = parseInt(__ANSWER, 10) - 1;
            let nextVal = (selValue ? __CHOICE[__INDEX] : undefined);

            if (nextVal === undefined) {
                const __VALTYPE = getValue(__CONFIG.ValType, 'String');
                const __CASTVAL = this[__VALTYPE](__ANSWER);

                if (freeValue || (~ __CHOICE.indexOf(__CASTVAL))) {
                    nextVal = __CASTVAL;
                }
            }

            if (nextVal !== __VALUE) {
                if (nextVal) {
                    return setOpt(opt, nextVal, reload);
                }

                const __LABEL = __CONFIG.Label.replace('$', __VALUE);

                showAlert(__LABEL, "Ung\xFCltige Eingabe: " + __ANSWER);
            }
        }
    } catch (ex) {
        __LOG[1]("promptNextOpt: " + ex.message);
    }

    return __VALUE;
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
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// value: Default fuer ggfs. zu setzenden Wert
// return Zu setzender Wert
function getNextOptByName(optSet, item, value = undefined) {
    const __OPT = getOptByName(optSet, item);

    return getNextOpt(__OPT, value);
}

// Setzt die naechste moegliche Option (Version mit Key)
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// value: Default fuer ggfs. zu setzenden Wert
// reload: Seite mit neuem Wert neu laden
// return Gesetzter Wert
function setNextOptByName(optSet, item, value = undefined, reload = false) {
    const __OPT = getOptByName(optSet, item);

    return setNextOpt(__OPT, value, reload);
}

// Setzt die naechste moegliche Option oder fragt ab einer gewissen Anzahl interaktiv ab (Version mit Key)
// optSet: Platz fuer die gesetzten Optionen (und Config)
// item: Key der Option
// value: Default fuer ggfs. zu setzenden Wert
// reload: Seite mit neuem Wert neu laden
// freeValue: Angabe, ob Freitext zugelassen ist (Default: false)
// minChoice: Ab wievielen Auswahlmoeglichkeiten soll abgefragt werden? (Default: 3)
// return Gesetzter Wert
function promptNextOptByName(optSet, item, value = undefined, reload = false, freeValue = false, selValue = true, minChoice = 3) {
    const __OPT = getOptByName(optSet, item);

    return promptNextOpt(__OPT, value, reload, freeValue, selValue, minChoice);
}

// Baut das Benutzermenu auf
// optSet: Gesetzte Optionen
function buildMenu(optSet) {
    __LOG[3]("buildMenu()");

    for (let opt in optSet) {
        registerOption(optSet[opt]);
    }
}

// Invalidiert eine (ueber Menu) gesetzte Option
// opt: Zu invalidierende Option
// force: Invalidiert auch Optionen mit 'AutoReset'-Attribut
function invalidateOpt(opt, force = false) {
    if (! opt.ReadOnly) {
        const __CONFIG = getOptConfig(opt);

        // Wert "ungeladen"...
        opt.Loaded = (force || ! __CONFIG.AutoReset);

        if (opt.Loaded && __CONFIG.AutoReset) {
            // Nur zuruecksetzen, gilt als geladen...
            setOptValue(opt, initOptValue(__CONFIG));
        }
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
    const __ISSHARED = getValue(__CONFIG.Shared, false, true);
    const __NAME = getOptName(opt);
    const __DEFAULT = getOptValue(opt, undefined, false, false);
    let value;

    if (opt.Loaded && ! __ISSHARED) {
        __LOG[1]("Error: Oprion '" + __NAME + "' bereits geladen!");
    }

    if (opt.ReadOnly || __ISSHARED) {
        value = __DEFAULT;
    } else if (! force && __CONFIG.AutoReset) {
        value = initOptValue(__CONFIG);
    } else {
        value = (__CONFIG.Serial ?
                        deserialize(__NAME, __DEFAULT) :
                        GM_getValue(__NAME, __DEFAULT));
    }

    __LOG[5]("LOAD " + __NAME + ": " + __LOG.changed(__DEFAULT, value));

    // Wert als geladen markieren...
    opt.Loaded = true;

    // Wert intern setzen...
    return setOptValue(opt, value);
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

        __LOG[4]("DELETE " + __NAME);

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
// - name: Neu zu setzender Name (Speicheradresse)
// - param: Parameter "renameParam" von oben, z.B. Prefix oder Postfix
function renameOptions(optSet, optSelect, renameParam = undefined, renameFun = prefixName) {
    if (renameFun === undefined) {
        __LOG[1]("RENAME: Illegale Funktion!");
    }
    for (let opt in optSelect) {
        const __OPTPARAMS = optSelect[opt];
        const __OPT = optSet[opt];

        if (__OPT === undefined) {
            __LOG[1]("RENAME: Option '" + opt + "' nicht gefunden!");
        } else {
            const __NAME = getOptName(__OPT);
            const __NEWNAME = renameFun(__NAME, renameParam);
            const __ISSCALAR = ((typeof __OPTPARAMS) === 'boolean');
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
        __LOG[1]("Could not add " + type + " event:");
        __LOG[2](callback);

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
        __LOG[1]("Could not remove " + type + " event:");
        __LOG[2](callback);

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
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
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
        const __VALSTR = ((value !== undefined) ? safeStringify(value) : __SERIAL ? "JSON.stringify(" + __TVALUE + ')' : __TVALUE);
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
// memory: __OPTMEM.normal = unbegrenzt gespeichert (localStorage), __OPTMEM.begrenzt = bis Browserende gespeichert (sessionStorage), __OPTMEM.inaktiv
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

    if (__CONFIG.FreeValue && ! (~ __CONFIG.Choice.indexOf(__VALUE))) {
        element += '\n<option value="' + __VALUE + '" SELECTED>' + __VALUE + '</option>';
    }
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
    //const __ONSUBMIT = (__SUBMIT.length ? ' onKeyDown="' + __SUBMIT + '"': "");
    const __ONSUBMIT = (__SUBMIT ? ' onKeyDown="' + __SUBMIT + '"': "");
    const __FORMLABEL = getValue(__CONFIG.FormLabel, __CONFIG.Label);
    const __ELEMENTLABEL = '<label for="' + __NAME + '">' + __FORMLABEL + '</label>';
    const __ELEMENTTEXT = '<textarea name="' + __NAME + '" id="' + __NAME + '" cols="' + __CONFIG.Cols +
                           '" rows="' + __CONFIG.Rows + '"' + __ONSUBMIT + __ACTION + '>' +
                           safeStringify(__VALUE, __CONFIG.Replace, __CONFIG.Space) + '</textarea>';

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
            const __TDOPT = (~ __ELEMENT.indexOf('|')) ? "" : ' colspan="2"';

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
    __LOG[3]("buildForm()");

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

    __FORMS[anchor] = {
                          'Script' : script,
                          'Form'   : form
                      };

    anchor.innerHTML = __REST + script + form;
}

// ==================== Abschnitt fuer Klasse Classification ====================

// Basisklasse fuer eine Klassifikation der Optionen nach Kriterium (z.B. Erst- und Zweitteam oder Fremdteam)
function Classification() {
    'use strict';

    this.renameFun = prefixName;
    //this.renameParamFun = undefined;
    this.optSet = undefined;
    this.optSelect = { };
}

Class.define(Classification, Object, {
                    'renameOptions' : function() {
                                          const __PARAM = this.renameParamFun();

                                          if (__PARAM !== undefined) {
                                              // Klassifizierte Optionen umbenennen...
                                              renameOptions(this.optSet, this.optSelect, __PARAM, this.renameFun);
                                          }
                                      },
                    'deleteOptions' : function() {
                                          return deleteOptions(this.optSet, this.optSelect, true, true);
                                      }
                } );

// ==================== Ende Abschnitt fuer Klasse Classification ====================

// ==================== Abschnitt fuer Klasse TeamClassification ====================

// Klasse fuer die Klassifikation der Optionen nach Team (Erst- und Zweitteam oder Fremdteam)
function TeamClassification() {
    'use strict';

    Classification.call(this);

    this.team = undefined;
    this.teamParams = undefined;
}

Class.define(TeamClassification, Classification, {
                    'renameParamFun' : function() {
                                           const __MYTEAM = (this.team = getMyTeam(this.optSet, this.teamParams, this.team));

                                           if (__MYTEAM.LdNr) {
                                               // Prefix fuer die Optionen mit gesonderten Behandlung...
                                               return __MYTEAM.LdNr.toString() + '.' + __MYTEAM.LgNr.toString() + ':';
                                           } else {
                                               return undefined;
                                           }
                                       }
                } );

// ==================== Ende Abschnitt fuer Klasse TeamClassification ====================

// ==================== Abschnitt fuer Klasse Team ====================

// Klasse fuer Teamdaten
function Team(team, land, liga) {
    'use strict';

    this.Team = team;
    this.Land = land;
    this.Liga = liga;
    this.LdNr = getLandNr(land);
    this.LgNr = getLigaNr(liga);
}

Class.define(Team, Object, {
                    '__TEAMITEMS' : {   // Items, die in Team als Teamdaten gesetzt werden...
                                        'Team' : true,
                                        'Liga' : true,
                                        'Land' : true,
                                        'LdNr' : true,
                                        'LgNr' : true
                                    }
                } );

// ==================== Ende Abschnitt fuer Klasse Team ====================

// ==================== Spezialisierter Abschnitt fuer Optionen ====================

// Gesetzte Optionen (wird von initOptions() angelegt und von loadOptions() gefuellt):
const __OPTSET = { };

// Teamparameter fuer getrennte Speicherung der Optionen fuer Erst- und Zweitteam...
const __TEAMCLASS = new TeamClassification();

// Optionen mit Daten, die ZAT- und Team-bezogen gemerkt werden...
__TEAMCLASS.optSelect = {
                       'datenZat'   : true,
                       'birthdays'  : true,
                       'tClasses'   : true,
                       'progresses' : true,
                       'zatAges'    : true,
                       'trainiert'  : true,
                       'positions'  : true,
                       'skills'     : true
                   };

// Gibt die Teamdaten zurueck und aktualisiert sie ggfs. in der Option
// optSet: Platz fuer die gesetzten Optionen
// teamParams: Dynamisch ermittelte Teamdaten ('Team', 'Liga', 'Land', 'LdNr' und 'LgNr')
// myTeam: Objekt fuer die Teamdaten
// return Die Teamdaten oder undefined bei Fehler
function getMyTeam(optSet = undefined, teamParams = undefined, myTeam = new Team()) {
    if (teamParams !== undefined) {
        addProps(myTeam, teamParams, myTeam.__TEAMITEMS);
        __LOG[2]("Ermittelt: " + safeStringify(myTeam));
        // ... und abspeichern...
        setOpt(optSet.team, myTeam, false);
    } else {
        const __TEAM = getOptValue(optSet.team);  // Gespeicherte Parameter

        if ((__TEAM !== undefined) && (__TEAM.Land !== undefined)) {
            addProps(myTeam, __TEAM, myTeam.__TEAMITEMS);
            __LOG[2]("Gespeichert: " + safeStringify(myTeam));
        } else {
            __LOG[1]("Unbekannt: " + safeStringify(__TEAM));
        }
    }

    return myTeam;
}

// Behandelt die Optionen und laedt das Benutzermenu
// optConfig: Konfiguration der Optionen
// optSet: Platz fuer die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'hideMenu': Optionen werden zwar geladen und genutzt, tauchen aber nicht im Benutzermenu auf
// 'teamParams': Getrennte Daten-Option wird genutzt, hier: Team() mit 'LdNr'/'LgNr' des Erst- bzw. Zweitteams
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
// return Gefuelltes Objekt mit den gesetzten Optionen
function buildOptions(optConfig, optSet = undefined, optParams = { 'hideMenu' : false }) {
    // Klassifikation ueber Land und Liga des Teams...
    __TEAMCLASS.optSet = optSet;  // Classification mit optSet verknuepfen
    __TEAMCLASS.teamParams = optParams.teamParams;  // Ermittelte Parameter

    optSet = startOptions(optConfig, optSet, __TEAMCLASS);

    showOptions(optSet, optParams);

    return optSet;
}

// ==================== Ende Abschnitt fuer Optionen ====================

// ==================== Abschnitt genereller Code zur Anzeige der Jugend ====================

// Funktionen ***************************************************************************

// Erschafft die Spieler-Objekte und fuellt sie mit Werten
// reloadData: true = Teamuebersicht, false = Spielereinzelwerte
function init(playerRows, optSet, colIdx, offsetUpper = 1, offsetLower = 0, reloadData = false) {
    storePlayerDataFromHTML(playerRows, optSet, colIdx, offsetUpper, offsetLower, reloadData);

    const __SAISON = getOptValue(optSet.saison);
    const __CURRZAT = getOptValue(optSet.aktuellerZat);
    const __BIRTHDAYS = getOptValue(optSet.birthdays, []);
    const __TCLASSES = getOptValue(optSet.tClasses, []);
    const __PROGRESSES = getOptValue(optSet.progresses, []);
    const __ZATAGES = getOptValue(optSet.zatAges, []);
    const __TRAINIERT = getOptValue(optSet.trainiert, []);
    const __POSITIONS = getOptValue(optSet.positions, []);
    const __SKILLS = getOptValue(optSet.skills, []);
    const __PLAYERS = [];

    for (let i = offsetUpper, j = 0; i < playerRows.length - offsetLower; i++, j++) {
        const __CELLS = playerRows[i].cells;
        const __AGE = getIntFromHTML(__CELLS, colIdx.Age);
        const __ISGOALIE = isGoalieFromHTML(__CELLS, colIdx.Age);
        const __NEWPLAYER = new PlayerRecord(__AGE, getValue(__SKILLS[j], []), __ISGOALIE);

        __NEWPLAYER.initPlayer(__SAISON, __CURRZAT, __BIRTHDAYS[j], __TCLASSES[j], __PROGRESSES[j]);

        if (reloadData) {
            __NEWPLAYER.setZusatz(__ZATAGES[j], __TRAINIERT[j], __POSITIONS[j]);
        }

        __PLAYERS[j] = __NEWPLAYER;
    }

    if (! reloadData) {
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

        if (__ZUSATZ.zatAge !== undefined) {  // braucht Geburtstag fuer gueltige Werte!
            __ZATAGES[i]    = __ZUSATZ.zatAge;
        }
        __TRAINIERT[i]  = __ZUSATZ.trainiert;
        __POSITIONS[i]  = __ZUSATZ.bestPos;
    }

    setOpt(optSet.zatAges, __ZATAGES, false);
    setOpt(optSet.trainiert, __TRAINIERT, false);
    setOpt(optSet.positions, __POSITIONS, false);
}

// Ermittelt die Werte in den Spieler-Objekten aus den Daten der Seite und speichert diese
// reloadData: true = Teamuebersicht, false = Spielereinzelwerte
function storePlayerDataFromHTML(playerRows, optSet, colIdx, offsetUpper = 1, offsetLower = 0, reloadData = false) {
    if (reloadData) {
        const __BIRTHDAYS = [];
        const __TCLASSES = [];
        const __PROGRESSES = [];

        for (let i = offsetUpper, j = 0; i < playerRows.length - offsetLower; i++, j++) {
            const __CELLS = playerRows[i].cells;

            __BIRTHDAYS[j] = getIntFromHTML(__CELLS, colIdx.Geb);
            __TCLASSES[j] = getTalentFromHTML(__CELLS, colIdx.Tal);
            __PROGRESSES[j] = getAufwertFromHTML(__CELLS, colIdx.Auf, getOptValue(optSet.shortAufw, true));
        }
        setOpt(optSet.birthdays, __BIRTHDAYS, false);
        setOpt(optSet.tClasses, __TCLASSES, false);
        setOpt(optSet.progresses, __PROGRESSES, false);
    } else {
        const __SKILLS = [];

        for (let i = offsetUpper, j = 0; i < playerRows.length - offsetLower; i++, j++) {
            const __CELLS = playerRows[i].cells;

            __SKILLS[j] = getSkillsFromHTML(__CELLS, colIdx);
        }
        setOpt(optSet.skills, __SKILLS, false);
    }
}

// Trennt die Gruppen (z.B. Jahrgaenge) mit Linien
function separateGroups(rows, borderString, colIdxSort = 0, offsetUpper = 1, offsetLower = 0, offsetLeft = -1, offsetRight = 0, formatFun = sameValue) {
    if (offsetLeft < 0) {
        offsetLeft = colIdxSort;  // ab Sortierspalte
    }

    for (let i = offsetUpper, newVal, oldVal = formatFun(rows[i].cells[colIdxSort].textContent); i < rows.length - offsetLower - 1; i++, oldVal = newVal) {
        newVal = formatFun(rows[i + 1].cells[colIdxSort].textContent);
        if (newVal !== oldVal) {
            for (let j = offsetLeft; j < rows[i].cells.length - offsetRight; j++) {
                rows[i].cells[j].style.borderBottom = borderString;
            }
        }
    }
}

// Klasse ColumnManager *****************************************************************

function ColumnManager(optSet, colIdx, showCol) {
    'use strict';

    __LOG[3]("ColumnManager()");

    const __SHOWCOL = getValue(showCol, true);
    const __SHOWALL = ((__SHOWCOL === true) || (__SHOWCOL.Default === true));

    const __BIRTHDAYS = getOptValue(optSet.birthdays, []).length;
    const __TCLASSES = getOptValue(optSet.tClasses, []).length;
    const __PROGRESSES = getOptValue(optSet.progresses, []).length;

    const __ZATAGES = getOptValue(optSet.zatAges, []).length;
    const __TRAINIERT = getOptValue(optSet.trainiert, []).length;
    const __POSITIONS = getOptValue(optSet.positions, []).length;

    const __EINZELSKILLS = getOptValue(optSet.skills, []).length;
    const __PROJECTION = (__EINZELSKILLS && __ZATAGES);

    this.colIdx = colIdx;

    this.geb = (__BIRTHDAYS && getValue(__SHOWCOL.zeigeGeb, __SHOWALL) && getOptValue(optSet.zeigeGeb));
    this.tal = (__TCLASSES && getValue(__SHOWCOL.zeigeTal, __SHOWALL) && getOptValue(optSet.zeigeTal));
    this.quo = (__ZATAGES && __TRAINIERT && getValue(__SHOWCOL.zeigeQuote, __SHOWALL) && getOptValue(optSet.zeigeQuote));
    this.aufw = (__PROGRESSES && getValue(__SHOWCOL.zeigeAufw, __SHOWALL) && getOptValue(optSet.zeigeAufw));
    this.substAge = (__ZATAGES && getValue(__SHOWCOL.ersetzeAlter, __SHOWALL) && getOptValue(optSet.ersetzeAlter));
    this.alter = (__ZATAGES && getValue(__SHOWCOL.zeigeAlter, __SHOWALL) && getOptValue(optSet.zeigeAlter));
    this.fix = (__EINZELSKILLS && getValue(__SHOWCOL.zeigeFixSkills, __SHOWALL) && getOptValue(optSet.zeigeFixSkills));
    this.tr = (__EINZELSKILLS && __TRAINIERT && getValue(__SHOWCOL.zeigeTrainiert, __SHOWALL) && getOptValue(optSet.zeigeTrainiert));
    this.antHpt = (__EINZELSKILLS && getValue(__SHOWCOL.zeigeAnteilPri, __SHOWALL) && getOptValue(optSet.zeigeAnteilPri));
    this.antNeb = (__EINZELSKILLS && getValue(__SHOWCOL.zeigeAnteilSec, __SHOWALL) && getOptValue(optSet.zeigeAnteilSec));
    this.pri = (__EINZELSKILLS && getValue(__SHOWCOL.zeigePrios, __SHOWALL) && getOptValue(optSet.zeigePrios));
    this.skill = (__EINZELSKILLS && getValue(__SHOWCOL.zeigeSkill, __SHOWALL) && getOptValue(optSet.zeigeSkill));
    this.pos = (__EINZELSKILLS && __POSITIONS && getValue(__SHOWCOL.zeigePosition, __SHOWALL) && getOptValue(optSet.zeigePosition));
    this.anzOpti = ((__EINZELSKILLS && getValue(__SHOWCOL.zeigeOpti, __SHOWALL)) ? getOptValue(optSet.anzahlOpti) : 0);
    this.anzMw =  ((__PROJECTION && getValue(__SHOWCOL.zeigeMW, __SHOWALL)) ? getOptValue(optSet.anzahlMW) : 0);
    this.trE = (__PROJECTION && __TRAINIERT && getValue(__SHOWCOL.zeigeTrainiertEnde, __SHOWALL) && getOptValue(optSet.zeigeTrainiertEnde));
    this.antHptE = (__PROJECTION && getValue(__SHOWCOL.zeigeAnteilPriEnde, __SHOWALL) && getOptValue(optSet.zeigeAnteilPriEnde));
    this.antNebE = (__PROJECTION && getValue(__SHOWCOL.zeigeAnteilSecEnde, __SHOWALL) && getOptValue(optSet.zeigeAnteilSecEnde));
    this.priE = (__PROJECTION && getValue(__SHOWCOL.zeigePriosEnde, __SHOWALL) && getOptValue(optSet.zeigePriosEnde));
    this.skillE = (__PROJECTION && getValue(__SHOWCOL.zeigeSkillEnde, __SHOWALL) && getOptValue(optSet.zeigeSkillEnde));
    this.anzOptiE = ((__PROJECTION && getValue(__SHOWCOL.zeigeOptiEnde, __SHOWALL)) ? getOptValue(optSet.anzahlOptiEnde) : 0);
    this.anzMwE = ((__PROJECTION && getValue(__SHOWCOL.zeigeMWEnde, __SHOWALL)) ? getOptValue(optSet.anzahlMWEnde) : 0);
    this.kennzE = getOptValue(optSet.kennzeichenEnde);
}

Class.define(ColumnManager, Object, {
        'toString'       : function() {
                               let result = "Skillschnitt\t\t" + this.skill + '\n';
                               result += "Beste Position\t" + this.pos + '\n';
                               result += "Optis\t\t\t" + this.anzOpti + '\n';
                               result += "Marktwerte\t\t" + this.anzMw + '\n';
                               result += "Skillschnitt Ende\t" + this.skillE + '\n';
                               result += "Optis Ende\t\t" + this.anzOptiE + '\n';
                               result += "Marktwerte Ende\t" + this.anzMwE + '\n';

                               return result;
                           },
        'addCell'        : function(tableRow) {
                               tableRow.insertCell(-1);
                               return tableRow.cells.length - 1;
                           },
        'addAndFillCell' : function(tableRow, value, color, digits = 2) {
                               let text = value;

                               if (value && isFinite(value) && (value !== true) && (value !== false)) {
                                   // Zahl einfuegen
                                   if (value < 1000) {
                                       // Mit Nachkommastellen darstellen
                                       text = parseFloat(value).toFixed(digits);
                                   } else {
                                       // Mit Tausenderpunkten darstellen
                                       text = getNumberString(value.toString());
                                   }
                               }

                               // String, Boolean oder Zahl einfuegen...
                               tableRow.cells[this.addCell(tableRow)].textContent = text;
                               tableRow.cells[tableRow.cells.length - 1].style.color = color;
                           },
        'addTitles'      : function(headers, titleColor = "#FFFFFF") {
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
                               if (this.alter && ! this.substAge) {
                                   this.addAndFillCell(headers, "Alter", titleColor);
                               }
                               if (this.fix) {
                                   this.addAndFillCell(headers, "fix", titleColor);
                               }
                               if (this.tr) {
                                   this.addAndFillCell(headers, "tr.", titleColor);
                               }
                               if (this.antHpt) {
                                   this.addAndFillCell(headers, "%H", titleColor);
                               }
                               if (this.antNeb) {
                                   this.addAndFillCell(headers, "%N", titleColor);
                               }
                               if (this.pri) {
                                   this.addAndFillCell(headers, "Prios", titleColor);
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
                               if (this.trE) {
                                   this.addAndFillCell(headers, "tr." + this.kennzE, titleColor);
                               }
                               if (this.antHptE) {
                                   this.addAndFillCell(headers, "%H" + this.kennzE, titleColor);
                               }
                               if (this.antNebE) {
                                   this.addAndFillCell(headers, "%N" + this.kennzE, titleColor);
                               }
                               if (this.priE) {
                                   this.addAndFillCell(headers, "Prios" + this.kennzE, titleColor);
                               }
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
                           },  // Ende addTitles()
        'addValues'      : function(player, playerRow, color = "#FFFFFF") {
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
                               if (this.substAge) {
                                   convertStringFromHTML(playerRow.cells, this.colIdx.Age, function(unused) {
                                                                                               return parseFloat(player.getAge()).toFixed(2);
                                                                                           });
                               } else if (this.alter) {
                                   this.addAndFillCell(playerRow, player.getAge(), __COLOR, 2);
                               }
                               if (this.fix) {
                                   this.addAndFillCell(playerRow, player.getFixSkills(), __COLOR, 0);
                               }
                               if (this.tr) {
                                   this.addAndFillCell(playerRow, player.getTrainableSkills(), __COLOR, 0);
                               }
                               if (this.antHpt) {
                                   this.addAndFillCell(playerRow, player.getPriPercent(player.getPos()), __COLOR, 0);
                               }
                               if (this.antNeb) {
                                   this.addAndFillCell(playerRow, player.getSecPercent(player.getPos()), __COLOR, 0);
                               }
                               if (this.pri) {
                                   this.addAndFillCell(playerRow, player.getPrios(player.getPos()), __COLOR, 1);
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
                               if (this.trE) {
                                   this.addAndFillCell(playerRow, player.getTrainableSkills(player.__TIME.end), __COLOR, 1);
                               }
                               if (this.antHptE) {
                                   this.addAndFillCell(playerRow, player.getPriPercent(player.getPos(), player.__TIME.end), __COLOR, 0);
                               }
                               if (this.antNebE) {
                                   this.addAndFillCell(playerRow, player.getSecPercent(player.getPos(), player.__TIME.end), __COLOR, 0);
                               }
                               if (this.priE) {
                                   this.addAndFillCell(playerRow, player.getPrios(player.getPos(), player.__TIME.end), __COLOR, 1);
                               }
                               if (this.skillE) {
                                   this.addAndFillCell(playerRow, player.getSkill(player.__TIME.end), __COLOR, 2);
                               }
                               for (let i = 1; i <= 6; i++) {
                                   const __POSI = ((i === 1) ? player.getPos() : player.getPos(i));
                                   const __COLI = getColor(__POSI);

                                   if (i <= this.anzOptiE) {
                                       if ((i === 1) || ! player.isGoalie) {
                                           // Opti anzeigen
                                           this.addAndFillCell(playerRow, player.getOpti(__POSI, player.__TIME.end), __COLI, 2);
                                       } else {
                                           // TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
                                           this.addCell(playerRow);
                                       }
                                   }
                                   if (i <= this.anzMwE) {
                                       if ((i === 1) || ! player.isGoalie) {
                                           // MW anzeigen
                                           this.addAndFillCell(playerRow, player.getMarketValue(__POSI, player.__TIME.end), __COLI, 0);
                                       } else {
                                           // TOR, aber nicht bester MW -> nur Zelle hinzufuegen
                                           this.addCell(playerRow);
                                       }
                                   }
                               }
                           }  // Ende addValues(player, playerRow)
    } );

// Klasse PlayerRecord ******************************************************************

function PlayerRecord(age, skills, isGoalie) {
    'use strict';

    this.mwFormel = this.__MWFORMEL.S10;  // Neue Formel, genauer in initPlayer()

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
}

Class.define(PlayerRecord, Object, {
        '__TIME'                : {   // Zeitpunktangaben
                                      'cre' : 0,  // Jugendspieler angelegt (mit 12 Jahren)
                                      'beg' : 1,  // Jugendspieler darf trainieren (wird 13 Jahre alt)
                                      'now' : 2,  // Aktueller ZAT
                                      'end' : 3   // Jugendspieler wird Ende 18 gezogen (Geb. - 1 bzw. ZAT 71 fuer '?')
                                  },
        '__MWFORMEL'            : {   // Zu benutzende Marktwertformel
                                      'alt' : 0,  // Marktwertformel bis Saison 9 inklusive
                                      'S10' : 1   // Marktwertformel MW5 ab Saison 10
                                  },
        'toString'              : function() {
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
                                      result += "Skillschnitt\t" + this.getSkill(this.__TIME.end).toFixed(2) + '\n';
                                      result += "Optis und Marktwerte";

                                      for (let pos of this.positions) {
                                          result += "\n\t" + this.getPos()[i] + '\t';
                                          result += this.getOpti(pos, this.__TIME.end).toFixed(2) + '\t';
                                          result += getNumberString(this.getMarketValue(pos, this.__TIME.end).toString());
                                      }

                                      return result;
                                  },  // Ende this.toString()
        'initPlayer'            : function(saison, currZAT, gebZAT, tclass, progresses) {
                                      // Berechnet die Opti-Werte, sortiert das Positionsfeld und berechnet die Einzelskills mit Ende 18
                                      this.zatGeb = gebZAT;
                                      this.zatAge = this.calcZatAge(currZAT);
                                      this.talent = tclass;
                                      this.aufwert = progresses;
                                      this.mwFormel = ((saison < 10) ? this.__MWFORMEL.alt : this.__MWFORMEL.S10);

                                      const __POSREIHEN = [ "ABW", "DMI", "MIT", "OMI", "STU", "TOR" ];
                                      this.positions = [];
                                      for (let index = 0; index < __POSREIHEN.length; index++) {
                                          const __REIHE = __POSREIHEN[index];

                                          this.positions[index] = [ __REIHE, this.getOpti(__REIHE) ];
                                      }

                                      // Sortieren
                                      sortPositionArray(this.positions);

                                      // Einzelskills mit Ende 18 berechnen
                                      this.skillsEnd = [];

                                      const __ZATDONE = this.getZatDone();
                                      const __ZATTOGO = this.getZatDone(this.__TIME.end) - __ZATDONE;
                                      const __ADDRATIO = (__ZATDONE ? __ZATTOGO / __ZATDONE : 0);
                                      let addSkill = (__ADDRATIO ? __ADDRATIO * this.getTrainiert() : __ZATTOGO * (1 + this.talent / 3.6));

                                      for (let i in this.skills) {
                                          const __SKILL = this.skills[i];
                                          let progSkill = __SKILL;

                                          if (isTrainableSkill(i)) {
                                              // Auf ganze Zahl runden und parseInt(), da das sonst irgendwie als String interpretiert wird
                                              const __ADDSKILL = Math.min(getMulValue(__ADDRATIO, __SKILL, 0, NaN), 99 - progSkill);

                                              progSkill += __ADDSKILL;
                                              addSkill -= __ADDSKILL;
                                          }

                                          this.skillsEnd[i] = progSkill;
                                      }
                                      this.restEnd = addSkill;
                                  },  // Ende this.initPlayer()
        'setZusatz'             : function(zatAge, trainiert, bestPos) {
                                      // Setzt Nebenwerte fuer den Spieler (geht ohne initPlayer())
                                      this.zatAge = zatAge;
                                      this.trainiert = trainiert;
                                      this.bestPos = bestPos;
                                  },
        'calcZusatz'            : function() {
                                      // Ermittelt Nebenwerte fuer den Spieler und gibt sie alle zurueck (nach initPlayer())
                                      // this.zatAge und this.skills bereits in initPlayer() berechnet
                                      this.trainiert = this.getTrainiert(true);  // neu berechnet aus Skills
                                      this.bestPos = this.getPos(-1);  // hier: -1 explizit angeben, da neu ermittelt (this.bestPos noch nicht belegt)

                                      return {
                                                 'zatAge'     : this.zatAge,
                                                 'trainiert'  : this.trainiert,
                                                 'bestPos'    : this.bestPos
                                             };
                                  },
        'getGeb'                : function() {
                                      return (this.zatGeb < 0) ? '?' : this.zatGeb;
                                  },
        'calcZatAge'            : function(currZAT) {
                                      let zatAge;

                                      if (this.zatGeb !== undefined) {
                                          let ZATs = (this.age - ((currZAT < this.zatGeb) ? 12 : 13)) * 72;  // Basiszeit fuer die Jahre seit Jahrgang 13

                                          if (this.zatGeb < 0) {
                                              zatAge = ZATs + currZAT;  // Zaehlung begann Anfang der Saison (und der Geburtstag wird erst nach dem Ziehen bestimmt)
                                          } else {
                                              zatAge = ZATs + currZAT - this.zatGeb;  // Verschiebung relativ zum Geburtstag (von -zatGeb, ..., 0, ..., 71 - zatGeb)
                                          }
                                      }

                                      return zatAge;
                                  },
        'getZatAge'             : function(when = this.__TIME.now) {
                                      if (when === this.__TIME.end) {
                                          return (18 - 12) * 72 - 1;  // (max.) Trainings-ZATs bis Ende 18
                                      } else {
                                          return this.zatAge;
                                      }
                                  },
        'getZatDone'            : function(when = this.__TIME.now) {
                                      return Math.max(0, this.getZatAge(when));
                                  },
        'getAge'                : function(when = this.__TIME.now) {
                                      if (this.mwFormel === this.__MWFORMEL.alt) {
                                          return (when === this.__TIME.end) ? 18 : this.age;
                                      } else {  // Geburtstage ab Saison 10...
                                          return (13.00 + this.getZatAge(when) / 72);
                                      }
                                  },
        'getTrainiert'          : function(recalc = false) {
                                      if (recalc || (this.trainiert === undefined)) {
                                          return this.getTrainableSkills();
                                      } else {
                                          return this.trainiert;
                                      }
                                  },
        'getAufwertungsSchnitt' : function() {
                                      return parseFloat(this.getTrainiert() / this.getZatDone());
                                  },
        'getPos'                : function(idx = undefined) {
                                      const __IDXOFFSET = 1;

                                      switch (getValue(idx, 0)) {
                                      case -1 : return (this.bestPos = this.positions[this.isGoalie ? 5 : 0][0]);
                                      case  0 : return this.bestPos;
                                      default : return this.positions[idx - __IDXOFFSET][0];
                                      }
                                  },
        'getTalent'             : function() {
                                      return (this.talent < 0) ? "wenig" : (this.talent > 0) ? "hoch" : "normal";
                                  },
        'getAufwert'            : function() {
                                      return this.aufwert;
                                  },
        'getSkillSum'           : function(when = this.__TIME.now, idxSkills = undefined, restRate = 15) {
                                      let cachedItem;

                                      if (idxSkills === undefined) {  // Gesamtsumme ueber alle Skills wird gecached...
                                          cachedItem = ((when === this.__TIME.end) ? 'skillSumEnd' : 'skillSum');

                                          const __CACHED = this[cachedItem];

                                          if (__CACHED !== undefined) {
                                              return __CACHED;
                                          }

                                          idxSkills = getIdxAllSkills();
                                      }

                                      const __SKILLS = ((when === this.__TIME.end) ? this.skillsEnd : this.skills);
                                      let sumSkills = (when === this.__TIME.end) ? (restRate / 15) * this.restEnd : 0;

                                      for (let idx of idxSkills) {
                                          sumSkills += __SKILLS[idx];
                                      }

                                      if (cachedItem !== undefined) {
                                          this[cachedItem] = sumSkills;
                                      }

                                      return sumSkills;
                                  },
        'getSkill'              : function(when = this.__TIME.now) {
                                      return this.getSkillSum(when) / 17;
                                  },
        'getOpti'               : function(pos, when = this.__TIME.now) {
                                      const __SUMALLSKILLS = this.getSkillSum(when);
                                      const __SUMPRISKILLS = this.getSkillSum(when, getIdxPriSkills(pos), 2 * 4);

                                      return (4 * __SUMPRISKILLS + __SUMALLSKILLS) / 27;
                                  },
        'getPrios'              : function(pos, when = this.__TIME.now) {
                                      return this.getSkillSum(when, getIdxPriSkills(pos), 2 * 4) / 4;
                                  },
        'getPriPercent'         : function(pos, when = this.__TIME.now) {
                                      const __SUMPRISKILLS = this.getSkillSum(when, getIdxPriSkills(pos), 2 * 4);
                                      const __SUMSECSKILLS = this.getSkillSum(when, getIdxSecSkills(pos), 7);

                                      return (100 * __SUMPRISKILLS) / (__SUMPRISKILLS + __SUMSECSKILLS);
                                  },
        'getSecPercent'         : function(pos, when = this.__TIME.now) {
                                      const __SUMPRISKILLS = this.getSkillSum(when, getIdxPriSkills(pos), 2 * 4);
                                      const __SUMSECSKILLS = this.getSkillSum(when, getIdxSecSkills(pos), 7);

                                      return (100 * __SUMSECSKILLS) / (__SUMPRISKILLS + __SUMSECSKILLS);
                                  },
        'getTrainableSkills'    : function(when = this.__TIME.now) {
                                      return this.getSkillSum(when, getIdxTrainableSkills());
                                  },
        'getFixSkills'          : function() {
                                      return this.getSkillSum(this.__TIME.now, getIdxFixSkills());
                                  },
        'getMarketValue'        : function(pos, when = this.__TIME.now) {
                                      const __AGE = this.getAge(when);

                                      if (this.mwFormel === this.__MWFORMEL.alt) {
                                          return Math.round(Math.pow((1 + this.getSkill(when)/100) * (1 + this.getOpti(pos, when)/100) * (2 - __AGE/100), 10) * 2);    // Alte Formel bis Saison 9
                                      } else {  // MW-Formel ab Saison 10...
                                          const __MW5TF = 1.00;  // Zwischen 0.97 und 1.03

                                          return Math.round(Math.pow(1 + this.getSkill(when)/100, 5.65) * Math.pow(1 + this.getOpti(pos, when)/100, 8.1) * Math.pow(1 + (100 - __AGE)/49, 10) * __MW5TF);
                                      }
                                  }
    } );

// Funktionen fuer die HTML-Seite *******************************************************

// Liest eine Zahl aus der Spalte einer Zeile der Tabelle aus (z.B. Alter, Geburtsdatum)
// cells: Die Zellen einer Zeile
// colIdxInt: Spaltenindex der gesuchten Werte
// return Spalteneintrag als Zahl (-1 fuer "keine Zahl", undefined fuer "nicht gefunden")
function getIntFromHTML(cells, colIdxInt) {
    const __CELL = getValue(cells[colIdxInt], { });
    const __TEXT = __CELL.textContent;

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
    const __CELL = getValue(cells[colIdxFloat], { });
    const __TEXT = __CELL.textContent;

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
    const __CELL = getValue(cells[colIdxStr], { });
    const __TEXT = __CELL.textContent;

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
// cells: Die Zellen einer Zeile
// colIdxClass: Spaltenindex einer fuer TOR eingefaerbten Zelle
// return Angabe, der Spieler Torwart oder Feldspieler ist
function isGoalieFromHTML(cells, colIdxClass) {
    return (cells[colIdxClass].className === "TOR");
}

// Liest einen String aus der Spalte einer Zeile der Tabelle aus, nachdem dieser konvertiert wurde
// cells: Die Zellen einer Zeile
// colIdxStr: Spaltenindex der gesuchten Werte
// convertFun: Funktion, die den Wert konvertiert
// return Spalteneintrag als String ("" fuer "nicht gefunden")
function convertStringFromHTML(cells, colIdxStr, convertFun = sameValue) {
    const __CELL = getValue(cells[colIdxStr], { });
    const __TEXT = convertFun(__CELL.textContent, __CELL);

    if (__TEXT !== undefined) {
        __CELL.innerHTML = __TEXT;
    }

    return getValue(__TEXT.toString(), "");
}

// Konvertiert den Aufwertungstext einer Zelle auf der Jugend-Teamuebersicht
// value: Der Inhalt dieser Zeile ("+1 SKI +1 OPT" bzw. "+2 SKI)
// cell: Zelle, in der der Text stand (optional)
// return Der konvertierte String ("SKI OPT" bzw. "SKI SKI")
function convertAufwertung(value, cell = undefined) {
    if (value !== undefined) {
        value = value.replace(/\+2 (\w+)/, "$1 $1").replace(/\+1 /g, "");

        if (cell && (cell.className === "TOR")) {
            value = convertGoalieSkill(value);
        }
    }

    return value;
}

// Konvertiert die allgemeinen Skills in die eines Torwarts
// value: Ein Text, der die Skillnamen enthaelt
// return Der konvertierte String mit Aenderungen (z.B. "FAN" statt "KOB") oder unveraendert
function convertGoalieSkill(value) {
    if (value !== undefined) {
        value = value.replace(/\w+/g, getGoalieSkill);
    }

    return value;
}

// Konvertiert einen Aufwertungstext fuer einen Skillnamen in den fuer einen Torwart
// name: Allgemeiner Skillname (abgeleitet von den Feldspielern)
// return Der konvertierte String (z.B. "FAN" statt "KOB") oder unveraendert
function getGoalieSkill(name) {
    const __GOALIESKILLS = {
                               'SCH' : 'ABS',
                               'BAK' : 'STS',
                               'KOB' : 'FAN',
                               'ZWK' : 'STB',
                               'DEC' : 'SPL',
                               'GES' : 'REF'
                           };

    return getValue(__GOALIESKILLS[name], name);
}

// Liest die Aufwertungen eines Spielers aus und konvertiert je nachdem, ob der Spieler Torwart oder Feldspieler ist
// cells: Die Zellen einer Zeile
// colIdxAuf: Spaltenindex der gesuchten Aufwertungen
// shortForm: true = abgekuerzt, false = Originalform
// return Konvertierte Aufwertungen (kurze oder lange Form, aber in jedem Fall fuer Torwart konvertiert)
function getAufwertFromHTML(cells, colIdxAuf, shortForm = true) {
    const __ISGOALIE = isGoalieFromHTML(cells, colIdxAuf);
    const __TEXT = convertStringFromHTML(cells, colIdxAuf, (shortForm ? convertAufwertung : __ISGOALIE ? convertGoalieSkill : undefined));

    return (__ISGOALIE ? __TEXT.replace(/\w+/g, getGoalieSkill) : __TEXT);
}

// Identitaetsfunktion. Konvertiert nichts, sondern liefert einfach den Wert zurueck
// value: Der uebergebene Wert
// return Derselbe Wert
function sameValue(value) {
    return value;
}

// Liefert den ganzzeiligen Anteil einer Zahl zurueck, indem alles hinter einem Punkt abgeschnitten wird
// value: Eine uebergebene Dezimalzahl
// return Der ganzzeilige Anteil dieser Zahl
function floorValue(value, dot = '.') {
    const __INDEXDOT = (value ? value.indexOf(dot) : -1);

    return ((~ __INDEXDOT) ? value.substring(0, __INDEXDOT) : value);
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
    const __TRAINABLESKILLS = getIdxTrainableSkills();
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

// Gibt die Indizes aller Skills zurueck
function getIdxAllSkills() {
    return [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
}

// Gibt die Indizes der trainierbaren Skills zurueck
function getIdxTrainableSkills() {
    return [ 0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 15 ];
}

// Gibt die Indizes der Fixskills zurueck
function getIdxFixSkills() {
    return [ 6, 7, 12, 13, 14, 16 ];
}

// Gibt die Indizes der Primaerskills zurueck
function getIdxPriSkills(pos) {
    switch (pos) {
        case "TOR" : return [ 2, 3, 4, 5 ];
        case "ABW" : return [ 2, 3, 4, 15 ];
        case "DMI" : return [ 1, 4, 9, 11 ];
        case "MIT" : return [ 1, 3, 9, 11 ];
        case "OMI" : return [ 1, 5, 9, 11 ];
        case "STU" : return [ 0, 2, 3, 5 ];
        default :    return [];
    }
}

// Gibt die Indizes der (trainierbaren) Sekundaerskills zurueck
function getIdxSecSkills(pos) {
    switch (pos) {
        case "TOR" : return [ 0, 1, 8, 9, 10, 11, 15 ];
        case "ABW" : return [ 0, 1, 5, 8, 9, 10, 11 ];
        case "DMI" : return [ 0, 2, 3, 5, 8, 10, 15 ];
        case "MIT" : return [ 0, 2, 4, 5, 8, 10, 15 ];
        case "OMI" : return [ 0, 2, 3, 4, 8, 10, 15 ];
        case "STU" : return [ 1, 4, 8, 9, 10, 11, 15 ];
        default :    return [];
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
        default :    return "";
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
    const __TEAMCELLSTR  = (table === undefined) ? "" : table.rows[__TEAMCELLROW].cells[__TEAMCELLCOL].innerHTML;
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

    let land = (~ __INDEXLIGA) ? teamParams.substring(__INDEXLIGA + __SEARCHLIGA.length) : undefined;
    const __TEAMNAME = (~ __INDEXMIDDLE) ? teamParams.substring(0, __INDEXMIDDLE) : undefined;
    let liga = ((~ __INDEXLIGA) && (~ __INDEXMIDDLE)) ? teamParams.substring(__INDEXMIDDLE + __SEARCHMIDDLE.length) : undefined;

    if (land !== undefined) {
        if (land.charAt(2) === ' ') {    // Land z.B. hinter "2. Liga A " statt "1. Liga "
            land = land.substr(2);
        }
        if (liga !== undefined) {
            liga = liga.substring(0, liga.length - land.length);
        }
        const __INDEXLAND = land.indexOf(__SEARCHLAND);
        if (~ __INDEXLAND) {
            land = land.substr(__INDEXLAND + __SEARCHLAND.length);
        }
    }

    const __TEAM = new Team(__TEAMNAME, land, liga);

    return __TEAM;
}

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url: Adresse der Seite
// leafs: Liste von Filenamen mit der Default-Seitennummer (falls Query-Parameter nicht gefunden)
// item: Query-Parameter, der die Nummer der Unterseite angibt
// return Parameter aus der URL der Seite als Nummer
function getPageIdFromURL(url, leafs, item = "page") {
    const __URI = new URI(url);
    const __LEAF = __URI.getLeaf();

    for (let leaf in leafs) {
        if (__LEAF === leaf) {
            const __DEFAULT = leafs[leaf];

            return getValue(__URI.getQueryPar(item), __DEFAULT);
        }
    }

    return -1;
}

// Gibt die laufende Nummer des ZATs im Text einer Zelle zurueck
// cell: Tabellenzelle mit der ZAT-Nummer im Text
// return ZAT-Nummer im Text
function getZATNrFromCell(cell) {
    const __TEXT = ((cell === undefined) ? [] : cell.textContent.split(' '));
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

    const __ZATCELL = getProp(getProp(getRows(0), 2), 'cells', { })[0];
    const __NEXTZAT = getZATNrFromCell(__ZATCELL);  // "Der naechste ZAT ist ZAT xx und ..."
    const __CURRZAT = __NEXTZAT - 1;
    const __DATAZAT = getOptValue(__OPTSET.datenZat);

    if (__CURRZAT >= 0) {
        __LOG[2]("Aktueller ZAT: " + __CURRZAT);

        // Neuen aktuellen ZAT speichern...
        setOpt(__OPTSET.aktuellerZat, __CURRZAT, false);

        if (__CURRZAT !== __DATAZAT) {
            __LOG[2](__LOG.changed(__DATAZAT, __CURRZAT));

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
        __LOG[2]("Ziehen-Seite");
    } else if (getRows(1) === undefined) {
        __LOG[2]("Diese Seite ist ohne Team nicht verf\xFCgbar!");
    } else {
        buildOptions(__OPTCONFIG, __OPTSET, {
                         'menuAnchor' : getTable(0, "div"),
                         'showForm'   : {
                                            'kennzeichenEnde'    : true,
                                            'shortAufw'          : true,
                                            'sepStyle'           : true,
                                            'sepColor'           : true,
                                            'sepWidth'           : true,
                                            'saison'             : true,
                                            'aktuellerZat'       : true,
                                            'team'               : true,
                                            'ersetzeAlter'       : true,
                                            'zeigeAlter'         : true,
                                            'zeigeQuote'         : true,
                                            'zeigePosition'      : true,
                                            'zeigeFixSkills'     : true,
                                            'zeigeTrainiert'     : true,
                                            'zeigeAnteilPri'     : true,
                                            'zeigeAnteilSec'     : true,
                                            'zeigePrios'         : true,
                                            'zeigeSkill'         : true,
                                            'anzahlOpti'         : true,
                                            'anzahlMW'           : true,
                                            'zeigeTrainiertEnde' : true,
                                            'zeigeAnteilPriEnde' : true,
                                            'zeigeAnteilSecEnde' : true,
                                            'zeigePriosEnde'     : true,
                                            'zeigeSkillEnde'     : true,
                                            'anzahlOptiEnde'     : true,
                                            'anzahlMWEnde'       : true,
                                            'zatAges'            : true,
                                            'trainiert'          : true,
                                            'positions'          : true,
                                            'skills'             : true,
                                            'reset'              : true,
                                            'showForm'           : true
                                        },
                         'formWidth'  : 1
                     });

        const __ROWS = getRows(1);
        const __HEADERS = __ROWS[0];
        const __TITLECOLOR = getColor("LEI");  // "#FFFFFF"

        const __PLAYERS = init(__ROWS, __OPTSET, __COLUMNINDEX, __ROWOFFSETUPPER, __ROWOFFSETLOWER, true);
        const __COLMAN = new ColumnManager(__OPTSET, __COLUMNINDEX, {
                                            'Default'            : true,
                                            'zeigeGeb'           : false,
                                            'zeigeSkill'         : false,
                                            'zeigeTal'           : false,
                                            'zeigeAufw'          : false
                                        });

        __COLMAN.addTitles(__HEADERS, __TITLECOLOR);

        for (let i = 0; i < __PLAYERS.length; i++) {
            __COLMAN.addValues(__PLAYERS[i], __ROWS[i + __ROWOFFSETUPPER], __TITLECOLOR);
        }

        // Format der Trennlinie zwischen den Monaten...
        const __BORDERSTRING = getOptValue(__OPTSET.sepStyle) + ' ' + getOptValue(__OPTSET.sepColor) + ' ' + getOptValue(__OPTSET.sepWidth);

        separateGroups(__ROWS, __BORDERSTRING, __COLUMNINDEX.Age, __ROWOFFSETUPPER, __ROWOFFSETLOWER, -1, 0, floorValue);
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
        __LOG[2]("Diese Seite ist ohne Team nicht verf\xFCgbar!");
    } else {
        buildOptions(__OPTCONFIG, __OPTSET, {
                         'menuAnchor' : getTable(0, "div"),
                         'hideForm'   : {
                                            'zatAges'       : true,
                                            'trainiert'     : true,
                                            'positions'     : true,
                                            'skills'        : true,
                                            'shortAufw'     : true
                                        },
                         'formWidth'  : 1
                     });

        const __ROWS = getRows(1);
        const __HEADERS = __ROWS[0];
        const __TITLECOLOR = getColor("LEI");  // "#FFFFFF"

        const __PLAYERS = init(__ROWS, __OPTSET, __COLUMNINDEX, __ROWOFFSETUPPER, __ROWOFFSETLOWER, false);
        const __COLMAN = new ColumnManager(__OPTSET, __COLUMNINDEX, true);

        __COLMAN.addTitles(__HEADERS, __TITLECOLOR);

        for (let i = 0; i < __PLAYERS.length; i++) {
            __COLMAN.addValues(__PLAYERS[i], __ROWS[i + __ROWOFFSETUPPER], __TITLECOLOR);
        }

        // Format der Trennlinie zwischen den Monaten...
        const __BORDERSTRING = getOptValue(__OPTSET.sepStyle) + ' ' + getOptValue(__OPTSET.sepColor) + ' ' + getOptValue(__OPTSET.sepWidth);

        separateGroups(__ROWS, __BORDERSTRING, __COLUMNINDEX.Age, __ROWOFFSETUPPER, __ROWOFFSETLOWER, -1, 0, floorValue);
    }
}

try {
    // URL-Legende:
    // page=0: Managerbuero
    // page=1: Teamuebersicht
    // page=2: Spielereinzelwerte

    // Verzweige in unterschiedliche Verarbeitungen je nach Wert von page:
    switch (getPageIdFromURL(window.location.href, {
                                                       'haupt.php' : 0,  // Ansicht "Haupt" (Managerbuero)
                                                       'ju.php'    : 1   // Ansicht "Jugendteam"
                                                   }, 'page')) {
        case 0  : procHaupt(); break;
        case 1  : procTeamuebersicht(); break;
        case 2  : procSpielereinzelwerte(); break;
        default : break;
    }
} catch (ex) {
    showAlert('[' + ex.lineNumber + "] " + __DBMOD.Name, ex.message, ex);
} finally {
    __LOG[2]("SCRIPT END");
}

// *** EOF ***
