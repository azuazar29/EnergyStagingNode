var express = require('express');
var router = express.Router();

var sql = require("../database");
var request = new sql.Request();


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

module.exports = router;