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





router.get('/energyConsumption', function (req, res) {

    request.query('Select * From energyconsumptionfromjob', function (err, response) {

        let result = groupBy(response.recordsets[0], 'DeviceName')

        res.json({
            success: true,
            result: result
        })

    })

})

function getColor(value, min, factor) {


    // console.log(value, min, factor)

    if (value >= min && value <= (min + factor)) {
        return lightGreen
    } else if (value > (min + factor) && value <= factor + (min + factor)) {
        return green
    } else if (value > factor + (min + factor)) {
        return red
    } else if (value == 0) {
        return grey
    }

}

router.post('/getEnergyConsumption', function (req, res) {


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
        query = `Select * from [EnergyConsumptionFromJob] where Device_ID = 'bf664ad3a1ff7085d7pyvr' order by updatedOn `
    }
    //console.log('start, ends', startDate, endDate)



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

            let ab = moment(new Date()).subtract('7', 'days').format('YYYY-MM-DD')
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
                            energyConsumed: element.EnergyConsumed,
                            color: ''
                        })
                        isAvailable = true
                    }
                })
                if (!isAvailable) {
                    finalResult.push({
                        day: m.date().toString(),
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
                        temp[i].energyConsumed = (Number(temp[i].energyConsumed) + Number(element.EnergyConsumed)).toFixed(2)

                    }
                })
            })

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



            res.status(200)
            res.json({
                success: true,
                MonthlyResult: finalResult1,
                message: "Consumption Details",
                TotalEnergySpendMonthly: Number(total).toFixed(2),
                TotalMoneySpendMonthly: ((Number(total)) * .023).toFixed(2),
                ThresholdMonthly: 75 * 30,
                WeeklyResult: final,
                TotalEnergySpendWeekle: total.toFixed(2),
                TotalMoneySpendWeekly: ((Number(total)) * .23).toFixed(2),
                ThresholdWeekly: 75 * 7,
                TrendResult: temp,
                TotalEnergySpendTrend: Number(total).toFixed(2),
                TotalMoneySpendTrend: ((Number(total)) * .023).toFixed(2),
                ThresholdTrend: 75 * Number(month) * 30,
                TotalEnergySpendToday: todaysenergy,
                TotalMoneySpendToday: ((Number(todaysenergy)) * .23).toFixed(2),
                TotalMoneySpendmax: ((Number(maxdayenergy)) * .23).toFixed(2),
                TotalEnergySpendmax: maxdayenergy.toString(),
                installationDate: '15-10-2022'
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


})

router.post('/getEnergyConsumptionByCO2', function (req, res) {


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
        query = `Select * from [EnergyConsumptionFromJob] where Device_ID = 'bf664ad3a1ff7085d7pyvr' order by updatedOn `
    }
    //console.log('start, ends', startDate, endDate)



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
                element.EnergyConsumed = element.EnergyConsumed * .408


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

            let ab = moment(new Date()).subtract('7', 'days').format('YYYY-MM-DD')
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
                            energyConsumed: element.EnergyConsumed,
                            color: ''
                        })
                        isAvailable = true
                    }
                })
                if (!isAvailable) {
                    finalResult.push({
                        day: m.date().toString(),
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
                        temp[i].energyConsumed = (Number(temp[i].energyConsumed) + Number(element.EnergyConsumed)).toFixed(2)

                    }
                })
            })

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



            res.status(200)
            res.json({
                success: true,
                MonthlyResult: finalResult1,
                message: "Consumption Details",
                TotalEnergySpendMonthly: Number(total).toFixed(2),
                TotalMoneySpendMonthly: ((Number(total) / .408) * .023).toFixed(2),
                ThresholdMonthly: 75 * 30,
                WeeklyResult: final,
                TotalEnergySpendWeekle: total.toFixed(2),
                TotalMoneySpendWeekly: ((Number(total) / .408) * .23).toFixed(2),
                ThresholdWeekly: 75 * 7,
                TrendResult: temp,
                TotalEnergySpendTrend: Number(total).toFixed(2),
                TotalMoneySpendTrend: ((Number(total) / .408) * .023).toFixed(2),
                ThresholdTrend: 75 * Number(month) * 30,
                TotalEnergySpendToday: todaysenergy,
                TotalMoneySpendToday: ((Number(todaysenergy) / .408) * .23).toFixed(2),
                TotalMoneySpendmax: ((Number(maxdayenergy) / .408) * .23).toFixed(2),
                TotalEnergySpendmax: maxdayenergy.toString(),
                installationDate: '15-10-2022'
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


})




function datediff(first, second) {

    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}
function parseDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
}



module.exports = router;