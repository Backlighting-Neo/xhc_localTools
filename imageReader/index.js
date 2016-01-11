var express = require('express');
var app = express();
var request = require('request');

// Promise化的request
var requestPromise = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      error ? reject(error) : resolve(body);
    })
  })
}

app.get('/imageReader/:url', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var url = req.params.url;
  request(url, function(error, response, body) {
    if (error) {
      res.status(500)
        .json({
          code: 1000,
          msg: '请求错误'
        })
        .end();
      return;
    } else {
      var patt = new RegExp("jqimg=\'.*?\'", "g");
      var sourceCode = body;
      var imageList = sourceCode.match(patt);

      for (var i = 0; i < imageList.length; i++) {
        imageList[i] = imageList[i].replace('jqimg=', '').replace(/\'/g, '');
      };

      res.status(200)
      .json({
      	code: 0,
      	imageList
      })
      .end();
    }
  });
})

var server = app.listen(1679, '0.0.0.0', () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('ImageReader app listening at http://%s:%s\nPowered by Backlighting', host, port);
});