var express = require('express');
var router = express.Router();

var sql = require("../database");
var request = new sql.Request();

const moment = require("moment")
const middleware = require('../middleware/token-auth')



const red = "#c62828", lightGreen = "#4b00ff", green = "#7c84f0", grey = '#ffffff'
const redValue = 120, lightGreenValue = 60, greenValue = 80, greyValue = 0

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


function getOrderID(id) {

    return new Promise((resolve, reject) => {
        // console.log("rqyert", `select Id from orderList where UserId = '${id}' and OrderStatus = 'PE'`)
        request.query(`select Id,OrderStatus from orderList where UserId = '${id}' and OrderStatus = 'PE'`, function (err, recordset) {

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
                            resolve("4")
                        } else {
                            resolve("3")
                        }


                    })
                }





            } else {
                resolve('')

            }

        })
    })



}


router.get('/energyConsumption', function (req, res) {



    request.query('Select * From energyconsumptionfromjob', function (err, response) {

        let result = groupBy(response.recordsets[0], 'deviceID')

        res.json({
            success: true,
            result: result
        })

    })

})

function getColor(value, min, factor) {


    // console.log(value, min, factor)


    min = Number(min)
    value = Number(value)
    factor = Number(factor)

    // console.log(` value -  ${value} min+factor ${(min + factor)}, factor + min+ factor - ${(factor + (min + factor))}`)


    if (value >= min && value <= (min + factor)) {
        return green
    } else if (value > (min + factor) && value <= factor + (min + factor)) {
        console.log('it came')

        return lightGreen
    } else if (value > factor + (min + factor)) {
        return red
    } else if (value == 0) {
        return grey
    }

}

router.post('/getEnergyConsumption', middleware.authenticate, async function (req, res) {

    let status = await getOrderID(req.decoded.id)

    if (status == "") {
        status = '2'
    }


    let deviceID = await new Promise((resolve, reject) => {

        let query = `Select deviceID,Id from orderList where userId = '${req.decoded.id}' and OrderStatus <> 'CA'`

        console.log("query device mapping", query)

        request.query(query, function (err, recordset) {

            console.log("recordset.recordset", recordset.recordset)

            if (recordset.recordset.length) {


                request.query(`Select installationDate from subscriptionManagement where userID = ${req.decoded.id} and orderID = ${recordset.recordset[0].Id}`, function (err, record) {


                    if (record.recordset[0].installationDate != null) {
                        resolve({ deviceID: recordset.recordset[0].deviceID, installationDate: moment(record.recordset[0].installationDate).format('DD-MM-YYYY') })

                    } else {
                        resolve({ deviceID: recordset.recordset[0].deviceID, installationDate: '' })
                    }
                })
            } else {
                resolve({ deviceID: '', installationDate: '' })
            }



        })


    })

    console.log("device", deviceID)
    if (deviceID.deviceID) {
        let startDate, endDate
        let query
        if (req.body.filter == 'today') {
            startDate = moment(new Date()).startOf('day').toISOString()
            endDate = moment(new Date()).endOf('day').toISOString()
            query = `Select * from [EnergyConsumptionFromJob] Where updatedOn Between '${startDate}' AND '${endDate}'`
        } else if (req.body.filter == 'week') {
            startDate = moment(new Date()).startOf('week').toISOString()
            endDate = moment(new Date()).endOf('week').toISOString()
            query = `Select * from [EnergyConsumptionFromJob] Where updatedOn Between '${startDate}' AND '${endDate}'`
        } else if (req.body.filter == 'month') {
            startDate = moment(new Date()).startOf('month').toISOString()
            endDate = moment(new Date()).endOf('month').toISOString()
            query = `Select * from [EnergyConsumptionFromJob] Where updatedOn Between '${startDate}' AND '${endDate}'`
        } else {
            query = `Select * from [EnergyConsumptionFromJob] where Device_ID = '${deviceID.deviceID}' order by updatedOn `
        }



        request.query(query, async function (err, set) {
            if (err) {

                res.status(400)
                res.json({
                    success: false,
                    message: "Something bad has happened"
                })

            } else {
                let finalResult = []
                let result = set.recordsets[0]

                result.forEach((element, index) => {

                    element.updatedOn = moment(element.updatedOn).format('MM/DD/YYYY')

                })

                let resultFinal = groupBy(result, 'updatedOn')

                let groupedData = []

                Object.keys(resultFinal).forEach(element => {

                    groupedData.push(resultFinal[element][resultFinal[element].length - 1])

                })

                result = groupedData

                let maxdayenergy = 0

                result.forEach(element => {
                    maxdayenergy = Number(maxdayenergy) + Number(element.EnergyConsumed)
                })

                let ab = moment(new Date()).subtract('6', 'days').format('YYYY-MM-DD')
                let bb = moment(new Date()).format('YYYY-MM-DD')

                console.log('bb', bb)
                console.log('ab', ab)

                let todaysenergy = 0
                let final = []
                for (var m = moment(ab); m.diff(bb, 'days') <= 0; m.add(1, 'days')) {

                    // console.log("mmm", m.day())
                    let isAvailable = false
                    result.forEach(element => {


                        // console.log("elemen", element)

                        if (moment(element.updatedOn).format('YYYY-MM-DD') == m.format('YYYY-MM-DD')) {
                            final.push({
                                day: m.format('dddd'),
                                energyConsumed: element.EnergyConsumed.toString(),
                                color: ''
                            })
                            if (moment(new Date()).format('YYYY-MM-DD') == m.format('YYYY-MM-DD')) {
                                todaysenergy = (Number(todaysenergy) + Number(element.EnergyConsumed)).toFixed(2)
                            }

                            isAvailable = true

                        }

                    })
                    if (!isAvailable) {
                        final.push({
                            day: m.format('dddd'),
                            energyConsumed: "0",
                            color: ''
                        })
                    }
                }


                let total = 0
                final.forEach(element => {

                    total = total + Number(element.energyConsumed)

                })



                let startDate1 = moment(new Date()).startOf('month').toDate()
                let endDate1 = moment(new Date()).endOf('month').toDate()

                var a = moment(moment(startDate1).format('YYYY-MM-DD'));
                var b = moment(moment(endDate1).format('YYYY-MM-DD'));

                for (var m = moment(a); m.diff(b, 'days') <= 0; m.add(1, 'days')) {

                    let isAvailable = false


                    result.forEach(element => {
                        // //console.log(moment(element.updatedOn).date())
                        if (moment(element.updatedOn).format("MM/DD/YYYY") == m.format("MM/DD/YYYY")) {
                            finalResult.push({
                                day: m.date().toString(),
                                dayString: m.format("dddd"),
                                energyConsumed: element.EnergyConsumed,
                                color: ''
                            })
                            isAvailable = true
                        }
                    })
                    if (!isAvailable) {
                        finalResult.push({
                            day: m.date().toString(),
                            dayString: m.format('dddd'),
                            energyConsumed: 0,
                            color: ''
                        })
                    }
                }

                let finalResult1 = []
                finalResult.forEach(element => {
                    element.energyConsumed = Number(element.energyConsumed).toFixed(2)
                    finalResult1.push(element)
                })



                // //console.log("finalResult", finalResult1)
                let totalMonthly = 0
                finalResult1.forEach(element => {

                    totalMonthly = totalMonthly + Number(element.energyConsumed)


                })

                // 



                let monthArray = []

                let month = Number(req.body.month)
                for (let i = 0; i < month; i++) {
                    monthArray.push(moment(new Date()).subtract(i, 'month').format("MMM"))
                }

                let temp = []
                let months = []

                let monthsCount = Number(req.body.month)


                for (let i = 0; i < monthsCount; i++) {

                    temp[i] = {
                        "month": moment(new Date()).subtract(i, 'month').format("MMM"),
                        "Year": moment(new Date()).subtract(i, 'month').format("YYYY"),
                        "energyConsumed": "0"
                    }
                    result.forEach((element) => {
                        if (moment(element.created_On).format("MMM") == temp[i].month &&
                            moment(element.created_On).format("YYYY") == temp[i].Year) {
                            temp[i].energyConsumed = (Number(temp[i].energyConsumed) + Number(element.EnergyConsumed)).toFixed(2)

                        }
                    })

                }


                let totalTrend = 0
                temp.forEach(element => {

                    totalTrend = totalTrend + Number(element.energyConsumed)

                })



                let weeklyMax = 0, weeklyMin = 0
                final.forEach(element => {
                    //console.log("max", element.energyConsumed)
                    if (weeklyMax < element.energyConsumed) {
                        weeklyMax = element.energyConsumed
                    }
                })
                let MinArrayWeek = []

                finalResult1.forEach(element => {
                    if (element.energyConsumed != 0)
                        MinArrayWeek.push(element)
                })

                weeklyMin = MinArrayWeek.reduce(function (prev, curr) {
                    return prev.energyConsumed < curr.energyConsumed ? prev : curr;
                });
                weeklyMin = weeklyMin.energyConsumed
                // console.log("min", monthlyMin.energyConsumed)

                let factor = (weeklyMax - weeklyMin) / 3

                final.forEach(element => {

                    let color = getColor(element.energyConsumed, weeklyMin, factor)
                    // //console.log("color", color)
                    element.color = color

                })

                let monthlyMax = 0, monthlyMin = 0
                finalResult1.forEach(element => {
                    // //console.log("max", element.energyConsumed)
                    if (monthlyMax < element.energyConsumed) {
                        monthlyMax = element.energyConsumed
                    }
                })
                let index11 = 0

                MinArray = []

                finalResult1.forEach(element => {
                    if (element.energyConsumed != 0)
                        MinArray.push(element)
                })

                monthlyMin = MinArray.reduce(function (prev, curr) {
                    return prev.energyConsumed < curr.energyConsumed ? prev : curr;
                });
                monthlyMin = monthlyMin.energyConsumed
                console.log("min", monthlyMin.energyConsumed)
                // finalResult1.forEach((element, index) => {
                //     if (element.energyConsumed != 0) {

                //         index11 = index

                //         if (index == index11)
                //             monthlyMin = element.energyConsumed

                //         if (monthlyMin < element.energyConsumed) {
                //             monthlyMin = element.energyConsumed
                //         }



                //     }

                // })

                console.log("monthlyMax - monthlyMin", monthlyMax, monthlyMin)

                let factorMonthly = (monthlyMax - monthlyMin) / 3

                finalResult1.forEach(element => {

                    let color = getColor(element.energyConsumed, monthlyMin, factorMonthly)
                    //console.log("color", color)
                    element.color = color

                })

                final.forEach(element => {

                    if (element.day == moment(new Date()).format("dddd")) {

                        element.day = 'Today'

                    }

                })



                res.status(200)
                res.json({
                    success: true,
                    MonthlyResult: finalResult1,
                    message: "Consumption Details",
                    TotalEnergySpendMonthly: Number(totalMonthly).toFixed(2),
                    TotalMoneySpendMonthly: ((Number(totalMonthly)) * .23).toFixed(2),
                    ThresholdMonthly: ((Number(factorMonthly) + (Number(monthlyMin) + Number(factorMonthly)))).toFixed(2),
                    WeeklyResult: final,
                    TotalEnergySpendWeekle: total.toFixed(2),
                    TotalMoneySpendWeekly: ((Number(total)) * .23).toFixed(2),
                    ThresholdWeekly: ((Number(factor) + (Number(weeklyMin) + Number(factor)))).toFixed(2),
                    TrendResult: temp,
                    TotalEnergySpendTrend: Number(totalTrend).toFixed(2),
                    TotalMoneySpendTrend: ((Number(totalTrend)) * .23).toFixed(2),
                    ThresholdTrend: ((Number(factorMonthly) + (Number(monthlyMin) + Number(factorMonthly)))).toFixed(2),
                    TotalEnergySpendToday: todaysenergy.toString(),
                    TotalMoneySpendToday: ((Number(todaysenergy)) * .23).toFixed(2),
                    TotalMoneySpendmax: ((Number(maxdayenergy)) * .23).toFixed(2),
                    TotalEnergySpendmax: Number(maxdayenergy).toFixed(2).toString(),
                    installationDate: deviceID.installationDate,
                    status: status
                })




                // res.status(200)
                // res.json({
                //     success: true,
                //     result: {
                //         energyConsumed: Number(energyConsumed).toFixed(2),
                //         moneySpent: (Number(energyConsumed) * .23).toFixed(2)
                //     },
                //     message: "Filtered Successfully",

                // })


                // res.send(finalResult1)
            }
        })
    } else {

        res.status(200)
        res.json({
            success: false,
            message: "No Device ID is mapped with this user",
            status: status
        })

    }





})

router.post('/getEnergyConsumptionByCO2', middleware.authenticate, async function (req, res) {

    let status = await getOrderID(req.decoded.id)

    if (status == "") {
        status = '2'
    }

    let deviceID = await new Promise((resolve, reject) => {

        let query = `Select deviceID,orderID from deviceMapping where userID = '${req.decoded.id}'`

        console.log("query device mapping", query)

        request.query(query, function (err, recordset) {

            console.log("recordset.recordset", recordset.recordset)

            if (recordset.recordset.length) {


                request.query(`Select installationDate from subscriptionManagement where userID = ${req.decoded.id} and orderID = ${recordset.recordset[0].orderID}`, function (err, record) {

                    console.log("err", err)
                    console.log("record", record)

                    if (record.recordset[0].installationDate != null) {
                        resolve({ deviceID: recordset.recordset[0].deviceID, installationDate: moment(record.recordset[0].installationDate).format('DD-MM-YYYY') })

                    } else {
                        resolve({ deviceID: recordset.recordset[0].deviceID, installationDate: "" })

                    }
                })
            } else {
                resolve({ deviceID: '', installationDate: '' })
            }



        })


    })

    console.log("device", deviceID)
    if (deviceID.deviceID != '') {
        let startDate, endDate
        let query
        if (req.body.filter == 'today') {
            startDate = moment(new Date()).startOf('day').toISOString()
            endDate = moment(new Date()).endOf('day').toISOString()
            query = `Select * from [EnergyConsumptionFromJob] Where updatedOn Between '${startDate}' AND '${endDate}'`
        } else if (req.body.filter == 'week') {
            startDate = moment(new Date()).startOf('week').toISOString()
            endDate = moment(new Date()).endOf('week').toISOString()
            query = `Select * from [EnergyConsumptionFromJob] Where updatedOn Between '${startDate}' AND '${endDate}'`
        } else if (req.body.filter == 'month') {
            startDate = moment(new Date()).startOf('month').toISOString()
            endDate = moment(new Date()).endOf('month').toISOString()
            query = `Select * from [EnergyConsumptionFromJob] Where updatedOn Between '${startDate}' AND '${endDate}'`
        } else {
            query = `Select * from [EnergyConsumptionFromJob] where Device_ID = '${deviceID.deviceID}' order by updatedOn `
        }


        request.query(query, function (err, set) {
            if (err) {
                //console.log(err)

                res.status(400)
                res.json({
                    success: false,
                    message: "Something bad has happened"
                })

            } else {
                // //console.log("sucess",set)
                let finalResult = []
                // let result = set.recordsets[0]


                let endDate = new Date().toISOString()





                //console.log("sucess")
                let result = set.recordsets[0]
                let days = []
                let energyConsumed = "0"

                result.forEach((element, index) => {

                    element.updatedOn = moment(element.updatedOn).format('MM/DD/YYYY')
                    element.EnergyConsumed = (Number(element.EnergyConsumed) * .408).toFixed(2)


                })




                let resultFinal = groupBy(result, 'updatedOn')

                let groupedData = []

                Object.keys(resultFinal).forEach(element => {

                    groupedData.push(resultFinal[element][resultFinal[element].length - 1])

                })

                result = groupedData

                let maxdayenergy = 0

                result.forEach(element => {
                    maxdayenergy = (Number(maxdayenergy) + Number(element.EnergyConsumed)).toFixed(2)
                })

                let ab = moment(new Date()).subtract('6', 'days').format('YYYY-MM-DD')
                let bb = moment(new Date()).format('YYYY-MM-DD')

                console.log('bb', bb)
                console.log('ab', ab)

                let todaysenergy = 0
                let final = []
                for (var m = moment(ab); m.diff(bb, 'days') <= 0; m.add(1, 'days')) {

                    // console.log("mmm", m.day())
                    let isAvailable = false
                    result.forEach(element => {


                        // console.log("elemen", element)

                        if (moment(element.updatedOn).format('YYYY-MM-DD') == m.format('YYYY-MM-DD')) {
                            final.push({
                                day: m.format('dddd'),
                                energyConsumed: element.EnergyConsumed.toString(),
                                color: ''
                            })
                            if (moment(new Date()).format('YYYY-MM-DD') == m.format('YYYY-MM-DD')) {
                                todaysenergy = (Number(todaysenergy) + Number(element.EnergyConsumed)).toFixed(2)
                            }

                            isAvailable = true

                        }

                    })
                    if (!isAvailable) {
                        final.push({
                            day: m.format('dddd'),
                            energyConsumed: "0",
                            color: ''
                        })
                    }
                }


                let total = 0
                final.forEach(element => {

                    total = (Number(total) + Number(element.energyConsumed)).toFixed(2)

                })



                let startDate1 = moment(new Date()).startOf('month').toDate()
                let endDate1 = moment(new Date()).endOf('month').toDate()

                var a = moment(moment(startDate1).format('YYYY-MM-DD'));
                var b = moment(moment(endDate1).format('YYYY-MM-DD'));

                for (var m = moment(a); m.diff(b, 'days') <= 0; m.add(1, 'days')) {

                    let isAvailable = false


                    result.forEach(element => {
                        // //console.log(moment(element.updatedOn).date())
                        if (moment(element.updatedOn).format("MM/DD/YYYY") == m.format("MM/DD/YYYY")) {
                            finalResult.push({
                                day: m.date().toString(),
                                energyConsumed: element.EnergyConsumed,
                                dayString: m.format("dddd"),

                                color: ''
                            })
                            isAvailable = true
                        }
                    })
                    if (!isAvailable) {
                        finalResult.push({
                            day: m.date().toString(),
                            dayString: m.format("dddd"),

                            energyConsumed: 0,
                            color: ''
                        })
                    }
                }

                let finalResult1 = []
                finalResult.forEach(element => {
                    element.energyConsumed = Number(element.energyConsumed).toFixed(2)
                    finalResult1.push(element)
                })



                // //console.log("finalResult", finalResult1)
                let totalMonthly = 0
                finalResult1.forEach(element => {

                    totalMonthly = (Number(totalMonthly) + Number(element.energyConsumed)).toFixed(2)


                })

                // 


                let temp = []

                let monthsCount = Number(req.body.month)


                for (let i = 0; i < monthsCount; i++) {

                    temp[i] = {
                        "month": moment(new Date()).subtract(i, 'month').format("MMM"),
                        "Year": moment(new Date()).subtract(i, 'month').format("YYYY"),
                        "energyConsumed": "0"
                    }
                    result.forEach((element) => {
                        if (moment(element.created_On).format("MMM") == temp[i].month &&
                            moment(element.created_On).format("YYYY") == temp[i].Year) {
                            temp[i].energyConsumed = (Number(temp[i].energyConsumed) + Number(element.EnergyConsumed)).toFixed(2)

                        }
                    })

                }

                let totalTrend = 0
                temp.forEach(element => {

                    totalTrend = totalTrend + Number(element.energyConsumed)

                })



                let weeklyMax = 0, weeklyMin = 0
                final.forEach(element => {
                    //console.log("max", element.energyConsumed)
                    if (weeklyMax < element.energyConsumed) {
                        weeklyMax = element.energyConsumed
                    }
                })
                let MinArrayWeek = []

                finalResult1.forEach(element => {
                    if (element.energyConsumed != 0)
                        MinArrayWeek.push(element)
                })

                weeklyMin = MinArrayWeek.reduce(function (prev, curr) {
                    return prev.energyConsumed < curr.energyConsumed ? prev : curr;
                });
                weeklyMin = weeklyMin.energyConsumed
                // console.log("min", monthlyMin.energyConsumed)

                let factor = (weeklyMax - weeklyMin) / 3

                final.forEach(element => {

                    let color = getColor(element.energyConsumed, weeklyMin, factor)
                    // //console.log("color", color)
                    element.color = color

                })

                let monthlyMax = 0, monthlyMin = 0
                finalResult1.forEach(element => {
                    // //console.log("max", element.energyConsumed)
                    if (monthlyMax < element.energyConsumed) {
                        monthlyMax = element.energyConsumed
                    }
                })
                let index11 = 0

                MinArray = []

                finalResult1.forEach(element => {
                    if (element.energyConsumed != 0)
                        MinArray.push(element)
                })

                monthlyMin = MinArray.reduce(function (prev, curr) {
                    return prev.energyConsumed < curr.energyConsumed ? prev : curr;
                });
                monthlyMin = monthlyMin.energyConsumed
                console.log("min", monthlyMin.energyConsumed)
                // finalResult1.forEach((element, index) => {
                //     if (element.energyConsumed != 0) {

                //         index11 = index

                //         if (index == index11)
                //             monthlyMin = element.energyConsumed

                //         if (monthlyMin < element.energyConsumed) {
                //             monthlyMin = element.energyConsumed
                //         }



                //     }

                // })

                console.log("monthlyMax - monthlyMin", monthlyMax, monthlyMin)

                let factorMonthly = (monthlyMax - monthlyMin) / 3

                finalResult1.forEach(element => {

                    let color = getColor(element.energyConsumed, monthlyMin, factorMonthly)
                    //console.log("color", color)
                    element.color = color

                })

                final.forEach(element => {

                    if (element.day == moment(new Date()).format("dddd")) {

                        element.day = 'Today'

                    }

                })



                res.status(200)
                res.json({
                    success: true,
                    MonthlyResult: finalResult1,
                    message: "Consumption Details",
                    TotalEnergySpendMonthly: Number(totalMonthly).toFixed(2),
                    TotalMoneySpendMonthly: ((Number(totalMonthly) / .408) * .23).toFixed(2),
                    ThresholdMonthly: ((Number(factorMonthly) + (Number(monthlyMin) + Number(factorMonthly)))).toFixed(2),

                    WeeklyResult: final,
                    TotalEnergySpendWeekle: Number(total).toFixed(2),
                    TotalMoneySpendWeekly: ((Number(total) / .408) * .23).toFixed(2),
                    ThresholdWeekly: ((Number(factor) + (Number(weeklyMin) + Number(factor)))).toFixed(2),

                    TrendResult: temp,
                    TotalEnergySpendTrend: Number(totalTrend).toFixed(2),
                    TotalMoneySpendTrend: ((Number(totalTrend) / .408) * .23).toFixed(2),
                    ThresholdTrend: ((Number(factorMonthly) + (Number(monthlyMin) + Number(factorMonthly)))).toFixed(2),
                    TotalEnergySpendToday: todaysenergy.toString(),
                    TotalMoneySpendToday: ((Number(todaysenergy) / .408) * .23).toFixed(2),
                    TotalMoneySpendmax: ((Number(maxdayenergy) / .408) * .23).toFixed(2),
                    TotalEnergySpendmax: Number(maxdayenergy).toFixed(2).toString(),
                    installationDate: deviceID.installationDate,
                    status: status

                })




                // res.status(200)
                // res.json({
                //     success: true,
                //     result: {
                //         energyConsumed: Number(energyConsumed).toFixed(2),
                //         moneySpent: (Number(energyConsumed) * .23).toFixed(2)
                //     },
                //     message: "Filtered Successfully",

                // })


                // res.send(finalResult1)
            }
        })

    } else {
        res.status(200)
        res.json({
            success: false,
            message: "No Device ID is mapped with this user",
            status: status
        })

    }

})

router.post('/updateDeviceID/:deviceID/:orderID', function (req, res) {

    let query = `update OrderList set deviceID='${req.params.deviceID}' where OrderNo = '${req.params.orderID}' `

    request.query(`Select * from orderList where OrderNo = '${req.params.orderID}'`, function (err, response) {

        console.log('if', err)

        let userID = response.recordset[0].UserId
        let orderID = response.recordset[0].Id
        let deviceID = req.params.deviceID

        let insertquery = `INSERT INTO [dbo].[DeviceMapping]
    ([userID]
    ,[orderID]
    ,[deviceID]
    ,[addedOn])
VALUES
    (${userID}
    ,${orderID}
    ,'${deviceID}'
    ,'${new Date().toISOString()}')`
        let updateQuery = `update DeviceMapping set deviceID = '${deviceID}' where userID = ${userID} and orderID = ${orderID} `
        // console.log(insertquery)

        request.query(`Select * From DeviceMapping where userID = ${userID} and orderID = ${orderID}`, function (err, responseM) {
            if (responseM.recordset.length) {
                request.query(updateQuery, function (err, response) {

                    if (!err) {

                        request.query(query, function (err, recordset) {

                            if (!err) {
                                res.json({
                                    success: true
                                })
                            } else {
                                console.log("err", err)
                            }

                        })

                    }

                    console.log(err)

                })

            } else {
                request.query(insertquery, function (err, response) {

                    if (!err) {

                        request.query(query, function (err, recordset) {

                            if (!err) {
                                res.json({
                                    success: true
                                })
                            } else {
                                console.log("err", err)
                            }

                        })

                    }

                    console.log(err)

                })
            }
        })






    })



})
router.post('/updateBaselineValue/:baseValue/:orderID', function (req, res) {

    let query = `update OrderList set baselineValue='${req.params.baseValue}' where OrderNo = '${req.params.orderID}' `

    request.query(query, function (err, recordset) {

        if (!err) {
            res.json({
                success: true
            })
        } else {
            console.log("err", err)
        }

    })



})




function datediff(first, second) {

    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}
function parseDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
}



module.exports = router;