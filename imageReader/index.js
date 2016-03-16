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
      var patt = new RegExp("http://p0.jmstatic.com/product/.*?.jpg", "g");
      var resultList = [];
      imageList = body.match(patt);
      var imageListLength = imageList==null?0:imageList.length;

      for (var i = 0; i < imageListLength; i++) {
        var url = imageList[i];
        var sizePatt = /(\d+)_(\d+).jpg/.exec(url),
            width = sizePatt[1],
            height = sizePatt[2];
        if(parseInt(width)+parseInt(height)>300){
          resultList.push({
            imgUrl: url,
            width,height
          });
        }
      };

      res.status(200)
      .json({
      	code: 0,
      	resultList
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