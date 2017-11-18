// ==UserScript==
// @name         OS2.spielerprofil
// @namespace    http://os.ongapo.com/
// @version      0.3
// @copyright    2016+
// @author       Michael Bertram
// @author       Andreas Eckes (Strindheim BK)
// @author       Sven Loges (SLC)
// @description  Alter exakt / Summe der trainierbaren Skills / Talent (trainierbare Skills mit Alter 19.00 bei unterstelltem 17er-Trainer seitdem)
// @include      http*://os.ongapo.com/haupt.php
// @include      http*://os.ongapo.com/sp.php?s=*
// @include      http*://www.os.ongapo.com/haupt.php
// @include      http*://www.os.ongapo.com/sp.php?s=*
// @include      http*://online-soccer.eu/haupt.php
// @include      http*://online-soccer.eu/sp.php?s=*
// @include      http*://www.online-soccer.eu/haupt.php
// @include      http*://www.online-soccer.eu/sp.php?s=*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

var color = "";
var textAusrichtung = "right"; // Text-Ausrichtung in den neuen Spalten
var table1 = document.getElementById("a").getElementsByTagName("table")[0]; // neben dem Bild
var table2 = document.getElementById("a").getElementsByTagName("table")[1]; // Skills
var wert = "";
var skills = new Array(20);
var count = 0;
var trainierb = new Array(0,1,2,3,4,5,8,9,10,11,15); // Index der trainierbaren Skills
var dauer = new Array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,59,60,62,63,65,66,68,70,71,73,75,77,79,82,84,87,89,92,95,98,101,104,108,112,116,120,125,130,136,142,148,155,163,171,181,192,205,220,238,261,292,340);
var tage = new Array(-1505,-1426,-1346,-1267,-1188,-1109,-1030,-950,-871,-792,-713,-634,-554,-475,-396,-317,-238,-158,-79,0,72,138,198,254,304,350,392,431,465,497,526,551,575,596,615,632,648,662,674,685);
var faktor = new Array(110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,100,92,84,77,70,64,58,53,48,44,40,36,33,29,26,24,21,19,17,15,14);
var seTrainierb = 0;
var seEQ19 = 0;
var trainiert = 0;
var restTage = 0;


// ****************************************************************************
// Hilfsfunktionen
// ****************************************************************************

// Fuegt eine Zelle am Ende einer Zeile hinzu, fuellt die Zelle und gibt sie (td-Tag) zurueck.
// row: Zeile, die verlaengert wird
// text: Textinhalt der neuen Zelle
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
// alignment: Ausrichtung des Texts (left, center, right)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color, alignment) {
	var returnValue = row.insertCell(-1);
	returnValue.textContent = content;
	returnValue.style.color = color;
	if (alignment !== "") { returnValue.align = alignment; }
	return returnValue;
}

// Wandelt einen String in eine Zahl um.
// Prozentzahlen-Strings werden als Zahl interpretiert (d.h. "100%" -> 1).
// Ganze Zahlen mit Tausenderpunkten werden erkannt, wenn sie mit "." gefolgt von 3 Ziffern enden.
// Dezimalzahlen werden erkannt, wenn sie mit "." gefolgt von beliebig vielen Ziffern enden.
// Da zuerst auf ganze Zahlen geprueft wird, koennen Dezimalzahlen nicht 3 Nachkommaziffern haben.
function stringToNumber(string) {
	// parseXXX interpretiert einen Punkt immer als Dezimaltrennzeichen
	var returnValue = "";
	var percent = false;
	// Buchstaben und Whitespaces entfernen
	string = string.replace(/[\sa-zA-Z]/g, "");
	// Auf % pruefen und % entfernen
	if (string.lastIndexOf("%") != -1) {
		percent = true;
		string = string.replace(/%/g, "");
	}
	var regexpWholeSimple = /^\d+$/;
	var regexpWholeWithDots = /^\d+(\.\d{3}){1,}$/;
	var regexpDecimal = /^\d*\.\d{1,}$/;
	if (regexpWholeSimple.test(string)) {
		// Einfache ganze Zahl
		returnValue = parseInt(string);
	} else if (regexpWholeWithDots.test(string)) {
		// Ganze Zahl mit Tausenderpunkten
		returnValue = parseInt(string.replace(/\./g, ""));
	} else if (regexpDecimal.test(string)) {
		// Dezimalzahl mit Punkt als Trennzeichen
		returnValue = parseFloat(string);
	} else {
		// Kein gueltiger String
		percent = false;
		returnValue = "";
	}
	if (percent) { returnValue /= 100; }
	return returnValue;
}

// Erzeugt die uebergebene Anzahl von Zellen in der uebergebenen Zeile.
// row: Zeile, die aufgepumpt werden soll
// length: Anzahl der zu erzeugenden Zellen
function inflateRow(row, length) {
	for (var i = 0; i < length; i++) {
		row.insertCell(-1);
	}
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

// Helferfunktion fuer die Ermittlung der Zeilen einer Tabelle
// index: Laufende Nummer des Elements (0-based)
// doc: Dokument (document)
function getRows(index, doc = document) {
    const __TABLE = getTable(index, "table", doc);
    const __ROWS = (__TABLE === undefined) ? undefined : __TABLE.rows;

    return __ROWS;
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

function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    const __SUCH = "page=";
    const __INDEXS = url.lastIndexOf(__SUCH);
    const __HAUPT = url.match(/haupt\.php/);        // Ansicht "Haupt" (Managerbuero)
    const __SP = url.match(/sp\.php/);              // Ansicht "Jugendteam"
    let page = -1;                                  // Seitenindex (Rueckgabewert)

    // Wert von page (Seitenindex) ermitteln...
    // Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "page=" und ggf. von '&'
    if (__HAUPT) {
        page = 0;
    } else if (__SP) {
        if (__INDEXS < 0) {
            page = 1;
        }
    }

    return page;
}

function procHaupt() {
    const zat = getZATNrFromCell(getRows(0)[2].cells[0]) - 1;
    GM_setValue("currZAT", zat);
}

function procSpieler() {
    alter = stringToNumber(table1.rows[0].cells[5].textContent);
    gebtag = stringToNumber(table1.rows[1].cells[4].textContent);
    var zat = GM_getValue("currZAT", 100);

    // Skills auslesen
    for (var i = 1; i < 7; i++) {
        for (var j = 0; j < 3; j++) {
            wert = table2.rows[i].cells[j*2].textContent;
            skills[count] = stringToNumber(wert.substring(wert.length-2,wert.length));
            count++;
        }
    }

    // berechnen
    for (i = 0; i < 11; i++) {
        seTrainierb = seTrainierb + skills[trainierb[i]];
        seEQ19 = seEQ19 + dauer[skills[trainierb[i]]];
    }

    if (gebtag > zat) {  // hat dieses Jahr Geburtstag
        restTage = 72 - (gebtag - zat);
    } else {     // hatte schon Geburtstag
        restTage = zat - gebtag;
    }

    trainiert = tage[alter] + restTage * faktor[alter] / 100;
    var EQ19 = seEQ19 - trainiert;
    var alterDez = alter + restTage / 72;

    //ausgeben
    appendCell(table1.rows[3], "trainierbare Skills:", color, textAusrichtung);
    appendCell(table1.rows[3], seTrainierb, color, textAusrichtung);
    var neu = table1.insertRow(4); // neue Zeile
    inflateRow (table1.rows[4],4);
    appendCell(table1.rows[4], "Talent:", color, textAusrichtung);
    appendCell(table1.rows[4], EQ19.toFixed(0), color, textAusrichtung);
    inflateRow (table1.rows[4],1);
    appendCell(table1.rows[4], "ZAT:", color, textAusrichtung);
    appendCell(table1.rows[4], zat, color, textAusrichtung);

    table1.rows[0].cells[5].textContent = alterDez.toFixed(2);
}

// Verzweige in unterschiedliche Verarbeitungen je nach Wert von page:
switch (getPageIdFromURL(window.location.href)) {
    case 0: procHaupt(); break;
    case 1: procSpieler(); break;
    default: break;
}

console.log("SCRIPT END");

// *** EOF ***
