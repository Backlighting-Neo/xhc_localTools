var crypto = require('crypto');

var sha1 = (text) => {
  return crypto.createHash('sha1').update(text.toString()).digest("hex");
}

var stringA = 'jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value';

console.log(sha1(stringA));