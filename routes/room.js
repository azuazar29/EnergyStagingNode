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

router.get("/defaultValues", middleware.authenticate, function (req, res) {
  let query = `Select * from InitialDefaultValues`;

  request.query(query, function (err, set) {
    if (err) {
      console.log("err", err);
      res.status(400);
      res.json({
        success: false,
        message: err.originalError.info.message,
      });
    } else {
      let result = set.recordset[0];
      result.currentRatingDeafult = JSON.parse(result.currentRatingDeafult);
      result.room = JSON.parse(result.room);
      res.status(200);
      res.json({
        success: true,
        message: "Initial default values to load",
        result: result,
      });
    }
  });
});

router.get("/roomCategory", middleware.authenticate, function (req, res) {
  let query = `Select * from RoomCategory`;

  request.query(query, function (err, set) {
    if (err) {
      console.log("err", err);
      res.status(400);
      res.json({
        success: false,
        message: err.originalError.info.message,
      });
    } else {
      let result = set.recordset;
      res.status(200);
      res.json({
        success: true,
        message: "Initial default values to load",
        result: result,
      });
    }
  });
});

router.get("/defaultOccupancyPattern", function (req, res) {
  let query = `Select * from DefaultOccupancyPattern`;

  request.query(query, function (err, set) {
    if (err) {
      console.log("err", err);
      res.status(400);
      res.json({
        success: false,
        message: err.originalError.info.message,
      });
    } else {
      let result = set.recordset[0];
      result.mondayList = JSON.parse(result.mondayList);
      result.tuesdayList = JSON.parse(result.tuesdayList);
      result.wednesdayList = JSON.parse(result.wednesdayList);
      result.thursdayList = JSON.parse(result.thursdayList);
      result.fridayList = JSON.parse(result.fridayList);
      result.saturdayList = JSON.parse(result.saturdayList);
      result.sundayList = JSON.parse(result.sundayList);
      res.status(200);
      res.json({
        success: true,
        message: "Initial default values to load",
        result: result,
      });
    }
  });
});

router.post(
  "/configuration",
  [
    check("idealRoomTemparature").exists(),
    check("ceilingHeightMeter").exists(),
    check("currentRating").exists(),
    check("roomSize").exists(),
    check("bedrooms").exists(),
    check("room").exists(),
    check("ceilingHeightFeet").exists(),
  ],
  middleware.authenticate,
  function (req, res) {
    try {
      validationResult(req).throw();

      let guid = uuidv4();
      let query = `Insert into UserConfiguration values( '', '${
        req.body.bedrooms
      }', '${req.body.roomSize}',
   '${JSON.stringify(
     req.body.room
   )}', '${new Date().toISOString()}', '${new Date().toISOString()}',
    '1', '${req.decoded.id}', '0') SELECT SCOPE_IDENTITY() as id`;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          let rooms = req.body.room;
          let promise = [];
          rooms.forEach((element) => {
            promise.push(
              addRoom(element, req.decoded.id, set.recordset[0].id, req.body)
                .then((resultAddRoom) => {
                  console.log("Add room res", resultAddRoom);
                })
                .catch((err) => {
                  console.log("err", err);
                })
            );
          });

          Promise.all(promise).then((responsePromise) => {
            res.status(200);
            res.json({
              success: true,
              message: "Configuration Added Successfully",
              ConfigurationID: set.recordset[0].id,
            });
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

router.get("/configuration/:id", middleware.authenticate, function (req, res) {
  let resultArray = [];
  let query = `Select * From UserConfiguration Where Id = ${req.params.id}`;
  request.query(query, function (err, set) {
    if (err) {
      console.log("err", err);
      res.status(400);
      res.json({
        success: false,
        message: err.originalError.info.message,
      });
    } else {
      console.log(
        "set.recordsets[0][0].roomNames",
        set.recordsets[0][0].roomNames
      );
      set.recordsets[0][0].roomNames = JSON.parse(
        set.recordsets[0][0].roomNames
      );
      resultArray.push({ Configuration: set.recordsets[0] });
      let query = `Select * From UserRoom Where ConfigID = '${req.params.id}'`;
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
          resultArray.push({ Rooms: set.recordsets[0] });
          let query = `Select * From UserOccupancyPattern Where ConfigID = '${req.params.id}'`;
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
              let resultset = set.recordsets[0];
              console.log("resultset", resultset);

              resultset.forEach((element) => {
                element.mondayList = JSON.parse(element.mondayList);
                element.tuesdayList = JSON.parse(element.tuesdayList);
                element.wednesdayList = JSON.parse(element.wednesdayList);
                element.thursdayList = JSON.parse(element.thursdayList);
                element.fridayList = JSON.parse(element.fridayList);
                element.saturdayList = JSON.parse(element.saturdayList);
                element.sundayList = JSON.parse(element.sundayList);
              });
              resultArray.push({ OccupancyPattern: resultset });
              res.status(200);
              res.json({
                success: true,
                message:
                  "All the rooms, occupancy details and configuration details",
                result: resultArray,
              });
            }
          });
        }
      });
    }
  });
});

router.put(
  "/configuration/:id",
  [check("rooms").exists(), check("configurationName").exists()],
  middleware.authenticate,
  function (req, res) {
    try {
      validationResult(req).throw();

      let guid = uuidv4();
      let query = `update UserConfiguration Set configurationName = '${
        req.body.configurationName
      }', updatedOn = '${new Date().toISOString()}' Where Id = ${
        req.params.id
      }`;

      request.query(query, function (err, set) {
        if (err) {
          console.log("err", err);
          res.status(400);
          res.json({
            success: false,
            message: err.originalError.info.message,
          });
        } else {
          let rooms = req.body.rooms;
          let promise = [];
          rooms.forEach((element) => {
            promise.push(
              updateRoom(element, req.decoded.id, req.params.id)
                .then((resultAddRoom) => {
                  console.log("Add room res", resultAddRoom);
                })
                .catch((err) => {
                  console.log("err", err);
                })
            );
          });

          Promise.all(promise)
            .then((responsePromise) => {
              res.status(200);
              res.json({
                success: true,
                message: "Configuration Added Successfully",
              });
            })
            .catch((err) => {
              res.json({
                success: false,
                message: err.originalError.info.message,
              });
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

router.put(
  "/occupancyPattern/:OPid",
  [
    check("mondayOccupancy").exists(),
    check("tuesdayOccupancy").exists(),
    check("wednesdayOccupancy").exists(),
    check("thursdayOccupancy").exists(),
    check("fridayOccupancy").exists(),
    check("saturdayOccupancy").exists(),
    check("sundayOccupancy").exists(),
    check("usageAdherence").exists(),
    check("mondayList").exists(),
    check("tuesdayList").exists(),
    check("wednesdayList").exists(),
    check("thursdayList").exists(),
    check("fridayList").exists(),
    check("saturdayList").exists(),
    check("sundayList").exists(),
    check("weekendsHour").exists(),
    check("weekdaysHour").exists(),
    check("occupancyPatternHoursMinute").exists(),
  ],
  middleware.authenticate,
  function (req, res) {
    let query = `update UserOccupancyPattern Set
  mondayOccupancy  = '${req.body.mondayOccupancy}',
  tuesdayOccupancy  = '${req.body.tuesdayOccupancy}',
  wednesdayOccupancy  = '${req.body.wednesdayOccupancy}',
  thursdayOccupancy  = '${req.body.thursdayOccupancy}',
  fridayOccupancy  = '${req.body.fridayOccupancy}',
  saturdayOccupancy  = '${req.body.saturdayOccupancy}',
  sundayOccupancy  = '${req.body.sundayOccupancy}',
  usageAdherence  = '${req.body.usageAdherence}',
  mondayList  =   '${JSON.stringify(req.body.mondayList)}',
  tuesdayList  =   '${JSON.stringify(req.body.tuesdayList)}',
  wednesdayList  =   '${JSON.stringify(req.body.wednesdayList)}',
  thursdayList  =   '${JSON.stringify(req.body.thursdayList)}',
  fridayList  =   '${JSON.stringify(req.body.fridayList)}',
  saturdayList  =   '${JSON.stringify(req.body.saturdayList)}',
  sundayList  =   '${JSON.stringify(req.body.sundayList)}',
  weekendsHour  = '${req.body.weekendsHour}',
  weekdaysHour  = '${req.body.weekdaysHour}',
  occupancyPatternHoursMinute  = '${
    req.body.occupancyPatternHoursMinute
  }' Where Id = ${req.params.OPid}`;

    console.log("quey", query);
    request.query(query, function (err, set) {
      if (err) {
        console.log("err", err);
        res.status(400);
        res.json({
          success: false,
          message: err.originalError.info.message,
        });
      } else {
        console.log("sets", set);
        if (set.rowsAffected[0] > 0) {
          res.status(200);
          res.json({
            success: true,
            message: "Occupancy Pattern Updated Successfully",
          });
        } else {
          res.status(404);

          res.json({
            success: false,
            message: "No such Occupancy Pattern Found",
          });
        }
      }
    });
  }
);
function addRoom(roomName, id, guid, roomData) {
  return new Promise((resolve, reject) => {
    let query = `insert into UserRoom Values( '${roomName}', 
    '${roomData.idealRoomTemparature}', '${roomData.ceilingHeightMeter}', 
    '${roomData.currentRating}', '${Number(
      roomData.roomSize / roomData.room.length
    ).toFixed(2)}', 
    '${id}', '${new Date().toISOString()}', '${new Date().toISOString()}', 
    '${guid}', '${roomData.ceilingHeightFeet}') SELECT SCOPE_IDENTITY() as id`;
    console.log("query", query);
    request.query(query, function (err, set) {
      if (err) {
        console.log("err in add room", err);
        resolve(err);
      } else {
        let roomID = set.recordset[0].id;
        let query = `Select * From DefaultOccupancyPattern`;
        request.query(query, function (err, set) {
          if (err) {
            console.log("err", err);
            resolve(err);
          } else {
            let occupancyPattern = set.recordset[0];
            let query = `Insert into UserOccupancyPattern values(            
             '${occupancyPattern.mondayOccupancy}',
             '${occupancyPattern.tuesdayOccupancy}',
             '${occupancyPattern.wednesdayOccupancy}',
             '${occupancyPattern.thursdayOccupancy}',
             '${occupancyPattern.fridayOccupancy}',
             '${occupancyPattern.saturdayOccupancy}',
             '${occupancyPattern.sundayOccupancy}',
             '${occupancyPattern.usageAdherence}',
             '${occupancyPattern.mondayList}',
             '${occupancyPattern.tuesdayList}',
             '${occupancyPattern.wednesdayList}',
             '${occupancyPattern.thursdayList}',
             '${occupancyPattern.fridayList}',
             '${occupancyPattern.saturdayList}',
             '${occupancyPattern.sundayList}', '${roomID}', '${guid}', '${id}', '${occupancyPattern.weekendsHour}', '${occupancyPattern.weekdaysHour}',
             '${occupancyPattern.occupancyPatternHoursMinute}'
             )`;

            request.query(query, function (err, set) {
              if (err) {
                console.log("err", err);
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

function updateRoom(roomData, userId, configID) {
  return new Promise((resolve, reject) => {
    if (!roomData.Id || roomData.Id == null) {
      let query = `insert into UserRoom Values( '${roomData.roomName}', 
      '${roomData.idealRoomTemparature}', '${roomData.ceilingHeightMeter}', 
      '${roomData.currentRating}', '${Number(roomData.roomSize).toFixed(2)}', 
      '${userId}', '${new Date().toISOString()}', '${new Date().toISOString()}', 
      '${configID}', '${
        roomData.ceilingHeightFeet
      }') SELECT SCOPE_IDENTITY() as id`;
      console.log("query", query);
      request.query(query, function (err, set) {
        if (err) {
          console.log("err in add room", err);
          resolve(err);
        } else {
          let roomID = set.recordset[0].id;
          let query = `Select * From DefaultOccupancyPattern`;
          request.query(query, function (err, set) {
            if (err) {
              console.log("err", err);
              resolve(err);
            } else {
              let occupancyPattern = set.recordset[0];
              let query = `Insert into UserOccupancyPattern values(            
               '${occupancyPattern.mondayOccupancy}',
               '${occupancyPattern.tuesdayOccupancy}',
               '${occupancyPattern.wednesdayOccupancy}',
               '${occupancyPattern.thursdayOccupancy}',
               '${occupancyPattern.fridayOccupancy}',
               '${occupancyPattern.saturdayOccupancy}',
               '${occupancyPattern.sundayOccupancy}',
               '${occupancyPattern.usageAdherence}',
               '${occupancyPattern.mondayList}',
               '${occupancyPattern.tuesdayList}',
               '${occupancyPattern.wednesdayList}',
               '${occupancyPattern.thursdayList}',
               '${occupancyPattern.fridayList}',
               '${occupancyPattern.saturdayList}',
               '${occupancyPattern.sundayList}', '${roomID}', '${guid}', '${id}', '${occupancyPattern.weekendsHour}', '${occupancyPattern.weekdaysHour}',
               '${occupancyPattern.occupancyPatternHoursMinute}'
               )`;

              request.query(query, function (err, set) {
                if (err) {
                  console.log("err", err);
                  resolve(err);
                } else {
                  resolve("success");
                }
              });
            }
          });
        }
      });
    } else {
      let query = `Update UserRoom Set roomName = '${roomData.roomName}', 
      idealRoomTemparature = '${
        roomData.idealRoomTemparature
      }', ceilingHeightMeter = '${roomData.ceilingHeightMeter}', 
      ceilingHeightFeet = '${roomData.ceilingHeightFeet}', roomSize = '${
        roomData.roomSize
      }', 
      updatedOn = '${new Date().toISOString()}' where Id = ${roomData.Id}`;
      console.log("query", query);
      request.query(query, function (err, set) {
        if (err) {
          console.log("err in add room", err);
          resolve(err);
        } else {
          resolve("Success");
        }
      });
    }
  });
}

module.exports = router;
