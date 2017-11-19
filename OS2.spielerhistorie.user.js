// ==UserScript==
// @name OS2.spielerhistorie
// @version 0.1
// @description OS 2.0 - Zeigt absoluten und relativen MW-Zuwachs in Spielerhistorie an
// @include http://os.ongapo.com/sp.php?s=*
// @include http://www.os.ongapo.com/sp.php?s=*
// @include http://online-soccer.eu/sp.php?s=*
// @include http://www.online-soccer.eu/sp.php?s=*
// @grant none
// ==/UserScript==

// Konfiguration ************************************************************************
var titelMwAbsolut = "\u0394MW abs."; // Titel der Spalte fuer die absolute MW-Differenz
var titelMwRelativ = "\u0394MW rel."; // Titel der Spalte fuer die relative MW-Differenz
var tabellenbreite = 600; // Breite der Tabelle in Pixel (standardmaessig 750)
var textAusrichtung = "right"; // Text-Ausrichtung in den neuen Spalten
// Konfiguration Ende *******************************************************************

var colorPos = "#00FF00";
var colorNeg = "#FF0000";
var borderString = "solid white 1px";
var offsetTop = 1;
var offsetBottom = 1;
var table = document.getElementById("e").getElementsByTagName("table")[0];
var offsets = [offsetTop, offsetBottom, 0, 0]; // 1 Zeilen oben, 1 Zeile unten ausschliessen
var colIdxMwSum = 2;

var mw = 0;
var mwPrev = 0;
var mwDiffAbsString = "";
var mwDiffRelString = "";
var color = "";

// Tabellenbreite
table.setAttribute("width", tabellenbreite);
// Ueberschriften
appendCell(table.rows[0], titelMwAbsolut, "", "center");
appendCell(table.rows[0], titelMwRelativ, "", "center");
// Werte berechnen und eintragen
for (var i = offsetTop; i < table.rows.length - offsetBottom; i++) {
	mw = stringToNumber(table.rows[i].cells[colIdxMwSum].textContent);
	mwPrev = stringToNumber(table.rows[i + 1].cells[colIdxMwSum].textContent);
	mwDiffAbsString = wholeNumberToString(mw - mwPrev);
	mwDiffRelString = decimalNumberToString((mw - mwPrev) / mwPrev, 2, true);
	color = (mw - mwPrev >= 0) ? colorPos : colorNeg;
	appendCell(table.rows[i], mwDiffAbsString, color, textAusrichtung);
	appendCell(table.rows[i], mwDiffRelString, color, textAusrichtung);
}
// Linien zeichnen
drawHorizontalLines(table, offsets, 1, 5);

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
