const axios = require('axios');
const qs=require('qs');
var CryptoJS = require("crypto-js");
const config=require("../config.json")
const {calcSign,stringToSign}=require("../utils")

const base_url=config.base_url
const client_id=config.client_id
const secret=config.secret
var timestamp = new Date().getTime();
const httpMethod='POST'
//var accessToken=""
var device_id=config.device_id
var nonce = config.nonce
const path='/v1.0/devices/'+device_id+'/commands'



const send_device_command=function(accessToken,body){

    return new Promise(function(resolve,reject){

        var signStr=stringToSign(path,httpMethod,body)
        var sign = calcSign(client_id, timestamp, nonce, signStr, secret,accessToken);
        
        axios({
        
            method: httpMethod,
            
            url: base_url+path,
            data:body,
            headers: {'Content-Type': 'application/json','client_id':client_id,'sign':sign,'t':timestamp,'sign_method':'HMAC-SHA256','access_token':accessToken} 
          }).then(function (response) {
             resolve(response.data)
            
        
        
        
          })

    })

    



}

module.exports={send_device_command};


