// ==UserScript==
// @name         OS2.spielersuche
// @namespace    http://os.ongapo.com/
// @version      0.11
// @copyright    2016+
// @author       Michael Bertram
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
    const __ELEMENTS = document.getElementsByTagName('option');

    for (let thisElement of __ELEMENTS) {
        if (thisElement.text === 'VLZ') {
            thisElement.value = 35;
            thisElement.text = 'TDetails';
        }
    }
}

procSpielersucheTDetails();

console.log("SCRIPT END");
