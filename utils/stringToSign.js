
var CryptoJS = require("crypto-js");

const stringToSign=function(path,method,body){

    var headersStr = ""
    
    var bodyStr=""
    if(body!=undefined)
    {bodyStr=JSON.stringify(body)}
    
    
    var sha256 = CryptoJS.SHA256(bodyStr)
    

    var signUrl=method + "\n" + sha256 + "\n" + headersStr + "\n" + path
    
    return signUrl



}



module.exports={stringToSign};