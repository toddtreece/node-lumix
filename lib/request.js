var request = require('request'),
    util = require('util');

var proto = Request.prototype;

exports = module.exports = Request;

function Request(options) {

  if (!(this instanceof Request)) {
    return new Request(options);
  }

  util._extend(this, options);

}

proto.address = '10.0.1.1';
proto.params = [];

proto.mode = function(mode) {
  this.params.push('mode=' + mode);
};

proto.type = function(type) {
  this.params.push('type=' + type);
};

proto.value = function(value) {
  this.params.push('value=' + value);
}

proto.send = function(cb) {

  var url = 'http://' + this.address + '/cam.cgi?' + this.params.join('&');

  // empty params
  this.params = [];

  // actually make the request
  request(url, cb);

};
