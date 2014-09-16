var util = require('util'),
    stream = require('stream'),
    dgram = require('dgram');

util.inherits(ImageStream, stream.Readable);

var proto = ImageStream.prototype;

exports = module.exports = ImageStream;

function ImageStream(options) {

  if (!(this instanceof ImageStream)) {
    return new ImageStream(options);
  }

  options = util._extend({
    highWaterMark: 64 * 1024 // 64k
  }, options || {});

  stream.Readable.call(this, options);

  util._extend(this, options);

  this.listen();

}

proto.port = 41234;
proto.socket = false;
proto.timeout = false;
proto.images = [];

proto.listen = function() {

  var self = this;

  this.socket = dgram.createSocket('udp4');

  this.socket.on('message', this.receivedData.bind(this));

  this.socket.on('listening', function() {
    self.emit('listening');
  });

  this.socket.on('error', function(e) {
    self.socket.close();
  });

  this.socket.on('close', function() {
    self.socket = false;
    self.emit('close');
  });

  this.socket.bind(this.port);

};

proto.receivedData = function(data, rinfo) {

  var self = this;

  if(this.timeout) {
    clearTimeout(this.timeout);
  }

  // we stopped getting data. close the socket
  this.timeout = setTimeout(function() {
    self.socket.close();
  }, 2000);

  // cap stored images at 30
  if(this.images.length > 30) {
    images.splice(30);
  }

  // skip past most of the header
  for(var i = 100; i < data.length; i++) {

    // push start of image
    // http://www.xbdev.net/image_formats/jpeg/tut_jpg/jpeg_file_layout.php
    if(data[i] === 0xff && data[i + 1] === 0xd8) {
      this.images.push(data.slice(i));
      this.emit('image');
      break;
    }

  }

};

proto._read = function() {

  var ready;

  if(!this.socket) {
    return this.once('listening', function() {
      this._read();
    });
  }

  if(!this.images.length) {
    return this.once('image', function() {
      this._read();
    });
  }

  while(this.images.length > 0) {

    ready = this.push(this.images.shift());

    if(!ready) {
      return;
    }

  }

};
