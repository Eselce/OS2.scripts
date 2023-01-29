// ==UserScript==
// @name OS2.0
// @description Zeigt Primärsklills hervorgehoben
// @include http://os.ongapo.com/sp.php?*
// ==/UserScript==


var tds = document.getElementsByTagName("td");
var pos = tds[13].innerHTML;
var skills = getArrayPositionOfSkills(pos);

for (var i = 0; i < skills.length; i++) {
    tds[skills[i]].style.fontWeight = 'bold';
    tds[skills].style.color = '#80FFFF';
}

function getArrayPositionOfSkills(pos) {
    switch (pos) {
        case "TOR": return new Array("35","37","39","41");
        case "ABW": return new Array("35","37","39","61");
        case "DMI": return new Array("49","53","39","33");
        case "MIT": return new Array("49","53","37","33");
        case "OMI": return new Array("49","53","33","41");
        case "STU": return new Array("31","35","41","37");
        default:    return new Array();
    }
}