var SSDP = require('node-ssdp').Client,
    ssdp = new SSDP(),
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

proto.getAddress = function(cb) {

  var self = this;

  ssdp.on('response', this.handleResponse.bind(this, cb));

  this.timer = setInterval(function() {
    ssdp.search(self.type);
  }, this.interval);

};

proto.handleResponse = function(cb, headers, statusCode, rinfo) {

  if(! /Panasonic/.test(headers.SERVER)) {
    return;
  }

  // clear listeners
  ssdp.removeAllListeners('response');

  // stop searching
  if(this.timer) {
    clearInterval(this.timer);
    this.timer = false;
  }

  // return address to callback
  cb(rinfo.address);

};

