const axios = require('axios');
const qs=require('qs');
var CryptoJS = require("crypto-js");
const config=require("../config.json")
const {calcSign,stringToSign}=require("../utils")


const base_url=config.base_url
const client_id=config.client_id
const secret=config.secret
var timestamp = new Date().getTime();
//const httpMethod='GET'


var nonce = config.nonce
//const path='/v1.0/token?grant_type=1'


const get_access_token=function(path,httpMethod){
   return new Promise(function(resolve,reject){
    
      var signStr=stringToSign(path,httpMethod)
      var sign = calcSign(client_id, timestamp, nonce, signStr, secret);
   
   axios({
   
       method: httpMethod,
       
       url: base_url+path,
       //data:data,
       headers: { 'content-type': 'application/x-www-form-urlencoded','client_id':client_id,'sign':sign,'t':timestamp,'sign_method':'HMAC-SHA256'} 
     }).then(function (response) {
        //console.log(response.data.result.access_token)
       
        resolve( response.data.result.access_token)
   
   
     })

   })

}

module.exports={get_access_token};