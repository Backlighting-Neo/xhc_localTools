var qiniu = require('qiniu');
var http = require('http');

function uptoken(bucketname, expires) {
  qiniu.conf.ACCESS_KEY = 'topm8b9bDpC3ZGbUniY8IJTyTeym-1AvRamFdANc';
  qiniu.conf.SECRET_KEY = 'Twk0QTrn-e7fVVQX5eQMPfnV0nJ9WxCfewz-RYwt';

  var putPolicy = new qiniu.rs.PutPolicy(bucketname);
  putPolicy.insertOnly = 1;
  putPolicy.expires = expires;
  return putPolicy.token();
}

http.createServer(function(req, res) {
  var token = uptoken('xhc-static', 3600);
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  });
  res.end('{"token":"'+token+'"}');
}).listen(1337, "0.0.0.0");
