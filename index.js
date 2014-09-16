var util = require('util');

var proto = Lumix.prototype;

exports = module.exports = Lumix;

Lumix.CamFinder = require('./lib/cam_finder');
Lumix.ImageStream = require('./lib/image_stream');
Lumix.Request = require('./lib/request');

function Lumix(options) {

  if (!(this instanceof Lumix)) {
    return new Lumix(options);
  }

  util._extend(this, options);

}


// TODO: junk beyond this point

var camfinder = Lumix.CamFinder(),
    images = Lumix.ImageStream({port: 42222});

camfinder.search(function(cam) {

  var request = Lumix.Request({address: cam.address});

  console.log('Found ' + cam.manufacturer + ' ' + cam.model + ' @ ' + cam.address);

  request.mode('setsettings').type('liveviewsize').value('vga').queue();
  request.mode('camcmd').type('recmode').queue();
  request.mode('startstream').value(images.port).queue(console.log);

  setInterval(function() {
    request.mode('getstate').queue();
  }, 1000);

});

var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('<img src="lumix.mjpeg">');
});

app.get('/lumix.mjpeg', function(req, res) {

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=lumix',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  images.on('data', function(image) {

    console.log(image);
    res.write('--lumix\r\n');
    res.write('Content-Type: image/jpeg\r\n');
    res.write('Content-Length: ' + image.length + '\r\n');
    res.write('\r\n');
    res.write(image, 'binary');
    res.write('\r\n');

  });

});

app.listen(8080);

