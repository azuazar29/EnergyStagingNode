var express = require("express");
var router = express.Router();
var sql = require("../database");
var request = new sql.Request();
const { v4: uuidv4 } = require("uuid");
var config = require("../config/general_config");
const rp = require("request-promise");
const { check, oneOf, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = "05231b50-fd3d-11e9-bac2-47f7251a736c";
const middleware = require("../middleware/token-auth");
const moment = require("moment");
const ImagePath = require("../config/server_config");
const multer = require("multer");
const filePath = require("../config/filePath");

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/Yishun_Glen");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage1 });

router.post("/single", upload.single("image"), (req, res) => {
  console.log(req.file);
  res.send("Image Uploaded");
});
router.get("/Buildings_floor_Map/:pCode", function (req, res) {
  let query = `Select * From Buildings_floor_Map$ b
      inner join Floor_Plans_area$ f
      on b.LinkId_Floor_plan_1 = f.LinkId_Floor_plan
      inner join Floor_Plans_area$ f1
      on b.LinkId_Floor_plan_2 = f1.LinkId_Floor_plan
      inner join Floor_Plans_area$ f2
      on b.LinkId_Floor_plan_3 = f2.LinkId_Floor_plan
      inner join Floor_Plans_area$ f3
      on b.LinkId_Floor_plan_4 = f3.LinkId_Floor_plan
      inner join Floor_Plans_area$ f4
      on b.LinkId_Floor_plan_5 = f4.LinkId_Floor_plan
      and b.[Postal code] = '${req.params.pCode}'`;

  request.query(query, function (err, response) {
    let result = response.recordset[0];

    let finalResult = [];

    result["Floor plan"].forEach((element, index) => {
      finalResult.push({
        name: "Floor plan " + (index + 1),
        imagePath: filePath.HostUrl + element,
        linkId: result["LinkId_Floor_plan"][index],
        totalSize: result["Total Floor"][index],
        numberOfRooms: "6",
      });
    });

    let finalOutput = {
      PostalCode: result["Postal code"],
      BlockNo: result["Blk No#"],
      StreetName: result["Street name"],
      type: "Condo",
      FloorPlans: finalResult,
    };

    res.json({
      success: true,
      result: finalOutput,
      message: "Succefully retrieved",
    });
  });
});

router.get("/Buildings_floor_MapBlkNo/:id", function (req, res) {
  let query = `Select * From Buildings_floor_Map$ b
    inner join Floor_Plans_area$ f
    on b.LinkId_Floor_plan_1 = f.LinkId_Floor_plan
    inner join Floor_Plans_area$ f1
    on b.LinkId_Floor_plan_2 = f1.LinkId_Floor_plan
    inner join Floor_Plans_area$ f2
    on b.LinkId_Floor_plan_3 = f2.LinkId_Floor_plan
    inner join Floor_Plans_area$ f3
    on b.LinkId_Floor_plan_4 = f3.LinkId_Floor_plan
    inner join Floor_Plans_area$ f4
    on b.LinkId_Floor_plan_5 = f4.LinkId_Floor_plan
    and b.[Postal code] = '${req.params.id}'`;

  request.query(query, function (err, response) {
    let result = response.recordset[0];

    let finalResult = [];

    result["Floor plan"].forEach((element, index) => {
      finalResult.push({
        name: "Floor plan " + (index + 1),
        imagePath: filePath.HostUrl + element,
        linkId: result["LinkId_Floor_plan"][index],
        totalSize: result["Total Floor"][index],
        numberOfRooms: "6",
      });
    });

    let finalOutput = {
      PostalCode: result["Postal code"],
      BlockNo: result["Blk No#"],
      StreetName: result["Street name"],
      FloorPlans: finalResult,
      type: "Condo",
    };

    res.json({
      success: true,
      result: finalOutput,
      message: "Succefully retrieved",
    });
  });
});

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

router.get("/Buildings_floor_Map1/:id1/:id2", function (req, res) {
  let query = `select * from Buildings_floor_Map$ where [Postal code] like '%' +'${req.params.id1}'+ '%' and [Blk No#] like '%' +'${req.params.id2}'+ '%'`;

  request.query(query, function (err, set) {
    if (err) {
      res.json({
        success: true,
        message: err,
      });
    } else {
      let result = set.recordset;
      result.forEach((element) => {
        element["Floor plan 1"] = ImagePath + element["Floor plan 1"];
        element["Floor plan 2"] = ImagePath + element["Floor plan 2"];
        element["Floor plan 3"] = ImagePath + element["Floor plan 3"];
        element["Floor plan 4"] = ImagePath + element["Floor plan 4"];
        element["Floor plan 5"] = ImagePath + element["Floor plan 5"];

        if (element["Floor plan 6"] == "N/A") {
          element["Floor plan 6"] = element["Floor plan 6"];
        } else {
          element["Floor plan 6"] = ImagePath + element["Floor plan 6"];
        }
      });

      let query1 = `select * from Buildings_floor_Map$  inner join Floor_Plans_area$  on Buildings_floor_Map$.linkId_Floor_plan_1 = Floor_Plans_area$.LinkId_Floor_plan
            where Buildings_floor_Map$.[Postal code] like '%' +'${req.params.id1}'+ '%' and  Buildings_floor_Map$.[Blk No#] like '%' +'${req.params.id2}'+ '%'`;

      request.query(query1, function (err, set) {
        if (err) {
          res.json({
            success: true,
            message: err,
          });
        } else {
          let result1 = set.recordset[0];

          let FloorPlan = [];
          Object.keys(result1).forEach(function (key, index) {
            if (index > 2) {
              FloorPlan.push({
                name: key,
                imagePath: result1["Floor plan 1"],
                linkId: result1["LinkId_Floor_plan_1"],
                totalSize: result1["Total Floor"],
              });
            }
          });

          console.log(FloorPlan);

          res.json({
            success: true,
            result: result1,
            message: "Successfully retreived!",
          });
        }
      });
    }
  });
});

router.get("/Floor_Plans_area/:id", function (req, res) {
  let query1 = `select * from [dbo].[Floor_Plans_area$] where LinkId_Floor_plan ='${req.params.id}'`;

  request.query(query1, function (err, set) {
    if (err) {
      res.json({
        success: true,
        message: err,
      });
    } else {
      let result1 = set.recordset[0];
      result1["Floor plan"] = ImagePath + result1["Floor plan"];

      let query3 = `select * from InitialDefaultValues`;

      request.query(query3, async function (err, set) {
        if (err) {
          res.json({
            success: true,
            message: err,
          });
        } else {
          set.recordset[0].RoomSize = result1["Total Floor"];
          let occP = await new Promise((resolve, reject) => {
            request.query(
              "Select * from DefaultOccupancyPattern",
              function (err, response) {
                resolve(response.recordset[0]);
              }
            );
          });

          let roomsArray = [];
          Object.keys(result1).forEach(function (key, index) {
            if (index > 2) {
              roomsArray.push({
                roomName: key,
                roomSize: result1[key],
                roomTemperature: set.recordset[0].idealRoomTemparature,
                ceilingHeightMeter: set.recordset[0].ceilingHeightMeter,
                ceilingHeightFeet: set.recordset[0].ceilingHeightFeet,
                weekdaysHour: occP.weekdaysHour,
                weekendsHour: occP.weekendsHour,
              });
            }
          });

          set.recordset[0].Rooms = roomsArray;

          let roomCount = [];
          //   Object.keys(result1).forEach(function (key, index) {
          //     if (index > 2) {
          //       if (result1[key] != "NA") {
          //         roomCount.push({
          //           roomSize: result1[key],
          //         });
          //       }
          //     }
          //   });
          let bedroomCount = roomCount.length;
          set.recordset[0].NoOfRooms = "6";

          delete set.recordset[0].idealRoomTemparature;
          delete set.recordset[0].ceilingHeightMeter;
          delete set.recordset[0].currentRating;
          delete set.recordset[0].currentRatingDeafult;
          delete set.recordset[0].room;

          let finalOutput = set.recordset[0];

          (set.recordset[0].type = "Condo"),
            res.json({
              success: true,
              result2: set.recordset[0],
              message: "Successfully retreived!",
            });
        }
      });
    }
  });
});
router.get("/testrouter", function (req, res) {
  let query = `Select * From Buildings_floor_Map$ b
    inner join Floor_Plans_area$ f
    on b.LinkId_Floor_plan_1 = f.LinkId_Floor_plan
    inner join Floor_Plans_area$ f1
    on b.LinkId_Floor_plan_2 = f1.LinkId_Floor_plan
    inner join Floor_Plans_area$ f2
    on b.LinkId_Floor_plan_3 = f2.LinkId_Floor_plan
    inner join Floor_Plans_area$ f3
    on b.LinkId_Floor_plan_4 = f3.LinkId_Floor_plan
    inner join Floor_Plans_area$ f4
    on b.LinkId_Floor_plan_5 = f4.LinkId_Floor_plan
    and b.[Blk No#] = '123A' and b.[Postal code] = '691123'`;

  request.query(query, function (err, response) {
    let result = response.recordset[0];

    let finalResult = [];

    result["Floor plan"].forEach((element, index) => {
      finalResult.push({
        name: "Floor plan " + (index + 1),
        imagePath: filePath.HostUrl + element,
        linkId: result["LinkId_Floor_plan"][index],
        totalSize: result["Total Floor"][index],
        numberOfRooms: "6",
      });
    });

    let finalOutput = {
      PostalCode: result["Postal code"],
      BlockNo: result["Blk No#"],
      StreetName: result["Street name"],
      FloorPlans: finalResult,
    };

    res.json({
      result: finalOutput,
    });
  });
});

module.exports = router;
