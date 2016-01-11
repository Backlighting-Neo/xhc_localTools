var request = require('request');
var fs      = require('fs');
var crypto  = require('crypto');
var cheerio = require('cheerio');
var qiniu   = require('qiniu');
var express = require('express');
var app     = express();

var qiniuTokenURL = 'http://192.168.2.200:1337/';
var domain        = 'http://static.xiaohongchun.com/'

var requestPromise = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      error ? reject(error) : resolve(body);
    })
  })
}

var postPromise = (url, form) => {
	return new Promise((resolve, reject) => {
	  request.post({
	  	url,
	  	form
	  }, function(error, response, body) {
	    error ? reject(error) : resolve(body);
	  })
	})
}

var writeFilePromise = (path, content) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(__dirname + '/' + path, content, (err)=>{
			err?reject(err):resolve(path);
		})
	})
}

var uploadFileToQiniu = (localFile, key, uptoken) => {
  var extra = new qiniu.io.PutExtra();
  return new Promise((resolve, reject)=> {
  	qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
  		err?reject(err):resolve(ret.key);
  	});
  })
}

var md5 = (text) => {
  return crypto.createHash('md5').update(text.toString()).digest("hex").toUpperCase();
};

var handle = (url)=>{
	var domEdit = (content)=>{
		var $ = cheerio.load(content);
		$('iframe').remove();
		$('.m-cmthot').remove();
		$('.g-ft').remove();
		$('.g-hd0').remove();
		$('h1.m-ttl a').html('小红唇');
		return $.html();
	}
	var fileName = `staticPage/${md5(url)}_${(new Date()).getTime()}.html`;

	return requestPromise(url)
	.then((sourceCode)=>{
		var content = domEdit(sourceCode);
		return(writeFilePromise(fileName, content));
	})
	.then(()=>{
		return(requestPromise(qiniuTokenURL));
	})
	.then((token)=>{
		var qiniuURL;
		token = JSON.parse(token).token;
		return(uploadFileToQiniu(fileName, fileName, token));
	})
	.then((result)=>{
		return(result)
	})
}

app.get('/staticPage/:url', (req, res) => {
	var url = req.params.url;
	handle(url)
	.then((result)=>{
		res.header("Access-Control-Allow-Origin", "*");
		res.status(200)
		.json({
			qiniuURL: domain+result
		})
		.end();
	});
});

var server = app.listen(1680, '0.0.0.0', () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('staticPage app listening at http://%s:%s\nPowered by Backlighting', host, port);
});