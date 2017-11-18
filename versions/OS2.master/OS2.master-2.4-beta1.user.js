// ==UserScript==
// @name         OS2.master
// @namespace    http://os.ongapo.com/
// @version      2.4+WE
// @copyright    2013+
// @author       Andreas Eckes (Strindheim BK)
// @description  OS 2.0 - Master-Skript
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/sp\.php\?s=\d+$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/st\.php\?(s=\d+&)?c=\d+$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/showteam\.php(\?s=\d+)?$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/training\.php$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/ka\.php$/
// @grant        none
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// Dieses Skript ist in der Lage, folgendes zu machen:
// Teamansicht - Einzelwerte: Primaerskills hervorheben
// Teamansicht - Statistik Saison / Gesamt: Spalten umordnen, Hoechstwerte markieren, Wettbewerbe bzw. Kategorien trennen
// Teamansicht - Vereinshistorie: Saisons trennen
// Spielerprofil: Primaerskills hervorheben, Saisons in Historie trennen
// Training: Trainingswahrscheinlichkeiten je nach Einsatzdauer berechnen
// Kontoauszug: Abrechnungen trennen
// Ob diese Aenderungen wirklich durchgefuehrt werden, kann gesteuert werden, indem die folgenden
// Konfigurations-Variablen auf true (wird gemacht) oder false (wird nicht gemacht) gesetzt werden

// Konfiguration ************************************************************************
var einzelwerte = true; // Teamansicht - Einzelwerte bearbeiten?
var statistiken = true; // Teamansicht - Statistik Saison/Gesamt bearbeiten?
var statistikenUmordnen = true; // In Teamansicht - Statistik Saison/Gesamt Wettbewerbe und Kategorien vertauschen?
var vereinshistorie = true; // Teamansicht - Vereinshistorie bearbeiten?
var spielerprofil = true; // Spielerprofil bearbeiten?
var training = true; // Training bearbeiten?
var kontoauszug = true; // Kontoauszug bearbeiten?
// Konfiguration Ende *******************************************************************

var osBlue = "#111166";
var borderString = "solid white 1px";
var url = window.location.href;
var pageString = parseURL(url);

// Je nach URL in die Verarbeitungsfunktionen verzweigen
switch (pageString) {
    case "teamansicht": procTeamansicht(); break;
    case "spielerprofil": if (spielerprofil) { procSpielerprofil(); } break;
    case "training": if (training) { procTraining(); } break;
    case "kontoauszug": if (kontoauszug) { procKontoauszug(); } break;
}

// **************************************************************************************
// Teamansicht: Diverse Verarbeitungen, teilweise in eigenen Funktionen.
// **************************************************************************************
function procTeamansicht() {
    // Parameter s auslesen
    let regexpS = /s=(\d+)/;
    let s = -1;
    let table;
    if (regexpS.test(url)) { s = parseInt(regexpS.exec(url)[1]);    }
    switch (true) {
        // Einzelwerte
        case ((s == 2) && einzelwerte):
            table = document.getElementById("team");
            for (let i = 1; i < table.rows.length - 1; i++) {
                let pos = table.rows[i].cells[0].className;
                let primarySkills = getIdxPriSkillsGlobalPage(pos);
                for (let j  = 0; j < primarySkills.length; j++) {
                    table.rows[i].cells[primarySkills[j]].style.color = osBlue;
                    table.rows[i].cells[primarySkills[j]].style.backgroundColor = getColor(pos);
                }
            }
            break;
        // Statistiken
        case (((s == 3) || (s == 4)) && statistiken):
            table = document.getElementsByTagName("table")[2];
            procStatistiken(table);
            break;
        // Vereinshistorie
        case (s == 7):
            table = document.getElementsByTagName("table")[2];
            let offsets = [2, 1, 0, 0]; // 2 Zeilen oben, 1 Zeile unten ausschliessen
            drawHorizontalLines(table, offsets, 1, 0);
            break;
    }
}

// **************************************************************************************
// Statistik-Seiten: Kategorie und Wettbewerb vertauschen, Abrechnungen trennen,
// Hoechstwerte hervorheben.
// **************************************************************************************
function procStatistiken(table) {
    let rowOffsetTop = 2;
    let rowOffsetBottom = 2;
    let colOffset = 4;
    let statistics = [];
    let maxValues = [];
    let numberOfPlayers = table.rows.length - (rowOffsetTop + rowOffsetBottom);
    let periodicity = (statistikenUmordnen) ? 6 : 4;
    let statisticsNew;
    // statistics fuellen
    for (let i = 0; i < numberOfPlayers; i++) {
        statistics[i] = [];
        for (let j = colOffset; j < table.rows[i + rowOffsetTop].cells.length; j++) {
            statistics[i][j - colOffset] = parseInt(table.rows[i + rowOffsetTop].cells[j].textContent);
        }
    }
    if (statistikenUmordnen) {
        // Formel zum Index mappen: neu = (alt div 4) + 6 * (alt mod 4)
        statisticsNew = [];
        let idxNeu = 0;
        for (let i = 0; i < statistics.length; i++) {
            statisticsNew[i] = [];
            for (let j = 0; j < statistics[i].length; j++) {
                idxNeu = Math.floor(j / 4) + 6 * (j % 4);
                statisticsNew[i][idxNeu] = statistics[i][j];
            }
        }
        // Umgeordnete Werte eintragen
        for (let i = 0; i < statistics.length; i++) {
            for (let j = 0; j < statistics[i].length; j++) {
                table.rows[i + rowOffsetTop].cells[j + colOffset].textContent = statisticsNew[i][j];
            }
        }
        // Titelzeilen aendern
        changeTitleRow1(table.rows[0]);
        changeTitleRow1(table.rows[table.rows.length - 1]);
        changeTitleRow2(table.rows[1]);
        changeTitleRow2(table.rows[table.rows.length - 2]);
    } else {
        statisticsNew = statistics;
    }
    // Linien zeichen. Offsets rechts = 1, um keinen Rand bei letzter Spalte zu haben
    let offsets = new Array(rowOffsetTop, rowOffsetBottom, colOffset, 1);
    let offsetsTitleRowTop = new Array(1, table.rows.length - 2, 3, 1);
    let offsetsTitleRowBottom = new Array(table.rows.length - 2, 1, 3, 1);
    drawVerticalLines(table, offsets, periodicity);
    drawVerticalLines(table, offsetsTitleRowTop, periodicity);
    drawVerticalLines(table, offsetsTitleRowBottom, periodicity);
    // maxValues ermitteln. Initialisierung mit 1, um keine Nullen zu markieren
    for (let j = 0; j < 24; j++) {
        maxValues[j] = 1;
        for (let i = 0; i < numberOfPlayers; i++) {
            if (statisticsNew[i][j] > maxValues[j]) { maxValues[j] = statisticsNew[i][j]; }
        }
    }
    // Hoechstwerte hervorheben
    for (let i = 0; i < numberOfPlayers; i++) {
        let pos = table.rows[i + rowOffsetTop].cells[0].className;
        for (let j = 0; j < maxValues.length; j++) {
            if (statisticsNew[i][j] >= maxValues[j]) {
                table.rows[i + rowOffsetTop].cells[j + colOffset].style.color = osBlue;
                table.rows[i + rowOffsetTop].cells[j + colOffset].style.backgroundColor = getColor(pos);
                table.rows[i + rowOffsetTop].cells[j + colOffset].style.fontWeight = "bold";
            }
        }
    }
}

// **************************************************************************************
// Spielerprofil: Primaerskills hervorheben, Saisons in Spielerhistorie trennen.
// **************************************************************************************
function procSpielerprofil() {
    // Primaerskills hervorheben
    let tdTags = document.getElementsByTagName("td");
    let pos = tdTags[21].textContent;
    let color = getColor(pos);
    let skills = getIdxPriSkillsDetailsPage(pos);
    for (let i = 0; i < skills.length; i++) {
        tdTags[skills[i]].style.color = color;
    }
    // Saisons in Spielerhistorie trennen
    let table = document.getElementById("e").getElementsByTagName("table")[0];
    let offsets = [1, 1, 0, 0]; // Je 1 Zeile oben und unten ausschliessen
    drawHorizontalLines(table, offsets, 1, 5);
}

// **************************************************************************************
// Kontoauszug: Abrechnungen trennen.
// **************************************************************************************
function procKontoauszug() {
    let table = document.getElementsByTagName("table")[0];
    let season = 1;
    let optionTags = document.getElementsByTagName("select")[0].getElementsByTagName("option");
    for (let i = 0; i < optionTags.length; i++) {
        if (optionTags[i].selected) { season = parseInt(optionTags[i].textContent); }
    }
    for (let i = 2; i < table.rows.length; i++) {
        // Pruefen ob Zat-Abrechnung
        let postingText = table.rows[i].cells[3].textContent;
        let regexpPostingText = /Abrechnung ZAT (\d+)/;
        if (regexpPostingText.test(postingText)) {
            let zat = regexpPostingText.exec(postingText)[1];
            // Pruefen ob Ende von Abrechnungszeitraum
            let zatPerMonth = (season == 1) ? 7 : 6;
            if (zat % zatPerMonth == 0) {
                for (let j = 0; j < table.rows[i].cells.length; j++) {
                    table.rows[i].cells[j].style.borderTop = borderString;
                }
            }
        }
    }
}

// **************************************************************************************
// Training: Trainingswahrscheinlichkeiten je nach Einsatzart und -dauer anzeigen.
// **************************************************************************************
function procTraining() {
    let warningTable = document.getElementsByTagName("table")[1];
    let table = document.getElementsByTagName("table")[2];
    let titleBankeinsatz = "Bankeinsatz";
    let titleTeilweise = "Teilweise";
    let titleDurchgehend = "Durchgehend";
    // Warnungen hinzufuegen
    let warning1 = "Die Wahrscheinlichkeiten in den Spalten \"" + titleBankeinsatz + "\", \"" + titleTeilweise + "\" und \"" + titleDurchgehend + "\" dienen nur zur Information!";
    let warning2 = "Die maximale Wahrscheinlichkeit einer Aufwertung ist immer 99.00 %!";
    //let newCell1 = appendCell(warningTable.insertRow(-1), warning1);
    //newCell1.setAttribute("colspan", 4, false);
    //let newCell2 = appendCell(warningTable.insertRow(-1), warning2);
    //newCell2.setAttribute("colspan", 3, false);
    // Ueberschriften hinzufuegen
    let colWidth = 80;
    let titleRow = table.rows[0];
    appendCell(titleRow, titleBankeinsatz).setAttribute("width", colWidth, false);
    appendCell(titleRow, titleTeilweise).setAttribute("width", colWidth, false);
    appendCell(titleRow, titleDurchgehend).setAttribute("width", colWidth, false);
    // Wahrscheinlichkeiten berechnen und hinzufuegen
    let colIdxChance = 7;
    for (let i = 1; i < table.rows.length; i++) {
        let currentRow = table.rows[i];
        let probabilityString = currentRow.cells[colIdxChance].textContent;
        // Schleife verlassen, wenn Berechnung irrelevant ist
        if ((probabilityString == "0.00 %") || (probabilityString == "Trainerskill zu niedrig!")) { continue; }
        let color = getColor(currentRow.cells[colIdxChance].className);
        for (let j = 1; j <= 3; j++) {
            // Wert von j entscheidet, welcher Faktor zur Berechnung benutzt wird (Art des Einsatzes)
            let factor = 1;
            switch (j) {
                case 1: factor = 1.1; break;
                case 2: factor = 1.25; break;
                case 3: factor = 1.35; break;
            }
            let newProbabilityString = decimalNumberToString(factor * stringToNumber(probabilityString), 2, true);
            appendCell(currentRow, newProbabilityString, color);
        }
    }
}

// ****************************************************************************
// Hilfsfunktionen
// ****************************************************************************

// Fuer Teamansicht - Statistiken: Aendert die erste Titelzeile von "Spiele", ... auf "Liga", ...
function changeTitleRow1(row) {
    let offsetLeft = 1;
    row.deleteCell(-1); row.deleteCell(-1);
    for (let i = offsetLeft; i < row.cells.length; i++) {
        row.cells[i].colSpan = 6;
        switch (i) {
            case offsetLeft: row.cells[i].textContent = "Liga"; break;
            case offsetLeft + 1: row.cells[i].textContent = "Landespokal"; break;
            case offsetLeft + 2: row.cells[i].textContent = "International"; break;
            case offsetLeft + 3: row.cells[i].textContent = "Friendly"; break;
        }
    }
}

// Fuer Teamansicht - Statistiken: Aendert die zweite Titelzeile von "LI", "LP", ... auf "SP", "TO", ...
function changeTitleRow2(row) {
    let offsetLeft = 3;
    let cell;
    for (let i = offsetLeft; i < row.cells.length; i++) {
        cell = row.cells[i];
        row.cells[i].align = "center";
        switch ((i - offsetLeft) % 6) {
            case 0: cell.textContent = "SP"; break;
            case 1: cell.textContent = "TO"; break;
            case 2: cell.textContent = "VL"; break;
            case 3: cell.textContent = "SC"; break;
            case 4: cell.textContent = "GK"; break;
            case 5: cell.textContent = "RK"; break;
        }
    }
}

// Zeichnet vertikale Linien in eine Tabelle (mit borderRight)
// table: zu bearbeitende Tabelle
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden; [2]/[3]: Anzahl Spalten links/rechts, die ignoriert werden
// periodicity: Jede periodicity-te Spalte mit Linie versehen
function drawVerticalLines(table, offsets, periodicity) {
    for (let i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        for (let j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
            if (((j - offsets[2] + 1) % periodicity) == 0) {
                table.rows[i].cells[j].style.borderRight = borderString;
            }
        }
    }
}

// Zeichnet horizontale Linien in eine Tabelle (jeweils als unteren Rand von Zellen)
// table: zu bearbeitende Tabelle
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden; [2]/[3]: Anzahl Spalten links/rechts, die ignoriert werden
// mode = 1: Saisons trennen ("i != i + 1")
// mode = 2: Abrechnungsperioden trennen ("% 7 == 0")
// mode = 3: Abrechnungsperioden trennen ("% 6 == 0")
// colIdx: Index der Spalte, die die zu vergleichenden Werte enthaelt
function drawHorizontalLines(table, offsets, mode, colIdx) {
    for (let i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        switch (mode) {
            case 1: // Saisons trennen
                let value1 = parseInt(table.rows[i].cells[colIdx].textContent);
                let value2 = parseInt(table.rows[i + 1].cells[colIdx].textContent);
                if (value1 != value2) {
                    for (let j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
                        table.rows[i].cells[j].style.borderBottom = borderString;
                    }
                }
                break;
            case 2: // Abrechnungsperioden trennen (Saison 1)
                let value3 = parseInt(table.rows[i].cells[colIdx].textContent);
                if (value3 % 7 == 0) {
                    for (let j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
                        table.rows[i].cells[j].style.borderBottom = borderString;
                    }
                }
                break;
            case 3: // Abrechnungsperioden trennen (Saisons > 1)
                let value4 = parseInt(table.rows[i].cells[colIdx].textContent);
                if (value4 % 6 == 0) {
                    for (let j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
                        table.rows[i].cells[j].style.borderBottom = borderString;
                    }
                }
                break;
        }
    }
}

// Fuegt eine Zelle am Ende einer Zeile hinzu, fuellt die Zelle und gibt sie (td-Tag) zurueck.
// row: Zeile, die verlaengert wird
// text: Textinhalt der neuen Zelle
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color) {
    let returnValue = row.insertCell(-1);
    returnValue.textContent = content;
    returnValue.style.color = color;
    return returnValue;
}

// Parst den URL und gibt einen String zurueck, der die Seite identifiziert.
// url: Der URL, der geparst werden soll
function parseURL(url) {
    if (url.match(/\/showteam\.php\?s=/)) { return "teamansicht"; }
    if (url.match(/\/st\.php\?s=/)) { return "teamansicht"; }
    if (url.match(/\/tplatz\.php\?/)) { return "tabellenplatz"; }
    if (url.match(/\/spielpreview\.php\?/)) { return "vorschau"; }
    if (url.match(/\/sp\.php\?/)) { return "spielerprofil"; }
    if (url.match(/\/training\.php/)) { return "training"; }
    if (url.match(/\/ju\.php/)) { return "jugend"; }
    if (url.match(/\/ka\.php/)) { return "kontoauszug"; }
    return "";
}


// ****************************************************************************
// Funktionen, die Zahlen und Zahlenstrings verarbeiten
// ****************************************************************************

// Wandelt eine Dezimalzahl in einen String um ("." als Dezimalzeichen).
// Fuer Prozentzahlen wird der Wert verhundertfacht und " %" rechts angehaengt.
// number: Die Zahl, die umgewandelt werden soll
// decimalDigits: Anzahl der Nachkommastellen in der Ausgabe (werden erzwungen)
// percent: Ob die Zahl als Prozentwert dargestellt werden soll
function decimalNumberToString(number, decimalDigits, percent) {
    let returnValue = "";
    if (percent) { number *= 100; }
    number = number.toFixed(decimalDigits);
    returnValue = number.toString();
    if (percent) { returnValue += " %"; }
    return returnValue;
}

// Wandelt eine ganze Zahl in einen String um ("." als Tausenderzeichen).
// number: Die Zahl, die umgewandelt werden soll
function wholeNumberToString(number) {
    let returnValue = "";
    let temp = "";
    for (let i = number.toString().length - 1; i >= 0; i--) {
        temp += number.toString().charAt(i);
        if ((i % 3 == 0) && (i > 0)) { temp += "."; }
    }
    for (let i = temp.length - 1; i >= 0; i--) {
        returnValue += temp.charAt(i);
    }
    return returnValue;
}

// Wandelt einen String in eine Zahl um.
// Prozentzahlen-Strings werden als Zahl interpretiert (d.h. "100%" -> 1).
// Ganze Zahlen mit Tausenderpunkten werden erkannt, wenn sie mit "." gefolgt von 3 Ziffern enden.
// Dezimalzahlen werden erkannt, wenn sie mit "." gefolgt von beliebig vielen Ziffern enden.
// Da zuerst auf ganze Zahlen geprueft wird, koennen Dezimalzahlen nicht 3 Nachkommaziffern haben.
function stringToNumber(string) {
    // parseXXX interpretiert einen Punkt immer als Dezimaltrennzeichen
    let returnValue = "";
    let percent = false;
    // Buchstaben und Whitespaces entfernen
    string = string.replace(/[\sa-zA-Z]/g, "");
    // Auf % pruefen und % entfernen
    if (string.lastIndexOf("%") != -1) {
        percent = true;
        string = string.replace(/%/g, "");
    }
    let regexpWholeSimple = /^\d+$/;
    let regexpWholeWithDots = /^\d+(\.\d{3}){1,}$/;
    let regexpDecimal = /^\d*\.\d{1,}$/;
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


// ****************************************************************************
// Funktionen, die Konstanten definieren
// ****************************************************************************

// Liefert je nach Position die Indizes der Primaerskills im Spielerprofil.
function getIdxPriSkillsDetailsPage(pos) {
    let tdOffset = 0;

    switch (pos) {
        case "TOR": return [ tdOffset + 38, tdOffset + 40, tdOffset + 42, tdOffset + 44 ];
        case "ABW": return [ tdOffset + 38, tdOffset + 40, tdOffset + 42, tdOffset + 64 ];
        case "DMI": return [ tdOffset + 52, tdOffset + 56, tdOffset + 42, tdOffset + 36 ];
        case "MIT": return [ tdOffset + 52, tdOffset + 56, tdOffset + 40, tdOffset + 36 ];
        case "OMI": return [ tdOffset + 52, tdOffset + 56, tdOffset + 36, tdOffset + 44 ];
        case "STU": return [ tdOffset + 34, tdOffset + 38, tdOffset + 44, tdOffset + 40 ];
        default:    return [];
    }
}

// Liefert je nach Position die Indizes der Primaerskills in Teamansicht - Einzelwerte.
function getIdxPriSkillsGlobalPage(pos) {
    switch (pos) {
        case "TOR": return [  6,  7,  8,  9 ];
        case "ABW": return [  6,  7,  8, 19 ];
        case "DMI": return [ 13, 15,  8,  5 ];
        case "MIT": return [ 13, 15,  7,  5 ];
        case "OMI": return [ 13, 15,  9,  5 ];
        case "STU": return [  4,  6,  7,  9 ];
        default:    return [];
    }
}

// Liefert die zur Position gehoerige Farbe,
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
