(function (tokenAuthenticationMiddleware_new) {

    'use strict';

    var jwt = require('jsonwebtoken'),
        secret = "05231b50-fd3d-11e9-bac2-47f7251a736c",
        sql = require("../database"),
        request = new sql.Request();

    function callbackFunc(res, bitVal, message, status) {
        res.status(status);
        res.json({
            isToken: bitVal,
            success: false,
            message: message
        });
    }

    tokenAuthenticationMiddleware_new.authenticate = function (req, res, next) {

        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;

        if (token) {


            jwt.verify(token, secret, { algorithm: 'HS512' },
                function (err, decoded) {

                    if (err) {
                        console.log('error in aauthentication', err)
                        callbackFunc(res, false, "Invalid token", 400);
                    } else {

                        if (decoded.user == 'john') {
                            next()
                        } else {
                            callbackFunc(res, false, "Invalid token", 400);
                        }



                    }

                });


        } else {
            callbackFunc(res, false, "Please supply authorization token to continue ", 403);
        }
    };

})(module.exports);