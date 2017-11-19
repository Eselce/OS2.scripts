// ==UserScript==
// @name OS2.vereinshistorieMitKruecke
// @version 0.1
// @description OS 2.0 - Ergaenzt fehlende Zeilen und zeigt absoluten und relativen MW-Zuwachs an
// @include http://os.ongapo.com/showteam.php?s=7
// @include http://os.ongapo.com/st.php?s=7*
// @include http://www.os.ongapo.com/showteam.php?s=7
// @include http://www.os.ongapo.com/st.php?s=7*
// @include http://online-soccer.eu/showteam.php?s=7
// @include http://online-soccer.eu/st.php?s=7*
// @include http://www.online-soccer.eu/showteam.php?s=7
// @include http://www.online-soccer.eu/st.php?s=7*
// @grant none
// ==/UserScript==

var fehlendeZeilen = new Array();

// Konfiguration ************************************************************************
// Statt "9999" bitte die eigene Vereins-ID eintragen:
var eigeneID = 9999;

// Die beiden Befehle "fehlendeZeilen.push(new Array( ... ));" unten fuegen vermisste Zeilen von Saison 6/ZAT 18 fuer Vereins-ID 9999 und 9998 hinzu.
// Hinweise:
// Es muessen die folgenden Werte in genau dieser Reihenfolge getrennt durch Kommata angegeben werden (Punkt als Dezimaltrennzeichen, Managername in Anfuehrungszeichen)
// Vereins-ID, Saison, ZAT, Spieler, Skill, Opti, Alter, Schnitt MW, Summe MW, Schnitt Gehalt, Summe Gehalt, Manager

fehlendeZeilen.push(new Array(9999, 6, 18, 33, 45.67, 78.90, 23.45, 12345678, 345678901, 98765, 3456789, "Fußballgott"));
fehlendeZeilen.push(new Array(9998, 6, 18, 32, 44.97, 79.70, 23.51, 12395678, 345698901, 98965, 3459789, "Mr. Bananenflanke"));

// Konfiguration des normalen Vereinshistorie-Skripts ***********************************
var titelMwAbsolut = "\u0394MW abs."; // Titel der Spalte fuer die absolute MW-Differenz
var titelMwRelativ = "\u0394MW rel."; // Titel der Spalte fuer die relative MW-Differenz
var popupFensterFaktorX = 0.2; // Faktor, um den die Breite des Popupfensters vergroessert wird
// Konfiguration Ende *******************************************************************

var offsetTop = 2;
var offsetBottom = 1;
var table = document.getElementsByTagName("table")[1];
var offsets = [offsetTop, offsetBottom, 0, 0]; // 2 Zeilen oben, 1 Zeile unten ausschliessen

// Kruecken-Logik ***********************************************************************

var showteam = false;
var url = this.location.href;
var regexp = /showteam/;
if (regexp.test(url)) { showteam = true; }
regexp = /c=(\d+)/;
var teamID = -1;
if (regexp.test(url)) { teamID = parseInt(regexp.exec(url)[1]); }

// Die relevanten Zeilen aus "fehlendeZeilen" ermitteln
var relevanteZeilen = new Array();
if (showteam) {
    // Relevant ist alles mit der eigenen ID ("eigeneID")
    for (var i = 0; i < fehlendeZeilen.length; i++) {
        if (fehlendeZeilen[i][0] == eigeneID) {
            relevanteZeilen.push(fehlendeZeilen[i]);
        }
    }
} else {
    // Relevant ist alles mit der gleichen ID wie "teamID"
    for (var i = 0; i < fehlendeZeilen.length; i++) {
        if (fehlendeZeilen[i][0] == teamID) {
            relevanteZeilen.push(fehlendeZeilen[i]);
        }
    }
}

var colIdxSeason = 0;
var colIdxZat = 1;
var idxRow = offsetTop;
var idxRowMax = table.rows.length - 1;
var season = 0;
var zat = 0;
var seasonNext = 0;
var zatNext = 0;

while (idxRow < idxRowMax) {
    // Muss eine relevante Zeile eingefuegt werden?
    season = stringToNumber(table.rows[idxRow].cells[colIdxSeason].textContent);
    zat = stringToNumber(table.rows[idxRow].cells[colIdxZat].textContent);
    seasonNext = stringToNumber(table.rows[idxRow + 1].cells[colIdxSeason].textContent);
    zatNext = stringToNumber(table.rows[idxRow + 1].cells[colIdxZat].textContent);
    for (var i = 0; i < relevanteZeilen.length; i++) {
        if (isEqualTime(relevanteZeilen[i][1], relevanteZeilen[i][2], season, zat)) {
            // Relevante Zeile gibt es schon -> entfernen
            relevanteZeilen[i][1] = -1; // Saison auf -1 setzen zum Entfernen
        } else if (isLaterTime(relevanteZeilen[i][1], relevanteZeilen[i][2], seasonNext, zatNext)) {
            // Relevante Zeile ist "spaeter" als die naechste -> einfuegen und dann aus "relevanteZeilen" entfernen
            insertRow(table, relevanteZeilen[i], idxRow + 1);
            relevanteZeilen[i][1] = -1; // Saison auf -1 setzen zum Entfernen
            idxRowMax = table.rows.length - 1; // "idxRowMax" aktualisieren, da sich Anzahl Zeilen geaendert hat
            break; // Aus for-Schleife aussteigen, damit max. eine relevante Zeile eingefuegt wird
        }
    }
    idxRow += 1;
}

// Fuegt eine Zeile in eine Tabelle ein
// table: Die Tabelle, in die die Zeile eingefueget werden soll
// row: Die Zeile, die eingefuegt werden soll als Array der Zellinhalte
// idxRow: Der Zeilenindex, an dem die neue Zeile eingefuegt werden soll
function insertRow(table, row, idxRow) {
    var styleString = "padding-left:10px;";
    var textContent = "";
    table.insertRow(idxRow);
    for (var i = 1; i < row.length; i++) { // Start mit i = 1, um die Vereins-ID auszulassen
        // Format des Zellinhalts bestimmen. Standard: Text
        textContent = row[i];
        switch (true) {
            case ((i == 4) || (i == 5) || (i == 6)): // Dezimalzahlen
                textContent = decimalNumberToString(row[i], 2, false);
                break;
            case ((i == 1) || (i == 2) || (i== 3) || (i == 7) || (i == 8) || (i == 9) || (i == 10)): // Ganze Zahlen
                textContent = wholeNumberToString(row[i]);
                break;
        }
        appendCell(table.rows[idxRow], textContent, "", "center").setAttribute("style", styleString);
    }
}

// Gibt true zurueck, wenn die OS-Zeitpunkte gleich sind
// s1, z1, s2, z2: Saison bzw. Zat von Argument 1 bzw. 2
function isEqualTime(s1, z1, s2, z2) {
    return (s1 == s2) && (z1 == z2);
}

// Gibt true zurueck, wenn die OS-Zeitpunkt 1 groesser als OS-Zeitpunkt 2 ist
// s1, z1, s2, z2: Saison bzw. Zat von Argument 1 bzw. 2
function isLaterTime(s1, z1, s2, z2) {
    return (((s1 == s2) && (z1 > z2)) || (s1 > s2));
}

// Kruecken-Logik Ende ******************************************************************

var colorPos = "#00FF00";
var colorNeg = "#FF0000";
var borderString = "solid white 1px";
var colIdxMwSum = 7;
var mw = 0;
var mwPrev = 0;
var mwDiffAbsString = "";
var mwDiffRelString = "";
var color = "";

// Ueberschriften
appendCell(table.rows[0], titelMwAbsolut, "", "center");
appendCell(table.rows[0], titelMwRelativ, "", "center");
// Dicke Linie verlaengern
var newLength = table.rows[1].cells[0].getAttribute("colspan") + 2;
table.rows[1].cells[0].setAttribute("colspan", newLength);
// Werte berechnen und eintragen
for (var i = offsetTop; i < table.rows.length - offsetBottom; i++) {
    mw = stringToNumber(table.rows[i].cells[colIdxMwSum].textContent);
    mwPrev = stringToNumber(table.rows[i + 1].cells[colIdxMwSum].textContent);
    mwDiffAbsString = wholeNumberToString(mw - mwPrev);
    mwDiffRelString = decimalNumberToString((mw - mwPrev) / mwPrev, 2, true);
    color = (mw - mwPrev >= 0) ? colorPos : colorNeg;
    appendCell(table.rows[i], mwDiffAbsString, color, "right");
    appendCell(table.rows[i], mwDiffRelString, color, "right");
}
// Linien zeichnen
drawHorizontalLines(table, offsets, 1, 0);
// Wenn Popup-Fenster, dann verbreitern
if (isPopupWindow(this)) {
    this.resizeBy(this.innerWidth * popupFensterFaktorX, 0);
}

// ****************************************************************************
// Hilfsfunktionen
// ****************************************************************************

// Zeichnet horizontale Linien in eine Tabelle (jeweils als unteren Rand von Zellen)
// table: zu bearbeitende Tabelle
// offsets[0]/[1]: Anzahl Zeilen oben/unten, die ignoriert werden; [2]/[3]: Anzahl Spalten links/rechts, die ignoriert werden
// mode = 1: Saisons trennen ("i != i + 1")
// mode = 2: Abrechnungsperioden trennen ("% 7 == 0")
// mode = 3: Abrechnungsperioden trennen ("% 6 == 0")
// colIdx: Index der Spalte, die die zu vergleichenden Werte enthaelt
function drawHorizontalLines(table, offsets, mode, colIdx) {
    for (var i = offsets[0]; i < table.rows.length - offsets[1]; i++) {
        switch (mode) {
            case 1: // Saisons trennen
                var value1 = parseInt(table.rows[i].cells[colIdx].textContent);
                var value2 = parseInt(table.rows[i + 1].cells[colIdx].textContent);
                if (value1 != value2) {
                    for (var j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
                        table.rows[i].cells[j].style.borderBottom = borderString;
                    }
                }
                break;
            case 2: // Abrechnungsperioden trennen (Saison 1)
                var value = parseInt(table.rows[i].cells[colIdx].textContent);
                if (value % 7 == 0) {
                    for (var j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
                        table.rows[i].cells[j].style.borderBottom = borderString;
                    }
                }
                break;
            case 3: // Abrechnungsperioden trennen (Saisons > 1)
                var value = parseInt(table.rows[i].cells[colIdx].textContent);
                if (value % 6 == 0) {
                    for (var j = offsets[2]; j < table.rows[i].cells.length - offsets[3]; j++) {
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
// alignment: Ausrichtung des Texts (left, center, right)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color, alignment) {
    var returnValue = row.insertCell(-1);
    returnValue.textContent = content;
    returnValue.style.color = color;
    if (alignment != "") { returnValue.align = alignment; }
    return returnValue;
}

// Wandelt eine Dezimalzahl in einen String um ("." als Dezimalzeichen).
// Fuer Prozentzahlen wird der Wert verhundertfacht und " %" rechts angehaengt.
// number: Die Zahl, die umgewandelt werden soll
// decimalDigits: Anzahl der Nachkommastellen in der Ausgabe (werden erzwungen)
// percent: Ob die Zahl als Prozentwert dargestellt werden soll
function decimalNumberToString(number, decimalDigits, percent) {
    var returnValue = "";
    if (percent) { number *= 100; }
    number = number.toFixed(decimalDigits);
    returnValue = number.toString();
    if (percent) { returnValue += " %"; }
    return returnValue;
}

// Wandelt eine ganze Zahl in einen String um ("." als Tausenderzeichen).
// number: Die Zahl, die umgewandelt werden soll
function wholeNumberToString(number) {
    var returnValue = "";
    var temp = "";
    var counter = 0;
    for (var i = number.toString().length - 1; i >= 0; i--) {
        temp += number.toString().charAt(i);
        counter += 1;
        if (((counter % 3) == 0) && (i > 0) && (number.toString().charAt(i - 1) != "-")) { temp += "."; }
    }
    for (var i = temp.length - 1; i >= 0; i--) {
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

// Gibt true zurueck, wenn das uebergebene Fenster keine sichtbare Menueleiste hat.
// Im Allgemeinen ist das Fenster dann ein Popupfenster.
function isPopupWindow(aWindow) {
    return !(aWindow.menubar && aWindow.menubar.visible);
}
