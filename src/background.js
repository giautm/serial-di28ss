/**
 * Created by giautm on 13/09/2016.
 */
"use strict";

const LB_TO_KG = 0.45359237;
var connectedPorts = [];
var singleWindow = null;

function onConnect(port) {
    if (port.name == 'display' || port.name == 'di-28ss') {
        connectedPorts.push(port);
        port.onDisconnect.addListener(function () {
            var index = connectedPorts.indexOf(port);
            if (index > -1) {
                connectedPorts.splice(index, 1);
            }
        });
        port.onMessage.addListener(function (msg) {
            console.log('Received message from connected port', msg);
        });
    } else {
        console.log('Undefined port name: ', port.name);
    }
}
chrome.runtime.onConnect.addListener(onConnect);
chrome.runtime.onConnectExternal.addListener(onConnect);


function parseRaw(buffer) {
    var matches = String.fromCharCode.apply(null, new Uint8Array(buffer))
        .match(/\x02?(\x01|\x00)\r(?:0|NET WEIGHT:)(.{7})\r(?:4|TARE WEIGHT:)(.{7})\r\n/);
    if (matches && matches[2] != 'OV00000' && matches[3] != '???????') {
        var netWeight = parseFloat(matches[2].replace(',', '.'));
        var tareWeight = parseFloat(matches[3].replace(',', '.'));
        return {
            stable: matches[1].charCodeAt(0) == 0x01,
            weight: netWeight + tareWeight,
            netWeight: netWeight,
            tareWeight: tareWeight
        };
    }

    return false;
}

var onReceiveCallback = function (info) {
    console.log('Received data from serial: ' + info.connectionId);
    if (info.data && connectedPorts && connectedPorts.length) {
        var result = parseRaw(info.data, 1);
        console.log(result);
        if (result) {
            connectedPorts.forEach(function (port) {
                port.postMessage(result);
            });
        }
    }
};
chrome.serial.onReceive.addListener(onReceiveCallback);

function onAppWindowClosed() {
    singleWindow = null;
    chrome.serial.getConnections(function (connections) {
        connections.forEach(function (c) {
            chrome.serial.disconnect(c.connectionId, console.log.bind(console));
        });
    });
}
chrome.app.runtime.onLaunched.addListener(function () {
    var windowWidth = 370;
    var windowHeight = 250;
    if (singleWindow) {
        singleWindow.outerBounds.setPosition(
            screen.availWidth - windowWidth,
            screen.availHeight - windowHeight);
    } else {
        chrome.app.window.create('window.html', {
            outerBounds: {
                width: windowWidth,
                height: windowHeight,
                left: screen.availWidth - windowWidth,
                top: screen.availHeight - windowHeight
            },
            // resizable: false,
            // frame: 'none',
            alwaysOnTop: true
        }, function (appWindow) {
            singleWindow = appWindow;
            appWindow.onClosed.addListener(onAppWindowClosed);
        });
    }
});

console.log("Hello from background!");