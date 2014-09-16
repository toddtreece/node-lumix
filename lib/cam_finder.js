var SSDP = require('node-ssdp').Client,
    ssdp = new SSDP(),
    request = require('request'),
    xml = require('xml2js').parseString,
    util = require('util');

var proto = CamFinder.prototype;

exports = module.exports = CamFinder;

function CamFinder(options) {

  if (!(this instanceof CamFinder)) {
    return new CamFinder(options);
  }

  util._extend(this, options);

}

proto.type = 'urn:schemas-upnp-org:service:ContentDirectory:1';
proto.interval = 3000;
proto.timer = false;

proto.search = function(cb) {

  var self = this;

  if(! cb) {
    cb = function() {};
  }

  ssdp.on('response', this.handleResponse.bind(this, cb));

  this.timer = setInterval(function() {
    ssdp.search(self.type);
  }, this.interval);

};

proto.handleResponse = function(cb, headers, statusCode, rinfo) {

  if(! /Panasonic/.test(headers.SERVER)) {
    return;
  }

  // request info about the camera
  request(headers.LOCATION, function(err, res, body) {

    // parse xml
    xml(body, function(err, parsed) {

      var device = parsed.root.device[0];

      // clear listeners
      ssdp.removeAllListeners('response');

      // stop searching
      if(this.timer) {
        clearInterval(this.timer);
        this.timer = false;
      }

      // return info to callback
      cb({
        address: rinfo.address,
        model: device.modelName[0] + ' ' + device.modelNumber[0],
        manufacturer: device.manufacturer[0]
      });

    });

  });

};

