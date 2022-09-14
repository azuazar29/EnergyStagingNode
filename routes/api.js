var express = require('express');
var router = express.Router();
var sql = require("../database");
var request = new sql.Request();
const { v4: uuidv4 } = require('uuid');
var config = require('../config/general_config')
const rp = require("request-promise")
const { check, oneOf, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = "05231b50-fd3d-11e9-bac2-47f7251a736c"
const middleware = require('../middleware/token-auth')
const moment = require("moment")






router.post('/', function (req, res, next) {
  // console.log(req.ipInfo)
  res.send('respond with a resource');
  var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  console.log(myDate)
});

router.post('/signup',
  [check("firstName").exists(),
  check("email").exists(),
  check("isSocialLogin").exists(),
  check("isActive").exists(),
  check("phoneNumber").isLength({ min: 10, max: 10 }),
  check("phoneNumber").isNumeric()],
  async function (req, res) {

    try {
      validationResult(req).throw()

      let query = `select * from Users where Email = '${req.body.email}'`

      request.query(query, async function (err, set) {
        if (err) {

          console.log("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })

        } else {
          if (set.recordsets[0].length) {
            console.log("email", set.recordsets[0][0])
            if (set.recordsets[0][0].IsSocialLogin) {
              res.status(200)
              res.json({
                success: true,
                message: "User has been added successfully"
              })
            } else {
              res.status(409)
              res.json({
                success: false,
                message: "This Email has been already registered. Please use a different one."
              })
            }

          } else {
            let password = ''
            if (req.body.password) {
              password = await createPassword(req.body.password)
            }

            let checkcon = `INSERT INTO Users VALUES ('${req.body.firstName}', 
  '${req.body.lastName ? req.body.lastName : ''}', '${req.body.email}', '${password}', 
  '${req.body.isSocialLogin}', '${req.body.isActive}', '${new Date().toISOString()}', '${new Date().toISOString()}', 
  '${req.body.location ? req.body.location : ''}', '${req.body.phoneNumber ? req.body.phoneNumber : ''}') SELECT SCOPE_IDENTITY() as id`

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
                  message: "User has been added successfully"
                })

              }
            })
          }
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
      
             ('${req.body.firstName}','${req.body.lastName}','${req.body.email}','${req.body.phoneNumber}','NA','${new Date().toISOString()}','${new Date().toISOString()}','NA',null, '${req.body.location}','N','L',null,null,'NA','${req.body.isFromWeb ? req.body.isFromWeb : 0}','${id}')`


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

router.post('/login',
  [check("email").exists()]
  , function (req, res) {
    try {
      validationResult(req).throw()
      let query = `select * from Users where Email = '${req.body.email}'`

      request.query(query, function (err, set) {
        if (err) {

          console.log("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })

        } else {

          if (!set.recordsets[0].length) {
            res.status(404)
            res.json({
              success: false,
              message: "This Email is not registred yet."
            })
          } else {
            console.log(req.body.password, set.recordset[0].IsSocialLogin)
            if (!set.recordset[0].IsSocialLogin) {
              if (req.body.password) {
                bcrypt.compare(req.body.password, set.recordsets[0][0].Password).then(function (result) {
                  if (result) {
                    let time = '10000'
                    if (req.body.expireTime) {
                      time = req.body.expireTime
                    }
                    var payload = {}
                    payload.id = set.recordsets[0][0].Id
                    payload.email = set.recordsets[0][0].Email
                    payload.expire = moment(new Date()).add(time, 'minutes').toDate()
                    payload.firstName = set.recordset[0].FirstName
                    payload.lastName = set.recordset[0].LastName
                    payload.phoneNumber = set.recordset[0].PhoneNumber
                    payload.address = set.recordset[0].address ? set.recordset[0].address : ""
                    payload.isSocialLogin = set.recordset[0].IsSocialLogin



                    let userType = '0'

                    request.query(`Select * from UserConfiguration where userID = '${set.recordsets[0][0].Id}' AND saveAndExit = '1'`, function (err, userConfig) {
                      if (!err) {
                        if (userConfig.recordsets[0].length) {
                          userType = '2'
                        } else {
                          userType = '1'
                        }
                        if (set.recordsets[0][0].Email == "subscription@gmail.com") {
                          userType = '3'
                        }

                        payload.userType = userType


                        var token = jwt.sign(payload, secret);
                        let result = set.recordsets[0][0]
                        result.userType = userType
                        result.token = token
                        delete result.Password
                        res.status(200)
                        res.json({
                          success: true,
                          message: "Successfully logged in!",
                          result: result
                        })
                      }
                    })

                  } else {
                    res.status(400)
                    res.json({
                      success: false,
                      message: "Invalid password. Please check your password and try again."
                    })
                  }
                });
              } else {
                res.status(400)
                res.json({
                  success: false,
                  message: "Invalid Password. Please provide password to continue."
                })
              }

            } else {

              let time = '100000'
              if (req.body.expireTime) {
                time = req.body.expireTime
              }
              let userType = '0'
              var payload = {}
              payload.id = set.recordsets[0][0].Id
              payload.email = set.recordsets[0][0].Email
              payload.expire = moment(new Date()).add(time, 'minutes').toDate()
              payload.firstName = set.recordset[0].FirstName
              payload.lastName = set.recordset[0].LastName
              payload.phoneNumber = set.recordset[0].PhoneNumber
              payload.address = set.recordset[0].address ? set.recordset[0].address : ""
              payload.isSocialLogin = set.recordset[0].IsSocialLogin

              request.query(`Select * from UserConfiguration where userID = '${set.recordsets[0][0].Id}' AND saveAndExit = '1'`, function (err, userConfig) {
                if (!err) {
                  if (userConfig.recordsets[0].length) {
                    userType = '2'
                  } else {
                    userType = '1'
                  }
                  if (set.recordsets[0][0].Email == "subscription@gmail.com") {
                    userType = '3'
                  }

                  payload.userType = userType


                  var token = jwt.sign(payload, secret);
                  let result = set.recordsets[0][0]
                  result.userType = userType
                  result.token = token
                  delete result.Password
                  res.status(200)
                  res.json({
                    success: true,
                    message: "Successfully logged in!",
                    result: result
                  })
                }
              })

            }



          }

        }
      })
    } catch (err) {
      res.status(400)
      res.json({
        success: "false",
        message: err.errors
      })
    }

  })
router.post('/ContentArgument', (req, res) => {
  try {
    let query = `select * from ContentArgument Where ID=${req.body.id}`
    request.query(query, function (err, set) {
      if (err) {

        console.log("err", err)
        res.status(400)
        res.json({
          success: false,
          message: err.originalError.info.message
        })

      } else {
        res.json({
          success: true,
          message: set.recordset
        })
      }
    })

  }
  catch (err) {
    console.log(err)
  }
})

router.post('/checkEmail', [check("email").exists()], function (req, res) {
  try {
    validationResult(req).throw()
    let query = `select * from Users where Email = '${req.body.email.toString().trim()}'`

    request.query(query, function (err, set) {
      if (err) {

        console.log("err", err)
        res.status(400)
        res.json({
          success: false,
          message: err.originalError.info.message
        })

      } else {

        if (set.recordsets[0].length) {
          res.status(409)
          res.json({
            success: false,
            message: "This Email is already registred. Please use a different email."
          })
        } else {
          res.status(200)
          res.json({
            success: true,
            message: "This Email is not registred yet."
          })
        }

      }
    })
  } catch (err) {
    res.status(400)
    res.json({
      success: "false",
      message: err.errors
    })
  }
})

router.post('/changePassword/:id', [
  check("newPassword").exists()
], middleware.authenticate, function (req, res) {
  try {
    validationResult(req).throw()

    createPassword(req.body.newPassword).then(newPass => {

      let query = `Update Users Set Password = '${newPass}' where Id = ${req.params.id}`

      request.query(query, function (err, set) {
        if (err) {

          console.log("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })
        } else {

          res.status(200)
          res.json({
            success: true,
            message: "Password has been changed successfully"
          })

        }
      })

    })


  } catch (err) {
    res.status(400)
    res.json({
      success: "false",
      message: err.errors
    })
  }
})

router.get('/getUserDetails/:id', middleware.authenticate, (req, res) => {
  try {
    let query = `select * from Users Where Id=${req.params.id}`
    request.query(query, function (err, set) {
      if (err) {

        console.log("err", err)
        res.status(400)
        res.json({
          success: false,
          message: err.originalError.info.message
        })

      } else {
        res.json({
          success: true,
          message: "User details respective to the ID passed.",
          result: set.recordset[0]
        })
      }
    })

  }
  catch (err) {
    console.log(err)
  }
})

router.put('/updateUserDetails/:id',
  [
    check("firstName").exists(),
    check("lastName").exists(),
    check("isActive").exists(),
    check("location").exists(),
    check("phoneNumber").exists(),
  ], middleware.authenticate,
  async function (req, res) {

    try {
      validationResult(req).throw()

      let query = `update Users set FirstName = '${req.body.firstName}',
      LastName = '${req.body.lastName}', IsActive = '${req.body.isActive}', PhoneNumber = '${req.body.phoneNumber}',
      Location = '${req.body.location}', updatedOn = '${new Date().toISOString()}' where Id = '${req.params.id}'`

      request.query(query, async function (err, set) {
        if (err) {

          console.log("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })

        } else {

          res.status(200)
          res.json({
            success: true,
            message: "User has been updated successfully"
          })

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



function createPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10).then(function (hash) {

      resolve(hash)

    });
  })

}


router.post("/create", function (req, res) {

  let query = `Create Table DefaultOccupancyPattern(
    weekdaysHour varchar(50), 
    weekendsHour varchar(50), 
    mondayOccupancy varchar(50), 
    tuesdayOccupancy varchar(50), 
    wednesdayOccupancy varchar(50), 
    thursdayOccupancy varchar(50), 
    fridayOccupancy varchar(50), 
    saturdayOccupancy varchar(50), 
    sundayOccupancy varchar(50), 
    usageAdherence varchar(50), 
    mondayList varchar(MAX), 
    tuesdayList varchar(MAX), 
    wednesdayList varchar(MAX), 
    thursdayList varchar(MAX), 
    fridayList varchar(MAX), 
    saturdayList varchar(MAX), 
    sundayList varchar(MAX)
  )`

  request.query(query, function (err, set) {
    if (err) {

      console.log("err", err)
      res.status(400)
      res.json({
        success: false,
        message: err.originalError.info.message
      })

    } else {
      res.status(200)
      res.json({
        success: true,
        message: "Table created successfully"
      })

    }
  })

})

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
function getRandom(length) {

  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));

}

router.post("/insert", async function (req, res) {

  let customers = require('../config/names')
  let AC = require('../config/names')
  let tempData = []
  for (let i = 0; i < 16; i++) {
    let ACNAme = AC.ACName[(randomIntFromInterval(0, 30))]
    let split = customers.fakeName[18 + i]
    let temp = {
      "OrderNo": "OD" + getRandom(12),
      "OrderType": "O",
      "OrderDate": moment(new Date("2021-08-10")).add(1 * i, 'days').toISOString(),
      "LastModifiedDate": "",
      "AssignedOnDate": "",
      "AssignedTo": "O&M",
      "OrderStatus": "PE",
      "OrderTotal": randomIntFromInterval(2000, 5000),
      "Customer": split,
      "UserId": 18 + i,
      "ProductId": randomIntFromInterval(0, 100)
    }

    await insertOrders(temp)
  }



  res.json({ result: "success" })

  // customers.customers.forEach(async customer=>{

  //   await insertCustomer(customer)

  // })

  // res.send("success")



  // res.send(customers.length.toString())



})

function insertProduct(Product) {

  return new Promise((resolve, reject) => {


    let query = `Insert into ProductDetails values( 
    '${Product.ProductName}',
'${Product.ProductCategory}',
'${Product.Description}',
'${Product.Quantity}',
'${Product.Price}',
'${Product.ProductCode}',
'${Product.Manufacturer}',
'${Product.ProductTax}',
'${Product.CoolingCapacity}',
'${Product.PowerConsumption}',
'${Product.CurrentRating}',
'${Product.FCUCapacity}',
'${Product.EfficiencyProfile}',
${Product.ProductCategoryId},
'${Product.IsActive}',
'${Product.CreatedOn}',
'${Product.UpdatedOn}',
'${Product.ProductInventory}',
'${Product.Tags}',
'${Product.ImagePath}',
'${Product.ModelNo}'
   )`

    console.log("query", query)
    request.query(query, function (err, set) {
      if (err) {

        console.log("err", err)
        resolve(false)

      } else {

        resolve(true)

      }
    })

  })

}

function insertOrders(order) {

  return new Promise((resolve, reject) => {


    let query = `Insert into OrderList values( 
    '${order.OrderNo}',
    '${order.OrderType}',
    '${order.OrderDate}',
    '${order.LastModifiedDate}',
    '${order.AssignedOnDate}',
    '${order.AssignedTo}',
    '${order.OrderStatus}',
    '${order.OrderTotal}',
    '${order.Customer}',
    '${order.UserId}',
    '${order.ProductId}'    
   )`

    console.log("query", query)
    request.query(query, function (err, set) {
      if (err) {

        console.log("err", err)
        resolve(false)

      } else {

        resolve(true)

      }
    })

  })

}

function insertCustomer(customer) {

  return new Promise((resolve, reject) => {


    let query = `Insert into Customer_New values( '${customer.FirstName}',
  '${customer.LastName}',
  '${customer.Email}',
  '${customer.Phone}',
  '${customer.PlanInfo}',
  '${customer.CreatedOn}',
  '${customer.UpdatedOn}',
  '${customer.LastService}',
  '${customer.ServiceLocation}',
  '${customer.PurchaseType}',
  '${customer.CustomerType}' )`

    console.log("query", query)
    request.query(query, function (err, set) {
      if (err) {

        console.log("err", err)
        resolve(false)

      } else {

        resolve(true)

      }
    })

  })

}
router.get("/testData", function (req, res) {

  let query = `
  Select * From Users
  Inner Join UserConfiguration as uc
  On uc.userID = Users.Id
  And Users.Email = 'william@testmail.com'`

  request.query(query, function (err, set) {
    if (err) {

      console.log("err", err)
      res.status(400)
      res.json({
        success: false,
        message: err.originalError.info.message
      })

    } else {
      res.status(200)
      res.json({
        success: true,
        result: set
      })

    }
  })

})

router.post("/forgot-password",
  [check('email').exists()]
  , async function (req, res) {

    try {
      validationResult(req).throw()

      var transporter = require('../config/email-config')

      let query = `Select * From Users Where Email = '${req.body.email}'`

      request.query(query, async function (err, result) {

        if (result.recordset.length) {
          let userDetails = result.recordset[0]
          var generator = require('generate-password');

          var password = generator.generate({
            length: 10,
            numbers: true
          });

          let updatePass = await createPassword(password)


          let query = `Update Users set password = '${updatePass}' where Email = '${req.body.email}'`

          request.query(query, function (err, updRes) {

            if (!err) {
              transporter.sendMail({
                from: 'mailfortesting.azar@gmail.com', // sender address
                to: result.recordset[0].Email, // list of receivers
                subject: "Reset Password", // Subject line
                // plain text body
                html: `<p style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Hi ${userDetails.FirstName}&nbsp;${userDetails.LastName},</p>
            <p style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Your Password has been reset!</p>
            <p style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">Below is the information to access your account</p>
            <p style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><strong>Username: ${userDetails.Email}</strong></p>
            <p style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><strong><span class="il">Password</span>: ${password}</strong></p>
            <p style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">You can change password via mobile application</p>`, // html body
              }).then(response => {

                res.status(200)
                res.json({
                  success: true,
                  message: "Email has been sent to you registed mail-id"
                })

              })
            } else {
              res.status(503)
              res.json({
                success: false,
                message: err
              })

            }
          })



        } else {
          res.status(404)
          res.json({
            success: false,
            message: "Email not found"
          })
        }

      })
    } catch (err) {
      res.status(400)
      res.json({
        success: "false",
        message: err.errors
      })
    }



  })







module.exports = router;
