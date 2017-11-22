// ==UserScript==
// @name OS2.master
// @description Master-Script fuer Online Soccer 2.2
// @include http://os.ongapo.com/sp.php?*
// @include http://os.ongapo.com/st.php?c=*
// @include http://os.ongapo.com/st.php?s=*
// @include http://os.ongapo.com/showteam.php
// @include http://os.ongapo.com/showteam.php?s=*
// @include http://www.os.ongapo.com/sp.php?*
// @include http://www.os.ongapo.com/st.php?c=*
// @include http://www.os.ongapo.com/st.php?s=*
// @include http://www.os.ongapo.com/showteam.php
// @include http://www.os.ongapo.com/showteam.php?s=*
// @include http://online-soccer.eu/sp.php?*
// @include http://online-soccer.eu/st.php?c=*
// @include http://online-soccer.eu/st.php?s=*
// @include http://online-soccer.eu/showteam.php
// @include http://online-soccer.eu/showteam.php?s=*
// @include http://www.online-soccer.eu/sp.php?*
// @include http://www.online-soccer.eu/st.php?c=*
// @include http://www.online-soccer.eu/st.php?s=*
// @include http://www.online-soccer.eu/showteam.php
// @include http://www.online-soccer.eu/showteam.php?s=*
// ==/UserScript==

// Script wird angewendet auf
// - Spielerprofil
// - Teamansicht in Popupfenster
// - Teamansicht in Hauptfenster

// URL-Legende:
// .../showteam.php?s=_Eigenes Team (Browser-Hauptfenster)
// .../st.php?s=_&c=_Beliebiges Team (Popup-Fenster)
// .../sp.php?s=_Spielerprofil
// .../tplatz.php?t=_Tabellenplätze
// sSeitenindex / Spielerindex (im Spielerprofil)
// c, tTeamindex
// s=0Teamübersicht
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

// Variablen zur Identifikation der Seite
var sp = false;// Spielerprofil
var st = false;// Teamansicht Popupfenster
var showteam = false;// Teamansicht Hauptfenster
var guessFIT = true;// Fitness anhand der Einsätze vermuten
mulTOR = 5;// Multiplikator im Score für TOR; Feldspieler haben Gewicht 1
var s = -1;// Seitenindex

url = window.location.href;
osBlau = "#111166";
borderString = "solid white 1px";
playerProfileWindowOffsetY = 80;

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

// Seite ermitteln
if (url.match(/sp\.php/)) { sp = true; }
if (url.match(/st\.php/)) { st = true; }
if (url.match(/\/www\./)) { guessFIT = false; }
if (url.match(/showteam\.php/)) {
	showteam = true;
	colIdxMOR = 9;
	colIdxFIT = 10;
	colIdxSkill += 2;
	colIdxOpti += 2;
	colIdxVerl += 2;
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
	var skills = getArrayPositionOfSkillsOnDetailsPage(pos);// Liste der Indizes der Primärskills

	for (var i = 0; i < skills.length; i++) {
		tdTags[skills[i]].style.color = getColor(pos);
		tdTags[skills[i]].style.fontWeight = 'bold';
	}
}

// Verarbeitet Spielerprofil "Spielerhistorie"
function procPlayerHistory() {
	// Spielerdaten sind in der ersten Tabelle im HTML-Element mit ID "e":
	separateSeasons(document.getElementById("e").getElementsByTagName("table")[0], 1, 1, 5);
}

// Verarbeitet Spielerprofil "Teamübersicht"
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
		if ((getPosId(pos) >= 0) && (getFIT(currentRow) > 0)) {
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
			mul = (j == 0) ? mulTOR : 1;	// TOR wird besser gewichtet
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
		var teamName = "|------|";
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
}

// Verarbeitet Ansicht "Einzelwerte"
function procSingleValues() {
	var playerTable = document.getElementById("team");
	var rowOffsetUpper = 1;
	var rowOffsetLower = 1;
	var colWidth = 40;
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
	appendCell(title2Row, "FixVals");
	appendCell(title2Row, "Prios");
	appendCell(title2Row, "Skill");
	appendCell(title2Row, "Opti");

	// Breite und Sortierung der neuen Spalten festlegen
	for (var i = orgLength + 1; i < titleRow.cells.length; i++) {
		var txt = titleRow.cells[i].textContent;
		titleRow.cells[i].setAttribute("width", colWidth, false);
	        titleRow.cells[i].innerHTML = '<a href="#" class="sortheader" onclick="ts_resortTable(this);return false;">'+txt+'<span class="sortarrow"</span></a>';
	        title2Row.cells[i] = titleRow.cells[i];
	}

	for (var i = rowOffsetUpper; i < playerTable.rows.length - rowOffsetLower; i++) {
		var currentRow = playerTable.rows[i];
		var pos = currentRow.cells[0].className;// Position des Spielers ermitteln
		var skills = (pos == "LEI") ? getArrayPositionOfLEISkillsOnGlobalPage(currentRow)
				: getArrayPositionOfSkillsOnGlobalPage(pos);// Liste der Indizes der Primärskills
		var color = getColor(pos);
		var sumSkill = 0;
		var sumFixVal = 0;
		var sumPrio = 0;

		for (var idx = 4; idx < 21; idx++) {
			sumSkill += getEinzelSkill(currentRow, idx);
		}

		for (var j = 0; j < fixSkills.length; j++) {
			sumFixVal += getEinzelSkill(currentRow, fixSkills[j]);
		}

		for (var j = 0; j < skills.length; j++) {
			currentRow.cells[skills[j]].style.color = osBlau;
			currentRow.cells[skills[j]].style.backgroundColor = color;
			currentRow.cells[skills[j]].style.fontWeight = 'bold';

			sumPrio += getEinzelSkill(currentRow, skills[j]);
		}

		var avgSkill = sumSkill / 17;
		var avgOpti = (sumSkill + 4 * sumPrio) / 27;
		var avgFixVal = sumFixVal / fixSkills.length;
		var avgPrio = sumPrio / skills.length;

		appendCell(currentRow, avgFixVal.toFixed(prec), color);
		appendCell(currentRow, avgPrio.toFixed(prec), color);
		appendCell(currentRow, avgSkill.toFixed(prec2), color);
		appendCell(currentRow, avgOpti.toFixed(prec2), color);
	}
}

// Verarbeitet Ansichten "Statistik Saison" und "Statistik Gesamt"
function procStatistics() {
	var playerTable = document.getElementsByTagName("table")[2];
	var statisticsArray = [];// Array der Statistikwerte
	var maxValues = [];// Liste der Höchstwerte
	var rowOffsetUpper = 2;
	var rowOffsetLower = 2;
	var columnOffset = 4;// 4 fuehrende Spalten sind irrelevant
	var numberOfCompetitions = 4;// 4 Wettbewerbe (LI, LP, IP, FS)
	var numberOfCategories = 6;// 6 Kategorien (Spiele, Tore, Vorlagen, Score, Gelb, Rot)

	var numberOfPlayers = playerTable.rows.length - (rowOffsetUpper + rowOffsetLower);
	var numberOfStatistics = numberOfCategories*numberOfCompetitions;

	// statisticsArray füllen
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
	// Höchstwerte markieren
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
	// Sonderbehandlung der Über- und Unterschriftszeilen (je 1 Spalte weniger)
	for (var j = 0; j < numberOfCategories - 1; j++) {
		var columnIndexCompetition = numberOfCompetitions*(j + 1) + columnOffset - 1;
		playerTable.rows[1].cells[columnIndexCompetition].style.borderLeft = borderString;
		playerTable.rows[playerTable.rows.length - 2].cells[columnIndexCompetition].style.borderLeft = borderString;
	}
}

// Verarbeitet die URL der Seite und ermittelt die Nummer der gewünschten Unterseite
// url Adresse der Seite
function getPageIdFromURL(url) {
    // Variablen zur Identifikation der Seite
    var indexS = url.lastIndexOf("s=");
    var st = url.match(/st\.php/);              // Teamansicht Popupfenster
    var showteam = url.match(/showteam\.php/);  // Teamansicht Hauptfenster
    var s = -1;                                 // Seitenindex (Rückgabewert)
    
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

// Gibt die Indizes der Primärskills in der Detailansicht zurück
function getArrayPositionOfSkillsOnDetailsPage(pos) {
	switch (pos) {
		case "TOR": return new Array(36,38,40,42);
		case "ABW": return new Array(36,38,40,62);
		case "DMI": return new Array(50,54,40,34);
		case "MIT": return new Array(50,54,38,34);
		case "OMI": return new Array(50,54,34,42);
		case "STU": return new Array(32,36,42,38);
		default:	return new Array();
	}
}

// Gibt die Indizes der Primärskills in der Einzelwertansicht zurück
function getArrayPositionOfSkillsOnGlobalPage(pos) {
	switch (pos) {
		case "TOR": return new Array(6,7,8,9);
		case "ABW": return new Array(6,7,8,19);
		case "DMI": return new Array(13,15,8,5);
		case "MIT": return new Array(13,15,7,5);
		case "OMI": return new Array(13,15,9,5);
		case "STU": return new Array(4,6,7,9);
		default:	return new Array();
	}
}

// Gibt die Indizes der Primärskills von Leihspielern in der Einzelwertansicht zurück
function getArrayPositionOfLEISkillsOnGlobalPage(row) {
	var skills = new Array();
	for (var idx = 4; idx < 21; idx++) {
		if (row.cells[idx].style.fontWeight == "bold") {
			skills.push(idx);
		}
	}
	return skills;
}

// Gibt die Positionsstärken dieser Zeile zurueck
function getArrayPosSkills(row) {
	var ret = new Array(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
	var pos = getPos(row);
	var posId = getPosId(pos);
	var skill = getSkill(row);
	var opti = getOpti(row);
	var prio = getPrio(row);
	var alter = getAlter(row);
	var MOR = getMOR(row);
	var FIT = getFIT(row);
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

// Liefert das "beste" verfügbare Team
function getBestTeam(score, rest) {
	var ret = new Array();
	ret.push(new Array());	// Zeilennummern
	ret.push(new Array());	// Score-Werte
	ret.push(new Array());	// Original-Score-Werte
	var posIds = new Array(0,2,4,1,5,1,5,4,1,5,3);
	var altPos = new Array(0,2,4,1,5,1,2,2,2,4,2);
	for (var i = 0; (i < posIds.length) && (rest.length > 0); i++) {
		var bestId = 0;
		var bestIndex = rest[bestId];
		var best = score[bestIndex][posIds[i]];
		for (var j = 0; j < rest.length; j++) {
			var posId = posIds[i];
			var value = score[rest[j]][posId];
			if ((altPos[i] > -1) && (altPos[i] != posId)) {	// check flex pos
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
		default:	return "";
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
		default:	return -1;
	}
}

// Gibt den Namen des Kaders zurueck
function getTeamName(index) {
	switch (index) {
		case 0: return "A-Team";
		case 1: return "B-Team";
		case 2: return "Reserve";
		default:	return "|------|";
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
