var express = require("express");
var router = express.Router();
var sql = require("../database");
var request = new sql.Request();
var config = require("../config/general_config");
const rp = require("request-promise");
const { check, oneOf, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
var config = require("../config/general_config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = "05231b50-fd3d-11e9-bac2-47f7251a736c";
const middleware = require("../middleware/token-auth");
const moment = require("moment");

router.get("/cartDetails", (req, res) => {
  try {
    let query = `select * from AgreementDetails`;
    let query1 = `select * from SubscriptionPattern`;
    let query2 = `select * from AddOnDetails`;
    let query3 = `select * from InstallationCharges `;
    let resultArray = [];
    request.query(query, function (err, set) {
      if (err) {
        console.log("err", err);
        res.status(400);
        res.json({
          success: false,
          message: err.originalError.info.message,
        });
      } else {
        resultArray.push({ AgreementDetails: set.recordsets[0] });
        request.query(query1, function (err, set) {
          if (err) {
            console.log("err", err);
            res.status(400);
            res.json({
              success: false,
              message: err.originalError.info.message,
            });
          } else {
            resultArray.push({ SubscriptionDetails: set.recordsets[0] });
            request.query(query2, function (err, set) {
              if (err) {
                console.log("err", err);
                res.status(400);
                res.json({
                  success: false,
                  message: err.originalError.info.message,
                });
              } else {
                resultArray.push({ AddOnDetails: set.recordsets[0] });

                request.query(query3, function (err, set) {
                  if (err) {
                    console.log("err", err);
                    res.status(400);
                    res.json({
                      success: false,
                      message: err.originalError.info.message,
                    });
                  } else {
                    resultArray.push({
                      InstallationCharges: set.recordsets[0],
                    });
                    let charges = {
                      installationCharges: "24",
                      maintenanceCharges: "20",
                      gst: "7",
                      delivery: "1200",
                      downPayment: "10000",
                      totalsaving: "5000",
                    };
                    resultArray.push({ Charges: charges });
                    res.status(200);
                    res.json({
                      success: true,
                      message: "Details Required For Cart",
                      result: resultArray,
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});
router.post("/setproductId", middleware.authenticate, (req, res) => {
  let query = `INSERT INTO Cart
  (product_Id,created_On) VALUES ('${JSON.stringify(
    req.body.product
  )}','${new Date().toISOString()}') SELECT SCOPE_IDENTITY() as id`;

  request.query(query, function (err, set) {
    if (err) {
      console.log("err", err);
      res.status(400);
      res.json({
        success: false,
        message: err.originalError.info.message,
      });
    } else {
      res.status(200);
      res.json({
        success: true,
        message: "SuccessFully Added",
        CartId: set.recordset[0].id,
      });
    }
  });
});

router.put(
  "/setProductDetails/:ID",
  [
    check("add_On").exists(),

    check("installion_Charges").exists(),
    check("maintenance_Charges").exists(),
    check("subcription_Type").exists(),

    check("base_MonthlyRent").exists(),
    check("gst").exists(),
    check("total_MonthlyRent").exists(),
    check("down_Payment").exists(),
    check("delivery").exists(),
    check("total").exists(),
  ],
  middleware.authenticate,
  (req, res, err) => {
    try {
      validationResult(req).throw();
      let query = `UPDATE Cart Set
  add_On = '${JSON.stringify(
    req.body.add_On
  )}',quantity ='1',installion_Charges ='${req.body.installion_Charges}',
  maintenance_Charges='${req.body.maintenance_Charges}',
  subcription_Type= '${
    req.body.subcription_Type ? req.body.subcription_Type : "OT"
  }',updated_On='${new Date().toISOString()}',
    base_MonthlyRent ='${req.body.base_MonthlyRent}',gst ='${req.body.gst}',
    total_MonthlyRent='${req.body.total_MonthlyRent}',down_Payment='${
        req.body.down_Payment
      }',
    delivery= '${req.body.delivery}',total='${req.body.total}',user_Id='${
        req.decoded.id
      }'
    Where id=${req.params.ID}`;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          res.status(200);
          res.json({
            success: true,
            message: "SuccessFully Added",
          });
        }
      });
    } catch (e) {
      res.status(400);
      res.json({
        success: false,
        message: e,
      });
    }
  }
);

router.post(
  "/confirmOrder/:ID",
  [check("paymentID").exists()],
  middleware.authenticate,
  (req, res, err) => {
    try {
      validationResult(req).throw();
      let query = `UPDATE Cart Set paymentID = '${req.body.paymentID}' Where id=${req.params.ID}`;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          let cartQuery = `Select * from Cart 
        inner join Users
        on Cart.user_id = Users.Id
        and Cart.id = ${req.params.ID}`;

          request.query(cartQuery, function (err, CartDetails) {
            let cart = CartDetails.recordset[0];
            console.log("cart", cart);

            let products = JSON.parse(cart.product_Id);

            let query = `
          INSERT INTO [dbo].[OrderList]
                     ([OrderNo]
                     ,[OrderType]
                     ,[OrderDate]
                     ,[LastModifiedDate]
                     ,[AssignedOnDate]
                     ,[AssignedTo]
                     ,[OrderStatus]
                     ,[OrderTotal]
                     ,[Customer]
                     ,[UserId]
                     ,[ProductId])
               VALUES
                     (
                       '${"OD" + getRandom(12)}'
                     ,'${cart.subcription_Type == "OT" ? "O" : "S"}'
                     ,'${new Date().toISOString()}'
                     ,null
                     ,null
                     ,null
                     ,'PE'
                     ,'${cart.total}'
                     ,'${cart.FirstName} ${cart.LastName}'
                     ,'${cart.user_Id}'
                     ,'${
                       products.condenserIDs ? products.condenserIDs[0] : "101"
                     }'
                     )`;

            console.log("query", query);

            request.query(query, function (err, responseOrder) {
              if (!err) {
                request.query(
                  `update Customer_New set CustomerType = '${
                    cart.subcription_Type == "OT" ? "OT" : "AS"
                  }' where userID = '${cart.user_Id}'`,
                  function (err, responseOrd) {
                    if (!err) {
                      res.status(200);
                      res.json({
                        success: true,
                        message: "order has been placed successfully",
                        result: cart,
                      });
                    } else {
                      res.status(500);
                      res.json({
                        success: true,
                        message: err,
                      });
                    }
                  }
                );
              } else {
                res.status(200);
                res.json({
                  success: false,
                  message: "cannot place order",
                  err: err,
                  result: cart,
                });
              }
            });
          });
        }
      });
    } catch (e) {
      res.status(400);
      res.json({
        success: false,
        message: e,
      });
    }
  }
);

router.get(
  "/getProductDetails/:ID",
  middleware.authenticate,
  (req, res, err) => {
    try {
      validationResult(req).throw();
      let query = `Select * From Cart where Id =${req.params.ID} `;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          let result = set.recordsets[0][0];
          result.product_Id = JSON.parse(result.product_Id);
          res.status(200);
          res.json({
            success: true,
            message: "Cart Details",
            result: set.recordsets[0],
          });
        }
      });
    } catch (e) {
      res.status(400);
      res.json({
        success: false,
        message: e,
      });
    }
  }
);

router.post(
  "/deliveryAddress",
  [
    check("name").exists(),
    check("contactNumber").exists(),
    check("email").exists(),
    check("address").exists(),
  ],
  middleware.authenticate,
  function (req, res) {
    try {
      validationResult(req).throw();

      let query = `Select * From DeliveryAddress Where userID = '${req.decoded.id}'`;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          if (set.recordsets[0].length) {
            let query = `update DeliveryAddress Set name = '${
              req.body.name
            }', contactNumber = '${req.body.contactNumber}', email = '${
              req.body.email
            }',
              address = '${
                req.body.address
              }', updatedOn = '${new Date().toISOString()}' Where userId = '${
              req.decoded.id
            }' `;

            console.log("query", query);
            request.query(query, function (err, set) {
              if (err) {
                console.log("err", err);
                res.status(400);
                res.json({
                  success: false,
                  message: err.originalError.info.message,
                });
              } else {
                res.status(200);
                res.json({
                  success: true,
                  message: "Delivery address added successfully",
                });
              }
            });
          } else {
            let query = `Insert into DeliveryAddress values( '${
              req.body.name
            }', '${req.body.contactNumber}', '${req.body.email}',
              '${req.body.address}', '${
              req.decoded.id
            }', '${new Date().toISOString()}', '${new Date().toISOString()}', '1' )`;

            console.log("insertquery");
            request.query(query, function (err, set) {
              if (err) {
                console.log("err", err);
                res.status(400);
                res.json({
                  success: false,
                  message: err.originalError.info.message,
                });
              } else {
                res.status(200);
                res.json({
                  success: true,
                  message: "Delivery address added successfully",
                });
              }
            });
          }
        }
      });
    } catch (err) {
      res.status(400);
      res.json({
        success: false,
        message: err.errors,
      });
    }
  }
);

router.get(
  "/deliveryAddress/:id",
  middleware.authenticate,
  function (req, res) {
    let query = `Select * from DeliveryAddress Where userID = ${req.params.id}`;

    request.query(query, function (err, set) {
      if (err) {
        console.log("err", err);
        res.status(400);
        res.json({
          success: false,
          message: err.originalError.info.message,
        });
      } else {
        res.status(200);
        res.json({
          success: true,
          message: "Delivery address for userID :" + req.params.id,
          result: set.recordsets[0],
        });
      }
    });
  }
);

function getRandom(length) {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
}

module.exports = router;
