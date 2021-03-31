var crypto = require('crypto');
var token = null;

function getToken() {
  const time = Date.now();
  const limitTime = 30 * 60 * 1000; // 30 minute
  if (token === null || time - token.time > limitTime) {
    token = {
      time: time,
      value: getEncryption(time)
    };
  } 
  return token.value;
}

var getEncryption = function (str) {
  let SUFFIX = 's5w84&&d4d473885s2025s5*4s2';
  var obj = crypto.createHash('sha256');
  obj.update(str + SUFFIX);
  return obj.digest('hex');
}

module.exports = getToken;