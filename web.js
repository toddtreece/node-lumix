var util = require('util'),
    express = require('express'),
    app = express(),
    Lumix = require('./index'),
    images = Lumix.ImageStream(),
    lumix = Lumix();

lumix.connect(function() {

  lumix.request.mode('setsettings').type('liveviewsize').value('vga').queue();
  lumix.request.mode('camcmd').value('recmode').queue();
  lumix.request.mode('startstream').value(images.port).queue();

});

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

    res.write('--lumix\r\n');
    res.write('Content-Type: image/jpeg\r\n');
    res.write('Content-Length: ' + image.length + '\r\n');
    res.write('\r\n');
    res.write(image, 'binary');
    res.write('\r\n');

  });

});

app.listen(8080);

