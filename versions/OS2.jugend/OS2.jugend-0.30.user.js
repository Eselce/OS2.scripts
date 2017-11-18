// ==UserScript==
// @name OS2.jugendV3
// @description Jugendteam-Script fuer Online Soccer 2.0
// @include http://os.ongapo.com/ju.php?page=2
// @include http://online-soccer.eu/ju.php?page=2
// @include http://www.online-soccer.eu/ju.php?page=2
// ==/UserScript==

// Konfiguration ************************************************************************

// Entscheidend fuer die Berechnung der Werte mit Ende 18, sollte also moeglichst aktuell sein
// Fuer jeden Skill wird anhand der Ist-Daten die Anzahl an Aufwertungen pro Zat bestimmt
// Diese Zahl wird auch fuer die Zukunft angenommen
// D.h. es wird angenommen, dass jeder Spieler bis zum Ende genau so trainiert wie bisher
var aktuellerZat = 1;

// Spaltenauswahl fuer die aktuellen Werte (true = anzeigen, false = nicht anzeigen)
// anzahlOpti gibt die Anzahl der Opti-Spalten an
// 1: nur bester Opti, 2: die beiden besten, ..., 6: Alle inklusive TOR
// Bei Torhuetern wird immer nur der TOR-Opti angezeigt
// Werte < 1 oder > 6 schalten die Anzeige aus
// anzahlMW funktioniert analog
var zeigeSkill = true;
var zeigePosition = false;
var anzahlOpti = 1;
var anzahlMW = 1;

// Spaltenauswahl fuer die Werte mit Ende 18
// Bedeutungen sind wie fuer die aktuellen Werte
var zeigeSkillEnde = true;
var anzahlOptiEnde = 1;
var anzahlMWEnde = 1;

// Text, mit dem die "Ende 18"-Spaltentitel gekennzeichnet werden
// "\u03A9" stellt das Unicode-Zeichen Nummer 03A9 dar (grosses Omega)
var kennzeichenEnde = " \u03A9";

// Variablen ****************************************************************************

var url = window.location.href;
var borderString = "solid white 1px";
var titleColor = "#FFFFFF";
var rowOffset = 1;
var players = [];
var playerRows = document.getElementsByTagName("table")[1].getElementsByTagName("tr");

// Programm *****************************************************************************

var colMan = new ColumnManager();
colMan.addTitles();
init();
for (var i = 0; i < players.length; i++) {
	colMan.addValues(players[i], playerRows[i + rowOffset]);
}
separateAgeGroups();
// Spaltentitel zentrieren
playerRows[0].align = "center";

// Funktionen ***************************************************************************

// Erschafft die Spieler-Objekte und fuellt sie mit Werten
//
function init() {
	var playerRow;
	var age;
	var skills;
	var isGoalie;
	for (var i = rowOffset; i < playerRows.length; i++) {
		playerRow = playerRows[i];
		age = getAgeFromHTML(playerRow);
		skills = getSkillsFromHTML(playerRow);
		isGoalie = isGoalieFromHTML(playerRow);
		players[i - rowOffset] = new PlayerRecord(age, skills, isGoalie);
		players[i - rowOffset].initPlayer();
	}
}

// Trennt die Jahrgaenge mit Linien
//
function separateAgeGroups() {
	var colIdxAge = 3;
	var playerTable = document.getElementsByTagName("table")[1];

	for (var i = rowOffset; i < playerTable.rows.length - 1; i++) {
		if (playerTable.rows[i].cells[colIdxAge].textContent != playerTable.rows[i + 1].cells[colIdxAge].textContent) {
			for (var j = colIdxAge; j < playerTable.rows[i].cells.length; j++) {
				playerTable.rows[i].cells[j].style.borderBottom = borderString;
			}
		}
	}
}

// Klasse ColumnManager *****************************************************************

function ColumnManager() {
	this.skill = zeigeSkill;
	this.pos = zeigePosition;
	this.opti = ((anzahlOpti >= 1) && (anzahlOpti <= 6)) ? true : false;
	this.mw = ((anzahlMW >= 1) && (anzahlMW <= 6)) ? true : false;
	this.anzOpti = anzahlOpti;
	this.anzMw = anzahlMW;
	this.skillE = zeigeSkillEnde;
	this.optiE = ((anzahlOptiEnde >= 1) && (anzahlOptiEnde <= 6)) ? true : false;
	this.mwE = ((anzahlMWEnde >= 1) && (anzahlMWEnde <= 6)) ? true : false;
	this.anzOptiE = anzahlOptiEnde;
	this.anzMwE = anzahlMWEnde;
	this.kennzE = kennzeichenEnde;

	this.toString = function() {
		var result = "Skillschnitt\t\t" + this.skill + "\n";
		result += "Beste Position\t" + this.pos + "\n";
		result += "Optis\t\t\t" + this.opti + " (" + this.anzOpti + ")\n";
		result += "Marktwerte\t\t" + this.mw + " (" + this.anzMw + ")\n";
		result += "Skillschnitt Ende\t" + this.skillE + "\n";
		result += "Optis Ende\t\t" + this.optiE + " (" + this.anzOptiE + ")\n";
		result += "Marktwerte Ende\t" + this.mwE + " (" + this.anzMwE + ")\n";
		return result;
	}

	this.addCell = function(tableRow) {
		tableRow.insertCell(-1);
		return tableRow.cells.length - 1;
	}

	this.addAndFillCell = function(tableRow, value, color) {
		if (isFinite(value) && (value !== true) && (value !== false)) {
			// Zahl einfuegen
			if (value < 1000) {
				// Mit 2 Nachkommastellen darstellen
				tableRow.cells[this.addCell(tableRow)].textContent = value.toFixed(2);
			} else {
				// Mit Tausenderpunkten darstellen
				tableRow.cells[this.addCell(tableRow)].textContent = getNumberString(value.toString());
			}
		} else {
			// String einfuegen
			tableRow.cells[this.addCell(tableRow)].textContent = value;
		}
		tableRow.cells[tableRow.cells.length - 1].style.color = color;
	}

	this.addTitles = function() {
		// Titel fuer die aktuellen Werte
		if (this.skill) { this.addAndFillCell(playerRows[0], "Skill", titleColor); }
		if (this.pos) { this.addAndFillCell(playerRows[0], "Pos", titleColor); }
		if (this.opti) {
			for (var i = 1; i <= this.anzOpti; i++) {
				this.addAndFillCell(playerRows[0], "Opti " + i, titleColor);
				if (this.mw && (this.anzMw >= i)) {
					this.addAndFillCell(playerRows[0], "MW " + i, titleColor);
				}
			}
			if (this.mw) {
				for (var i = this.anzOpti + 1; i <= this.anzMw; i++) {
					// Mehr MW- als Opti-Spalten
					this.addAndFillCell(playerRows[0], "MW " + i, titleColor);
				}
			}
		} else if (this.mw) {
			// Keine Opti-, dafuer MW-Spalten
			for (var i = 1; i <= this.anzMw; i++) {
				this.addAndFillCell(playerRows[0], "MW " + i, titleColor);
			}
		}

		// Titel fuer die Werte mit Ende 18
		if (this.skillE) { this.addAndFillCell(playerRows[0], "Skill" + this.kennzE, titleColor); }
		if (this.optiE) {
			for (var i = 1; i <= this.anzOptiE; i++) {
				this.addAndFillCell(playerRows[0], "Opti " + i + this.kennzE, titleColor);
				if (this.mwE && (this.anzMwE >= i)) {
					this.addAndFillCell(playerRows[0], "MW " + i + this.kennzE, titleColor);
				}
			}
			if (this.mwE) {
				for (var i = this.anzOptiE + 1; i <= this.anzMwE; i++) {
					this.addAndFillCell(playerRows[0], "MW " + i + this.kennzE, titleColor);
				}
			}
		} else if (this.mwE) {
			for (var i = 1; i <= this.anzMwE; i++) {
				this.addAndFillCell(playerRows[0], "MW " + i + this.kennzE, titleColor);
			}
		}
	} // Ende addTitles()

	this.addValues = function(player, playerRow) {
		// Aktuelle Werte
		if (this.skill) {
			if (player.isGoalie) { this.addAndFillCell(playerRow, player.getSkill(true), getColor("TOR")); }
			else { this.addAndFillCell(playerRow, player.getSkill(true), titleColor); }
		}
		if (this.pos) {
			if (player.isGoalie) { this.addAndFillCell(playerRow, "TOR", getColor("TOR")); }
			else { this.addAndFillCell(playerRow, player.getPos(1), getColor(player.getPos(1))); }
		}
		if (this.opti) {
			for (var i = 1; i <= this.anzOpti; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-Opti anzeigen
						this.addAndFillCell(playerRow, player.getOpti("TOR", true), getColor("TOR"));
					} else {
						// TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-Opti anzeigen
					this.addAndFillCell(playerRow, player.getOpti(player.getPos(i), true), getColor(player.getPos(i)));
				}
				if (this.mw && (this.anzMw >= i)) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", true), getColor("TOR"));
						} else {
							// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), true), getColor(player.getPos(i)));
					}
				}
			}
			// Verbleibende MW anzeigen
			if (this.mw) {
				for (var i = this.anzOpti + 1; i <= this.anzMw; i++) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", true), getColor("TOR"));
						} else {
							// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), true), getColor(player.getPos(i)));
					}
				}
			}
		} else if (this.mw) {
			// Opti soll nicht angezeigt werden, dafuer aber MW
			for (var i = 1; i <= this.anzMw; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue("TOR", true), getColor("TOR"));
					} else {
						// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-MW anzeigen
					this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), true), getColor(player.getPos(i)));
				}
			}
		}

		// Werte mit Ende 18
		if (this.skillE) {
			if (player.isGoalie) { this.addAndFillCell(playerRow, player.getSkill(false), getColor("TOR")); }
			else { this.addAndFillCell(playerRow, player.getSkill(false), titleColor); }
		}
		if (this.optiE) {
			for (var i = 1; i <= this.anzOptiE; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-Opti anzeigen
						this.addAndFillCell(playerRow, player.getOpti("TOR", false), getColor("TOR"));
					} else {
						// TOR, aber nicht bester Opti -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-Opti anzeigen
					this.addAndFillCell(playerRow, player.getOpti(player.getPos(i), false), getColor(player.getPos(i)));
				}
				if (this.mwE && (this.anzMwE >= i)) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", false), getColor("TOR"));
						} else {
							// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), false), getColor(player.getPos(i)));
					}
				}
			}
			// Verbleibende MW anzeigen
			if (this.mwE) {
				for (var i = this.anzOptiE + 1; i <= this.anzMwE; i++) {
					if (player.isGoalie) {
						if (i == 1) {
							// TOR-MW anzeigen
							this.addAndFillCell(playerRow, player.getMarketValue("TOR", false), getColor("TOR"));
						} else {
						 	// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
							this.addCell(playerRow);
						}
					} else {
						// Feld-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), false), getColor(player.getPos(i)));
					}
				}
			}
		} else if (this.mwE) {
			// Opti soll nicht angezeigt werden, dafuer aber MW
			for (var i = 1; i <= this.anzMwE; i++) {
				if (player.isGoalie) {
					if (i == 1) {
						// TOR-MW anzeigen
						this.addAndFillCell(playerRow, player.getMarketValue("TOR", false), getColor("TOR"));
					} else {
						// TOR, aber nicht bester MW -> nur Zelle hinzufuegen
						this.addCell(playerRow);
					}
				} else {
					// Feld-MW anzeigen
					this.addAndFillCell(playerRow, player.getMarketValue(player.getPos(i), false), getColor(player.getPos(i)));
				}
			}
		}
	} // Ende addValues(player, playerRow)
}

// Klasse PlayerRecord ******************************************************************

function PlayerRecord(age, skills, isGoalie) {
	// in this.initPlayer() definiert:
	// this.positions[][]: Positionstext und Opti; TOR-Index ist 5
	// this.skillsEnd[]: Berechnet aus this.skills, this.age und aktuellerZat
	this.age = age;
	this.skills = skills;
	this.isGoalie = isGoalie;

	this.toString = function() {
		var result = "Alter\t\t" + this.age + "\n\n";
		result += "Aktuelle Werte\n";
		result += "Skillschnitt\t" + this.getSkill(true).toFixed(2) + "\n";
		result += "Optis und Marktwerte";
		for (var i = 0; i < this.positions.length; i++) {
			result += "\n\t" + this.getPos()[i] + " \t";
			result += this.getOpti(this.getPos()[i], true).toFixed(2) + "\t";
			result += getNumberString(this.getMarketValue(this.getPos()[i], true).toString());
		}
		result += "\n\nWerte mit Ende 18\n"
		result += "Skillschnitt\t" + this.getSkill(false).toFixed(2) + "\n";
		result += "Optis und Marktwerte";
		for (var i = 0; i < this.positions.length; i++) {
			result += "\n\t" + this.getPos()[i] + " \t";
			result += this.getOpti(this.getPos()[i], false).toFixed(2) + "\t";
			result += getNumberString(this.getMarketValue(this.getPos()[i], false).toString());
		}
		return result;
	} // Ende this.toString()

	// Berechnet die Opti-Werte, sortiert das Positionsfeld und berechnet die Einzelskills mit Ende 18
	//
	this.initPlayer = function() {
		this.positions = [];
		// ABW
		this.positions[0] = [];
		this.positions[0][0] = "ABW";
		this.positions[0][1] = this.getOpti("ABW", true);
		// DMI
		this.positions[1] = [];
		this.positions[1][0] = "DMI";
		this.positions[1][1] = this.getOpti("DMI", true);
		// MIT
		this.positions[2] = [];
		this.positions[2][0] = "MIT";
		this.positions[2][1] = this.getOpti("MIT", true);
		// OMI
		this.positions[3] = [];
		this.positions[3][0] = "OMI";
		this.positions[3][1] = this.getOpti("OMI", true);
		// STU
		this.positions[4] = [];
		this.positions[4][0] = "STU";
		this.positions[4][1] = this.getOpti("STU", true);
		// TOR
		this.positions[5] = [];
		this.positions[5][0] = "TOR";
		this.positions[5][1] = this.getOpti("TOR", true);
		// Sortieren
		sortPositionArray(this.positions);

		// Einzelskills mit Ende 18 berechnen
		this.skillsEnd = [];
		var zatSoFar = (this.age - 13) * 72 + aktuellerZat;
		var zatTillEnd = (18 - this.age) * 72 + (71 - aktuellerZat);
		for (var i = 0; i < this.skills.length; i++) {
			if (isTrainableSkill(i)) {
				// Auf ganze Zahl runden und parseInt, da das sonst irgendwie als String interpretiert wird
				this.skillsEnd[i] = parseInt((this.skills[i] * (1 + zatTillEnd / zatSoFar)).toFixed(0));
			} else {
				this.skillsEnd[i] = this.skills[i];
			}
		}
	} // Ende this.iniPlayer()

	this.getSkill = function(now) {
		var temp = (now) ? this.skills : this.skillsEnd;
		var result = 0;
		for (var i = 0; i < temp.length; i++) {
			result += temp[i];
		}
		return result / temp.length;
	}

	this.getPos = function(idx) {
		var idxOffset = 1;
		return this.positions[idx - idxOffset][0];
	}

	this.getOpti = function(pos, now) {
		var temp = (now) ? this.skills : this.skillsEnd;
		var idxPriSkills = getIdxPriSkills(pos);
		var idxSecSkills = getIdxSecSkills(pos);
		var sumPriSkills = 0;
		var sumSecSkills = 0;
		for (var i = 0; i < idxPriSkills.length; i++) {
			sumPriSkills += temp[idxPriSkills[i]];
		}
		for (var i = 0; i < idxSecSkills.length; i++) {
			sumSecSkills += temp[idxSecSkills[i]];
		}
		return (5 * sumPriSkills + sumSecSkills) / 27;
	}

	this.getMarketValue = function(pos, now) {
		var age = (now) ? this.age : 18;
		return Math.round(Math.pow((1 + this.getSkill(now)/100)*(1 + this.getOpti(pos, now)/100)*(2 - age/100), 10) * 2);
	}
}

// Funktionen fuer die HTML-Seite *******************************************************

// Liest das Alter aus
//
function getAgeFromHTML(playerRow) {
	var colIndexAge = 3;
	return parseInt(playerRow.cells[colIndexAge].textContent);
}

// Liest die Einzelskills aus
//
function getSkillsFromHTML(playerRow) {
	var numberOfSkills = 17;
	var colOffset = 4;
	var result = [];
	for (var i = 0; i < numberOfSkills; i++) {
		result[i] = parseInt(playerRow.cells[i + colOffset].textContent);
	}
	return result;
}

// Liest aus, ob der Spieler Torwart oder Feldspieler ist
//
function isGoalieFromHTML(playerRow) {
	var colIndexAge = 3;
	return (playerRow.cells[colIndexAge].className == "TOR");
}

// Hilfsfunktionen **********************************************************************

// Sortiert das Positionsfeld per BubbleSort
//
function sortPositionArray(array) {
	var temp = [];
	var transposed = true;
	// TOR soll immer die letzte Position im Feld sein, deshalb - 1
	var length = array.length - 1;

	while (transposed && (length > 1)) {
		transposed = false;
		for (var i = 0; i < length - 1; i++) {
			// Vergleich Opti-Werte:
			if (array[i][1] < array[i + 1][1]) {
				// vertauschen
				temp[0] = array[i][0];
				temp[1] = array[i][1];
				array[i][0] = array[i + 1][0];
				array[i][1] = array[i + 1][1];
				array[i + 1][0] = temp[0];
				array[i + 1][1] = temp[1];
				transposed = true;
			}
		}
		length -= 1;
	}
}

// Fuegt in die uebergebene Zahl Tausender-Trennpunkte ein
// Wandelt einen etwaig vorhandenen Dezimalpunkt in ein Komma um
//
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

// Dreht den uebergebenen String um
//
function reverseString(string) {
	var result = "";
	for (var i = string.length - 1; i >= 0; i--) {
		result += string.substr(i, 1);
	}
	return result;
}

// Schaut nach, ob der uebergebene Index zu einem trainierbaren Skill gehoert
// Die Indizes gehen von 0 (SCH) bis 16 (EIN)
//
function isTrainableSkill(idx) {
	var trainableSkills = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 15];
	var result = false;
	for (var i = 0; i < trainableSkills.length; i++) {
		if (idx == trainableSkills[i]) { result = true; break; }
	}
	return result;
}

// Gibt die Indizes der Primaerskills zurueck
//
function getIdxPriSkills(pos) {
	switch(pos) {
		case "TOR": return new Array(2, 3, 4, 5);
		case "ABW": return new Array(2, 3, 4, 15);
		case "DMI": return new Array(1, 4, 9, 11);
		case "MIT": return new Array(1, 3, 9, 11);
		case "OMI": return new Array(1, 5, 9, 11);
		case "STU": return new Array(0, 2, 3, 5);
		default: return new Array();
	}
}

// Gibt die Indizes der Sekundaerskills zurueck
//
function getIdxSecSkills(pos) {
	switch(pos) {
		case "TOR": return new Array(0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
		case "ABW": return new Array(0, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16);
		case "DMI": return new Array(0, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16);
		case "MIT": return new Array(0, 2, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16);
		case "OMI": return new Array(0, 2, 3, 4, 6, 7, 8, 10, 12, 13, 14, 15, 16);
		case "STU": return new Array(1, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
		default: return new Array();
	}
}

// Gibt die zur Position gehoerige Farbe zurueck
//
function getColor(pos) {
	switch (pos) {
		case "TOR": return "#FFFF00";
		case "ABW": return "#00FF00";
		case "DMI": return "#3366FF";
		case "MIT": return "#66FFFF";
		case "OMI": return "#FF66FF";
		case "STU": return "#FF0000";
		case "LEI": return "#FFFFFF";
		default: return "";
	}
}
