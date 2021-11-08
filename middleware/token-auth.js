(function (tokenAuthenticationMiddleware) {

    'use strict';

    var jwt = require('jsonwebtoken'),        
        secret = "05231b50-fd3d-11e9-bac2-47f7251a736c",
        sql = require("../database"),
        request = new sql.Request(); 

    function callbackFunc (res, bitVal, message,status) {
        res.status(status);
        res.json({
            isToken: bitVal,
            success: false,
            message: message
        });
    }
 
    tokenAuthenticationMiddleware.authenticate = function (req, res, next) {
        // console.log("request body ", req.body); 
        // console.log("request headers ", req.headers);
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
       
        if (token ) {
            
                jwt.verify(token, secret, {  algorithm:'HS512' },
                    function (err, decoded) {
    
                        if(err){
                            console.log('error in aauthentication',err)
                            callbackFunc(res, false, "Invalid token",400);
                        }else{
                            console.log('decoded',decoded) 
                            //    callbackFunc(res, true, message);
                            if(new Date(decoded.expire) < new Date()){

                                res.status(403);
                                res.json({
                                    success: false,
                                    message:'Your login session has been expired please login and try again!'
                                });

                            }else{
                                let query = `Select Email From Users Where Email = '${decoded.email}'`
                                request.query(query, function (err,set) { 
                                    if(err){                            
                                      console.log("err",err)
                                      res.status(400)
                                      res.json({
                                        success:false,
                                        message:err.originalError.info.message
                                      })
                                      
                                    }else{           
                                     if(!set.recordsets[0].length){
                                        res.status(403);
                                        res.json({
                                            success: false,
                                            message:'Access forbidden! Please check the supplied Authorization token and try again..'
                                        });
                                     }else{
                                         req.decoded = decoded
                                         next()
                                     }
                                      
                                    }
                                    })
                            }
                          
                         
                          
                        } 
                        
                    });
           
            
        } else {
            callbackFunc(res, false, "Please supply authorization token to continue ",403);
        }
    };

})(module.exports);