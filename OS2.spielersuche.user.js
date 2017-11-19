// ==UserScript==
// @name         Spielersuche
// @namespace    http://os.ongapo.com/
// @version      0.1
// @description  Transferdetails einblenden
// @author       Michael Bertram
// @include      http*://os.ongapo.com/suchspieler.php
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    var Elements, thisElement;
    Elements = document.getElementsByTagName('option');
    for (var i = 0; i < Elements.length; i++) {
        thisElement = Elements[i];
        if (thisElement.text == 'VLZ') {
            thisElement.value = 35;
            thisElement.text = 'TDetails';            
        } else {
            // nichts
            // alert("hello world");
        }
    }   
})();
