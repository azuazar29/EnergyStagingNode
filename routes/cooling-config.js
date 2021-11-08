var express = require('express');
var router = express.Router();
var sql = require("../database");
var request = new sql.Request();
var config = require('../config/general_config')
const rp = require("request-promise")
const { check, oneOf, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
var config = require('../config/general_config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = "05231b50-fd3d-11e9-bac2-47f7251a736c"
const middleware = require('../middleware/token-auth')
const moment = require("moment")
const { CoolingConfiguration } = require('./users');
const { response } = require('express');


// function randomNumber(min, max) {
//   return Number(Math.random() * (max - min) + min).toFixed(2);
// }

// Cooling config algorithm

router.post('/configuration/:id',
  middleware.authenticate, function (req, res, next) {

    try {
      validationResult(req).throw()

      if(!req.body.perPage){
        req.body.perPage = 3
      }

      let guid = uuidv4()
      let query = `Select * From UserRoom where ConfigID = '${req.params.id}'`

      request.query(query, function (err, set) {
        if (err) {

          //////console("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })

        } else {

          req.body.rooms = set.recordsets[0]

          //console(req.body.rooms.length)

          if(set.recordsets[0].length){
            CoolingConfiguration(req, res, next).then(response => {
              res.status(200)
              let energy = []
              let price = []
                ////console("req.body.perPage",req.body.perPage)
                response.EnergyWise.forEach((element,index)=>{
                  if(index+1 <= Number(req.body.perPage)){
                    energy.push(element)
                  }
                })

                response.PriceWise.forEach((element,index)=>{
                  if(index+1 <= Number(req.body.perPage)){
                       price.push(element)
                  }
                })
              
              res.json({
                success: true,
                message: "Cooling Configuration Details",
                result: {EnergyWise:energy,PriceWise:price}
              })
            })
          }else{
            res.status(404)
              res.json({
                success: false,
                message: "Cooling Configuration not found"
                
              })
          }
        }
      })

    } catch (err) {
      res.status(400)
      res.json({
        success: false,
        message: err.errors
      })

    }

})

router.post('/configuration/:id/:productId',
  middleware.authenticate, function (req, res, next) {

    try {
      validationResult(req).throw()

      if(!req.body.perPage){
        req.body.perPage = 3
      }

      let guid = uuidv4()
      let query = `Select * From UserRoom where ConfigID = '${req.params.id}'`

      request.query(query, function (err, set) {
        if (err) {

          //////console("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })

        } else {

          req.body.rooms = set.recordsets[0]

          //////console(req.body.rooms)

          if(set.recordsets[0].length){
            CoolingConfiguration(req, res, next).then(response => {
              res.status(200)
             
              
              res.json({
                success: true,
                message: "Cooling Configuration Details",
                result: response
              })
            })
          }else{
            res.status(404)
              res.json({
                success: false,
                message: "Cooling Configuration not found"
                
              })
          }
        }
      })

    } catch (err) {
      res.status(400)
      res.json({
        success: false,
        message: err.errors
      })

    }

})

router.get('/getFCUDetails/:id', function(req, res, next) {

  request.query(`select * From ProductDescription where manufacturer = '${req.params.id.toString().trim()}'`,function(err,recordset){
    res.status(200)
    console.log('err',err)
    res.json({
      success:true,
      message:"Product Details",
      result:recordset.recordset[0]
    })
  })
})
router.put('/SaveandExit/:id',
  [check("configurationName").exists()],
  function (req, res, next) {

    try {
      validationResult(req).throw()
      let query = `UPDATE UserConfiguration Set configurationName = '${req.body.configurationName}', saveAndExit = '1' Where id=${req.params.id}`

      request.query(query, function (err, set) {
        if (err) {

          //////console("err", err)
          res.status(400)
          res.json({
            success: false,
            message: err.originalError.info.message
          })

        } else {
          res.status(200)
          res.json({
            success: true,
            message: "Configuration Details Successfully Added",

          })



        }
      })

    } catch (err) {
      res.status(400)
      res.json({
        success: false,
        message: err.errors
      })

    }

  })
  
router.post('/getsystem', function (req, res, next) {


  CoolingConfiguration(req, res, next).then(response => {
    // //////console("res",res)



    res.send(response)
  })
})


function updateRoom(roomData, userId, configID) {

  return new Promise((resolve, reject) => {

    if (!roomData.Id || roomData.Id == null) {

      addRoom(roomData.roomName, userId, configID, roomData).then(res => {
        resolve("Success")
      }).catch(err => {
        resolve(err)
      })
    } else {
      let query = `Update UserRoom Set roomName = '${roomData.roomName}', 
        idealRoomTemparature = '${roomData.idealRoomTemparature}', ceilingHeightMeter = '${roomData.ceilingHeightMeter}', 
        ceilingHeightFeet = '${roomData.ceilingHeightFeet}', roomSize = '${roomData.roomSize}', 
        updatedOn = '${new Date().toISOString()}' where Id = ${roomData.Id}`
      //////console("query", query)
      request.query(query, function (err, set) {
        if (err) {

          //////console("err in add room", err)
          resolve(err)

        } else {
          resolve("Success")
        }
      })
    }


  })

}

function addRoom(roomName, id, guid, roomData) {

  return new Promise((resolve, reject) => {

    let query = `insert into UserRoom Values( '${roomName}', 
    '${roomData.idealRoomTemparature}', '${roomData.ceilingHeightMeter}', 
    '${roomData.currentRating}', '${Number(roomData.roomSize).toFixed(2)}', 
    '${id}', '${new Date().toISOString()}', '${new Date().toISOString()}', 
    '${guid}', '${roomData.ceilingHeightFeet}') SELECT SCOPE_IDENTITY() as id`
    //////console("query", query)
    request.query(query, function (err, set) {
      if (err) {

        //////console("err in add room", err)
        resolve(err)

      } else {
        let roomID = set.recordset[0].id
        let query = `Select * From DefaultOccupancyPattern`
        request.query(query, function (err, set) {
          if (err) {

            //////console("err", err)
            resolve(err)

          } else {

            let occupancyPattern = set.recordset[0]
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
              )`

            request.query(query, function (err, set) {
              if (err) {

                //////console("err", err)
                resolve(err)

              } else {
                resolve("success")


              }
            })

          }
        })


      }
    })

  })

}








module.exports = router;
