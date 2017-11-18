// ==UserScript==
// @name         OS2.spielerstatistik
// @namespace    http://os.ongapo.com/
// @version      0.1-SLC-WE
// @copyright    2016+
// @author       Roman Bauer
// @description  Sortierung/Formatierung der Statistikspalten
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/st\.php\?s=[34]&c=\d+$/
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/showteam\.php\?s=[34]$/
// @grant        GM.addStyle
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {

	'use strict';

	const TOP_COLUMNS = ["","Spiele","Tore","Vorlagen","Score","Gelb","Rot"];
	const SORT_COLUMNS = ["Name","Land","U","LI","LP","IP","FS","LI","LP","IP","FS","LI","LP","IP","FS","LI","LP","IP","FS","LI","LP","IP","FS","LI","LP","IP","FS"];

	var table = document.getElementsByTagName("table")[2], tableClone = table.cloneNode(true), r, row, spieler, baseCell, c, cellSkillschnitt, cellOpti;

	var getSortLink = function (text) {

		return "<a onclick=\"ts_resortTable(this);return false;\" class=\"sortheader\" href=\"#\">" + text +
			"<span span=\"\" <=\"\" class=\"sortarrow\"></span></a>";
	};

	var makeTitleDivRelativToCell = function (cell) {

		var title = TOP_COLUMNS[((cell.cellIndex - 3) / 4) + 1], offset = cell.parentNode.rowIndex === 1 ? -21 : 21;

		cell.innerHTML = "<div style=\"position:relative\">" + "<div style=\"position:absolute; " + "left:0px; top:" + offset +
			"px; width:90px; height:21px\">" + title + "</div></div>" + cell.innerHTML;
	};

	for (r = 0; r < tableClone.rows.length; r++) {

		row = tableClone.rows[r];

		if (r === 0 || r === (tableClone.rows.length - 1)) {
			// Zeile wird weiter unten geloescht
		} else if (r === 1 || r === (tableClone.rows.length - 2)) {

			row.cells[SORT_COLUMNS.indexOf("Land")].colSpan = 1;

			for (c = 0; c < SORT_COLUMNS.length; c++) {
				if (c > 2) {
					row.cells[c].align = "center";
				}
				if (r === 1) {
					row.cells[c].innerHTML = getSortLink(row.cells[c].textContent);
				}
			}

			makeTitleDivRelativToCell(row.cells[3]); // Spiele
			makeTitleDivRelativToCell(row.cells[7]); // Tore
			makeTitleDivRelativToCell(row.cells[11]); // Vorlagen
			makeTitleDivRelativToCell(row.cells[15]); // Score
			makeTitleDivRelativToCell(row.cells[19]); // Gelb
			makeTitleDivRelativToCell(row.cells[23]); // Rot

			if (r === (tableClone.rows.length - 2)) {
				row.className = "sortbottom";
			}

		} else {

			row.cells[SORT_COLUMNS.indexOf("Land")].parentNode.removeChild(row.cells[SORT_COLUMNS.indexOf("Land")]);

			row.cells[SORT_COLUMNS.indexOf("Land")].innerHTML = "<img src=\"images/flaggen/" + row.cells[SORT_COLUMNS.indexOf("Land")].textContent +
				".gif\"\/> " + row.cells[SORT_COLUMNS.indexOf("Land")].innerHTML;

		}

		if ((r > 0) && (r < (tableClone.rows.length - 1))) {
			for (c = 3; c < SORT_COLUMNS.length; c++) {
				tableClone.rows[r].cells[c].setAttribute("art", SORT_COLUMNS[c]);
				tableClone.rows[r].cells[c].setAttribute("statistik", TOP_COLUMNS[Math.floor((c - 3) / 4) + 1]);
			}
		}
	}

	tableClone.rows[0].parentNode.removeChild(tableClone.rows[0]);
	tableClone.rows[tableClone.rows.length - 1].parentNode.removeChild(tableClone.rows[tableClone.rows.length - 1]);

	tableClone.id = "team";
	tableClone.style.marginTop = "25px";

	table.parentNode.replaceChild(tableClone, table);

	GM.addStyle('table[id^=team] td[art=LI] div div { margin-left:-8px !important; }');
	GM.addStyle('table[id^=team] td[art=LI] { padding-left:10px !important; }');

})();
