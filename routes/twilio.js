var express = require('express');
var router = express.Router();
// var twilio = require('twilio');
const accountSid = '';
const authToken = '';
const serviceSid = '';
const rp = require('request-promise')
const country = '+91'
const { check, oneOf, validationResult } = require('express-validator');
var sql = require("../database");
var request = new sql.Request();
const secret = "05231b50-fd3d-11e9-bac2-47f7251a736c"
const moment = require("moment")
const jwt = require('jsonwebtoken')






// SendGrid verify API key - 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

/* POST verify phone number. */

function getTwilioCredentials() {

    return new Promise((resolve, reject) => {

        request.query(`Select * from Twilio_Credentials`, function (err, recordset) {
            console.log("err", err)
            resolve(recordset.recordset[0])
        })

    })

}

function sendSMS(to, channel) {
    console.log("to, channel", to, channel)
    return new Promise(async (resolve, reject) => {
        var data = {
            "To": to,
            "Channel": channel,
        }
        console.log('data', data)


        let cred = await getTwilioCredentials()
        console.log("cred", cred)

        var options = {
            url: `https://verify.twilio.com/v2/Services/${cred.serviceSid}/Verifications`,
            method: 'POST',
            formData: data,
            auth: {
                'user': cred.accountSid,
                'pass': cred.authToken
            },
            json: true
        };
        rp(options).then(response => {
            console.log(response)

            resolve({
                [channel]: {
                    success: true,
                    message: `OTP has been sent to ${to} via ${channel}`
                }
            })

        }).catch(error => {
            console.log('error', error.error)
            resolve({
                [channel]: {
                    success: false,
                    message: `Sending OTP has been failed to ${to} via ${channel}`
                }
            })

        })
    })
}

router.post('/send-otp', async function (req, res) {


    console.log("req.body", req.body)

    let finalResult = {}
    if (req.body.phoneNumber && req.body.channel) {

        req.body.channel = ["whatsapp"]
        // req.body.channel = ["sms", "whatsapp"]

        for (let i = 0; i < req.body.channel.length; i++) {

            // finalResult.push(await sendSMS(req.body.phoneNumber, req.body.channel[i]))
            finalResult = { ...finalResult, ...await sendSMS(req.body.phoneNumber, req.body.channel[i]) }
        }

        res.json({
            success: true,
            message: "OTP has been sent successfully",
            result: finalResult
        })

    } else {
        res.json({
            success: false,
            message: "Please check the body and try again",

        })
    }


});
function getOrderID(id) {

    return new Promise((resolve, reject) => {
        // console.log("rqyert", `select Id from orderList where UserId = '${id}' and OrderStatus = 'PE'`)
        request.query(`select Id,OrderStatus from orderList where UserId = '${id}'`, function (err, recordset) {

            console.log("err", err)
            if (recordset.recordset.length) {
                console.log("res", id, recordset.recordset)

                if (recordset.recordset[0].OrderStatus == "CA") {

                    resolve('')

                } else {
                    let query = `Select * From SubscriptionManagement where userID = '${id}' and orderID = '${recordset.recordset[0].Id}'`

                    console.log('query', query)
                    request.query(query, function (err, recordset1) {
                        console.log('recordset1', recordset1)
                        console.log('err', err)

                        if (recordset1.recordset[0].installationStatus == 2) {
                            resolve({ status: "4" })
                        } else {
                            resolve({ status: "3" })
                        }

                    })
                }





            } else {
                resolve('')

            }

        })
    })



}

/* POST verify phone number. */
router.post('/verify', async function (req, res, next) {
    if (req.body.otp && req.body.phoneNumber) {
        const code = req.body.otp,
            to = req.body.phoneNumber;

        let cred = await getTwilioCredentials()

        const twilioAccountSid = cred.accountSid,
            twilioAuthToken = cred.authToken,
            twilioVerificationSid = cred.serviceSid

        var data = {
            "To": to,
            "Code": code
        }
        console.log("data", data)

        var options = {
            url: `https://verify.twilio.com/v2/Services/${twilioVerificationSid}/VerificationCheck`,
            method: 'POST',
            formData: data,
            auth: {
                'user': twilioAccountSid,
                'pass': twilioAuthToken
            },
            json: true
        };

        rp(options).then(response => {

            if (response.valid) {

                let query = `select * from Users Where PhoneNumber='${req.body.phoneNumber}'`
                request.query(query, async function (err, set) {
                    if (err) {

                        console.log("err", err)
                        res.status(400)
                        res.json({
                            success: false,
                            message: err.originalError.info.message
                        })

                    } else {
                        if (set.recordset.length) {



                            var payload = {}
                            payload.id = set.recordsets[0][0].Id
                            payload.email = set.recordsets[0][0].Email
                            payload.expire = moment(new Date()).add('1000000', 'minutes').toDate()
                            payload.firstName = set.recordset[0].FirstName
                            payload.lastName = set.recordset[0].LastName
                            payload.phoneNumber = set.recordset[0].PhoneNumber
                            payload.address = set.recordset[0].address ? set.recordset[0].address : ""
                            payload.isSocialLogin = set.recordset[0].IsSocialLogin

                            var token = jwt.sign(payload, secret);

                            let isOrder = await getOrderID(set.recordsets[0][0].Id)
                            console.log("it came outer", isOrder)

                            if (isOrder) {
                                console.log("it came", isOrder)
                                set.recordset[0].status = isOrder.status
                            }



                            res.json({
                                success: true,
                                message: "User details respective to the Phone Number passed.",
                                result: set.recordset[0],
                                token: token
                            })
                        } else {


                            let checkcon = `INSERT INTO Users VALUES ('', 
  '', '', '', 
  '0', '1', '${new Date().toISOString()}', '${new Date().toISOString()}', 
  '', '${req.body.phoneNumber}', '1') SELECT SCOPE_IDENTITY() as id`

                            request.query(checkcon, function (err, set) {
                                if (err) {

                                    console.log("err", err)
                                    res.status(400)
                                    res.json({
                                        success: false,
                                        message: err.originalError.info.message
                                    })

                                } else {
                                    createCustomer(req, set.recordset[0].id)
                                    res.status(200)
                                    res.json({
                                        success: true,
                                        message: "User has been added successfully",
                                        result: { status: '0' }
                                    })

                                }
                            })


                        }

                    }
                })

            } else {
                res.json({
                    success: false,
                    message: "Invalid OTP. Please re-enter the OTP and try again."
                })
            }





        }).catch(error => {
            console.log("error", error.error)
            if (error.error.status == 404) {
                res.json({
                    success: false,
                    message: "OTP has been verified already. Please try resending.",
                    result: { statusCode: error.error.status }
                })
            } else if (error.error.status == 429) {
                res.json({
                    success: false,
                    message: "You have reached the maximum number of attempts. Please try after sometimes.",
                    result: { statusCode: error.error.status }
                })
            } else {
                res.json({
                    success: false,
                    message: { statusCode: error.error.message },
                    result: { statusCode: error.error.status }
                })
            }

        })






    } else {
        res.status(400)
        res.send("'code' and 'to' paramaeters are mandatory. Please check the fields and try again!")
    }
});

function createCustomer(req, id) {
    return new Promise((resolve, reject) => {

        let query = `INSERT INTO [dbo].[Customer_New]
               ([FirstName]
               ,[LastName]
               ,[Email]
               ,[Phone]
               ,[PlanInfo]
               ,[CreatedOn]
               ,[UpdatedOn]
               ,[paymentAmount]
               ,[LastService]
               ,[ServiceLocation]
               ,[PurchaseType]
               ,[CustomerType]          
               ,[paymentDate]
               ,[paymentDueDate]
               ,[isPaymentDone]
               ,[isFromWeb],[userID])
         VALUES
        
               ('NA','NA','NA','${req.body.phoneNumber}','NA','${new Date().toISOString()}','${new Date().toISOString()}','NA',null, 'NA','N','L',null,null,'NA','0','${id}')`


        console.log("query", query)
        request.query(query, function (err, response) {

            if (!err) {
                resolve(true)
            } else {
                console.log("err", err)
                resolve(false)
            }

        })




    })
}

router.put('/updateName',
    [
        check("firstName").exists(),
        check("lastName").exists(),
        check("phoneNumber").exists(),
    ],
    async function (req, res) {

        try {
            validationResult(req).throw()

            let query = `update Users set FirstName = '${req.body.firstName}',
            LastName = '${req.body.lastName}', updatedOn = '${new Date().toISOString()}', status='2' where phoneNumber = '${req.body.phoneNumber}'`

            let queryCustomer = ` update Customer_New set FirstName = '${req.body.firstName}',
            LastName = '${req.body.lastName}', updatedOn = '${new Date().toISOString()}' where Phone = '${req.body.phoneNumber}'`
            request.query(query, async function (err, set) {
                if (err) {

                    console.log("err", err)
                    res.status(400)
                    res.json({
                        success: false,
                        message: err.originalError.info.message
                    })

                } else {


                    request.query(`select * from Users where phoneNumber = '${req.body.phoneNumber}'`, function (err, set) {

                        var payload = {}
                        payload.id = set.recordsets[0][0].Id
                        payload.email = set.recordsets[0][0].Email
                        payload.expire = moment(new Date()).add('10000', 'minutes').toDate()
                        payload.firstName = set.recordset[0].FirstName
                        payload.lastName = set.recordset[0].LastName
                        payload.phoneNumber = set.recordset[0].PhoneNumber
                        payload.address = set.recordset[0].address ? set.recordset[0].address : ""
                        payload.isSocialLogin = set.recordset[0].IsSocialLogin

                        var token = jwt.sign(payload, secret);
                        res.status(200)
                        res.json({
                            success: true,
                            message: "User has been updated successfully",
                            result: set.recordset[0],
                            token: token
                        })

                    })



                    request.query(queryCustomer)

                }
            })
        }
        catch (err) {
            res.status(400)
            res.json({
                success: "false",
                message: err.errors
            })
        }


    })



module.exports = router;
