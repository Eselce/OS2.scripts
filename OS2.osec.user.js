// ==UserScript==
// @name         OS2.osec
// @namespace    http://os.ongapo.com/
// @version      0.12+WE
// @copyright    2013+
// @author       Sven Loges (SLC)
// @description  Europapokal-Script fuer Online Soccer 2.0
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/(os(eq?|c(q|[hzf]r))|supercup)\.php(\?\S+(&\S+)*)?$/
// @grant        none
// ==/UserScript==

// Script wird angewendet auf
// - OSE(Q) und OSC(Q) Ergebnisse

// Variablen zur Identifikation der Seite

var url = window.location.href;
var osBlau = "#111166";
var osOrange = "#FF9900";
var osNeutral = "#FF0000";
var osNormal = "#FFFFFF";
var osHome = "#33FF33";
var osAway = "#3377FF";
var borderString = "solid white 1px";

var prec = 1;
var prec0 = 0;
var prec1 = 1;
var prec2 = 2;

var tableTags = document.getElementsByTagName("table");
var beforeTable = tableTags[0];

var teams;

teams = parseGames();
procContent(beforeTable, teams);

// Liefert eine auf 0 zurueckgesetzten Stats
function emptyStats() {
    return [ 0, "", "", 0, 0, 0, 0, 0 ];
}

// Fuegt fuer Ergebnis das Team und Hin- und Rueckspiel in die Stats ein
// stats Enthaelt alle Stats
// ergebnis Spielergebnis [ Eigene Tore, Gegentore ]
function addResultToStats(stats, id, kue, name, oppId, heim, ergHin, ergRueck) {
    var entry;
    var gforHin = "";
    var gagainstHin = "";
    var gforRueck = "";
    var gagainstRueck = "";

    if (ergHin.length == 2) {
	if (heim) {
            gforHin = parseInt(ergHin[0], 10);
            gagainstHin = parseInt(ergHin[1], 10);
	} else {
            gforHin = parseInt(ergHin[1], 10);
            gagainstHin = parseInt(ergHin[0], 10);
	}
    }
    if (ergRueck.length == 2) {
	if (heim) {
            gforRueck = parseInt(ergRueck[0], 10);
            gagainstRueck = parseInt(ergRueck[1], 10);
	} else {
            gforRueck = parseInt(ergRueck[1], 10);
            gagainstRueck = parseInt(ergRueck[0], 10);
	}
    }

    entry = emptyStats();
    entry[0] = id;
    entry[1] = kue;
    entry[2] = name;
    entry[3] = oppId;
    entry[4] = gforHin;
    entry[5] = gagainstHin;
    entry[6] = gforRueck;
    entry[7] = gagainstRueck;
    stats.push(entry);

    return stats;
}

// Analysiert die Spieleliste und sammelt Daten
function parseGames() {
    var teams = [];
    var trTags = document.getElementsByTagName("tr");	// Liste aller "tr"-Tags

    for (var trInd = 0; trInd < trTags.length; trInd++) {
	// [0] = HomeFlag
	// [1] = HomeWappen
	// [2] = Home/HomeId
	// [4] = AwayFlag
	// [5] = AwayWappen
	// [6] = Away/AwayId
	// [8] = ergHin
	// [12] = komHin
	// [14] = ergRueck
	// [18] = komRueck
	var text = null;
	var inner = "";
	var pos;
	var flag;
	var kue;
	var homeKue;
	var awayKue;
	var homeId;
	var awayId;
	var homeName;
	var awayName;
	var erg;
	var ergHin;
	var ergRueck;
	var tdTags = trTags[trInd].getElementsByTagName("td");	// Liste aller "td"-Tags

	for (var tdInd = 0; tdInd < tdTags.length; tdInd++) {
	    text = tdTags[tdInd].textContent;
	    inner = tdTags[tdInd].innerHTML;

	    if ((tdInd == 0) || (tdInd == 4)) {
		pos = inner.indexOf(".gif");
		flag = inner.substring(0, pos);
		kue = flag.substring(flag.lastIndexOf("/") + 1);
		flag = flag.substring(flag.lastIndexOf("=") + 2) + ".gif";
		if (tdInd == 0) {
		    homeKue = kue;
		} else {
		    awayKue = kue;
		}
	    } else if ((tdInd == 2) || (tdInd == 6)) {
		pos = inner.indexOf("(");
		kue = inner.substring(pos + 1);
		pos = kue.indexOf(")");
		kue = kue.substring(0, pos);
		pos = parseInt(kue, 10);
		if (tdInd == 2) {
		    homeName = text;
		    homeId = pos;
		} else {
		    awayName = text;
		    awayId = pos;
		}
	    } else if ((tdInd == 8) || (tdInd == 14)) {
		erg = [ -1, -1 ];
		if (text != "") {
		    erg = text.split(" : ", 2);
		}
		if (tdInd == 8) {
		    ergHin = erg;
		} else {
		    ergRueck = erg;
		}
	    }
	}

//	alert(homeName + "(" + homeKue + ")" + homeId + " - " + awayName + "(" + awayKue + ")" + awayId + " " + ergHin[0] + ":" + ergHin[1] + " / " + ergRueck[0] + ":" + ergRueck[1]);

	addResultToStats(teams, homeId, homeKue, homeName, awayId, true, ergHin, ergRueck);
	addResultToStats(teams, awayId, awayKue, awayName, homeId, false, ergHin, ergRueck);
    }

    return teams;
}

// Fuegt Uebersicht ein
function procContent(beforeNode, teams) {
    var div = document.createElement("div");
    var br = document.createElement("br");
    var tableResults = document.createElement("table");
    var bodyResults = document.createElement("tbody");
    var tableTeams = document.createElement("table");
    var bodyTeams = document.createElement("tbody");

    tableResults.appendChild(bodyResults);
    tableResults.setAttribute("ID", "summaryresults");
    tableTeams.appendChild(bodyTeams);
    tableTeams.setAttribute("ID", "summaryteams");

    div.appendChild(br);
    div.appendChild(tableResults);
    div.appendChild(br);
    div.appendChild(tableTeams);
    div.appendChild(br);

    beforeNode.parentNode.insertBefore(div, beforeNode);

    var rowResults = tableResults.insertRow(-1);
    color = osOrange;
    appendCell(rowResults, "(H)", color);
    appendCell(rowResults, "(A)", color);
    appendCell(rowResults, "Heim", color);
    appendCell(rowResults, "(H)", color);
    appendCell(rowResults, "(A)", color);
    appendCell(rowResults, "Ausw\u00E4rts", color);
    appendCell(rowResults, "-", color);
    appendCell(rowResults, "HH", color);
    appendCell(rowResults, "AH", color);
    appendCell(rowResults, "-", color);
    appendCell(rowResults, "HR", color);
    appendCell(rowResults, "AR", color);

    var rowTeams = tableTeams.insertRow(-1);
    color = osOrange;
    appendCell(rowTeams, "OS-ID", color);
    appendCell(rowTeams, "Team", color);
    appendCell(rowTeams, "Land", color);

    for (var teamInd = 0; teamInd < teams.length; teamInd += 2) {
	appendTeam(tableTeams, teams[teamInd], 0);
	appendTeam(tableTeams, teams[teamInd + 1], 0);

	appendResult(tableResults, teams[teamInd], teams[teamInd + 1], 0);

    rowResults.style.border = beforeTable.rows[teamInd/2].style.border;
    }

    tableResults.style.borderCollapse = 'collapse';
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

// Fuegt eine Zeile ans Ende der Tabelle hinzu und fuellt sie
// table: Tabelle, die verlaengert wird
// team: Inhalt fuer das Team
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
function appendTeam(table, team, color) {
    var row = table.insertRow(-1);
    appendCell(row, team[0], color);
    appendCell(row, team[2], color);
    appendCell(row, team[1], color);
}

// Fuegt eine Zeile ans Ende der Tabelle hinzu und fuellt sie
// table: Tabelle, die verlaengert wird
// teamHome: Inhalt fuer das Heimteam
// teamAway: Inhalt fuer das Auswaertsteam
// color: Schriftfarbe der neuen Zelle (z.B. "#FFFFFF" fuer weiss)
function appendResult(table, teamHome, teamAway, color) {
    var winCol = color;
    var row = table.insertRow(-1);

    if (teamHome[5] >= 0) {
	var diff = teamHome[4] + teamHome[6] - teamHome[5] - teamHome[7];
	if ((diff == 0) && (teamHome[7] >= 0)) {
	    diff += teamHome[6] - teamHome[5];
	}
  winCol = (diff > 0) ? osHome : (diff < 0) ? osAway : osNormal;
    }

    appendCell(row, teamHome[0], osHome);
    appendCell(row, teamAway[0], osAway);
    appendCell(row, teamHome[2], osHome);
    appendCell(row, teamHome[1], osHome);
    appendCell(row, teamAway[1], osAway);
    appendCell(row, teamAway[2], osAway);
    appendCell(row, "", color);
    appendCell(row, teamHome[4], winCol);
    appendCell(row, teamHome[5], winCol);
    if (teamHome[7] < 0) {
        winCol = osNormal;
    }
    appendCell(row, "", color);
    appendCell(row, teamHome[6], winCol);
    appendCell(row, teamHome[7], winCol);
}
