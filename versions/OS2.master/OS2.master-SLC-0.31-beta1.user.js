// ==UserScript==
// @name         OS2.master
// @namespace    http://os.ongapo.com/
// @version      0.31beta1
// @copyright    2013+
// @author       Sven Loges (SLC) / Andreas Eckes (Strindheim BK)
// @description  Master-Script fuer Online Soccer 2.0
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/sp\.php\?s=\d+$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/st\.php\?(s=\d+&)?c=\d+$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/showteam\.php(\?s=\d+)?$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/tplatz\.php\?t=\d+$/
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// Script wird angewendet auf
// - Spielerprofil
// - Teamansicht in Popupfenster
// - Teamansicht in Hauptfenster

// URL-Legende:
// .../showteam.php?s=_Eigenes Team (Browser-Hauptfenster)
// .../st.php?s=_&c=_Beliebiges Team (Popup-Fenster)
// .../sp.php?s=_Spielerprofil
// .../tplatz.php?t=_Tabellenplaetze
// sSeitenindex / Spielerindex (im Spielerprofil)
// c, tTeamindex
// s=0Teamuebersicht
// s=1Vertragsdaten
// s=2Einzelwerte
// s=3Statistik Saison
// s=4Statistik Gesamt
// s=5Teaminfo
// s=6Saisonplan
// s=7Vereinshistorie
// s=8Transferhistorie
// s=9Leihhistorie

// HTML-Element-IDs im Spielerprofil:
// "te"Ueberschriftszeile
// "a"Spielerdaten
// "c"Transferhistorie
// "d"Leihhistorie
// "e"Spielerhistorie

const __LOGLEVEL = 3;

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
                                for (let level = 0; level < this.logFun.length; level++) {
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

// Speichert einen beliebiegen (strukturierten) Wert unter einem Namen ab
// name: GM.setValue-Name, unter dem die Daten gespeichert werden
// value: Beliebiger (strukturierter) Wert
// return String-Darstellung des Wertes
function serialize(name, value) {
    const __STREAM = ((value !== undefined) ? safeStringify(value) : value);

    __LOG[4](name + " >> " + __STREAM);

    GM.setValue(name, __STREAM);

    return __STREAM;
}

// Holt einen beliebiegen (strukturierter) Wert unter einem Namen zurueck
// name: GM.setValue-Name, unter dem die Daten gespeichert werden
// defValue: Default-Wert fuer den Fall, dass nichts gespeichert ist
// return Promise fuer das Objekt, das unter dem Namen gespeichert war
function deserialize(name, defValue = undefined) {
    return GM.getValue(name).then(stream => {
            __LOG[4](name + " << " + stream);

            if (stream && stream.length) {
                return JSON.parse(stream);
            } else {
                return defValue;
            }
        }, ex => {
            __LOG[1](name + ": " + ex.message);
        });
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

// Variablen zur Identifikation der Seite
var sp = false;// Spielerprofil
var st = false;// Teamansicht Popupfenster
var showteam = false;// Teamansicht Hauptfenster
var guessFIT = !true;// Fitness anhand der Einsaetze vermuten
mulTOR = 5;// Multiplikator im Score fuer TOR; Feldspieler haben Gewicht 1
var s = -1;// Seitenindex

url = window.location.href;
osBlau = "#111166";
borderString = "solid white 1px";
playerProfileWindowOffsetY = 80;

// Tabellen fuer Spielertalent...
const trainierb = new Array(0,1,2,3,4,5,8,9,10,11,15); // Indizes der trainierbaren Skills
const dauer = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,59,60,62,63,65,66,68,70,71,73,75,77,79,82,84,87,89,92,95,98,101,104,108,112,116,120,125,130,136,142,148,155,163,171,181,192,205,220,238,261,292,340);
const tage = new Array(-1505,-1426,-1346,-1267,-1188,-1109,-1030,-950,-871,-792,-713,-634,-554,-475,-396,-317,-238,-158,-79,0,72,138,198,254,304,350,392,431,465,497,526,551,575,596,615,632,648,662,674,685);
const faktor = new Array(110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,100,92,84,77,70,64,58,53,48,44,40,36,33,29,26,24,21,19,17,15,14);

var prec = 1;
prec0 = 0;
prec1 = 1;
prec2 = 2;

colIdxAlter = 3;
colIdxPos = 4;
colIdxAuf = 5;
var colIdxMOR = 0;
var colIdxFIT = 0;
var colIdxSkill = 9;
var colIdxOpti = 10;
var colIdxVerl = 13;
var teamID = 0;

// Seite ermitteln
if (url.match(/sp\.php/)) { sp = true; }
if (url.match(/st\.php/)) { st = true; }
if (url.match(/\/www\./)) { guessFIT = false; }
if (url.match(/showteam\.php/)) {
    showteam = true;
//  colIdxMOR = 9;
//  colIdxFIT = 10;
    colIdxSkill += 2;
    colIdxOpti += 2;
    colIdxVerl += 2;
} else {
    teamID = Number(url.replace(/^.*c=(\d+).*$/, "$1"));
}

// Wenn nicht Spielerprofil, dann Wert von s (Seitenindex) ermitteln
if (! sp) {
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "s=" und ggf. von "&"
    var indexS = url.lastIndexOf("s=");
    if (indexS < 0) {
        s = 0;
    } else if (showteam) {
        // Wert von s setzt sich aus allen Zeichen hinter "s=" zusammen
        s = parseInt(url.substring(indexS + 2, url.length));
    } else {
        // Wert von s setzt sich aus allen Zeichen zwischen "s=" und "&" zusammen
        var indexAmpersand = url.lastIndexOf("&");
        s = parseInt(url.substring(indexS + 2, indexAmpersand));
    }
    // Verzweige in unterschiedliche Verarbeitungen je nach Wert von s:
    switch (s) {
        case 0: procOverview(); break;
        case 2: procSingleValues(); break;
        case 3: procStatistics(); break;
        case 4: procStatistics(); break;
        case 7: procClubHistory(); break;
    }
} else {
    // Es handelt sich um das Spielerprofil:
    procPlayerData();
    procPlayerHistory();
}

// Verarbeitet Spielerprofil "Spielerdaten"
function procPlayerData() {
    var tdTags = document.getElementsByTagName("td");// Liste aller "td"-Tags
    var tdIndexPos = 14;// Index des td-Tags der Position
    var pos = tdTags[tdIndexPos].textContent;// Position des Spielers
    var priSkills = getArrayPositionOfSkillsOnDetailsPage(pos);// Liste der Indizes der Primaerskills

    for (var i = 0; i < priSkills.length; i++) {
        tdTags[priSkills[i]].style.color = getColor(pos);
        tdTags[priSkills[i]].style.fontWeight = 'bold';
    }
}

// Verarbeitet Spielerprofil "Spielerhistorie"
function procPlayerHistory() {
    // Spielerdaten sind in der ersten Tabelle im HTML-Element mit ID "e":
    separateSeasons(document.getElementById("e").getElementsByTagName("table")[0], 1, 1, 5);
}

// Verarbeitet Spielerprofil "Teamuebersicht"
function procOverview() {
    var playerTable = document.getElementById("team");
    var team = new Array();
    var einzel = new Array();
    var ausfall = new Array();
    var rowOffsetUpper = 1;
    var rowOffsetLower = 1;
    var colWidth = 40;
    var showScore = true;

    // Ueberschriften hinzufuegen
    var titleRow = playerTable.rows[rowOffsetUpper - 1];
    var title2Row = playerTable.rows[playerTable.rows.length - rowOffsetLower];

    var orgLength = titleRow.cells.length;
    appendCell(titleRow, "Prios");
    if (showScore) {
        appendCell(titleRow, "Score");
    }
    appendCell(titleRow, "Team");

    appendCell(title2Row, "Prios");
    if (showScore) {
        appendCell(title2Row, "Score");
    }
    appendCell(title2Row, "Team");

    // Breite und Sortierung der neuen Spalten festlegen
    for (var i = orgLength + 1; i < titleRow.cells.length; i++) {
        var txt = titleRow.cells[i].textContent;
        titleRow.cells[i].setAttribute("width", colWidth, false);
            titleRow.cells[i].innerHTML = '<a href="#" class="sortheader" onclick="ts_resortTable(this);return false;">'+txt+'<span class="sortarrow"</span></a>';
            title2Row.cells[i] = titleRow.cells[i];
    }

    var currentRow;
    var prio;
    var color;
    var pos;
    for (var i = rowOffsetUpper; i < playerTable.rows.length - rowOffsetLower; i++) {
        currentRow = playerTable.rows[i];
        prio = getPrio(currentRow);
        pos = getPos(currentRow);
        color = getColor(pos);
        appendCell(currentRow, prio.toFixed(prec), color);
        if ((getPosId(pos) >= 0) && (getFIT(currentRow) >= 10)) {
            einzel.push(i);
        } else {
            ausfall.push(i);
        }
    }

    var score = new Array();
    var teamFIT = new Array();
    var teamMOR = new Array();
    var teamSkill = new Array();
    var teamOpti = new Array();
    var teamPrio = new Array();
    var teamAlter = new Array();
    var teamScore = new Array();
    for (var i = rowOffsetUpper; i < playerTable.rows.length - rowOffsetLower; i++) {
        currentRow = playerTable.rows[i];
        score[i] = getArrayPosSkills(currentRow);
        if (showScore) {
            pos = getPos(currentRow);
            var posId = getPosId(pos);
            var val = (posId == -1) ? 0 : score[i][posId];
            color = getColor(pos);
            appendCell(currentRow, val.toFixed(prec0), color);
        }
    }
    while (einzel.length > 0) {
        var elf = getBestTeam(score, einzel);
        team.push(elf);
    }
    for (var i = 0; i < team.length; i++) {
        var teamName = getTeamName(i);
        var anz = team[i][0].length;
        var muls = 0;
        var sumFIT = 0;
        var sumMOR = 0;
        var sumSkill = 0.0;
        var sumOpti = 0.0;
        var sumPrio = 0.0;
        var sumAlter = 0;
        var sumScore = 0.0;
        for (var j = 0; j < anz; j++) {
            mul = (j == 0) ? mulTOR : 1;    // TOR wird besser gewichtet
            muls += mul;
            var index = team[i][0][j];
            currentRow = playerTable.rows[index];
            sumFIT += getFIT(currentRow);
            sumMOR += getMOR(currentRow);
            sumSkill += getSkill(currentRow);
            sumOpti += getOpti(currentRow);
            sumPrio += getPrio(currentRow);
            sumAlter += getAlter(currentRow);
            sumScore += mul * team[i][2][j];
            pos = getPos(currentRow);
            color = getColor(pos);
            appendCell(currentRow, teamName, color);
        }
        teamFIT.push(sumFIT / anz);
        teamMOR.push(sumMOR / anz);
        teamSkill.push(sumSkill / anz);
        teamOpti.push(sumOpti / anz);
        teamPrio.push(sumPrio / anz);
        teamAlter.push(sumAlter / anz);
        teamScore.push(sumScore / muls);
    }
    for (var i = 0; i < ausfall.length; i++) {
        var teamName = getTeamName();  // "|-----|"
        var index = ausfall[i];
        currentRow = playerTable.rows[index];
        pos = getPos(currentRow);
        color = getColor(pos);
        appendCell(currentRow, teamName, color);
    }

    var parentTable = document.getElementsByTagName("table")[2];
    var table = document.createElement("table");
    var body = document.createElement("tbody");
    table.appendChild(body);
    table.setAttribute("ID", "teamstats");
    parentTable.parentNode.insertBefore(table, parentTable);

    var row = table.insertRow(-1);
    color = "#00FF00";
    appendCell(row, "Team", color);
    appendCell(row, "#", color);
    appendCell(row, "Skill", color);
    appendCell(row, "Opti", color);
    appendCell(row, "Prios", color);
    appendCell(row, "Score", color);
    appendCell(row, "Alter", color);
    if ((colIdxFIT != 0) || guessFIT) {
        appendCell(row, "FIT", color);
    }
    if (colIdxMOR != 0) {
        appendCell(row, "MOR", color);
    }
    color = "#FFFF00";
    for (var i = 0; i < team.length; i++) {
        var teamName = getTeamName(i);
        if (team[i][0].length < 11) {
            color = "#00FF00";
        }
        row = table.insertRow(-1);
        appendCell(row, teamName, color);
        appendCell(row, team[i][0].length, color);
        appendCell(row, teamSkill[i].toFixed(prec2), color);
        appendCell(row, teamOpti[i].toFixed(prec2), color);
        appendCell(row, teamPrio[i].toFixed(prec1), color);
        appendCell(row, teamScore[i].toFixed(prec0), color);
        appendCell(row, teamAlter[i].toFixed(prec2), color);
        if ((colIdxFIT != 0) || guessFIT) {
            appendCell(row, teamFIT[i].toFixed(prec1), color);
        }
        if (colIdxMOR != 0) {
            appendCell(row, teamMOR[i].toFixed(prec1), color);
        }
    }

    deserialize('optis', []).then(optis => {
            return deserialize('scores', []).then(scores => {
                    optis[teamID] = Number(teamOpti[0].toFixed(prec2));
                    scores[teamID] = Number(teamScore[0].toFixed(prec0));
                    __LOG[3]("TeamID: " + teamID + "\tOpti: " + optis[teamID] + "\tScore: " + scores[teamID]);
                    __LOG[4](optis);
                    __LOG[4](scores);
                    serialize('optis', optis);
                    serialize('scores', scores);
                });
        }, ex => {
            __LOG[1]("Fehler beim Laden: " + ex.message);
        });
}

// Verarbeitet Ansicht "Einzelwerte"
function procSingleValues() {
    var playerTable = document.getElementById("team");
    var rowOffsetUpper = 1;
    var rowOffsetLower = 1;
    var colWidth = 40;
    var colIdxSkills = 4;
    var colIdxWID = 16;
    var colIdxSEL = colIdxWID + 1;
    var colIdxDIS = colIdxSEL + 1;
    var colIdxEIN = colIdxDIS + 2;
    var fixSkills = new Array(colIdxWID, colIdxSEL, colIdxDIS, colIdxEIN);

    // Ueberschriften hinzufuegen
    var titleRow = playerTable.rows[rowOffsetUpper - 1];
    var title2Row = playerTable.rows[playerTable.rows.length - rowOffsetLower];

    var orgLength = titleRow.cells.length;
    appendCell(titleRow, "FixVals");
    appendCell(titleRow, "Prios");
    appendCell(titleRow, "Skill");
    appendCell(titleRow, "Opti");
    appendCell(titleRow, "tr.");
    appendCell(titleRow, "Talent");
    appendCell(title2Row, "FixVals");
    appendCell(title2Row, "Prios");
    appendCell(title2Row, "Skill");
    appendCell(title2Row, "Opti");
    appendCell(title2Row, "tr.");
    appendCell(title2Row, "Talent");

    // Breite und Sortierung der neuen Spalten festlegen
    for (var i = orgLength + 1; i < titleRow.cells.length; i++) {
        var txt = titleRow.cells[i].textContent;
        titleRow.cells[i].setAttribute("width", colWidth, false);
            titleRow.cells[i].innerHTML = '<a href="#" class="sortheader" onclick="ts_resortTable(this);return false;">'+txt+'<span class="sortarrow"</span></a>';
            title2Row.cells[i] = titleRow.cells[i];
    }

    for (i = rowOffsetUpper; i < playerTable.rows.length - rowOffsetLower; i++) {
        var currentRow = playerTable.rows[i];
        var pos = currentRow.cells[0].className;// Position des Spielers ermitteln
        var priSkills = (pos == "LEI") ? getArrayPositionOfLEISkillsOnGlobalPage(currentRow)
                : getArrayPositionOfSkillsOnGlobalPage(pos);// Liste der Indizes der Primaerskills
        var skills = [];
        var color = getColor(pos);
        var sumSkill = 0;
        var sumFixVal = 0;
        var sumPrio = 0;

        for (var idx = colIdxSkills; idx < colIdxSkills + 17; idx++) {
            skills[idx - colIdxSkills] = getEinzelSkill(currentRow, idx);
        }

        sumSkill = skills.reduce((sum, skill) => sum + skill);

        sumFixVal = fixSkills.reduce((sum, idx) => sum + skills[idx - colIdxSkills], 0);

        sumPrio = priSkills.reduce(
            function (sum, idx) {
                currentRow.cells[idx].style.color = osBlau;
                currentRow.cells[idx].style.backgroundColor = color;
                currentRow.cells[idx].style.fontWeight = 'bold';
                return sum + skills[idx - colIdxSkills];
            }, 0);

        var avgSkill = sumSkill / 17;
        var avgOpti = (sumSkill + 4 * sumPrio) / 27;
        var avgFixVal = sumFixVal / fixSkills.length;
        var avgPrio = sumPrio / priSkills.length;
        var [trainiert, EQ19] = getTrainiertUndTalent(25, skills);

        appendCell(currentRow, avgFixVal.toFixed(prec), color);
        appendCell(currentRow, avgPrio.toFixed(prec), color);
        appendCell(currentRow, avgSkill.toFixed(prec2), color);
        appendCell(currentRow, avgOpti.toFixed(prec2), color);
        appendCell(currentRow, trainiert.toFixed(prec0), color);
        appendCell(currentRow, EQ19.toFixed(prec0), color);
    }
}

// Verarbeitet Ansichten "Statistik Saison" und "Statistik Gesamt"
function procStatistics() {
    var playerTable = document.getElementsByTagName("table")[2];
    var statisticsArray = [];// Array der Statistikwerte
    var maxValues = [];// Liste der Hoechstwerte
    var rowOffsetUpper = 2;
    var rowOffsetLower = 2;
    var columnOffset = 4;// 4 fuehrende Spalten sind irrelevant
    var numberOfCompetitions = 4;// 4 Wettbewerbe (LI, LP, IP, FS)
    var numberOfCategories = 6;// 6 Kategorien (Spiele, Tore, Vorlagen, Score, Gelb, Rot)

    var numberOfPlayers = playerTable.rows.length - (rowOffsetUpper + rowOffsetLower);
    var numberOfStatistics = numberOfCategories*numberOfCompetitions;

    // statisticsArray fuellen
    for (var i = 0; i < numberOfPlayers; i++) {
        statisticsArray[i] = [];
        for (var j = columnOffset; j < playerTable.rows[i + rowOffsetUpper].cells.length; j++) {
            statisticsArray[i][j - columnOffset] = parseInt(playerTable.rows[i + rowOffsetUpper].cells[j].textContent);
        }
    }
    // maxValues ermitteln (Initialisierung mit 1, um keine Nullen zu markieren)
    for (var j = 0; j < numberOfStatistics; j++) {
        maxValues[j] = 1;
        for (var i = 0; i < numberOfPlayers; i++) {
            if (statisticsArray[i][j] > maxValues[j]) { maxValues[j] = statisticsArray[i][j]; }
        }
    }
    // Hoechstwerte markieren
    for (var i = 0; i < numberOfPlayers; i++) {
        var pos = playerTable.rows[i + rowOffsetUpper].cells[0].className;
        for (var j = 0; j < maxValues.length; j++) {
            if (statisticsArray[i][j] >= maxValues[j]) {
                playerTable.rows[i + rowOffsetUpper].cells[j + columnOffset].style.color = osBlau;
                playerTable.rows[i + rowOffsetUpper].cells[j + columnOffset].style.backgroundColor = getColor(pos);
                playerTable.rows[i + rowOffsetUpper].cells[j + columnOffset].style.fontWeight = "bold";
            }
        }
    }
    // Linien zeichnen
    for (var i = rowOffsetUpper; i < playerTable.rows.length - rowOffsetLower; i++) {
        for (var j = 0; j < numberOfCategories - 1; j++) {
            var columnIndex = numberOfCompetitions*(j + 1) + columnOffset;
            playerTable.rows[i].cells[columnIndex].style.borderLeft = borderString;
        }
    }
    // Sonderbehandlung der Ueber- und Unterschriftszeilen (je 1 Spalte weniger)
    for (var j = 0; j < numberOfCategories - 1; j++) {
        var columnIndexCompetition = numberOfCompetitions*(j + 1) + columnOffset - 1;
        playerTable.rows[1].cells[columnIndexCompetition].style.borderLeft = borderString;
        playerTable.rows[playerTable.rows.length - 2].cells[columnIndexCompetition].style.borderLeft = borderString;
    }
}

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewuenschten Unterseite
// url Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    var indexS = url.lastIndexOf("s=");
    var st = url.match(/st\.php/);              // Teamansicht Popupfenster
    var showteam = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    var s = -1;                                 // Seitenindex (Rueckgabewert)

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

// Verarbeitet Ansicht "Vereinshistorie"
function procClubHistory() {
    separateSeasons(document.getElementsByTagName("table")[2], 2, 1, 0);
}

// Zeichnet in einer Tabelle Linien zwischen den Zeilen unterschiedlicher Saisons
// tableTabelle, die veraendert werden soll
// rowOffsetUpper Zeilenstartindex fuer Schleife
// rowOffsetLower Zeilenendindex fuer Schleife
// columnIndexSeason Spaltenindex der Spalte, deren Werte in benachbarten Zeilen verglichen werden
function separateSeasons(table, rowOffsetUpper, rowOffsetLower, columnIndexSeason) {
    for (var i = rowOffsetUpper; i < table.rows.length - rowOffsetLower; i++) {
        if (table.rows[i].cells[columnIndexSeason].textContent != table.rows[i + 1].cells[columnIndexSeason].textContent) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].style.borderBottom = borderString;
            }
        }
    }
}

// Gibt die Indizes der Primaerskills in der Detailansicht zurueck
function getArrayPositionOfSkillsOnDetailsPage(pos) {
    switch (pos) {
        case "TOR": return new Array(36,38,40,42);
        case "ABW": return new Array(36,38,40,62);
        case "DMI": return new Array(50,54,40,34);
        case "MIT": return new Array(50,54,38,34);
        case "OMI": return new Array(50,54,34,42);
        case "STU": return new Array(32,36,42,38);
        default:    return new Array();
    }
}

// Gibt die Indizes der Primaerskills in der Einzelwertansicht zurueck
function getArrayPositionOfSkillsOnGlobalPage(pos) {
    switch (pos) {
        case "TOR": return new Array(6,7,8,9);
        case "ABW": return new Array(6,7,8,19);
        case "DMI": return new Array(13,15,8,5);
        case "MIT": return new Array(13,15,7,5);
        case "OMI": return new Array(13,15,9,5);
        case "STU": return new Array(4,6,7,9);
        default:    return new Array();
    }
}

// Gibt die Indizes der Primaerskills von Leihspielern in der Einzelwertansicht zurueck
function getArrayPositionOfLEISkillsOnGlobalPage(row) {
    var skills = new Array();
    for (var idx = 4; idx < 21; idx++) {
        if (row.cells[idx].style.fontWeight == "bold") {
            skills.push(idx);
        }
    }
    return skills;
}

// Gibt Anzahl trainierter Skillpunkte und Michael Bertrams "Talent" zurueck
function getTrainiertUndTalent(age, skills) {
    const [__SETRAINIERB, __SEEQ19] = trainierb.reduce(
        function (res, skillIdx) {
            const __SKILL = skills[skillIdx];
            res[0] += __SKILL;
            res[1] += dauer[__SKILL];
            return res;
        }, [0, 0]);
    const __ALTER = Math.floor(age);
    const __RESTZAT = Math.round(72 * (age - __ALTER));
    const __TRAINIERT = tage[__ALTER] + Math.round(__RESTZAT * faktor[__ALTER] / 100);
    const __EQ19 = __SEEQ19 - __TRAINIERT;
    return [__SETRAINIERB, __EQ19];
}

// Gibt die Positionsstaerken dieser Zeile zurueck
function getArrayPosSkills(row) {
    var ret = new Array(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
    var pos = getPos(row);
    var posId = getPosId(pos);
    var skill = getSkill(row);
    var opti = getOpti(row);
    var prio = getPrio(row);
    var alter = getAlter(row);
    var FIT = getFIT(row);
    var MOR = getMOR(row);
    var AF = (alter < 25) ? alter : 25;
    var value = 25.0 * (opti + skill) / (150.0 - prio);
    if (FIT < 10) {
        value = 0.0;
    }
    value = value * (900.0 + FIT) * (100.0 + MOR) / (100.0 + AF) / 100.0;
    if (posId >= 0) {
        ret[posId] = value;
        if (posId > 0) {
            var mul = 0.92;
            if (posId > 1) {
                ret[posId - 1] = mul * value;
            }
            if (posId < 5) {
                ret[posId + 1] = mul * value;
            }
            if (posId != 3) {
                // ABW <-> DMI, OMI <-> STU
                var index = posId - 1;
                mul = 0.86;
                if ((posId == 1) || (posId == 4)) {
                    index = posId + 1;
                }
                if ((posId == 1) || (posId == 5)) {
                    mul = 0.8;
                }
                ret[index] = mul * value;
            }
        }
    }
    return ret;
}

// Liefert das "beste" verfuegbare Team
function getBestTeam(score, rest) {
    var ret = new Array();
    ret.push(new Array());  // Zeilennummern
    ret.push(new Array());  // Score-Werte
    ret.push(new Array());  // Original-Score-Werte
    var posIds = new Array(0,2,4,1,5,1,5,4,1,5,3);
    var altPos = new Array(0,2,4,1,5,1,2,2,2,4,2);
    for (var i = 0; (i < posIds.length) && (rest.length > 0); i++) {
        var bestId = 0;
        var bestIndex = rest[bestId];
        var best = score[bestIndex][posIds[i]];
        for (var j = 0; j < rest.length; j++) {
            var posId = posIds[i];
            var value = score[rest[j]][posId];
            if ((altPos[i] > -1) && (altPos[i] != posId)) { // check flex pos
                if (score[rest[j]][altPos[i]] > value) {
                    posId = altPos[i];
                    value = score[rest[j]][posId];
                }
            }
            if (value > best) {
                bestId = j;
                bestIndex = rest[bestId];
                best = score[bestIndex][posId];
            }
        }
        var bestOrg = best;
        var bestScores = score[bestIndex];
        for (var j = 0; j < bestScores.length; j++) {
            if (bestScores[j] > bestOrg) {
                bestOrg = bestScores[j];
            }
        }
        ret[0].push(bestIndex);
        ret[1].push(best);
        ret[2].push(bestOrg);
        for (var j = bestId + 1; j < rest.length; j++) {
            rest[j - 1] = rest[j];
        }
        rest.pop();
    }
    return ret;
}

// Fuegt eine Zelle ans Ende der uebergebenen Zeile hinzu und fuellt sie
// row: Zeile, die verlaengert wird
// content: Textinhalt der neuen Zelle
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color) {
    row.insertCell(-1);
    var colIdx = row.cells.length - 1;
    row.cells[colIdx].textContent = content;
    row.cells[colIdx].align = "center";
    row.cells[colIdx].style.color = color;
}

// Gibt die zur Position gehoerige Farbe zurueck
function getColor(pos) {
    switch (pos) {
        case "TOR": return "#FFFF00";
        case "ABW": return "#00FF00";
        case "DMI": return "#3366FF";
        case "MIT": return "#66FFFF";
        case "OMI": return "#FF66FF";
        case "STU": return "#FF0000";
        case "LEI": return "#FFFFFF";
        default:    return "";
    }
}

// Gibt die zur Position gehoerige Id zurueck
function getPosId(pos) {
    switch (pos) {
        case "TOR": return 0;
        case "ABW": return 1;
        case "DMI": return 2;
        case "MIT": return 3;
        case "OMI": return 4;
        case "STU": return 5;
        case "LEI": return -1;
        default:    return -1;
    }
}

// Gibt den Namen des Kaders zurueck
function getTeamName(index) {
    switch (index) {
        case 0: return "A-Team";
        case 1: return "B-Team";
        case 2: return "Reserve";
        default:    return "|-----|";
    }
}

// Gibt die Spieler-Position dieser Zeile zurueck
function getPos(row) {
    pos = row.cells[colIdxPos].className;
    return pos;
}

// Gibt den Skill dieser Zeile zurueck
function getSkill(row) {
    skill = row.cells[colIdxSkill].textContent;
    return parseFloat(skill);
}

// Gibt den Opti-Skill dieser Zeile zurueck
function getOpti(row) {
    opti = row.cells[colIdxOpti].textContent;
    return parseFloat(opti);
}

// Gibt den Prio-Schnitt dieser Zeile zurueck
function getPrio(row) {
    sumPrio = (27.0 * getOpti(row) - 17.0 * getSkill(row)) / 4.0;
    prio = parseInt(sumPrio.toFixed(0)) / 4.0;
    return prio;
}

// Gibt das Alter dieser Zeile zurueck
function getAlter(row) {
    alter = row.cells[colIdxAlter].textContent;
    return parseInt(alter);
}

// Gibt die Moral dieser Zeile zurueck
function getMOR(row) {
    if (colIdxMOR == 0) {
        return 99;
    }
    MOR = row.cells[colIdxMOR].textContent;
    return parseInt(MOR);
}

// Gibt die Fitness dieser Zeile zurueck
function getFIT(row) {
    if (colIdxFIT == 0) {
        Verl = row.cells[colIdxVerl].textContent;
        if (parseInt(Verl) > 0) {
            return 0;
        } else {
            if (guessFIT) {
                Aufstell = row.cells[colIdxAuf].textContent;
                if (Aufstell == "EIN") {
                    return (getPos(row) == "TOR") ? 80 : 70;
                } else if (Aufstell == "TOR") {
                    return 70;
                } else if (Aufstell != "") {
                    return 50;
                }
            }
            return 99;
        }
    }
    FIT = row.cells[colIdxFIT].textContent;
    return parseInt(FIT);
}

// Gibt einen Skill von der Uebersicht "Einzelwerte" zurueck
function getEinzelSkill(row, idx) {
    skill = row.cells[idx].textContent;
    return parseInt(skill);
}
