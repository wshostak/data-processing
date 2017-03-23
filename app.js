// utility
var console = {
    log: function () {
        var ipc = require("ipc");
        var args = ["console"].concat([].slice.call(arguments));
        return ipc.sendSync.apply(ipc, args)[0];
    }
};
var quit = function () {
    var ipc = require("ipc");
    return ipc.sendSync("app", "quit")[0];
};

// server handler
window.addEventListener("load", function () {
    var ipc = require("ipc");
    ipc.on("request", function (req, port) {
        //console.log(req);
        var doc = document.implementation.createHTMLDocument(req.url);
        var h1 = doc.createElement("h1");
        h1.textContent = "Hello DOM: " + req.url;
        doc.body.appendChild(h1);
        
        ipc.send(port, 200, {"content-type": "text/html;charset=UTF-8"},
                 doc.documentElement.outerHTML);
    });
}, false);
