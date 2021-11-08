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


const red = "#EB7676", lightGreen = "#57B78C", green = "#2B746A", grey = '#FFFFFF'
const redValue = 120, lightGreenValue = 60, greenValue = 80, greyValue = 30
router.get("/getBarChartWeeklyData", function (req, res, next) {


  let startDate = moment(new Date()).subtract("7", 'days').toISOString()
  let endDate = new Date().toISOString()

  let query = `Select * from EnergyConsumption Where created_On Between '${startDate}' AND '${endDate}'`

  request.query(query, function (err, set) {
    if (err) {
      console.log(err)

    } else {
      console.log("sucess")
      let result = set.recordsets[0]
      let days = []
      for (let i = 0; i < 7; i++) {
        days.push(
          {
            day: moment(endDate).subtract(i, 'days').day(),
            dayName: moment(endDate).subtract(i, 'days').format("dddd"),

          })
      }
      console.log("days", days)
      let final = []

      days.forEach((day, i) => {
        final[i] = {
          day: day.dayName,
          energyConsumed: "0"
        }
        result.forEach(element => {
          if (day.day == moment(element.created_On).day()) {
            final[i].energyConsumed = (Number(final[i].energyConsumed) + Number(element.energy)).toFixed(2)
          }
        })

      })
      let total = 0
      final.forEach(element => {

        element.color = getColor(Number(element.energyConsumed).toFixed(2))
        total = total + Number(element.energyConsumed)

      })

      console.log('result', final)

      res.json({
        success: true,
        result: final,
        message: "Weekly Data",
        TotalEnergySpend: total.toFixed(2),
        TotalMoneySpend: Number(total * .023).toFixed(2),
        Threshold: 75 * 7
      })

    }
  })





})


function parseDate(str) {
  var mdy = str.split('/');
  return new Date(mdy[2], mdy[0] - 1, mdy[1]);
}

function datediff(first, second) {

  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

router.get("/getBarChartMonthlyData", function (req, res, next) {

  // res.send(randomNumber(0.00,12.00).toString())
  let monday = 0, tuesday = 0, wednesday = 0, thursday = 0, friday = 0, saturday = 0, sunday = 0

  let startDate = moment(new Date()).startOf('month').format("MM/DD/YYYY")
  let endDate = moment(new Date()).format("MM/DD/YYYY")

  let startDate1 = moment(new Date()).startOf('month').toISOString()
  let endDate1 = moment(new Date()).toISOString()

  let query = `Select * from EnergyConsumption Where created_On Between '${startDate1}' AND '${endDate1}'`

  let diff = datediff(parseDate(startDate), parseDate(endDate)) + 1


  request.query(query, function (err, set) {
    if (err) {
      console.log(err)

      res.status(400)
      res.json({
        success: false,
        message: "Something bad has happened"
      })

    } else {
      // console.log("sucess",set)
      let finalResult = []
      let result = set.recordsets[0]
      for (let i = 0; i < diff; i++) {
        finalResult[i] = 0

        finalResult[i] = {
          day: i + 1,
          energyConsumed: "0"
        }

        result.forEach(element => {
          console.log(moment(element.created_On).date())
          if (moment(element.created_On).date() == i + 1) {
            finalResult[i].energyConsumed = Number(finalResult[i].energyConsumed) + Number(element.energy)
          }
        })
      }

      let finalResult1 = []
      finalResult.forEach(element => {
        element.energyConsumed = Number(element.energyConsumed).toFixed(2)
        element.color = getColor(element.energyConsumed)
        finalResult1.push(element)
      })



      console.log("finalResult", finalResult1)
      let total = 0
      finalResult1.forEach(element => {

        total = total + Number(element.energyConsumed)

      })

      res.status(200)
      res.json({
        success: true,
        result: finalResult1,
        message: "Monthly Data",
        TotalEnergySpend: Number(total).toFixed(2),
        TotalMoneySpend: Number(total * .023).toFixed(2),
        Threshold: 75 * 30
      })


      // res.send(finalResult1)
    }
  })

})

router.post("/getLineChartData",
  function (req, res, next) {



    let month
    let monthArray = []
    let startDate, endDate
    let query
    if (req.body.month) {
      month = Number(req.body.month)
      for (let i = 0; i < month; i++) {
        monthArray.push(moment(new Date()).subtract(i, 'month').format("MMM"))
      }
      startDate = moment(new Date()).subtract(month, 'month').startOf('month').toISOString()
      endDate = moment(new Date()).toISOString()

      query = `Select * from EnergyConsumption Where created_On Between '${startDate}' AND '${endDate}'`
    } else {
      query = `Select * from EnergyConsumption`
    }

    request.query(query, function (err, set) {
      if (err) {
        console.log(err)
        res.status(400)
        res.json({
          success: false,
          message: "Something bad has happened"
        })
      } else {

        let result = set.recordsets[0]

        let temp = []
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        if (req.body.month && Number(req.body.month) < 12) {
          months = monthArray
        }


        months.forEach((month, i) => {
          temp[i] = {
            "month": month,
            "energyConsumed": "0"
          }
          result.forEach((element) => {
            if (moment(element.created_On).format("MMM") == month) {
              temp[i].energyConsumed = (Number(temp[i].energyConsumed) + Number(element.energy)).toFixed(2)

            }
          })
        })

        let total = 0
        temp.forEach(element => {

          total = total + Number(element.energyConsumed)

        })



        res.status(200)
        res.json({
          success: true,
          result: temp,
          message: "Monthly line Data",
          TotalEnergySpend: Number(total).toFixed(2),
          TotalMoneySpend: Number(total * .023).toFixed(2),
          Threshold: 75 * Number(month) * 30,
          installedOn: new Date("2021-09-21")
        })


      }
    })

  })


function getColor(value) {

  if (value <= greyValue) {
    return grey
  } else if (value <= lightGreenValue) {
    return lightGreen
  } else if (value <= greenValue) {
    return green
  } else if (value >= redValue) {
    return red
  } else {
    return red
  }

}
function insertData(query) {
  return new Promise((resolve, reject) => {
    request.query(query, function (err, set) {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log("sucess")
        resolve("success")
      }
    })
  })

}
function randomNumber(min, max) {
  return Number(Math.random() * (max - min) + min).toFixed(2);
}
async function eneryconsumption(time) {
  return new Promise(async (resolve, reject) => {

    let eng = [{ product: "Hitachi", productid: 12 }, { product: "Daikin", productid: 334 }, { product: "Carrier", productid: 45 }, { product: "Panasonic", productid: 19 }, { product: "Haier", productid: 56 }]

    for (let i = 0; i < eng.length; i++) {
      let enegy = randomNumber(0.00, 12.00)
      let query = `INSERT INTO EnergyConsumption
    (product_Name
      ,user_ID
      ,energy
      ,created_On,product_ID) VALUES ('${JSON.stringify(eng[i].product)}','5','${enegy}','${time}','${eng[i].productid}') `
      await insertData(query)

      if (i == eng.length - 1) {
        resolve(true)
      }
    }



  })
}
router.get('/getMaintananceSchedule', function (req, res, next) {

  let query = `Select * From MaintananceRecord`

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
        message: "Maintanance Date",
        result: set.recordset[0]
      })

    }
  })

})
router.put('/rescheduleMaintanance',
  [check("date").exists()],
  function (req, res, next) {

    let query = `update MaintananceRecord set rescheduled = '1', rescheduledDate = '${new Date(req.body.date).toISOString()}'`

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
          message: "Your Schedule has been recheduled.",

        })

      }
    })

  })
router.post('/getConsumptionDetails', function (req, res) {


  let startDate, endDate
  let query
  if (req.body.filter == 'today') {
    startDate = moment(new Date()).startOf('day').toISOString()
    endDate = moment(new Date()).endOf('day').toISOString()
    query = `Select * from EnergyConsumption Where created_On Between '${startDate}' AND '${endDate}'`
  } else if (req.body.filter == 'week') {
    startDate = moment(new Date()).startOf('week').toISOString()
    endDate = moment(new Date()).endOf('week').toISOString()
    query = `Select * from EnergyConsumption Where created_On Between '${startDate}' AND '${endDate}'`
  } else if (req.body.filter == 'month') {
    startDate = moment(new Date()).startOf('month').toISOString()
    endDate = moment(new Date()).endOf('month').toISOString()
    query = `Select * from EnergyConsumption Where created_On Between '${startDate}' AND '${endDate}'`
  } else {
    query = 'Select * from EnergyConsumption'
  }
  console.log('start, ends', startDate, endDate)










  request.query(query, function (err, set) {
    if (err) {
      console.log(err)

      res.status(400)
      res.json({
        success: false,
        message: "Something bad has happened"
      })

    } else {
      // console.log("sucess",set)
      let finalResult = []
      let result = set.recordsets[0]
      let energyConsumed = "0"
      result.forEach(element => {
        energyConsumed = Number(energyConsumed) + Number(element.energy)
      })


      res.status(200)
      res.json({
        success: true,
        result: {
          energyConsumed: Number(energyConsumed).toFixed(2),
          moneySpent: (Number(energyConsumed) * .23).toFixed(2)
        },
        message: "Filtered Successfully",

      })


      // res.send(finalResult1)
    }
  })
})
router.post('/enegeryconsumption', async function (req, res) {

  for (let i = 0; i < 4; i++) {
    let time = moment(new Date("2021-10-17")).add(i * 12, 'hours').toISOString()
    await eneryconsumption(time)
  }
  res.send("Success")

})

router.get('/getPayandMaintanance', function (req, res, next) {

  let query = `Select * From MaintananceRecord`
  let query2 = `Select * From PaymentRecord`

  request.query(query, function (err, set) {
    if (err) {

      console.log("err", err)
      res.status(400)
      res.json({
        success: false,
        message: err.originalError.info.message
      })

    } else {
      let Maintanance = set.recordset[0]
      request.query(query2, function (err, set) {
        if (!err) {
          let payment = set.recordset[0]
          let maintananceDue = false
          let paymentDue = false
          let paymentDueDate = datediff(new Date(), payment.paymentDueDate)
          let maintananceDueDate
          if (Maintanance.rescheduled) {
            maintananceDueDate = datediff(new Date(), Maintanance.rescheduledDate)
          } else {
            maintananceDueDate = datediff(new Date(), Maintanance.dueDate)
          }
          if (maintananceDueDate <= 10) {
            maintananceDue = true
          }
          if (paymentDueDate <= 10) {
            paymentDue = true
          }
          res.status(200)
          res.json({
            success: true,
            message: "Upcoming payments and maintenance details",
            isMaintanaceDue: maintananceDue,
            isPaymentDue: paymentDue,
            MaintananceDueInDays: maintananceDue ? maintananceDueDate : "0",
            PaymentDueInDays: paymentDue ? paymentDueDate : "0",
            MaintananceRecord: Maintanance,
            PaymentRecord: payment
          })

        }
      })


    }
  })

})

router.get('/getBillingHistory', function (req, res) {

  let query = `Select * From BillingHistory`
  let query2 = `Select * From CardDetails`

  request.query(query, function (err, set) {

    request.query(query2, function (err, cardDetails) {


      if (!err) {
        res.status(200)
        res.json({
          success: true,
          message: "Billing history",
          BillingHistory: set.recordsets[0],
          CardDetails: cardDetails.recordsets[0][0]

        })
      }
    })
  })

})



module.exports = router;