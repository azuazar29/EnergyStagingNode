var express = require('express');
var router = express.Router();

var sql = require("../database");
var request = new sql.Request();

const moment = require("moment")



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
        query = 'Select * from [EnergyConsumptionFromJob]'
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
            // let result = set.recordsets[0]


            let startDate = moment(new Date()).subtract("7", 'days')
            let endDate = new Date().toISOString()


            let startDate1 = moment(new Date()).startOf('month').format("MM/DD/YYYY")
            let endDate1 = moment(new Date()).format("MM/DD/YYYY")


            console.log("sucess")
            let result = set.recordsets[0]
            let days = []
            let energyConsumed = "0"
            result.forEach(element => {
                energyConsumed = Number(energyConsumed) + Number(element.EnergyConsumed)
            })
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
                    if (day.day == moment(element.updatedOn).day()) {
                        final[i].energyConsumed = (Number(final[i].energyConsumed) + Number(element.EnergyConsumed)).toFixed(2)
                    }
                })

            })
            let total = 0
            final.forEach(element => {

                // element.color = getColor(Number(element.energyConsumed).toFixed(2))
                total = total + Number(element.energyConsumed)

            })

            // console.log('result', result)

            let diff = datediff(parseDate(startDate1), parseDate(endDate1)) + 1

            console.log("diff", diff)

            for (let i = 0; i < diff; i++) {
                finalResult[i] = 0

                finalResult[i] = {
                    day: i + 1,
                    energyConsumed: "0"
                }

                result.forEach(element => {
                    console.log(moment(element.updatedOn).date())
                    if (moment(element.updatedOn).date() == i + 1) {
                        finalResult[i].energyConsumed = Number(finalResult[i].energyConsumed) + Number(element.EnergyConsumed)
                    }
                })
            }

            let finalResult1 = []
            finalResult.forEach(element => {
                element.energyConsumed = Number(element.energyConsumed).toFixed(2)
                finalResult1.push(element)
            })



            console.log("finalResult", finalResult1)
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





            res.status(200)
            res.json({
                success: true,
                MonthlyResult: finalResult1,
                message: "Consumption Details",
                TotalEnergySpendMonthly: Number(total).toFixed(2),
                TotalMoneySpendMonthly: Number(total * .023).toFixed(2),
                Threshold: 75 * 30,
                WeeklyResult: final,
                TotalEnergySpendWeekle: total.toFixed(2),
                TotalMoneySpendWeekly: Number(total * .023).toFixed(2),
                Threshold: 75 * 7,
                TrendResult: temp,
                TotalEnergySpendTrend: Number(total).toFixed(2),
                TotalMoneySpendTrend: Number(total * .023).toFixed(2),
                Threshold: 75 * Number(month) * 30,
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