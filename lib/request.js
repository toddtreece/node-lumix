var request = require('request'),
    util = require('util');

var proto = Request.prototype;

exports = module.exports = Request;

function Request(options) {

  if (!(this instanceof Request)) {
    return new Request(options);
  }

  util._extend(this, options);

  setInterval(this.send.bind(this), this.interval);

}

proto.address = '10.0.1.1';
proto.interval = 500;
proto.params = [];
proto.q = [];

proto.mode = function(mode) {
  this.params.push('mode=' + mode);
  return this;
};

proto.type = function(type) {
  this.params.push('type=' + type);
  return this;
};

proto.value = function(value) {
  this.params.push('value=' + value);
  return this;
}

/**
 * queue
 *
 * pushes a url and callback to the
 * end of the queue so that the camera
 * won't get flooded with requests
 */
proto.queue = function(cb) {

  var url = 'http://' + this.address + '/cam.cgi?' + this.params.join('&');

  // empty params
  this.params = [];

  // push the request to the queue
  this.q.push({url: url, cb: cb});

  return this;

};

/**
 * send
 *
 * this actually makes the request, but
 * it should only be called by the interval
 */
proto.send = function() {

  if(this.q.length === 0) {
    return;
  }

  // get the oldest request
  var req = this.q.shift();

  // actually make the request
  request(req.url, req.cb);

};
