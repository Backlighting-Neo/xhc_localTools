var express = require('express');
var app = express();
var request = require('request');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var moment = require('moment');

app.use(bodyParser.urlencoded({
  extended: true
}));

// Created by Backlighting @ 2015-11-13

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
  return crypto.createHash('md5').update(text.toString()).digest("hex").toUpperCase();
};

var sha1 = (text) => {
  return crypto.createHash('sha1').update(text.toString()).digest("hex");
}

// 对传入的args中的所有键值对按照键名进行ASCII排序，然后按照URL格式进行拼接
var raw = (args) => {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach((key) => {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

// 创建一个15位的随机字符串
var createNonceStr = () => {
  return Math.random().toString(36).substr(2, 15);
};

// 创建当前时间的Unix时间戳
var createTimestamp = () => {
  return parseInt(new Date().getTime() / 1000) + '';
};

// 微信号AppId和Secret
var config = {
  xhc: { // 小红唇 服务号  isccawu@qq.com
    appid: 'wx978a281f79307bb7',
    secret: '9fe16a0640135b9ad4f3459ba12fb642',
    mch_id: undefined
  },
  xhc_store: { // 小红唇商城 服务号  dyh@xiaohongchun.com
    appid: 'wx3d7f899c6405a785',
    secret: 'a2715cda2a4c7f1b8e724c97315620ff',
    mch_id: '1288940601' // 微信支付商户号
  }
}
config.weixin = config.xhc_store; //选择使用哪个微信服务号

// 需要缓存的数据，在生产版本中，请将这两个值存入数据库
// 另需要一个定时的守护程序，当临近超时时，自动刷新对应的值更新数据库
// 本程序只从数据库取值，定时更新的任务由其他程序完成
var bufferData = {
  AccessToken: {
    value: '',
    timeoutStamp: 0
  },
  js_ticket: {
    value: '',
    timeoutStamp: 0
  }
}

// 根据临时凭票code换取AccessToken和OpenID
// 需要向微信服务器发送请求
// 拿到微信返回后查询数据库是否注册
// 拼接微信json和小红唇json后返回
// 方法：GET
// 参数：code - 微信登录接口返回给前端的临时凭票
app.get('/weixin/get_accesstoken/:code', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var code = req.params.code;
  if (code.length < 32) {
    res.status(500)
      .json({
        error: 'Code error'
      })
      .end();
    return;
  }

  var url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.weixin.appid}&secret=${config.weixin.secret}&code=${code}&grant_type=authorization_code`;

  request(url, function(error, response, body) {
    var tencent_json = JSON.parse(body);
    var uid = 0;
    if (tencent_json.errcode) {
      // 获取at出错，不需要去数据库查
      uid = -1;
    } else {
      // 获取到at和openid，请到数据库中查一下这个openid在我们这有没有注册过
      // 注册过请设置uid，没注册过请返-1
      // TODO 数据库查询
      uid = 12345;
    }

    res.status(200)
      .json({
        origin: {
          code: code
        },
        tencent: tencent_json,
        xhc: {
          uid: uid
        }
      })
      .end();
  })
});

// 微信支付签名
// 不需要向微信服务器发送请求
// 依赖微信号的secret字段
// 方法：POST
// 参数：prepayid - 预埋单编号
app.get('/weixin/sign/:prepayid', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var timeStamp = createTimestamp();
  var nonceStr = createNonceStr();

  res.status(200)
    .json({
      sign: (function() {
        var stringA = raw({
          appId: config.weixin.appid,
          timeStamp: timeStamp,
          nonceStr: nonceStr,
          package: 'prepay_id=' + req.params.prepayid,
          signType: 'MD5'
        }) + '&key=' + config.weixin.secret;
        return md5(stringA);
      })(),
      timeStamp: timeStamp,
      nonceStr: nonceStr
    })
    .end();
})

// 统一下单接口
// 文档：https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
app.post('/weixin/unifiedorder', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var mch_id = config.weixin.mch_id;
  var device_info = 'WEB';
  var nonce_str = createNonceStr();
  var sign = '';
  var body = req.body.body;
  var detail = req.body.detail ? req.body.detail : '';
  var attach = req.body.attach ? req.body.attach : '';
  var out_trade_no = createNonceStr();
  var fee_type = 'CNY';
  var total_fee = 0.01;
  var spbill_create_ip = req.ip;
  var time_start = moment().format('YYYYMMDDHHmmss');
  var time_expire = moment().add(30, 'minute').format('YYYYMMDDHHmmss');
  var goods_tag = '';
  res.status(200)
    .end();
})

app.get('/weixin/getAccessToken', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (bufferData.AccessToken.timeoutStamp > 0) {
    res.status(200)
      .json({
        AccessToken: bufferData.AccessToken.value
      })
      .end();
  } else {
    res.status(500)
      .json({
        error: 'Server not cache'
      })
      .end();
  }
})

app.get('/weixin/getJsTicket', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (bufferData.AccessToken.timeoutStamp > 0) {
    res.status(200)
      .json({
        js_ticket: bufferData.js_ticket.value
      })
      .end();
  } else {
    res.status(500)
      .json({
        error: 'Server not cache'
      })
      .end();
  }
})

app.get('/weixin/authJs/:url', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var timeStamp = createTimestamp();
  var nonceStr = createNonceStr();
  var url = req.params.url.replace(/#.*?$/g,'');

  var stringA = raw({
    nonceStr, timeStamp, url,
    jsapi_ticket: bufferData.js_ticket.value
  });

  res.status(200)
    .json({
      timeStamp, nonceStr, url, 
      signature: sha1(stringA)
    })
    .end();
})

var server = app.listen(1339, '0.0.0.0', () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Weixin-Interface app listening at http://%s:%s\nPowered by Backlighting', host, port);
});

var upDataToken = () => {
  var url = {
    AccessToken: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.weixin.appid + '&secret=' + config.weixin.secret,
    jsticket: (at) => {
      return ('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + at + '&type=jsapi');
    }
  };

  var nowTimeStamp = moment().unix();

  if (bufferData.AccessToken.timeoutStamp - nowTimeStamp < 600) { // 差十分钟到期的时候更新AT
    requestPromise(url.AccessToken).then((body) => {
      var json = JSON.parse(body);
      bufferData.AccessToken.value = json.access_token;
      bufferData.AccessToken.timeoutStamp = nowTimeStamp + json.expires_in;
      console.log(`weChat AccessToken Update Success, new Token is ${bufferData.AccessToken.value}`);
    }).then(() => {
      if (bufferData.js_ticket.timeoutStamp - nowTimeStamp < 600) {
        requestPromise(url.jsticket(bufferData.AccessToken.value)).then((body) => {
          var json = JSON.parse(body);
          bufferData.js_ticket.value = json.ticket;
          bufferData.js_ticket.timeoutStamp = nowTimeStamp + json.expires_in;
          console.log(`weChat js_ticket Update Success, new Ticket is ${bufferData.js_ticket.value}`);
        })
      }
    })
  }
}

upDataToken();
setInterval(upDataToken, 600000);
