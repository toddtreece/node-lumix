var util = require('util'),
    events = require('events'),
    xml = require('xml2js').parseString;

util.inherits(Lumix, events.EventEmitter);

var proto = Lumix.prototype;

exports = module.exports = Lumix;

Lumix.CamFinder = require('./lib/cam_finder');
Lumix.ImageStream = require('./lib/image_stream');
Lumix.Request = require('./lib/request');
Lumix.Control = require('./lib/control');

function Lumix(options) {

  if (!(this instanceof Lumix)) {
    return new Lumix(options);
  }

  events.EventEmitter.call(this, options);

  util._extend(this, options);

  this.init();

}

proto.cam = false;
proto.state = false;
proto.request = false;
proto.control = false;

proto.init = function() {

  var self = this,
      camfinder = Lumix.CamFinder();

  camfinder.search(function(cam) {

    self.cam = cam;

    self.request = Lumix.Request({address: cam.address});
    self.control = Lumix.Control({request: self.request});

    self.getState();

    self.emit('ready');

  });

};

proto.getState = function() {

  var self = this;

  setInterval(function() {

    // get the current state of the cam
    self.request.mode('getstate').queue(function(err, res, body) {

      // stash the state
      xml(body, function(err, parsed) {
        self.state = parsed;
      });

    });

  }, 10000);

};

