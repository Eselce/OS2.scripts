// ==UserScript==
// @name OS2.masterV1
// @description Master-Script fuer Online Soccer 2.0
// @include http://os.ongapo.com/sp.php?*
// @include http://os.ongapo.com/st.php?s=*
// @include http://os.ongapo.com/showteam.php?s=*
// @include http://online-soccer.eu/sp.php?*
// @include http://online-soccer.eu/st.php?s=*
// @include http://online-soccer.eu/showteam.php?s=*
// @include http://www.online-soccer.eu/sp.php?*
// @include http://www.online-soccer.eu/st.php?s=*
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
var s = -1;// Seitenindex

var url = window.location.href;
var osBlau = "#111166";
var borderString = "solid white 1px";
var playerProfileWindowOffsetY = 80;

// Seite ermitteln
if (url.match(/sp\.php/)) { sp = true; }
if (url.match(/st\.php/)) { st = true; }
if (url.match(/showteam\.php/)) { showteam = true; }
// Wenn nicht Spielerprofil, dann Wert von s (Seitenindex) ermitteln
if (!sp) {
// Annahme: Entscheidend ist jeweils das letzte Vorkommnis von "s=" und ggf. von "&"
var indexS = url.lastIndexOf("s=");
if (showteam) {
// Wert von s setzt sich aus allen Zeichen hinter "s=" zusammen
s = parseInt(url.substring(indexS + 2, url.length));
} else {
// Wert von s setzt sich aus allen Zeichen zwischen "s=" und "&" zusammen
var indexAmpersand = url.lastIndexOf("&");
s = parseInt(url.substring(indexS + 2, indexAmpersand));
}
// Verzweige in unterschiedliche Verarbeitungen je nach Wert von s:
switch(s) {
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
var tdIndexPos = 13;// Index des td-Tags der Position
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

// Verarbeitet Ansicht "Einzelwerte"
function procSingleValues() {
var playerTable = document.getElementById("team");
var rowOffsetUpper = 1;
var rowOffsetLower = 1;

for (var i = rowOffsetUpper; i < playerTable.rows.length - rowOffsetLower; i++ ) {
var pos = playerTable.rows[i].cells[0].className;// Position des Spielers ermitteln
var skills = getArrayPositionOfSkillsOnGlobalPage(pos);// Liste der Indizes der Primärskills
var color = getColor(pos);

for (var j = 0; j < skills.length; j++ ) {
playerTable.rows[i].cells[skills[j]].style.color = osBlau;
playerTable.rows[i].cells[skills[j]].style.backgroundColor = color;
playerTable.rows[i].cells[skills[j]].style.fontWeight = 'bold';
}
}
}

// Verarbeitet Ansichten "Statistik Saison" und "Statistik Gesamt"
function procStatistics() {
var playerTable = document.getElementsByTagName("table")[1];
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

// Verarbeitet Ansicht "Vereinshistorie"
function procClubHistory() {
separateSeasons(document.getElementsByTagName("table")[1], 2, 1, 0);
}

// Zeichnet in einer Tabelle Linien zwischen den Zeilen unterschiedlicher Saisons
// tableTabelle, die veraendert werden soll
// rowOffsetUpperZeilenstartindex fuer Schleife
// rowOffsetLowerZeilenendindex fuer Schleife
// columnIndexSeasonSpaltenindex der Spalte, deren Werte in benachbarten Zeilen verglichen werden
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
    case "TOR": return new Array(35,37,39,41);
    case "ABW": return new Array(35,37,39,61);
    case "DMI": return new Array(49,53,39,33);
    case "MIT": return new Array(49,53,37,33);
    case "OMI": return new Array(49,53,33,41);
    case "STU": return new Array(31,35,41,37);
    default:return new Array();
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
    default:return new Array();
}
}

// Gibt die zur Position gehörige Farbe zurück
function getColor(pos) {
switch (pos) {
case "TOR": return "#FFFF00";
case "ABW": return "#00FF00";
case "DMI": return "#3366FF";
case "MIT": return "#66FFFF";
case "OMI": return "#FF66FF";
case "STU": return "#FF0000";
case "LEI": return "#FFFFFF";
default:return "";
}
}
