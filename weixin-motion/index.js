var http = require('http'),
  httpProxy = require('http-proxy'),
  fs = require('fs'),
  request = require('request'),
  crypto = require('crypto');

// Promise化的request
var requestPromise = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      error ? reject(error) : resolve(body);
    })
  })
}

var golbal_count = 0;
var FileList = [];
var dirName = (new Date).getTime() + '';
fs.mkdir(`./${dirName}/`);

var proxy = httpProxy.createProxyServer({});
proxy.on('proxyRes', function(proxyReq, req, res, options) {
  if (req.url.indexOf('mmbiz.qpic.cn/mmemoticon') > -1) {
    console.log(req.url);
    http.get(req.url, function(res) {
      var imgData = '';
      res.setEncoding('binary'); 
      res.on('data', function(chunk) {
        imgData += chunk;
      });
      res.on('end', function() {
        if(FileList.indexOf(req.url)==-1){
          FileList.push(req.url);
          console.log(`store #${golbal_count++} motion`);
          fs.writeFile(`./${dirName}/${golbal_count}.gif`, imgData, 'binary');
        }
      });
      res.on('error', ()=>{
        console.log('download fail');
      })
    });
  }
});

var server = http.createServer(function(req, res) {
  proxy.web(req, res, {
    target: req.url
  });
});

process.on('uncaughtException', function (err) {
  console.log(err);
});

console.log('listening on port 8000');
console.log(`motion will be store at ./${dirName}/`);
server.listen(8000);
