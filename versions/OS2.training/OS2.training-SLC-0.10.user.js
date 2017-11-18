// ==UserScript==
// @name         OS2.training
// @namespace    http://os.ongapo.com/
// @version      1.0 SLC
// @copyright    2013+
// @author       Andreas Eckes (Strindheim BK)
// @author       Sven Loges (SLC)
// @description  OS 2.0 - Berechnet die Trainingswahrscheinlichkeiten abhaengig von der Art des Einsatzes
// @include      http*://os.ongapo.com/training.php
// @include      http*://www.os.ongapo.com/training.php
// @include      http*://online-soccer.eu/training.php
// @include      http*://www.online-soccer.eu/training.php
// @grant        none
// ==/UserScript==

var trainingTable = document.getElementsByTagName("table")[2];
var titleProb1 = "Bankeinsatz";
var titleProb2 = "Teilweise";
var titleProb3 = "Durchgehend";
var titlePS = "Primary";
var titleValue = "EW";
var titleProb = "WS";

var colIdxSkill = 5;
var colIdxChance = 7;

var colIdxAlter = 2;
var colIdxTSkill = 4;
var colIdxPSkill = 6;

var sum = 0.0;

procTraining();
addWarning();

// Fuegt einen Hinweis zur maximalen Trainingswahrscheinlichkeit in den Textbereich ueber der Tabelle hinzu
function addWarning() {
	var warning1 = "Die in den Spalten \"" + titleProb1 + "\", \"" + titleProb2 + "\" und \"" + titleProb3 +
			           "\" angegebenen Wahrscheinlichkeiten dienen nur zur Orientierung!";
	var warning2 = "Die maximale Wahrscheinlichkeit einer Aufwertung ist immer 99.00 %! Zu erwartende Aufwertungen = " + sum.toFixed(2).toString();

	var table = document.getElementsByTagName("table")[1];
	var newCell1 = table.insertRow(-1).insertCell(-1);
	newCell1.setAttribute("colspan", 4, false);
	newCell1.textContent = warning1;
	//newCell1.style.color = "#FFFF00";
	var newCell2 = table.insertRow(-1).insertCell(-1);
	newCell2.setAttribute("colspan", 3, false);
	newCell2.textContent = warning2;
}

// Verarbeitet die Trainings-Seite
function procTraining() {
	var colWidth = 80;
	var colWidth2 = 40;

	// Ueberschriften hinzufuegen
	var titleRow = trainingTable.rows[0];

	var orgLength = titleRow.cells.length;
	appendCell(titleRow, titleProb1);
	appendCell(titleRow, titleProb2);
	appendCell(titleRow, titleProb3);

	var col2 = titleRow.cells.length;
	appendCell(titleRow, titlePS);
	appendCell(titleRow, titleValue);
	appendCell(titleRow, titleProb);

	// Breite der neuen Spalten festlegen
	for (var i = orgLength + 1; i < titleRow.cells.length; i++) {
		titleRow.cells[i].setAttribute("width", (i < col2) ? colWidth : colWidth2, false);
	}

	// Wahrscheinlichkeiten eintragen
	var currentRow;
	var color;
	var pos;
	var skill;
	var practice;
	var practicePS;
	var value;
	var valueStr;
	var probStr;
	sum = 0.0;console.log("====");
	for (i = 1; i < trainingTable.rows.length; i++) {
		currentRow = trainingTable.rows[i];console.log(currentRow);
		pos = getPos(currentRow);
		skill = getSkill(currentRow);
		color = getColor(pos);
		probString = getProbString(currentRow);
		practice = (getProbability(probString, 0) !== "");
		practicePS = practice && isPrimarySkill(pos, skill);
		if (practice) {
			value = parseFloat(probString) * (practicePS ? 5 : 1) / 100.0;
			sum += value;
		} else {
			value = 0.0;
		}
		valueStr = value.toFixed(2).toString();console.log(valueStr);
		probStr = calcProbPercent(getAlter(currentRow), getPSkill(currentRow), getTSkill(currentRow));
		for (var j = 1; j <= 3; j++) {
			appendCell(currentRow, getProbability(probString, j), color);
		}
		appendCell(currentRow, practicePS ? skill : "", color);
		appendCell(currentRow, valueStr, color);
		appendCell(currentRow, probStr, color);
/*		if (practicePS) {
			for (var j = 0; j < currentRow.length; j++) {
				currentRow.cells[j].style.color = "#FFFFFF";
				currentRow.cells[j].style.fontWeight = "bold";
			}
		}*/
	}
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
	row.cells[colIdx].style.color = color;
}

// Gibt die Trainingswahrscheinlichkeit zurueck
// Format der Rueckgabe: "aaa.bb %", "aa.bb %" bzw. "a.bb %" (keine Deckelung bei 99.00 %)
// probString: Basis-Wahrscheinlichkeit (= Tribuene) als Prozent-String
// mode: Art des Einsatzes: 0 - Tribuene, 1 - Bank, 2 - Teilweiser Einsatz, 3 - Volleinsatz
function getProbability(probString, mode) {
	if ((probString == "0.00 %") || (probString == "Trainerskill zu niedrig!")) {
		return "";
	}

	var prob1 = 1.1;
	var prob2 = 1.25;
	var prob3 = 1.35;

	var returnValue = parseFloat(probString);
	switch(mode) {
		case 0: break;
		case 1: returnValue *= prob1; break;
		case 2: returnValue *= prob2; break;
		case 3: returnValue *= prob3; break;
	}

	return returnValue.toFixed(2).toString() + " %";
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
		default:	return "";
	}
}

// Gibt die zur Position gehoerigen Primaerskills zurueck
function getPrimarySkills(pos) {
	switch (pos) {
		case "TOR": return "FAN,STB,SPL,REF";
		case "ABW": return "KOB,ZWK,DEC,ZUV";
		case "DMI": return "BAK,DEC,PAS,UEB";
		case "MIT": return "BAK,ZWK,PAS,UEB";
		case "OMI": return "BAK,GES,PAS,UEB";
		case "STU": return "SCH,KOB,ZWK,GES";
		case "LEI": return "";
		default:	return "";
	}
}

// Gibt zurueck, ob der Skill ein zur Position gehoeriger Primaerskill ist
function isPrimarySkill(pos, skill) {
	var primarySkills = getPrimarySkills(pos);
	return (primarySkills.indexOf(skill) > -1);
}

// Gibt die Position dieser Zeile zurueck
function getPos(row) {
	pos = row.cells[colIdxChance].className;
	return pos;
}

// Gibt den Skill dieser Zeile zurueck
function getSkill(row) {
	HTML = row.cells[colIdxSkill].innerHTML;
	//skill = HTML.substr(HTML.indexOf("\"selected\"") + 11, 3);
	skill = HTML.substr(HTML.indexOf("selected=\"\"") + 12, 3);
	return skill;
}

// Gibt die Wahrscheinlichkeit fuer eine Aufwertung zurueck
function getProbString(row) {
	probString = row.cells[colIdxChance].textContent;
	return probString;
}

// Gibt das Alter des Spielers dieser Zeile zurueck
function getAlter(row) {console.log("ALTER");
	alterStr = row.cells[colIdxAlter].textContent;console.log(alterStr);
	return parseInt(alterStr, 10);
}

// Gibt den Skillwert des trainierten Skills des Spielers dieser Zeile zurueck
function getPSkill(row) {console.log("PSKILL");
	pSkillStr = row.cells[colIdxPSkill].textContent;console.log(pSkillStr);
	return ((pSkillStr.length === 0) ? 0 : parseInt(pSkillStr, 10));
}

// Gibt den Trainer-Skill dieser Zeile zurueck
function getTSkill(row) {console.log("TSKILL");
	HTML = row.cells[colIdxTSkill].innerHTML;
	//tSkillStr = HTML.substr(HTML.indexOf("\"selected\"") + 15);
	tSkillStr = HTML.substr(HTML.indexOf("selected=\"\"") + 16);console.log(tSkillStr);
	tSkill = ((tSkillStr.substr(0, 1) === '/') ? 0 : parseInt(tSkillStr.substr(0, tSkillStr.indexOf('<')), 10));
	return tSkill;
}

// Konstante 0.99 ^ 99
const __099HOCH99 = 0.36972963764972677265718790562881;

// Gibt die Wahrscheinlichkeit fuer ein Training zurueck
// alter: Alter des Spielers
// pSkill: Derzeitiger Wert des zu trainierenden Spieler-Skills
// tSkill: Trainer-Skill (60, 62.5, ..., 97.5, 99.5)
// limit: Obere Grenze (99), Default ist unbegrenzt (undefined)
function calcProbPercent(alter, pSkill, tSkill = 99.5, limit = undefined) {
    const __SKILLDIFF = Math.max(0, tSkill - pSkill);
    const __SKILLFACT = (0.5 + __SKILLDIFF) / (100.5 - __SKILLDIFF);
    const __ALTERFACT = Math.pow((100 - alter) / 37, 7);
    const __PROB = __099HOCH99 * __SKILLFACT * __ALTERFACT;

    return ((limit === undefined) ? __PROB : Math.min(limit, __PROB));
}
