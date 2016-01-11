var crypto = require('crypto');
function md5 (text) {
  var ret = crypto.createHash('md5').update(text.toString()).digest("hex");
　return ret;
};


tempstring = 'appid=wxd930ea5d5a258f4f&body=test&device_info=1000&mch_id=10000100&nonce_str=ibuaiVcKdpRxkhJA&key=192006250b4c09247ec02edce69f6a2d';

var sign=md5(tempstring);

console.log(sign);