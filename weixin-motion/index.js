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

// MD5加密 格式为32位大写 依赖crypto(nodejs自带官方包)
var md5 = (text) => {
  return crypto.createHash('md5').update(text.toString()).digest('hex').toUpperCase();
};

var golbal_count = 0;

var MD5List = [];

var dirName = (new Date).getTime() + '';
fs.mkdir(`./${dirName}/`);

var proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  if (req.url.indexOf('mmbiz.qpic.cn/mmemoticon') > -1) {
    http.get(req.url, function(res) {
      var imgData = '';
      res.setEncoding('binary'); 
      res.on('data', function(chunk) {
        imgData += chunk;
      });
      res.on('end', function() {
        var sign = md5(imgData);
        if(MD5List.indexOf(sign)==-1){
          MD5List.push(sign);
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

console.log('listening on port 8000');
console.log(`motion will be store at ./${dirName}/`);
server.listen(8000);
