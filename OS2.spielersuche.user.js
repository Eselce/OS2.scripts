// ==UserScript==
// @name         OS2.spielersuche
// @namespace    http://os.ongapo.com/
// @version      0.12
// @copyright    2016+
// @author       Michael Bertram
// @author       Sven Loges (SLC)
// @description  Transferdetails einblenden
// @include      http*://os.ongapo.com/suchspieler.php
// @include      http*://www.os.ongapo.com/suchspieler.php
// @include      http*://online-soccer.eu/suchspieler.php
// @include      http*://www.online-soccer.eu/suchspieler.php
// @grant        none
// ==/UserScript==

// ECMAScript 6: Erlaubt 'const', 'let', ...
/* jshint esnext: true */
/* jshint moz: true */

function procSpielersucheTDetails() {
    'use strict';
    const __SELECT = document.getElementById('cAtt');
    const __OPTIONS = __SELECT.options;
    const __VLZOPT = __OPTIONS[__OPTIONS.length - 1];  // derzeit letzte Option 'VLZ'
    const __NEWOPT = document.createElement('option');

    __NEWOPT.text = 'TDetails';
    __NEWOPT.value = 35;
    __SELECT.add(__NEWOPT, __VLZOPT);  // 'TDetails' zwischen 'TStatus' und 'VLZ' einfuegen
}

procSpielersucheTDetails();

console.log("SCRIPT END");