/* Copyright (c) 2015, Amperka LLC
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

var RETRY_CONNECT_MS = 1000;

var Connection = Backbone.Model.extend({
    defaults: {
        connectionId: null,
        path: null,
        bitrate: 9600,
        dataBits: 'eight',
        parityBit: 'no',
        stopBits: 'one',
        autoConnect: undefined,
        ports: [],
        text: '...',
        error: ''
    },

    initialize: function () {
        chrome.serial.onReceiveError.addListener(this._onReceiveError.bind(this));

        var port = chrome.runtime.connect({name: "display"});
        port.onMessage.addListener(this._onReceive.bind(this));
    },

    enumeratePorts: function () {
        var self = this;
        chrome.serial.getDevices(function (ports) {
            self.set('ports', ports);
            self._checkPath();
        });
    },

    hasPorts: function () {
        return this.get('ports').length > 0;
    },

    autoConnect: function (enable) {
        this.set('autoConnect', enable);
        if (enable) {
            this._tryConnect();
        } else {
            this._disconnect();
        }
    },

    _tryConnect: function () {
        if (!this.get('autoConnect')) {
            return;
        }

        var path = this.get('path');

        if (path) {
            var self = this;
            var opts = {
                bitrate: this.get('bitrate'),
                dataBits: this.get('dataBits'),
                parityBit: this.get('parityBit'),
                stopBits: this.get('stopBits')
            };

            chrome.serial.connect(path, opts, function (connectionInfo) {
                if (connectionInfo) {
                    self.set('connectionId', connectionInfo.connectionId);
                    self.set('text', 'Đã kết nối');
                } else {
                    self.set('connectionId', null);
                    self.set('autoConnect', false);
                    self.set('error',
                        'Connection failed' +
                        '<div style="font-size: 0.25em">' +
                        'Can\'t open serial port ' + path +
                        '.<br>Possibly it is already in use ' +
                        'by another application.' +
                        '</div>');
                }
            });
        } else {
            this.enumeratePorts();
            setTimeout(this._tryConnect.bind(this), RETRY_CONNECT_MS);
        }
    },

    _disconnect: function () {
        var cid = this.get('connectionId');
        if (!cid) {
            return;
        }

        var self = this;
        self.set('text', 'Mất kết nối');
        chrome.serial.disconnect(cid, function () {
            self.set('connectionId', null);
            self.enumeratePorts();
        });
    },

    _checkPath: function () {
        var path = this.get('path');
        var ports = this.get('ports');

        if (ports.length == 0) {
            this.set('path', null);
            return;
        }

        if (ports.some(function (port) {
                return port.path == path;
            })) {
            return;
        }

        // We have to auto-choose any port. Use first
        // one but try to guess better on Mac
        var portIdx = 0;
        for (var i = 0; i < ports.length; ++i) {
            var port = ports[i];
            if (port.path.indexOf('/dev/cu.usbmodem') === 0) {
                portIdx = i;
                break;
            }
        }

        this.set('path', ports[portIdx].path);
    },

    _onReceive: function (data) {
        console.log(data);
        if (data) {
            this.set('text', parseFloat(Math.round(data.weight * 100) / 100).toFixed(2));
        }
    },

    _onReceiveError: function (info) {
        this._disconnect();
        this.set('error', info.error);
        this.enumeratePorts();
    }
});

function setText(txt) {
    jQuery('h1').html(txt);
}

jQuery(function () {
    var connection = new Connection();

    connection.on('change:text', function (c) {
        var text = c.get('text');
        setText(text);
    });

    connection.on('change:error', function (c) {
        var text = c.get('error');
        setText(text);
    });

    connection.on('change:ports', function (c) {
        var ports = c.get('ports');
        var $port = jQuery('#port');
        $port.empty();

        for (var i = 0; i < ports.length; ++i) {
            var port = ports[i];
            jQuery('<option value="' + port.path + '">' +
                port.path + ' ' + (port.displayName || '') + '</option>').appendTo($port);
        }

        if (ports.length == 0) {
            jQuery('<option value="">[no device found]</option>').appendTo($port);
            $port.prop('disabled', true);
        } else {
            $port.val(c.get('path'));
        }
    });

    connection.on('change:autoConnect', function (c) {
        var autoConnect = !!c.get('autoConnect');
        jQuery('#stop-connection').toggle(autoConnect);
        jQuery('#connect').toggle(!autoConnect);
        jQuery('#port').prop('disabled', autoConnect || !c.hasPorts());
        jQuery('#bitrate, #dataBits, #parityBit, #stopBits').prop('disabled', autoConnect);
    });

    connection.on('change:path', function (c) {
        var path = c.get('path');
        jQuery('#port').val(path);
    });

    connection.on('change:connectionId', function (c) {
        var connected = !!c.get('connectionId');
        if (connected) {
            jQuery('body').css('background-color', 'green');
        } else {
            jQuery('body').css('background-color', 'red');
        }

        jQuery('.btn-connection').toggleClass('connected', connected);
    });

    jQuery('.btn-connection').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $connection = jQuery('#connection');
        $connection.toggle(0);
        if ($connection.is(':visible')) {
            connection.enumeratePorts();
        }
    });

    jQuery('#connection').click(function (e) {
        e.stopPropagation();
    });

    jQuery('body').click(function () {
        jQuery('#connection').hide();
    });

    jQuery('#connect').click(function (e) {
        e.preventDefault();
        connection.autoConnect(true);
    });

    jQuery('#port').change(function (e) {
        connection.set('path', jQuery(this).val());
    });

    // jQuery('#bitrate').change(function (e) {
    //     connection.set('bitrate', parseInt(jQuery(this).val()));
    // });
    //
    // jQuery('#dataBits, #parityBit, #stopBits').change(function (e) {
    //     connection.set(jQuery(this).attr('name'), jQuery(this).val());
    // });

    jQuery('#stop-connection').click(function (e) {
        e.preventDefault();
        connection.autoConnect(false);
    });

    connection.autoConnect(true);
});
