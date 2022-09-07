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
const { CoolingConfiguration } = require("./users");
const { response } = require("express");
const { route } = require("./floormap");
var app = express();

// function randomNumber(min, max) {
//   return Number(Math.random() * (max - min) + min).toFixed(2);
// }

// Cooling config algorithm
// middleware.authenticate,
router.post("/configuration/:id", function (req, res, next) {
  try {
    validationResult(req).throw();

    if (!req.body.perPage) {
      req.body.perPage = 3;
    }

    let guid = uuidv4();
    let query = `Select * From UserRoom where ConfigID = '${req.params.id}'`;

    request.query(query, function (err, set) {
      if (err) {
        //////console("err", err)
        res.status(400);
        res.json({
          success: false,
          message: err.originalError.info.message,
        });
      } else {
        req.body.rooms = set.recordsets[0];

        //console.log(req.body.rooms.length)

        if (set.recordsets[0].length) {
          CoolingConfiguration(req, res, next).then((response) => {
            res.status(200);
            let energy = [];
            let price = [];
            //console.log("response",response)

            response.EnergyWise.forEach((element, index) => {
              if (index + 1 <= Number(req.body.perPage)) {
                energy.push(element);
              }
            });

            response.PriceWise.forEach((element, index) => {
              if (index + 1 <= Number(req.body.perPage)) {
                price.push(element);
              }
            });

            res.json({
              success: true,
              message: "Cooling Configuration Details",
              result: { EnergyWise: energy, PriceWise: price },
              totalProducts: response.EnergyWise.length.toString(),
            });
          });
        } else {
          res.status(404);
          res.json({
            success: false,
            message: "Cooling Configuration not found",
          });
        }
      }
    });
  } catch (err) {
    console.log("err", err);
    res.status(400);
    res.json({
      success: false,
      message: err,
    });
  }
});

router.post("/test", function (req, res) {
  console.log("it came here");
});

router.post("/auto-configuration", middleware.authenticate, async function (req, res, next) {
  try {
    validationResult(req).throw();

    let addConfigResult = await addConfiguration(req);

    res.json({
      success: true,
      message: "Configuration Details",
      ConfigurationID: addConfigResult.ConfigurationID,
    });
  } catch (err) {
    res.status(400);
    res.json({
      success: false,
      message: err,
    });
  }
});

router.post("/auto-configuration/:id", function (req, res, next) {
  if (!req.body.perPage) {
    req.body.perPage = 3;
  }


  // Add Configuration

  let query = `Select * From UserRoom where ConfigID = '${req.params.id}'`;

  request.query(query, function (err, set) {
    if (err) {
      //////console("err", err)
      res.status(400);
      res.json({
        success: false,
        message: err.originalError.info.message,
      });
    } else {
      req.body.rooms = set.recordsets[0];

      // req.params.id = addConfigResult.ConfigurationID;
      // console.log(req.body.rooms.length);

      if (set.recordsets[0].length) {
        CoolingConfiguration(req, res, next).then((response) => {
          res.status(200);
          let energy = [];
          let price = [];
          //console.log("response",response)



          let finalResult = response.PriceWise;

          if (req.body.sortType && req.body.sortType == '0') {
            if (req.body.sortValue.toString() == "1") {

              finalResult = finalResult.sort((a, b) => (Number(a.display_price) > Number(b.display_price)) ? 1 : ((Number(b.display_price) > Number(a.display_price)) ? -1 : 0))
            } else {
              // finalResult = response.PriceWise.reverse();
              finalResult = finalResult.sort((a, b) => (Number(a.display_price) < Number(b.display_price)) ? 1 : ((Number(b.display_price) < Number(a.display_price)) ? -1 : 0))

            }
          } else if (req.body.sortType && req.body.sortType == '1') {
            if (req.body.sortValue.toString() == "1") {

              finalResult = finalResult.sort((a, b) => (a.display_monthly_operating_power > b.display_monthly_operating_power) ? 1 : ((b.display_monthly_operating_power > a.display_monthly_operating_power) ? -1 : 0))
            } else {
              // finalResult = response.PriceWise.reverse();
              finalResult = finalResult.sort((a, b) => (a.display_monthly_operating_power < b.display_monthly_operating_power) ? 1 : ((b.display_monthly_operating_power < a.display_monthly_operating_power) ? -1 : 0))

            }

          }



          finalResult.forEach((element, index) => {
            if (index + 1 <= Number(req.body.perPage)) {
              price.push(element);
            }
          });

          let avgTemp = 0;
          let totTemp = 0;
          let avgArea = 0;
          let totArea = 0;

          req.body.rooms.forEach((element) => {
            totTemp = totTemp + Number(element.idealRoomTemparature);
            totArea = totTemp + Number(element.roomSize);
          });

          res.json({
            success: true,
            message: "Cooling Configuration Details",
            result: price,
            totalProducts: response.EnergyWise.length.toString(),
            NoOfRooms: req.body.rooms.length.toString(),
            AverageTemperature: (totTemp / req.body.rooms.length).toString(),
            AverageArea: (totArea / req.body.rooms.length).toString(),
          });
        });
      } else {
        res.status(404);
        res.json({
          success: false,
          message: "Cooling Configuration not found",
        });
      }
    }
  });
});

router.post(
  "/configuration/:id/:productId",
  middleware.authenticate,
  function (req, res, next) {
    try {
      validationResult(req).throw();

      if (!req.body.perPage) {
        req.body.perPage = 3;
      }

      let guid = uuidv4();
      let query = `Select * From UserRoom where ConfigID = '${req.params.id}'`;

      request.query(query, function (err, set) {
        if (err) {
          //////console("err", err)
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          req.body.rooms = set.recordsets[0];

          console.log("roomd,", req.body.rooms);

          if (set.recordsets[0].length) {
            CoolingConfiguration(req, res, next).then((response) => {
              res.status(200);

              res.json({
                success: true,
                message: "Cooling Configuration Details",
                result: response,
              });
            });
          } else {
            res.status(404);
            res.json({
              success: false,
              message: "Cooling Configuration not found",
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

router.get("/getFCUDetails/:id", function (req, res, next) {
  request.query(
    `select * From ProductDescription where manufacturer = '${req.params.id
      .toString()
      .trim()}'`,
    function (err, recordset) {
      res.status(200);
      //console.log('err',err)
      res.json({
        success: true,
        message: "Product Details",
        result: recordset.recordset[0],
      });
    }
  );
});
router.put(
  "/SaveandExit/:id",
  [check("configurationName").exists()],
  function (req, res, next) {
    try {
      validationResult(req).throw();
      let query = `UPDATE UserConfiguration Set configurationName = '${req.body.configurationName}', saveAndExit = '1' Where id=${req.params.id}`;

      request.query(query, function (err, set) {
        if (err) {
          //////console("err", err)
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          res.status(200);
          res.json({
            success: true,
            message: "Configuration Details Successfully Added",
          });
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

router.post("/getsystem", function (req, res, next) {
  CoolingConfiguration(req, res, next).then((response) => {
    // //////console("res",res)

    res.send(response);
  });
});

function updateRoom(roomData, userId, configID) {
  return new Promise((resolve, reject) => {
    if (!roomData.Id || roomData.Id == null) {
      addRoom(roomData.roomName, userId, configID, roomData)
        .then((res) => {
          resolve("Success");
        })
        .catch((err) => {
          resolve(err);
        });
    } else {
      let query = `Update UserRoom Set roomName = '${roomData.roomName}', 
        idealRoomTemparature = '${roomData.idealRoomTemparature
        }', ceilingHeightMeter = '${roomData.ceilingHeightMeter}', 
        ceilingHeightFeet = '${roomData.ceilingHeightFeet}', roomSize = '${roomData.roomSize
        }', 
        updatedOn = '${new Date().toISOString()}' where Id = ${roomData.Id}`;
      //////console("query", query)
      request.query(query, function (err, set) {
        if (err) {
          //////console("err in add room", err)
          resolve(err);
        } else {
          resolve("Success");
        }
      });
    }
  });
}

function addRoom(roomName, id, guid, roomData) {
  return new Promise((resolve, reject) => {
    let query = `insert into UserRoom Values( '${roomName}', 
    '${roomData.idealRoomTemparature}', '${roomData.ceilingHeightMeter}', 
    '${roomData.currentRating}', '${Number(roomData.roomSize).toFixed(2)}', 
    '${id}', '${new Date().toISOString()}', '${new Date().toISOString()}', 
    '${guid}', '${roomData.ceilingHeightFeet}') SELECT SCOPE_IDENTITY() as id`;
    //////console("query", query)
    request.query(query, function (err, set) {
      if (err) {
        //////console("err in add room", err)
        resolve(err);
      } else {
        let roomID = set.recordset[0].id;
        let query = `Select * From DefaultOccupancyPattern`;
        request.query(query, function (err, set) {
          if (err) {
            //////console("err", err)
            resolve(err);
          } else {
            let occupancyPattern = set.recordset[0];
            let query = `Insert into UserOccupancyPattern values(            
              '${roomData.occupancyPattern.mondayOccupancy}',
              '${roomData.occupancyPattern.tuesdayOccupancy}',
              '${roomData.occupancyPattern.wednesdayOccupancy}',
              '${roomData.occupancyPattern.thursdayOccupancy}',
              '${roomData.occupancyPattern.fridayOccupancy}',
              '${roomData.occupancyPattern.saturdayOccupancy}',
              '${roomData.occupancyPattern.sundayOccupancy}',
              '${roomData.occupancyPattern.usageAdherence}',
              '${JSON.stringify(roomData.occupancyPattern.mondayList)}',
              '${JSON.stringify(roomData.occupancyPattern.tuesdayList)}',
              '${JSON.stringify(roomData.occupancyPattern.wednesdayList)}',
              '${JSON.stringify(roomData.occupancyPattern.thursdayList)}',
              '${JSON.stringify(roomData.occupancyPattern.fridayList)}',
              '${JSON.stringify(roomData.occupancyPattern.saturdayList)}',
              '${JSON.stringify(roomData.occupancyPattern.sundayList)}', '${roomID}', '${guid}', '${id}', '${roomData.occupancyPattern.weekendsHour}', '${roomData.occupancyPattern.weekdaysHour}',
              '${roomData.occupancyPattern.occupancyPatternHoursMinute}'
              )`;

            request.query(query, function (err, set) {
              if (err) {
                //////console("err", err)
                resolve(err);
              } else {
                resolve("success");
              }
            });
          }
        });
      }
    });
  });
}

function addConfiguration(req) {
  return new Promise((resolve, reject) => {
    try {
      let rooms = [];
      req.body.rooms.forEach((element) => {
        rooms.push(element.roomName);
      });
      let tempUserid = req.decoded.id;
      let query = `Insert into UserConfiguration values( '${req.body.configurationName
        }', '${req.body.totalRooms}', '${req.body.totalSize}',
     '${JSON.stringify(
          rooms
        )}', '${new Date().toISOString()}', '${new Date().toISOString()}',
      '1', '${tempUserid}', '0') SELECT SCOPE_IDENTITY() as id`;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          resolve({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          let rooms = req.body.rooms;
          let promise = [];
          rooms.forEach((element) => {
            promise.push(
              addRoom(
                element.roomName,
                tempUserid,
                set.recordset[0].id,
                element
              )
                .then((resultAddRoom) => {
                  console.log("Add room res", resultAddRoom);
                })
                .catch((err) => {
                  console.log("err", err);
                })
            );
          });

          Promise.all(promise).then((responsePromise) => {
            resolve({
              success: true,
              message: "Configuration Added Successfully",
              ConfigurationID: set.recordset[0].id,
            });
          });
        }
      });
    } catch (err) {
      resolve({
        success: false,
        error: err,
      });
    }
  });
}

module.exports = router;
