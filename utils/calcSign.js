var CryptoJS = require("crypto-js");


// Token verification calculation
const calcSign = function (clientId, timestamp, nonce, signStr, secret, accessToken) {
    if (accessToken != undefined) { var str = clientId + accessToken + timestamp + signStr }
    else { var str = clientId + timestamp + signStr }


    var hash = CryptoJS.HmacSHA256(str, secret);
    var hashInBase64 = hash.toString();
    var signUp = hashInBase64.toUpperCase();
    return signUp;



}


module.exports = { calcSign };