// ==UserScript==
// _name         xhr-test.js
// _namespace    http://os.ongapo.com/
// _version      0.10
// _copyright    2017+
// _author       Sven Loges (SLC)
// _description  Test lib for XHR calls
// _grant        GM.xmlHttpRequest
// _require      https://arantius.com/misc/greasemonkey/imports/greasemonkey4-polyfill.js
// _grant        GM_xmlhttpRequest
// ==/UserScript==

const __XHR = (() => {
    // ECMAScript 6:
    /* jshint esnext: true */
    /* jshint moz: true */

    console.log("Init xhr-test.js");

    const __GM3REQUEST = (('undefined' !== typeof GM_xmlhttpRequest) ? GM_xmlhttpRequest : undefined);  // GM 3.x and earlier
    const __GM4REQUEST = (('undefined' !== typeof GM)                ? GM.xmlHttpRequest : undefined);  // GM 4.0+
    const __CHECKFUN   = (fun => (('function' === typeof fun) ? fun : undefined));

    const __XMLREQUEST = (__CHECKFUN(__GM4REQUEST) || __CHECKFUN(__GM4REQUEST));

    const __DETAILS = {
        'GET'     : {
                        'method' : 'GET'
                    },
        'PUT'     : {
                        'method' : 'PUT'
                    },
        };

    const __HEADERS = {
        'FORM'    : {
                        'Content-Type'    : "application/x-www-form-urlencoded"
                    },
        'ACC'     : {
                        'Accept'          : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        'Accept-Language' : "de,en-US;q=0.7,en;q=0.3",
                        'Accept-Encoding' : "gzip, deflate, br"
                    },
        'FF58'    : {
                        'User-Agent'      : 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0'
                    }
        };

    const __CALLBACKS = { };

    function registerCallback(status, fun) {
        __CALLBACKS[status] = fun;
    }

    function runCallback(result) {
        const __CALLBACK = __CALLBACKS[result.status];

        console.log(__CALLBACK);

        return (__CALLBACK ? __CALLBACK(result) : null);
    }

    function onloadByStatus(result) {
        console.log(result.status, result.statusText);

        return runCallback(result);
    }

    function xmlRequest(d) {
        return new Promise(function(resolve, reject) {
                const __ONLOAD = d.onload;
                const __D = { };

                Object.assign(__D, d);

                __D.onload = (result => {
                        const __RET = __ONLOAD(result);

                        if (result.statusText === 'OK') {
                            resolve(__RET);
                        } else {
                            reject(result.statusText);
                        }
                    });

                if (__XMLREQUEST) {
                    console.log('Fetching', d.url, '...');

                    const __RET = __XMLREQUEST(__D);

                    if (__RET !== undefined) {
                        resolve(__RET);
                    }
                } else {
                    console.error('Tried to fetch', d.url, '...');

                    reject("XHR handler is missing");
                }
            });
    }

    function getRequest(d) {
        const __D = { };

        Object.assign(__D, d, __DETAILS.GET);

        return xmlRequest(__D);
    }

    function putRequest(d) {
        const __H = { };
        const __D = { };

        Object.assign(__H, __HEADERS.FORM, __HEADERS.ACC, __HEADERS.FF58, d.headers);
        Object.assign(__D, d, { 'headers' : __H }, __DETAILS.PUT);

        return xmlRequest(__D);
    }

    function browse(url, headers = { }, onload = onloadByStatus) {
        const __H = { };

        Object.assign(__H, __HEADERS.ACC, __HEADERS.FF58, headers);

        return getRequest({
                'url'     : url,
                'headers' : __H,
                'onload'  : onload
            });
    }

    registerCallback(200, function(result) {
            let parser = new DOMParser();
            let contentType;
            let doc;

            try {
                let match = result.responseHeaders.match(/^Content-Type:\s+((\S+)\/(\S+))$/m);
                contentType = (match ? match[1] : 'application/xml');
                console.log(contentType);

                doc = parser.parseFromString(result.responseText, contentType);

                console.log("Parsed:", doc);
            }
            catch(ex) {
                console.error("Parse error:", ex);
            }

            return doc;
        });

    return {
            browse,
            getRequest,
            putRequest,
            xmlRequest,
            registerCallback,
            __XMLREQUEST
        };
})();

// *** EOF ***