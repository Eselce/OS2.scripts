// ==UserScript==
// @name         OS2.faces
// @namespace    http://os.ongapo.com/
// @version      0.1
// @copyright    2016+
// @author       Roman Bauer
// @description  Farbeauswahl über HTML5 Color Picker
// @include      /^https?://(www\.|)(os\.ongapo\.com|online-soccer\.eu|os-zeitungen\.com)/osbetafaces\.php$/
// ==/UserScript==

/*jshint loopfunc: true */

(function () {

	"use strict";

	var colorPickerAvailable = (function () {
		var e = document.createElement("input");
		e.setAttribute("type", "color");
		return e.type !== "text";
	})();

	if (colorPickerAvailable) {

		var inputs = document.getElementsByTagName("input"), i;

		for (i = 0; i < inputs.length; i++) {

			var textInput = inputs[i];

			if (textInput.name && textInput.name.search(/.*farbe.*/) !== -1 && textInput.type === "text") {

				var colorPicker = document.createElement("input");

				colorPicker.type = "color";
				colorPicker.value = "#" + inputs[i].value;

				colorPicker.oninput = function () {
					this.nextSibling.value = this.value.substr(1);
				};

				textInput.parentNode.insertBefore(colorPicker, textInput);
				textInput.style.display = "none";

				i++; // cause of new input
			}
		}
	}

})();
