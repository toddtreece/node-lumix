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

}

proto.port = 41234;
proto.socket = false;
proto.images = [];
proto.current = [];

proto.listen = function() {

  var self = this;

  this.socket = dgram.createSocket('udp4');

  this.socket.on('message', this.receivedData.bind(this));

  this.socket.on('listening', function() {
    self.emit('listening');
  });

  this.socket.on('error', function() {
    self.socket.close();
    self.socket = false;
    self.listen();
  });

};

proto.receivedData = function(data, rinfo) {

  for(var i = 0; i < data.length; i++) {

    // push start of image
    // http://www.xbdev.net/image_formats/jpeg/tut_jpg/jpeg_file_layout.php
    if(data[i] === 0xff && data[i + 1] === 0xd8) {
      this.current.push(data[i]);
      i++;
      this.current.push(data[i]);
      continue;
    }

    // continue if the start of image hasn't been found yet
    if(!this.current.length) {
      continue;
    }

    if(data[i] === 0xff && data[i + 1] === 0xd9) {

      // push end of image
      this.current.push(data[i]);
      i++;
      this.current.push(data[i]);

      // push image to temporary buffer until _read is called
      this.images.push(
        Buffer(this.current)
      );

      // reset current image buffer
      this.current = [];

      // let _read know there's an image ready
      this.emit('image');

      continue;

    }

    // image data, go ahead and push it
    this.current.push(data[i]);

  }

};

proto._read = function() {

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

  this.push(this.images.shift());

};
