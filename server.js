var app = require("app");

app.on("ready", function () {
    var ipc = require("ipc");
    ipc.on("console", function (ev) {
        var args = [].slice.call(arguments, 1);
        var r = console.log.apply(console, args);
        ev.returnValue = [r];
    });
    ipc.on("app", function (ev, msg) {
        var args = [].slice.call(arguments, 2);
        ev.returnValue = [app[msg].apply(app, args)];
    });
    
    var BrowserWindow = require("browser-window");
    var window = new BrowserWindow({show: false});
    window.loadUrl("file://" + __dirname + "/index.html");
    window.webContents.once("did-finish-load", function () {
        var http = require("http");
        var crypto = require("crypto");
        var server = http.createServer(function (req, res) {
            var port = crypto.randomBytes(16).toString("hex");
            ipc.once(port, function (ev, status, head, body) {
                //console.log(status, head, body);
                res.writeHead(status, head);
                res.end(body);
            });
            window.webContents.send("request", req, port);
        });
        server.listen(8000);
        console.log("http://localhost:8000/");
    });
});