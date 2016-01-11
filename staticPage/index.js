var request = require('request');

var requestPromise = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      error ? reject(error) : resolve(body);
    })
  })
}

var handle = (url)=>{
	var qiniuURL;

	

	return(qiniuURL);
}