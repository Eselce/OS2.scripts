// ==UserScript==
// @name         OS2.report
// @namespace    http://os.ongapo.com/
// @version      0.11+WE
// @copyright    2013+
// @author       Sven Loges (SLC) / Andreas Eckes (Strindheim BK)
// @description  Report-Script fuer Online Soccer 2.0
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/rep/saison/\d+/\d+/\d+-\d+.html$/
// @grant        none
// ==/UserScript==

// Script wird angewendet auf
// - Spielbericht

// URL-Legende:
// .../rep/saison/_Saison/_ZAT/_Heimteam-_Auswteam.html (Popup-Fenster)

// Variablen zur Identifikation der Seite

var url = window.location.href;
var osBlau = '#111166';
var osOrange = '#FF9900';
var osNeutral = '#FF0000';
var osNormal = '#FFFFFF';
var osHome = '#33FF33';
var osAway = '#3377FF';
var borderString = 'solid white 1px';

var prec = 1;
var prec0 = 0;
var prec1 = 1;
var prec2 = 2;

var dataName = new Array();
var dataNameURL = new Array();

// Taktische Aufstellung der 10 Feldspieler beider Teams
var dataTaktik = new Array(new Array(0, 0, 0), new Array(0, 0, 0));
var dataTaktikSpalte = new Array(new Array(), new Array());
var dataTaktikZeile = new Array(new Array(), new Array());
var labelTaktik = "Taktik";

// 17 Spielernamen in der taktischen Aufstellung
var dataTaktikName = new Array(new Array(), new Array());
var labelTaktikName = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');

// Einsatz, Haerte, Spielweise, Taktik-STU, Taktik-MIT, Taktik-ABW
var dataEinstellung = new Array(new Array(), new Array());
var labelEinstellung = new Array("Einsatz", "H\u00E4rte", "Spielweise", "Taktik - Sturm", "Taktik - Mittelfeld", "Taktik - Abwehr");

// Endstand, Abseits, Eckenverhaeltnis, Fouls, Elfmeter, Ballbesitz, Schnitt Skill, Schnitt Opt.Skill, Fitness, Moral
var dataStats = new Array(new Array(), new Array());
var labelStats = new Array("Endstand", "Abseits", "Eckenverh\u00E4ltnis", "Fouls", "Elfmeter", "Ballbesitz", "Schnitt Skill", "Schnitt Opt.Skill", "Fitness", "Moral");

// Ges., 1. Hz., 2. Hz., Verl., Elfmeterschiessen
var dataTor = new Array(new Array(), new Array());
var labelTor = new Array("Ergebnis", "1. Halbzeit", "2. Halbzeit", "Verl\u00E4ngerung", "Elfmeterschie\u00DFen");

// Ballkontakt, dir.FS, indir.FS, Ecke, Elfer, Elferdrin, Schuss, Kopfball, Torchance, Latte, Pfosten, Torschuss, Treffer, Alu, 100%
var dataChance = new Array(new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
var labelChance = new Array("Ballkontakte", "direkte Freist\u00F6\u00DFe", "indirekte Freist\u00F6\u00DFe", "Eckb\u00E4lle", "Elfmeter", "Elfmetertreffer", "Sch\u00FCsse", "Kopfb\u00E4lle", "Torchancen", "Lattentreffer", "Pfostentreffer", "Sch\u00FCsse aufs Tor", "Feldtore", "Alutreffer", "Hundertprozentige");

var divTags = document.getElementsByTagName('DIV');
var titleDiv = divTags[0];
var beforeDiv = divTags[1];

var titleText = titleDiv.childNodes.item(0).textContent;
var spielArt = titleText.substring(titleText.indexOf("Spielart : ") + 11);
var posEnd = spielArt.indexOf(' ');
if (posEnd < 0) {
    posEnd = spielArt.length;
}
spielArt = spielArt.substring(0, posEnd);

parseReport();
procSummary(beforeDiv);

// Analysiert den Spielbericht und sammelt Daten
function parseReport() {
    phaseStart = 0;
    phaseTitel = 1;
    phaseTaktik = 2;
    phaseSpieler = 3;
    phaseEinstellung = 4;
    phaseBericht = 5;
    phaseGStatistik = 6;
    phasePStatistik = 7;
    phaseEnde = 8;

    var tdTags = document.getElementsByTagName('TD');   // Liste aller 'td'-Tags
    var startInd = new Array();
    var stopInd = new Array();
    var phase = phaseStart;
    var nextPhase = phase;
    var endPhase = false;
    var hz;
    var off;
    var items;

    for (var tdInd = 0; tdInd < tdTags.length; tdInd++) {
        var first = "";
        var prefix = "";
        var cls = "";
        var item = null;
        var text = tdTags[tdInd].textContent;

        if (tdTags[tdInd].hasChildNodes()) {
            items = tdTags[tdInd].childNodes;
            item = items.item(0);
            first = item.textContent;
        }
        if ((first == "Freistoss") || (first == "Ecke")) {  // Verschiebung um 2 (prefix + Zwischentext)
            prefix = first;
            item = items.item(2);
            first = item.textContent;
        }
        if ((item != null) && (item instanceof HTMLElement)) {
            cls = item.getAttribute('class');   // 'H', 'G', 'color:orange'
            if (cls == null) {
                cls = 'null';
            }
        }

        if (phase == phaseStart) {
            startInd[phase] = 0;
            endPhase = true;
        } else if (phase == phaseTitel) {
            if ((tdInd == 1) || (tdInd == 3)) {
                dataName.push(first);
            }
            if (tdInd == 3) {
                endPhase = true;
            }
        } else if (phase == phaseTaktik) {
            var ofs = tdInd - startInd[phase] + 1;
            var spalte = ofs % 25;
            var zeile = (ofs / 25 - 0.5).toFixed(prec0);
            if (ofs >= 16 * 25 + 6) {   // 16 Zeilen a 25 (erste 24) + T + T
                endPhase = true;
            } else if ((zeile == 0) || (zeile == 16) || (spalte == 0) || (spalte == 12) || (spalte == 24)) {
                // Labels (Spalten, Zeilen) und Torhueter
            } else if (first != "") {
                var reihe = ((15 - zeile) / 5 + 0.5).toFixed(prec0) - 1;
                off = (spalte < 12) ? 0 : 1;
                dataTaktik[off][reihe]++;
                dataTaktikSpalte[off].push(spalte % 12);
                dataTaktikZeile[off].push(16 - zeile);
            }
        } else if (phase == phaseSpieler) {
            var ofs = tdInd - startInd[phase];
            var spalte = ofs % 7;
            if (ofs >= 17 * 7) {    // 17 Spieler
                endPhase = true;
            } else if (spalte % 4 == 2) {
                off = (spalte < 4) ? 0 : 1;
                dataTaktikName[off].push(first);
            }
        } else if (phase == phaseEinstellung) {
            var ofs = tdInd - startInd[phase];
            var spalte = ofs % 4;
            if (ofs >= 7 * 4) { // 1 Ueberschrift und 6 Zeilen
                endPhase = true;
            } else if ((ofs >= 4) && (spalte % 2 == 1)) {
                off = (spalte < 2) ? 0 : 1;
                dataEinstellung[off].push(first);
            }
        } else if (phase == phaseBericht) {
            var isFrei = false;
            var isEcke = false;
            var isSchuss = false;
            var isElfer = false;
            var isKopf = false;
            var isDrin = false;

            if (cls.length == 1) {
                off = (cls == 'H') ? 0 : 1; // Offensivaktion von Heim / Gast
                if (hz > 0) {
                    dataChance[off][0]++;
                }
            }
            if (prefix == "Freistoss") {
                isFrei = true;
            }
            if (prefix == "Ecke") {
                isEcke = true;
            }
            if ((first == "Anpfiff") || (first == "Halbzeit") || (first == "Verl\u00E4ngerung") || (first == "Elfmeterschiessen")) {
                hz++;
                dataTor[0].push(0);
                dataTor[1].push(0);
            } else if (first == "Abpfiff") {
                endPhase = true;
            } else if (first == "Heimteam") {   // das "Abpfiff" fehlt beim Elfmeterschiessen
                endPhase = true;
            } else if (first.indexOf("Neuer Spielstand:") == 0) {
                dataTor[off][hz]++;
                dataChance[off][isElfer ? 5 : 12]++;
                dataChance[off][14]++;
            }
            if (text != null) {
                var alu = -1;

                if (text.indexOf("Der Ball geht an den Pfosten") > -1) {
                    alu = 10;
                } else if (text.indexOf("Der Ball geht an die Latte") > -1) {
                    alu = 9;
                }
                if (alu > -1) {
                    dataChance[off][alu]++;
                    dataChance[off][13]++;
                    dataChance[off][14]++;
                }

                if ((text.indexOf("schiesst") > -1) || (text.indexOf("Schuss von") > -1) || (text.indexOf("schu\u00DF von") > -1) /***|| (text.indexOf("kommt zum Schuss") > -1)***/ || (text.indexOf("Flatterball von") > -1) || (text.indexOf("Schlenzer von") > -1)) {
                    isSchuss = true;
                } else if ((text.indexOf("k\u00F6pft mit") > -1) || (text.indexOf("Kopfball von") > -1) || (text.indexOf("kommt zum Kopfball") > -1)) {
                    isKopf = true;
                }

                if (isSchuss || isKopf) {
                    dataChance[off][8]++;
                }
                if (isSchuss) {
                    dataChance[off][6]++;
                }
                if (isKopf) {
                    dataChance[off][7]++;
                }
                if (isFrei) {
                    dataChance[off][1]++;   // TODO: indirekte FS
                }
                if (isEcke) {
                    dataChance[off][3]++;
                }
            }
        } else if (phase == phaseGStatistik) {
            var ofs = tdInd - startInd[phase];
            var spalte = ofs % 4;
            if (ofs >= 11 * 4) {    // 1 Ueberschrift und 6 Zeilen
                endPhase = true;
            } else if ((ofs >= 4) && (spalte % 2 == 1)) {
                off = (spalte < 2) ? 0 : 1;
                dataStats[off].push(first);
            }
        } else if (phase == phasePStatistik) {
            // TODO
            if (tdInd + 1 == tdTags.length) {
                endPhase = true;
            }
        }

        // ================================== Phasenwechsel ===============================

        if (endPhase) {
            endPhase = false;
            if (nextPhase == phase) {
                nextPhase = phase + 1;
            }
        } else {
//          dataName[1] += ' ' + tdInd + '=' + first;
        }
        if (nextPhase != phase) {
            var ok = false;

            hz = 0;
            off = 0;
            items = null;

            if (nextPhase == phaseTaktik) {
                if (first == '1') { // Zeile "  1 2 3 ..."
                    ok = true;
                    tdInd--;
                }
            } else if (nextPhase == phaseSpieler) {
                if (first == 'A') { // Zeile "A <name> ..."
                    ok = true;
                }
            } else if (nextPhase == phaseEinstellung) {
                if (first == "Heimteam") {  // Zeile "  Heimteam Ausw\u00E4rtsteam"
                    ok = true;
                    tdInd--;
                }
            } else if (nextPhase == phaseBericht) {
                if (first == "1.") {    // vor "Anpfiff"
                    hz = dataTor[0].length; // 0, falls vorher korrekt geloescht!

                    dataTor[0].push(0);
                    dataTor[1].push(0);

                    ok = true;
                }
            } else if (nextPhase == phaseGStatistik) {
                if (first == "Heimteam") {  // Zeile "  Heimteam Auswaertsteam"
                    ok = true;
                    tdInd--;
                }
            } else if (nextPhase == phasePStatistik) {
                if (first == "Spielername") {   // Zeile "Spielername ..."
                    ok = true;
                }
            } else {
                ok = true;
            }

            if (ok) {
                if (nextPhase != phaseEnde) {
                    startInd[nextPhase] = tdInd;
                }
                tdInd--;
                stopInd[phase] = tdInd;
                phase = nextPhase;
            }
        }
    }

    for (var i = 1; i < dataTor[0].length; i++) {
        dataTor[0][0] += dataTor[0][i];
        dataTor[1][0] += dataTor[1][i];
    }

    var pos = url.indexOf("/rep/");
    if (pos > -1) {
        var baseURL = url.substring(0, pos);
        pos = url.lastIndexOf('/');
        var pos2 = url.indexOf('-', pos);
        dataNameURL.push("<a href=\"" + baseURL + "/st.php?c=" + url.substring(pos + 1, pos2) + "\">" + dataName[0] + "</a>");
//      dataNameURL.push("<a href=\"javascript:teaminfo(" + url.substring(pos + 1, pos2) + ");\">" + dataName[0] + "</a>");
        pos = pos2;
        pos2 = url.indexOf('.', pos);
        dataNameURL.push("<a href=\"" + baseURL + "/st.php?c=" + url.substring(pos + 1, pos2) + "\">" + dataName[1] + "</a>");
//      dataNameURL.push("<a href=\"javascript:teaminfo(" + url.substring(pos + 1, pos2) + ");\">" + dataName[1] + "</a>");
    }

/***
    for (var i = 0; i < startInd.length; i++) {
        if (stopInd[i] != startInd[i] - 1) {
            dataName[1] += ' ' + i + '[' + startInd[i] + '-' + stopInd[i] + ']';
        }
    }
    for (var off = 0; off < 2; off++) {
        dataName[0] += ' ' + dataTaktik[off][0] + '-' + dataTaktik[off][1] + '-' + dataTaktik[off][2];
        for (var i = 0; i < dataTaktikZeile[off].length; i++) {
            dataName[0] += ' ' + i + '[' + dataTaktikZeile[off][i] + '-' + dataTaktikSpalte[off][i] + ']';
        }
    }
    for (var off = 0; off < 2; off++) {
        for (var i = 0; i < dataTaktikName[off].length; i++) {
            dataName[0] += ' ' + i + '[' + dataTaktikName[off][i] + ']';
        }
    }
    for (var off = 0; off < 2; off++) {
        for (var i = 0; i < dataEinstellung[off].length; i++) {
            dataName[0] += ' ' + i + '[' + dataEinstellung[off][i] + ']';
        }
    }
    for (var off = 0; off < 2; off++) {
        for (var i = 0; i < dataStats[off].length; i++) {
            dataName[0] += ' ' + i + '[' + dataStats[off][i] + ']';
        }
    }
***/
}

// Fuegt Uebersicht ein
function procSummary(beforeNode) {
    var div = document.createElement('DIV');
    var br = document.createElement('BR');
    var table = document.createElement('TABLE');
    var body = document.createElement('TBODY');
    table.appendChild(body);
    table.setAttribute('ID', 'summary');
    div.appendChild(br);
    div.appendChild(table);

    beforeNode.parentNode.insertBefore(div, beforeNode);

    var row = table.insertRow(-1);
    color = osOrange;
    appendCell(row, "", color);
    appendCell(row, "Heimteam", color);
    appendCell(row, "Ausw\u00E4rtsteam", color);

    appendRow(table, spielArt, dataName[0], dataName[1], 0);
/***
    var idx = table.rows.length - 1;
    row = table.rows[idx];
    row.cells[1].innerHTML = dataNameURL[0];
    row.cells[2].innerHTML = dataNameURL[1];
***/
    appendRows(table, labelStats, dataStats, 0, 1);
    appendRows(table, labelStats, dataStats, dataStats[0].length - 5, 5);

    appendRow(table, labelTaktik, dataTaktik[0][0] + '-' + dataTaktik[0][1] + '-' + dataTaktik[0][2],
                    dataTaktik[1][0] + '-' + dataTaktik[1][1] + '-' + dataTaktik[1][2], 0);

    appendRows(table, labelEinstellung, dataEinstellung, 0, 2);

    appendRowsInteger(table, labelTor, dataTor, 0, dataTor[0].length, true);
    appendRowsInteger(table, labelChance, dataChance, 0, dataChance[0].length - 3, false);

    if ((dataChance[0][dataChance[0].length - 2] != 0) || (dataChance[1][dataChance[0].length - 2] != 0)) {
        appendRowsInteger(table, labelChance, dataChance, dataChance[0].length - 3, 3, true);
    }
}

// Fuegt eine Zelle ans Ende der uebergebenen Zeile hinzu und fuellt sie
// row: Zeile, die verlaengert wird
// content: Textinhalt der neuen Zelle
// color: Schriftfarbe der neuen Zelle (z.B. '#FFFFFF' fuer weiss)
// Bei Aufruf ohne Farbe wird die Standardfarbe benutzt
function appendCell(row, content, color) {
    row.insertCell(-1);
    var colIdx = row.cells.length - 1;
    row.cells[colIdx].textContent = content;
    row.cells[colIdx].align = 'center';
    row.cells[colIdx].style.color = color;
}

// Fuegt eine Zeile ans Ende der Tabelle hinzu und fuellt sie
// table: Tabelle, die verlaengert wird
// cat: Textinhalt des Labels der neuen Zeile
// home: Inhalt fuer das Heimteam
// away: Inhalt fuer das Auswaertsteam
// comp: Ergebnis des Vergleichs (bestimmt die Farbe des Label-Textes)
// Es wird die Heim-/Auswaertsfarbe genutzt bzw. die Standardfarbe bei Gleichheit
function appendRow(table, cat, home, away, comp) {
    var row = table.insertRow(-1);
    var color = (comp < 0) ? osAway : (comp > 0) ? osHome : osNormal;
    appendCell(row, cat, color);
    appendCell(row, home, osHome);
    appendCell(row, away, osAway);
}

// Fuegt eine Zeile ans Ende der Tabelle hinzu und fuellt sie mit ganzen Zahlwerten
// table: Tabelle, die verlaengert wird
// cat: Textinhalt des Labels der neuen Zeile
// home: Ganzzahl fuer das Heimteam
// away: Ganzzahl fuer das Auswaertsteam
function appendRowInteger(table, cat, home, away) {
    appendRow(table, cat, home.toFixed(prec0), away.toFixed(prec0), home - away);
}

// Fuegt eine Zeile ans Ende der Tabelle hinzu und fuellt sie mit Dezimalbruechen
// table: Tabelle, die verlaengert wird
// cat: Textinhalt des Labels der neuen Zeile
// home: Dezimalbruch fuer das Heimteam
// away: Dezimalbruch fuer das Auswaertsteam
function appendRowFloat(table, cat, home, away) {
    appendRow(table, cat, home.toFixed(prec2), away.toFixed(prec2), home - away);
}

// Fuegt Zeilen ans Ende der Tabelle hinzu und fuellt sie mit Werten
// table: Tabelle, die verlaengert wird
// label: Array mit Labeltexten
// data: doppeltes Array mit Werten (jeweils Heim/Auswaerts)
// ind: Startindex in den Daten
// len: Anzahl der aufeinander folgenden Werte (Zeilen)
function appendRows(table, label, data, ind, len) {
    var abbr = ind + len;
    for (var i = ind; i < abbr; i++) {
        appendRow(table, label[i], data[0][i], data[1][i], 0);
    }
}

// Fuegt Zeilen ans Ende der Tabelle hinzu und fuellt sie mit ganzen Zahlwerten
// table: Tabelle, die verlaengert wird
// label: Array mit Labeltexten
// data: doppeltes Array mit Zahlwerten (jeweils Heim/Auswaerts)
// ind: Startindex in den Daten
// len: Anzahl der aufeinander folgenden Werte (Zeilen)
// showZero: Angabe, ob Zeile angezeigt werden soll, wenn beide Werte 0 sind
function appendRowsInteger(table, label, data, ind, len, showZero) {
    var abbr = ind + len;
    for (var i = ind; i < abbr; i++) {
        if (showZero || (data[0][i] != 0) || (data[1][i] != 0)) {
            appendRowInteger(table, label[i], data[0][i], data[1][i]);
        }
    }
}
