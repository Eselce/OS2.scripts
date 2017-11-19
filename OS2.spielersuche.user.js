// ==UserScript==
// @name         OS2.spielersuche
// @namespace    http://os.ongapo.com/
// @version      0.13+WE
// @copyright    2016+
// @author       Sven Loges (SLC) / Michael Bertram
// @description  Transferdetails einblenden
// @include      /^https?://(www\.)?(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/suchspieler\.php$/
// @grant        none
// ==/UserScript==

// ECMAScript 6:
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
