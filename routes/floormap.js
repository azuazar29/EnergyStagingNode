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
const ImagePath = require('../config/server_config')


router.get("/Buildings_floor_MapBlkNo/:id", function (req, res) {

    let query = `select [Blk No#] from Buildings_floor_Map$ where [Postal code] like '%' +'${req.params.id}'+ '%'`;

    request.query(query, function (err, set) {
        if (err) {
            res.json({
                success: true,
                message: err,
            })
        }

        else {
            let result = set.recordset;
            let endResult = []
            result.forEach(element=>{
                endResult.push(element["Blk No#"])
            })
            res.json({
                success: true,
                result: endResult,
                message: "Successfully retreived!",

            });
        }
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
            })
        }

        else {
            let result = set.recordset;
            result.forEach(element => {
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

            })

            res.json({
                success: true,
                result: result,
                message: "Successfully retreived!",

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
            })
        }

        else {
            let result1 = set.recordset[0];
            result1["Floor plan"] = ImagePath + result1["Floor plan"];
          

            let query3 = `select * from InitialDefaultValues`;

            request.query(query3, function (err, set) {
                if (err) {
                    res.json({
                        success: true,
                        message: err,
                    })
                }

                else {
                    set.recordset[0].RoomSize = result1["Total Floor"]

                    let roomsArray = []
                    Object.keys(result1).forEach(function(key,index) {

                       if(index >2){
                        roomsArray.push({
                            roomName:key,
                            roomSize:result1[key]
                        })
                       }
                       
                      
                      });
                      set.recordset[0].room = roomsArray

                    res.json({
                        success: true,
                        result2:  set.recordset[0],
                        message: "Successfully retreived!",

                    });

                }

            })

        }

    })

});




module.exports = router;
