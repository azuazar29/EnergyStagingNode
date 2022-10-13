var express = require("express");
var router = express.Router();
var sql = require("../database");
var request = new sql.Request();
var filepath = require("../config/filePath");
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
var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
router.post("/setproductId/:type", middleware.authenticate, async (req, res) => {
  let productID = [];

  req.body.product.display_installed_rooms.forEach((element) => {
    let productDetails = {
      ID: element.product[0].id,
      productName: element.product[0].FCUName,
      price: element.product[0].Price,
      image: element.product[0].ImagePath,
      condensorID: element.product[0].CondenserId,
    };
    productID.push(productDetails);
  });

  let items = groupBy(productID, "productName");

  let finalProducts = [];

  Object.keys(items).forEach((element, index) => {
    finalProducts.push({
      productName: element,
      productImage: items[element][0].image,
      quantity: items[element].length.toString(),
      price: (
        Number(items[element][0].price) * items[element].length
      ).toString(),
    });
  });
  let price = [];
  req.body.product.display_product_manufacturer1.forEach((element) => {
    price.push(Number(element.price) * Number(element.count).toString());
  });

  req.body.product.display_product_manufacturer1.forEach((element, index) => {
    req.body.product.display_product_manufacturer1[index].price = price[index];
  });
  let FinalOutput = {
    FCUDetails: finalProducts,
    CondensorDetails: req.body.product.display_product_manufacturer1,
  };

  let query0 = `select * from AgreementDetails`;
  let query1 = `select * from SubscriptionPattern`;
  let query2 = `select * from AddOnDetails`;

  let AddOnDetails = await new Promise((resolve, reject) => {
    request.query(query2, function (err, recordset) {
      if (recordset.recordset.length) {
        resolve(recordset.recordsets[0]);
      }
    });
  });

  let resultArray = [];
  let accessories = [
    {
      name: "Energy meter",
      quantity: "2",
      price: "24",
      image: filepath.HostUrl + "addons/ic_energymeter.png",
    },
    {
      name: "Piping",
      quantity: "20",
      price: "24",
      image: filepath.HostUrl + "addons/ic_pipe.png",
    },
  ];

  let propertySize = 0

  req.body.product.display_installed_rooms.forEach(element => {

    propertySize = Number(propertySize) + Number(element.roomSize)

  })
  console.log("{req.body.product.product_subscription_cost", req.body.product.product_subscription_cost)

  let query = `INSERT INTO Cart
  (product_Id,created_On,isSubscription,[add_On],[gst],[installion_Charges],[accessories],[delivery],[savings],[user_Id],totalRooms,PropertySize,[base_MonthlyRent]) VALUES ('${JSON.stringify(
    FinalOutput
  )}','${new Date().toISOString()}','${req.params.type}','${JSON.stringify(
    AddOnDetails
  )}','7','54','${JSON.stringify(
    accessories
  )}','20','500','${req.decoded.id}','${req.body.product.display_installed_rooms.length}','${propertySize}','${req.body.product.product_subscription_cost}') SELECT SCOPE_IDENTITY() as id`;

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

    check("maintenance_Charges").exists(),

    check("subcription_Type").exists(),
    check("base_MonthlyRent").exists(),

    check("total_MonthlyRent").exists(),
    check("down_Payment").exists(),
    check("total").exists(),
  ],

  (req, res) => {
    try {
      validationResult(req).throw();
      let query = `UPDATE Cart Set
  add_On = '${JSON.stringify(req.body.add_On)}',quantity ='1',
  maintenance_Charges='${req.body.maintenance_Charges}',
  subcription_Type= '${req.body.subcription_Type ? req.body.subcription_Type : "OT"
        }',updated_On='${new Date().toISOString()}',
    base_MonthlyRent ='${req.body.base_MonthlyRent}',
    total_MonthlyRent='${req.body.total_MonthlyRent}',down_Payment='${req.body.down_Payment
        }',
   total='${req.body.total}'
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

            // let products = JSON.parse(cart.product_Id);

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
                     ,[ProductId],[orderFlow])
               VALUES
                     (
                       '${"OD" + getRandom(12)}'
                     ,'${cart.isSubscription == "0" ? "O" : "S"}'
                     ,'${new Date().toISOString()}'
                     ,null
                     ,null
                     ,null
                     ,'PE'
                     ,'${cart.total}'
                     ,'${cart.FirstName} ${cart.LastName}'
                     ,'${cart.user_Id}'
                     ,'101', 'OR')
              
                     SELECT SCOPE_IDENTITY() as id`;

            console.log("query", query);

            request.query(query, function (err, responseOrder) {
              if (!err) {

                request.query(`update Cart set orderID = ${responseOrder.recordset[0].id} where id = ${req.params.ID}`)

                request.query(
                  `update Customer_New set CustomerType = '${cart.subcription_Type == "OT" ? "OT" : "AS"
                  }' where userID = '${cart.user_Id}'`,
                  async function (err, responseOrd) {

                    let querySUB = `INSERT INTO [dbo].[SubscriptionManagement]
                    (
                    [visitStatus],[userID]
                    ,[addedOn]
                    ,[updatedOn],[orderID])
                VALUES
                    (
                    1,${cart.user_Id},'${new Date().toISOString()}','${new Date().toISOString()}',${responseOrder.recordset[0].id})`

                    request.query(querySUB)


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

  (req, res, err) => {
    try {
      validationResult(req).throw();
      let query = `Select * From Cart where Id =${req.params.ID} `;

      let query0 = `select * from AgreementDetails`;
      let query1 = `select * from SubscriptionPattern`;

      request.query(query, async function (err, set) {
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

          if (result.add_On != null) {
            result.add_On = JSON.parse(result.add_On);
          }
          if (result.accessories != null) {
            result.accessories = JSON.parse(result.accessories);
          }

          let AgreementDetails = await new Promise((resolve, reject) => {
            request.query(query0, function (err, recordset) {
              if (recordset.recordset.length) {
                resolve(recordset.recordsets[0]);
              }
            });
          });
          let SubscriptionDetails = await new Promise((resolve, reject) => {
            request.query(query1, function (err, recordset) {
              if (recordset.recordset.length) {
                resolve(recordset.recordsets[0]);
              }
            });
          });
          result.FCUDetails = result.product_Id.FCUDetails;
          result.CondensorDetails = result.product_Id.CondensorDetails;

          let totalCost = 0

          result.FCUDetails.forEach(element => {

            totalCost = totalCost + Number(element.price)

          })

          result.CondensorDetails.forEach(element => {

            totalCost = totalCost + Number(element.price)

          })

          result.base_MonthlyRent = Number((Number(result.base_MonthlyRent) * 7) / 100).toFixed(2) - Number(result.base_MonthlyRent).toFixed(2)

          result.basic_cost = Number(result.base_MonthlyRent).toFixed(2)
          result.vale_cost = Number(Number(result.base_MonthlyRent) / 2).toFixed(2)
          result.prime_cost = Number(Number(result.base_MonthlyRent) / 3).toFixed(2)


          result.AgreementDetails = AgreementDetails;
          result.SubscriptionDetails = SubscriptionDetails;

          delete result.product_Id;
          res.status(200);
          res.json({
            success: true,
            message: "Cart Details",
            result: result,
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
  middleware.authenticate,
  [
    check("name").exists(),
    check("contactNumber").exists(),
    check("email").exists(),
    check("address1").exists(),
    check("address2").exists(),
    check("additionalInfo").exists(),
  ],

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
            let query = `update DeliveryAddress Set name = '${req.body.name
              }', contactNumber = '${req.body.contactNumber}', email = '${req.body.email
              }',
              address1 = '${req.body.address1}', address2 = '${req.body.address2
              }',additionalInfo = '${req.body.additionalInfo
              }', updatedOn = '${new Date().toISOString()}', isPrimary = '${req.body.isBilling ? req.body.isBilling : '0'}', bAddress1 =  '${req.body.bAddress1 ? req.body.bAddress1 : ''}'
            , bAddress2 =  '${req.body.bAddress2 ? req.body.bAddress2 : ''}', bAddress3 =  '${req.body.bAddress3 ? req.body.bAddress3 : ''}'  Where userId = '${req.decoded.id}' `;

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
            let query = `Insert into DeliveryAddress values( '${req.body.name
              }', '${req.body.contactNumber}', '${req.body.email}',
              '${req.body.address1
              }', '${req.decoded.id}', '${new Date().toISOString()}', '${new Date().toISOString()}', '${req.body.isBilling ? req.body.isBilling : '0'}','${req.body.additionalInfo
              }','${req.body.address2}','${req.body.baddress1 ? req.body.bAddress1 : ''}','${req.body.bAddress2 ? req.body.bAddress2 : ''}'
            ,'${req.body.bAddress3 ? req.body.bAddress3 : ''}' )`;

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
  "/deliveryAddress/:id/:postalCode",

  async function (req, res) {
    let query = `Select * from DeliveryAddress Where userID = ${req.params.id}`;

    let postalAddress = await new Promise((resolve, reject) => {

      request.query(`Select [Postal code],[Blk No#],[Street name] From Buildings_floor_Map$ where [Postal code] = '${req.params.postalCode}'`, function (err, recordset) {

        if (recordset.recordset.length) {

          recordset.recordset[0].BlkNo = recordset.recordset[0]['Blk No#']
          recordset.recordset[0].PostalCode = recordset.recordset[0]['Postal code']
          recordset.recordset[0].StreetName = recordset.recordset[0]['Street name']
          delete recordset.recordset[0]['Postal code']
          delete recordset.recordset[0]['Street name']
          delete recordset.recordset[0]['Blk No#']
          resolve({
            success: true,
            resulr: recordset.recordset[0]
          })
        } else {
          resolve({
            success: false
          })
        }

      })

    })

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
          result: { ...set.recordsets[0][0], ...postalAddress.resulr },
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
