// ==UserScript==
// @name OS2.jugendV2
// @description Jugendteam-Script fuer Online Soccer 2.0
// @include http://os.ongapo.com/ju.php?page=2
// @include http://online-soccer.eu/ju.php?page=2
// @include http://www.online-soccer.eu/ju.php?page=2
// ==/UserScript==

var url = window.location.href;
var borderString = "solid white 1px";
var colIndexAge = 3;
var rowOffsetUpper = 1;

addColumns();
separateAgeGroups();

function addColumns() {
	var playerRows = document.getElementsByTagName("table")[1].getElementsByTagName("tr");

	for (var i = 0; i < playerRows.length; i++) {
		var playerRow = playerRows[i];

		// Zellen hinzufuegen:
		var colIndexSkill = playerRow.cells.length;	// Skillschnitt
		playerRow.insertCell(-1);
		var colIndexOpti1 = playerRow.cells.length;	// Opti 1
		playerRow.insertCell(-1);
		var colIndexMW1 = playerRow.cells.length;	// Marktwert 1
		playerRow.insertCell(-1);
		var colIndexOpti2 = playerRow.cells.length;	// Opti 2
		playerRow.insertCell(-1);
		var colIndexMW2 = playerRow.cells.length;	// MW 2
		playerRow.insertCell(-1);

		if (i > 0) {
			var skill = getSkill(playerRow);
			if (playerRow.cells[colIndexAge].className == "TOR") {
				// Torwart:
				var alter = parseInt(playerRow.cells[colIndexAge].textContent);
				var pos1 = "TOR";
				var opti1 = getOptSkillTOR(playerRow);
				var color1 = getColor(pos1);
				var marktwert = getMarketValue(skill, opti1, alter);

				playerRow.cells[colIndexSkill].textContent = skill.toFixed(2);
				playerRow.cells[colIndexSkill].style.color = color1;
				playerRow.cells[colIndexOpti1].textContent = opti1.toFixed(2);
				playerRow.cells[colIndexOpti1].style.color = color1;
				playerRow.cells[colIndexMW1].textContent = getNumberString(marktwert.toString());
				playerRow.cells[colIndexMW1].style.color = color1;
			} else {
				// Feldspieler:
				var positionValues = getSortedValuesByPosition(playerRow);
				var pos1 = positionValues[0][0];
				var opti1 = positionValues[0][1];
				var marktwert1 = getNumberString((positionValues[0][2]).toString());
				var color1 = getColor(pos1);
				var pos2 = positionValues[1][0];
				var opti2 = positionValues[1][1];
				var marktwert2 = getNumberString((positionValues[1][2]).toString());
				var color2 = getColor(pos2);

				playerRow.cells[colIndexSkill].textContent = skill.toFixed(2);
				playerRow.cells[colIndexOpti1].textContent = opti1.toFixed(2);
				playerRow.cells[colIndexOpti1].style.color = color1;
				playerRow.cells[colIndexMW1].textContent = marktwert1;
				playerRow.cells[colIndexMW1].style.color = color1;
				playerRow.cells[colIndexOpti2].textContent = opti2.toFixed(2);
				playerRow.cells[colIndexMW2].textContent = marktwert2;
				playerRow.cells[colIndexMW2].style.color = color2;
				playerRow.cells[colIndexOpti2].style.color = color2;
			}
		} else {
			// Ueberschriften:
			playerRow.cells[colIndexSkill].textContent = "Skillschnitt";
			playerRow.cells[colIndexOpti1].textContent = "Opti 1";
			playerRow.cells[colIndexMW1].textContent = "Marktwert 1";
			playerRow.cells[colIndexOpti2].textContent = "Opti 2";
			playerRow.cells[colIndexMW2].textContent = "Marktwert 2";
		}
	}
}

function separateAgeGroups() {
	var playerTable = document.getElementsByTagName("table")[1];

	for (var i = rowOffsetUpper; i < playerTable.rows.length - 1; i++) {
		if (playerTable.rows[i].cells[colIndexAge].textContent != playerTable.rows[i + 1].cells[colIndexAge].textContent) {
			for (var j = colIndexAge; j < playerTable.rows[i].cells.length; j++) {
				playerTable.rows[i].cells[j].style.borderBottom = borderString;
			}
		}
	}
}

function getSortedValuesByPosition(playerRow) {
	var result = [];
	var skill = getSkill(playerRow);
	var alter = parseInt(playerRow.cells[colIndexAge].textContent);

	// Mit Reihenfolge ABW, DMI, MIT, OMI, STU initialisieren:
	for (var i = 0; i < 5; i++) {
		result[i] = [];
		switch (i) {
			case 0: result[i][0] = "ABW"; result[i][1] = getOptSkillABW(playerRow); break;
			case 1: result[i][0] = "DMI"; result[i][1] = getOptSkillDMI(playerRow); break;
			case 2: result[i][0] = "MIT"; result[i][1] = getOptSkillMIT(playerRow); break;
			case 3: result[i][0] = "OMI"; result[i][1] = getOptSkillOMI(playerRow); break;
			case 4: result[i][0] = "STU"; result[i][1] = getOptSkillSTU(playerRow); break;
		}
		// Marktwert hinzufuegen:
		result[i][2] = getMarketValue(skill, result[i][1], alter);
	}
	// Sortieren:
	sortValuesByPosition(result);
	return result;
}

function sortValuesByPosition(array) {
	var temp = [];
	var transposed = true;
	var length = array.length;

	while (transposed && (length > 1)) {
		transposed = false;
		for (var i = 0; i < length - 1; i++) {
			// Vergleich Opti-Werte:
			if (array[i][1] < array[i + 1][1]) {
				// vertauschen
				temp[0] = array[i][0];
				temp[1] = array[i][1];
				temp[2] = array[i][2];
				array[i][0] = array[i + 1][0];
				array[i][1] = array[i + 1][1];
				array[i][2] = array[i + 1][2];
				array[i + 1][0] = temp[0];
				array[i + 1][1] = temp[1];
				array[i + 1][2] = temp[2];
				transposed = true;
			}
		}
		length -= 1;
	}
}

function getSkill(playerRow) {
	var colIndexFirstSkill = 4;
	var colIndexLastSkill = 20;
	var summe = 0;

	for (var i = colIndexFirstSkill; i <= colIndexLastSkill; i++) {
		summe += parseInt(playerRow.cells[i].textContent);
	}
	return summe / 17;
}

function getMarketValue(skill, opti, alter) {
	return Math.round(Math.pow((1 + skill/100)*(1 + opti/100)*(2 - alter/100), 10) * 2);
}

function getNumberString(numberString) {
	if (numberString.lastIndexOf(".") != -1) {
		// Zahl enthaelt Dezimalpunkt
		var wholePart = numberString.substring(0, numberString.lastIndexOf("."));
		var decimalPart = numberString.substring(numberString.lastIndexOf(".") + 1, numberString.length);
		return getNumberString(wholePart) + "," + decimalPart;
	} else {
		// Kein Dezimalpunkt, fuege Tausender-Trennpunkte ein:
		// String umdrehen, nach jedem dritten Zeichen Punkt einfuegen, dann wieder umdrehen:
		var temp = reverseString(numberString);
		var result = "";
		for (var i = 0; i < temp.length; i++) {
			if ((i > 0) && (i % 3 == 0)) { result += "."; }
			result += temp.substr(i, 1);
		}
		return reverseString(result);
	}
}

function reverseString(string) {
	var result = "";
	for (var i = string.length - 1; i >= 0; i--) {
		result += string.substr(i, 1);
	}
	return result;
}

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

function getOptSkillTOR(playerRow) {
	var colIndicesPriTOR = new Array(6, 7, 8, 9);
	var colIndicesSecTOR = new Array(4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
	var sumPrimary = 0;
	var sumSecondary = 0;
	for (var i = 0; i < colIndicesPriTOR.length; i++) {
		sumPrimary += parseInt(playerRow.cells[colIndicesPriTOR[i]].textContent);
	}
	for (var i = 0; i < colIndicesSecTOR.length; i++) {
		sumSecondary += parseInt(playerRow.cells[colIndicesSecTOR[i]].textContent);
	}
	return (5 * sumPrimary + sumSecondary) / 27;
}

function getOptSkillABW(playerRow) {
	var colIndicesPriABW = new Array(6, 7, 8, 19);
	var colIndicesSecABW = new Array(4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20);
	var sumPrimary = 0;
	var sumSecondary = 0;
	for (var i = 0; i < colIndicesPriABW.length; i++) {
		sumPrimary += parseInt(playerRow.cells[colIndicesPriABW[i]].textContent);
	}
	for (var i = 0; i < colIndicesSecABW.length; i++) {
		sumSecondary += parseInt(playerRow.cells[colIndicesSecABW[i]].textContent);
	}
	return (5 * sumPrimary + sumSecondary) / 27;
}

function getOptSkillDMI(playerRow) {
	var colIndicesPriDMI = new Array(5, 8, 13, 15);
	var colIndicesSecDMI = new Array(4, 6, 7, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20);
	var sumPrimary = 0;
	var sumSecondary = 0;
	for (var i = 0; i < colIndicesPriDMI.length; i++) {
		sumPrimary += parseInt(playerRow.cells[colIndicesPriDMI[i]].textContent);
	}
	for (var i = 0; i < colIndicesSecDMI.length; i++) {
		sumSecondary += parseInt(playerRow.cells[colIndicesSecDMI[i]].textContent);
	}
	return (5 * sumPrimary + sumSecondary) / 27;
}

function getOptSkillMIT(playerRow) {
	var colIndicesPriMIT = new Array(5, 7, 13, 15);
	var colIndicesSecMIT = new Array(4, 6, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 20);
	var sumPrimary = 0;
	var sumSecondary = 0;
	for (var i = 0; i < colIndicesPriMIT.length; i++) {
		sumPrimary += parseInt(playerRow.cells[colIndicesPriMIT[i]].textContent);
	}
	for (var i = 0; i < colIndicesSecMIT.length; i++) {
		sumSecondary += parseInt(playerRow.cells[colIndicesSecMIT[i]].textContent);
	}
	return (5 * sumPrimary + sumSecondary) / 27;
}

function getOptSkillOMI(playerRow) {
	var colIndicesPriOMI = new Array(5, 9, 13, 15);
	var colIndicesSecOMI = new Array(4, 6, 7, 8, 10, 11, 12, 14, 16, 17, 18, 19, 20);
	var sumPrimary = 0;
	var sumSecondary = 0;
	for (var i = 0; i < colIndicesPriOMI.length; i++) {
		sumPrimary += parseInt(playerRow.cells[colIndicesPriOMI[i]].textContent);
	}
	for (var i = 0; i < colIndicesSecOMI.length; i++) {
		sumSecondary += parseInt(playerRow.cells[colIndicesSecOMI[i]].textContent);
	}
	return (5 * sumPrimary + sumSecondary) / 27;
}

function getOptSkillSTU(playerRow) {
	var colIndicesPriSTU = new Array(4, 6, 7, 9);
	var colIndicesSecSTU = new Array(5, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
	var sumPrimary = 0;
	var sumSecondary = 0;
	for (var i = 0; i < colIndicesPriSTU.length; i++) {
		sumPrimary += parseInt(playerRow.cells[colIndicesPriSTU[i]].textContent);
	}
	for (var i = 0; i < colIndicesSecSTU.length; i++) {
		sumSecondary += parseInt(playerRow.cells[colIndicesSecSTU[i]].textContent);
	}
	return (5 * sumPrimary + sumSecondary) / 27;
}
