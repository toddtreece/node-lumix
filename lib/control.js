var util = require('util'),
    xml = require('xml2js').parseString;

var proto = Control.prototype;

exports = module.exports = Control;

function Control(options) {

  if (!(this instanceof Control)) {
    return new Control(options);
  }

  util._extend(this, options);

}

proto.request = false;

proto.capture = function(cb) {

  if(! this.request) {
    return cb('Request module not defined in capture');
  }

  this.request.mode('camctrl').type('capture').queue(function(err, res, body) {

    xml(body, function(err, parsed) {
      console.log(parsed);
    });

  });

};

