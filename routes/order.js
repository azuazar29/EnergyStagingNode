
var express = require('express');
var router = express.Router();
var sql = require("../database");
var request = new sql.Request();
const moment = require("moment")
const { check, oneOf, validationResult } = require('express-validator');
const { json } = require('body-parser');
const e = require('express');
var filePath = require('../config/filePath')
const multer = require('multer');
const { promises } = require('stream');
var fs = require('fs')
const json2csv = require('json2csv').parse;
const middleware = require("../middleware/token-auth");
const { resolve } = require('path');


var storage = multer.diskStorage({
    destination: async function (req, files, callback) {
        //console.log("req", files)
        var data = JSON.parse(req.body.data)
        var filepath = "public/images/" + data.Manufacturer.replace(/ /g, '') + "_" + data.ModelNo.replace(/ /g, '')
        // //console.log("filepath",filePath)
        await createFolder(filepath)

        callback(null, filepath);
    },
    filename: function (req, file, callback) {
        //console.log("name", file);
        callback(null, file.fieldname + file.originalname.substr(file.originalname.indexOf('.')))
    }
});


var storageEff = multer.diskStorage({
    destination: async function (req, file, callback) {

        var data = JSON.parse(req.body.data)
        // //console.log(data)
        var filepath = "public/Eff/" + data.ProductName.replace(/ /g, '') + "-" + data.ModelNo.replace(/ /g, '')
        await createFolder(filepath)
        callback(null, filepath);
    },
    filename: function (req, file, callback) {
        let name = file.originalname
        var data = JSON.parse(req.body.data)
        ////console.log("name", name.substr(name.lastIndexOf('.')))
        callback(null, data.ProductName + "-" + new Date().getTime() + name.substr(name.lastIndexOf('.')))
    }
});
function createFolder(filepath) {
    return new Promise(async function (resolve, reject) {
        // var filepath = pdfpath + folderName
        fs.access(filepath, async function (err) {
            if (err && err.code === 'ENOENT') {
                //console.log("filepath", filepath)
                if (fs.existsSync(filepath)) {
                    //console.log("it came here")
                    resolve()
                } else {
                    fs.mkdir(filepath, (err) => {
                        //console.log(err, "err")
                        if (err) {

                            resolve();
                        }

                        resolve()
                    }); //Create dir in case not found
                }

            } else {
                resolve();
            }

        });
    })
}
var upload = multer({ storage: storage }).any();
var uploadEff = multer({ storage: storageEff }).single('document');


router.get("/GetDashboardDetails", function (req, res) {

    let query = `Select * from dbo.OrderList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }

    //console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            let pendingOrder = []
            let OrderModification = []
            let Installation = []
            let totalOrderAmount = 0
            result.forEach(response => {

                totalOrderAmount = totalOrderAmount + Number(response.OrderTotal)

                if (response.OrderStatus == "PE") {
                    pendingOrder.push(response)
                }
                if (response.OrderStatus == "OM") {
                    OrderModification.push(response)
                }
                if (response.orderFlow == "IN") {
                    Installation.push(response)
                }
            });
            let tempOrder = pendingOrder
            tempOrder = tempOrder.sort(function (a, b) { return b.OrderDate - a.OrderDate });

            tempOrder.forEach(element => {

                element.OrderDate = moment(element.OrderDate).format("DD MMM, hh:mm")

            })

            if (req.query.Startdate) {
                let previous_datecount = Math.ceil((new Date() - new Date(req.query.Startdate)) / (1000 * 60 * 60 * 24))
                if (req.query.Enddate) {
                    previous_datecount = Math.ceil((new Date(req.query.Enddate) - new Date(req.query.Startdate)) / (1000 * 60 * 60 * 24))
                }
                let previousdate = moment(new Date(req.query.Startdate)).subtract(previous_datecount, 'days').toISOString()



                // ////console.log(previousdate)
                //    ////console.log("previous_date",previousdate)
                query2 = `Select * from dbo.OrderList where OrderDate between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}'`
                ////console.log("query2", query2)
                request.query(query2, function (err, set) {
                    if (err) {
                        ////console.log("err", err)
                        res.status(400)
                        res.json({
                            success: false,
                            message: err.originalError.info.message
                        })

                    } else {
                        let previousresult = set.recordset.length
                        let query3 = `Select * from EnergyConsumptionFromJob`

                        if (req.query.Startdate && req.query.Enddate) {
                            query3 = `${query3} where updatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
                        }
                        if (req.query.Startdate && !req.query.Enddate) {
                            query3 = `${query3} where updatedON between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
                        }
                        ////console.log("query3", query3)
                        request.query(query3, function (err, set) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err.originalError.info.message
                                })
                            }
                            else {
                                let energyconsumption = set.recordset

                                let query4 = `Select * from EnergyConsumptionFromJob where updatedOn between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}'`
                                ////console.log("query4", query4)
                                request.query(query4, function (err, set) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: err.originalError.info.message
                                        })
                                    }
                                    else {
                                        let previousEnegryConsumption = set.recordset
                                        let query5 = `Select * from dbo.Customer_New`

                                        if (req.query.Startdate && req.query.Enddate) {
                                            query5 = `${query5} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
                                        }
                                        if (req.query.Startdate && !req.query.Enddate) {
                                            query5 = `${query5} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
                                        }

                                        query5 = query5 + ` and isFromWeb <> '1'`

                                        ////console.log("query5", query5)
                                        request.query(query5, function (err, set) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: err.originalError.info.message
                                                })
                                            }
                                            else {
                                                let customerList = set.recordset.length
                                                query6 = `Select * from dbo.Customer_New where CreatedOn between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}' and isFromWeb <> '1'`
                                                ////console.log("query6", query6)
                                                request.query(query6, function (err, set) {
                                                    if (err) {
                                                        res.json({
                                                            success: false,
                                                            message: err.originalError.info.message
                                                        })

                                                    }
                                                    else {
                                                        let perviousCustomerList = set.recordset.length

                                                        let query5 = `Select * from OrderList`

                                                        if (req.query.Startdate && req.query.Enddate) {
                                                            query5 = `${query5} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}' `
                                                        }
                                                        if (req.query.Startdate && !req.query.Enddate) {
                                                            query5 = `${query5} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}' `
                                                        }
                                                        ////console.log("query5", query5)
                                                        request.query(query5, function (err, set) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: err.originalError.info.message
                                                                })
                                                            } else {
                                                                let OrderDetails = set.recordset
                                                                let salescount = 0
                                                                OrderDetails.forEach(element => {
                                                                    salescount = salescount + Number(element.OrderTotal)

                                                                });

                                                                request.query(`Select * from OrderList where OrderDate between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}' and OrderStatus = 'CO'`, function (err, set) {
                                                                    if (err) {
                                                                        res.json({
                                                                            success: false,
                                                                            message: err.originalError.info.message
                                                                        })
                                                                    } else {

                                                                        let perviousOrderList = set.recordset
                                                                        let previousSalescount = 0
                                                                        perviousOrderList.forEach(e => {
                                                                            previousSalescount = previousSalescount + Number(e.OrderTotal)
                                                                        });
                                                                        res.status(200)
                                                                        //console.log('previousresult', salescount, previousSalescount)



                                                                        res.json({
                                                                            success: true,
                                                                            message: "Successfully got form GetOrdersList",
                                                                            totalorder: result.length,
                                                                            pendingOrder: tempOrder.slice(0, 4),
                                                                            pendingOrderslength: tempOrder.length,
                                                                            Installation: Installation.length,
                                                                            OrderModification: OrderModification.length,
                                                                            previousorderresult: getString(PlusorNot(result.length, previousresult) + (result.length > 0 ? Number((result.length - previousresult) * 100 / result.length).toFixed(2) : 0) + "%"),

                                                                            energyconsumption: energyconsumption.length,
                                                                            previousEnegryConsumption: getString(PlusorNot(energyconsumption.length, previousEnegryConsumption.length) + (energyconsumption.length > 0 ? Number((energyconsumption.length - previousEnegryConsumption.length) * 100 / energyconsumption.length).toFixed(2) : 0) + "%"),
                                                                            customerList: customerList,
                                                                            perviousCustomerList: getString(PlusorNot(customerList, perviousCustomerList) + (customerList > 0 ? Number((customerList - perviousCustomerList) * 100 / customerList).toFixed(2) : 0) + "%"),
                                                                            salesDetails: totalOrderAmount,
                                                                            previousSalesDetails: getString(PlusorNot(totalOrderAmount, previousSalescount) + (totalOrderAmount > 0 ? Number((salescount - previousSalescount) * 100 / totalOrderAmount).toFixed(2) : 0) + "%")


                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })

                                                    }

                                                })



                                            }

                                        })


                                    }
                                })


                            }
                        })




                    }
                })
            }
            else {
                res.status(200)
                res.json({
                    success: true,
                    message: "Successfully got form GetOrdersList",
                    total: result.length,
                    pendingOrder: pendingOrder,
                    Installation: Installation.length,
                    OrderModification: OrderModification.length
                })
            }

        }
    })

})
function getString(val) {

    if (val.toString() == "-0%" || val.toString() == "+0%") {
        return "0%"
    } else {
        return val.toString().replace("--", "-")
    }


}
function PlusorNot(x, y) {
    if (x > y) {
        return "+"
    }
    else {
        return "-"
    }
}
function checkisnan(num) {

    if (isNaN(parseFloat(num))) {
        return 0
    } else {
        return num
    }

}

router.get("/GetOrderParticularDetails", (req, res) => {
    let query = `Select * from dbo.OrderList where Id=${req.query.OrderIndex}`
    request.query(query, function (err, set) {
        if (err) { res.status(400) }
        let productId = set.recordset[0].ProductId
        let userId = set.recordset[0].UserId
        query = `Select * from dbo.CondensorList where Id=${productId}`
        request.query(query, function (err1, set1) {
            if (err1) { res.status(400) }
            let fcuId = set1.recordset[0].id
            query = `Select * from dbo.FCU_New where CondenserId=${fcuId}`
            request.query(query, function (err2, set2) {
                if (err2) { res.status(400) }
                query = `Select * from dbo.Customer_New where userID=${userId}`
                request.query(query, function (err3, set3) {
                    if (err3) { res.status(400) }
                    res.json({
                        success: true,
                        orderDetail: set.recordset,
                        condensorDetail: set1.recordset,
                        fcuDetail: set2.recordset,
                        customerDetail: set3.recordset
                    })
                });
            })
        })
    })
});

router.get("/GetOrdersList", function (req, res) {

    let query = `Select da.mapAddress, OrderList.*,sm.installationDate,sm.InstallationDay,sm.installationSlot,sm.installationStatus,sm.visitDate,
    sm.visitDay,sm.visitSlot,sm.visitStatus,sm.orderID as smOrderID, da.address1,da.address2,da.bAddress1,da.bAddress2,da.bAddress3,da.contactNumber,da.email,da.isPrimary,da.name,cart.* from dbo.OrderList    
        inner join Cart on dbo.OrderList.Id = Cart.orderID
        inner join subscriptionmanagement as sm on  sm.orderID = dbo.OrderList.Id    
        left join DeliveryAddress as da on OrderList.UserId = da.userID`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.OrderType) {
        ////console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and OrderType ='${req.query.OrderType}' `
        }
        else {
            ////console.log("comming 2")
            query = `${query} where OrderType ='${req.query.OrderType}' `
        }

    }
    if (req.query.OrderStatus) {
        if (req.query.Startdate || req.query.OrderType) {
            query = `${query} and OrderStatus ='${req.query.OrderStatus}' `
        }
        else {
            query = `${query} where OrderStatus ='${req.query.OrderStatus}' `
        }
    }
    //console.log(query)
    query = query + ' ' + 'ORDER BY OrderDate DESC;'


    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset

            result.forEach(element => {

                if (element.isSubscription == false) {

                    let price = 0

                    let prodDetails = JSON.parse(element.product_Id)

                    prodDetails.FCUDetails.forEach(elementFCU => {
                        price = price + Number(elementFCU.price)
                    })
                    prodDetails.CondensorDetails.forEach(elementC => {
                        price = price + Number(elementC.price)
                    })
                    element.down_Payment = ((Number(price) * 7 / 100) + Number(price)).toFixed(2)

                    element.base_MonthlyRent = 0.00
                }

                if (element.OrderStatus == 'OM') {
                    element.OrderStatus = "Assigned to O&M"
                } else if (element.OrderStatus == 'CO') {
                    element.OrderStatus = "Completed"
                } else if (element.OrderStatus == 'CA') {
                    element.OrderStatus = "Cancelled"
                } else if (element.OrderStatus == 'PE') {
                    element.OrderStatus = "Pending"
                } else if (element.OrderStatus == 'IN') {
                    element.OrderStatus = "Installation"
                } else if (element.OrderStatus == 'DI') {
                    element.OrderStatus = "Dispatched"
                }

                if (element.OrderType == 'O') {
                    element.OrderType = "One time"
                } else if (element.OrderType == 'S') {
                    element.OrderType = "Subscription"
                }

                if (element.LastModifiedDate == null) {
                    element.LastModifiedDate = "NA"
                }


                element.OrderDate = moment(element.OrderDate).format("DD MMM YYYY")


            })


            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetOrdersList",
                result: result
            })

        }
    })

})
router.get("/ExportOrdersList", function (req, res) {

    let query = `Select * from dbo.OrderList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.OrderType) {
        ////console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and OrderType ='${req.query.OrderType}' `
        }
        else {
            ////console.log("comming 2")
            query = `${query} where OrderType ='${req.query.OrderType}' `
        }

    }
    if (req.query.OrderStatus) {
        if (req.query.Startdate || req.query.OrderType) {
            query = `${query} and OrderStatus ='${req.query.OrderStatus}' `
        }
        else {
            query = `${query} where OrderStatus ='${req.query.OrderStatus}' `
        }
    }
    ////console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset

            result.forEach(element => {

                if (element.OrderStatus == 'OM') {
                    element.OrderStatus = "Assigned to O&M"
                } else if (element.OrderStatus == 'CO') {
                    element.OrderStatus = "Completed"
                } else if (element.OrderStatus == 'CA') {
                    element.OrderStatus = "Cancelled"
                } else if (element.OrderStatus == 'PE') {
                    element.OrderStatus = "Pending"
                } else if (element.OrderStatus == 'IN') {
                    element.OrderStatus = "Installation"
                } else if (element.OrderStatus == 'DI') {
                    element.OrderStatus = "Dispatched"
                }

                if (element.LastModifiedDate == null) {
                    element.LastModifiedDate = "NA"
                }


                element.OrderDate = moment(new Date()).format("DD MMM YYYY")


            })

            result.forEach(element => {

                delete element.AssignedOnDate
                delete element.AssignedTo
                delete element.Id
                delete element.LastModifiedDate

            })

            const csvString = json2csv(result);
            res.setHeader('Content-disposition', 'attachment; filename=Orders-report.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csvString);



        }
    })

})
router.get("/GetOrdersOverviewTopCount", function (req, res) {

    let query = `Select * from dbo.OrderList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    ////console.log(query)
    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            let pending_Status = []
            let Cancelled_Status = []
            let Assingnedto_OandM_Status = []
            let todayOrder = 0

            result.forEach(res => {

                if (moment(new Date(res.OrderDate)).format("MM/DD/YYYY") == moment(new Date()).format("MM/DD/YYYY")) {
                    todayOrder = todayOrder + 1
                }
                if (res.OrderStatus == "PE") {

                    pending_Status.push(res)
                }
                else if (res.OrderStatus == "CO") {
                    Assingnedto_OandM_Status.push(res)
                }
                else if (res.OrderStatus == "CA") {
                    Cancelled_Status.push(res)
                }

            });

            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetOrdersOverviewTopCount",
                Total: todayOrder,
                pending_Status: pending_Status.length,
                Assingnedto_OandM_Status: Assingnedto_OandM_Status.length,
                Cancelled_Status: Cancelled_Status.length

            })

        }
    })

})
router.get("/GetCustomerList", function (req, res) {

    let query = `Select * from dbo.Customer_New`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.CustomerType) {
        ////console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and CustomerType ='${req.query.CustomerType}' `
        }
        else {
            ////console.log("comming 2")
            query = `${query} where CustomerType ='${req.query.CustomerType}' `
        }

    }
    if (req.query.PurchaseType) {
        if (req.query.Startdate || req.query.CustomerType) {
            query = `${query} and PurchaseType ='${req.query.PurchaseType}' `
        }
        else {
            query = `${query} where PurchaseType ='${req.query.PurchaseType}' `
        }
    }

    //console.log(query)
    query = query + ` and isFromWeb <> '1'`
    query = query + ' ' + 'ORDER BY createdOn DESC;'

    //console.log("query", query)

    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            result.forEach(element => {

                if (element.CustomerType == 'AS') {
                    element.CustomerType = "Active"
                } else if (element.CustomerType == 'OT') {
                    element.CustomerType = "One Time User"
                } else if (element.CustomerType == 'L') {
                    element.CustomerType = "Lead"
                }

                if (element.LastModifiedDate) {
                    element.LastModifiedDate = "NA"
                }




                element.CreatedOn = moment(element.CreatedOn).format("DD MMM YYYY")
                element.LastService = moment(element.LastService).format("DD MMM YYYY")
                element.paymentDueDate = moment(element.paymentDueDate).format("DD MMM YYYY")
                element.paymentDate = moment(element.paymentDate).format("DD MMM YYYY")

                if (element.CustomerType == 'SO') {
                    element.CustomerType = "Subscription Overdue"
                    element.paymentDate = "NA"

                }
                if (element.CustomerType == 'Lead') {
                    element.paymentDate = "NA"
                    element.paymentDueDate = "NA"
                    element.paymentAmount = "NA"

                }


            })

            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetOrdersList",
                result: result
            })




        }
    })

})
router.get("/ExportCustomerList", function (req, res) {

    let query = `Select * from dbo.Customer_New`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.CustomerType) {
        ////console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and CustomerType ='${req.query.CustomerType}' `
        }
        else {
            ////console.log("comming 2")
            query = `${query} where CustomerType ='${req.query.CustomerType}' `
        }

    }
    if (req.query.PurchaseType) {
        if (req.query.Startdate || req.query.CustomerType) {
            query = `${query} and PurchaseType ='${req.query.PurchaseType}' `
        }
        else {
            query = `${query} where PurchaseType ='${req.query.PurchaseType}' `
        }
    }

    query = query + ` and isFromWeb <> '1'`


    //console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset

            result.forEach(element => {

                if (element.CustomerType == 'AS') {
                    element.CustomerType = "Active"
                } else if (element.CustomerType == 'OT') {
                    element.CustomerType = "One Time User"
                } else if (element.CustomerType == 'SW') {
                    element.CustomerType = "Subscription Withdrawn"
                } else if (element.CustomerType == 'L') {
                    element.CustomerType = "Lead"
                }

                if (element.LastModifiedDate) {
                    element.LastModifiedDate = "NA"
                }


                element.CreatedOn = moment(new Date()).format("DD MMM YYYY")
                element.LastService = moment(new Date()).format("DD MMM YYYY")


            })

            const csvString = json2csv(result);
            res.setHeader('Content-disposition', 'attachment; filename=Customer-report.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csvString);






        }
    })

})
router.get("/GetCustomerOverviewTopCount", function (req, res) {

    let query = `Select * from dbo.Customer_New`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    query = query + ` and isFromWeb <> '1'`
    ////console.log(query)
    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            let Subcribers = []
            let SubcriptionOverdue = []
            let lead = []
            let SubcriptionWithdrawn = []
            result.forEach(res => {
                if (res.CustomerType == "AS") {

                    Subcribers.push(res)
                } if (res.CustomerType) {
                    if (res.CustomerType == "OT") {
                        SubcriptionOverdue.push(res)
                    }
                    else if (res.CustomerType == "L") {
                        lead.push(res)
                    }
                    else if (res.CustomerType == "SW") {
                        SubcriptionWithdrawn.push(res)
                    }
                }


            });

            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetCustomersOverviewTopCount",
                Total: result.length,
                Subcribers: Subcribers.length,
                SubcriptionOverdue: SubcriptionOverdue.length,
                lead: lead.length,
                SubcriptionWithdrawn: SubcriptionWithdrawn.length

            })

        }
    })

})
router.get('/ProductCategory', function (req, res) {

    let query = `Select * from ProductCategory`
    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset


            res.status(200)
            res.json({
                success: true,
                message: "Product List",
                result: result
            })

        }
    })

})

router.get('/deleteProduct/:id', function (req, res) {

    let query = `update CondensorList set deleted = '1',isActive = 'No' where id = ${req.params.id}`

    request.query(query, function (err, result) {
        if (!err) {
            res.json({
                success: true
            })
        } else {
            res.json({
                success: false
            })
        }
    })

})

router.post("/AddProductDetails", upload,
    function (req, res) {
        try {

            let data = JSON.parse(req.body.data)
            let cPath = ''
            //console.log("files", req.files.length)
            if (req.files.length) {

                req.files.forEach(element => {
                    if (element.fieldname == data.ProductName) {
                        cPath = element.destination + '/' + element.filename
                    }
                })
            }

            let query = `INSERT INTO CondensorList
                ([ProductName]
                ,[ProductCategory]             
                ,[Quantity]
                ,[Price]
                ,[ProductCode]
                ,[Brand]
                ,[ProductTax]
                ,[CoolingCapacity]
                ,[PowerConsumption]
                ,[CurrentRating]
                ,[FCUCapacity]
                ,[EfficiencyProfile]
                
                ,[IsActive]
                ,[createdOn]       
                ,[Tags]
                ,[ImagePath]
                ,[ModelNo],[deleted])
          VALUES
                (
                '${data.ProductName ? data.ProductName : ""}',
                '${data.ProductCategory ? data.ProductCategory : ""}',
              
                '${data.Quantity ? data.Quantity : '1'}',
                '${data.Price ? data.Price : "0.00"}',
                '${data.ProductCode ? data.ProductCode : ""}',
                '${data.Manufacturer ? data.Manufacturer : ''}',
                '${data.ProductTax ? data.ProductTax : ""}',
                '${data.CoolingCapacity ? data.CoolingCapacity : ""}',
                '${data.PowerConsumption ? data.PowerConsumption : ""}',
                '${data.CurrentRating ? data.CurrentRating : ''}',
                '${data.CoolingCapacity ? data.CoolingCapacity : ""}',
                '${data.EfficiencyProfile ? JSON.stringify(data.EfficiencyProfile) : ''}',               
                'Yes',
                '${new Date().toISOString()}', 
                '${data.Tags ? JSON.stringify(data.Tags) : ""}',
                '${cPath}',
                '${data.ModelNo}',''
                ) SELECT SCOPE_IDENTITY() as id`
            console.log(query)
            request.query(query, function (err, set) {
                if (err) {



                    // //console.log("err", err)
                    res.status(400)
                    res.json({
                        success: false,
                        message: err.originalError.info.message
                    })

                } else {



                    let query = `
                    INSERT INTO [dbo].[efficiency_profile_new]
                               ([condensorID]
                               ,[efficiencyDetails])
                         VALUES
                               ('${set.recordset[0].id}'
                               ,'${data.EfficiencyProfile ? JSON.stringify(data.EfficiencyProfile) : ''}'
                               )`

                    request.query(query, function (err, responseeFF) {

                        console.log(err, responseeFF)

                    })

                    if (err) {
                        return res.send("Error uploading file.");
                    } else {
                        let FcuDetails = data.FCUdetails
                        let promise = []
                        FcuDetails.forEach(element => {

                            promise.push(addProducts(element, req, set.recordset[0].id))

                        });
                        Promise.all(promise).then(responsePromise => {
                            res.status(200)
                            res.json({
                                success: true,
                                message: "Product Added successfully"
                            })
                        }).catch(err => {
                            //console.log("err", err)
                            res.json({
                                success: false,
                                message: "Error in adding product",

                            })
                        })
                    }
                }
            })
        } catch (err) {

            //console.log("body", err)

        }

    })

function addProducts(element, req, ID) {
    return new Promise((resolve, reject) => {

        let imagePath = ''
        if (req.files.length) {

            req.files.forEach(elementImage => {
                //console.log("(elementImage.fieldname", elementImage.fieldname, element.FCUName)
                if (elementImage.fieldname == element.FCUName) {
                    imagePath = elementImage.destination + '/' + elementImage.filename
                }
            })
        }
        //console.log("imagePath", imagePath)
        let query2 = `INSERT INTO [dbo].[FCU_New]
                            ([FCUCode]
                            ,[FCUName]
                            ,[Type]
                            ,[Model]
                            ,[Color]
                            ,[FCU]
                            ,[IdealTemperature]
                            ,[PowerConsumption]
                            ,[CompressorType]
                            ,[CondensorCoil]
                            ,[IndoorDimention]
                            ,[OutdoorDimention]
                            ,[Rating],
                            [ImagePath],
                            [CondenserId])
                        VALUES
                            (
                            '${element.FCUCode ? element.FCUCode : 'NULL'}',
                            '${element.FCUName ? element.FCUName : 'NULL'}', 
                            '${element.Type ? element.Type : 'NULL'}', 
                            '${element.Model ? element.Model : 'NULL'}', 
                            '${element.Color ? element.Color : 'NULL'}', 
                            '${element.FCU ? element.FCU : 'NULL'}', 
                            '${element.IdealTemperature ? element.IdealTemperature : 'NULL'}', 
                            '${element.PowerConsumption ? element.PowerConsumption : 'NULL'}', 
                            '${element.CompressorType ? element.CompressorType : 'NULL'}', 
                            '${element.CondensorCoil ? element.CondensorCoil : 'NULL'}', 
                            '${element.IndoorDimention ? element.IndoorDimention : 'NULL'}', 
                            '${element.OutdoorDimention ? element.OutdoorDimention : 'NULL'}', 
                            '${element.Rating ? element.Rating : "NULL"}',
                            '${imagePath ? imagePath : 'NULL'}',
                            '${ID}') SELECT SCOPE_IDENTITY() as id`
        // //console.log("query", query2)
        request.query(query2, function (err, set) {
            if (err) {
                //console.log("error", err)
                resolve(false)
            } else {

                resolve(true)
            }
        })

    })
}





router.post('/uploadEfficiencyProfile', function (req, res) {

    ////console.log("req.body.data",req.body)
    uploadEff(req, res, function (err) {

        if (err) {
            ////console.log("error",err)
            return res.send("Error uploading file.");
        } else {
            ////console.log("req", req.file)
            const csvFilePath = req.file.path
            const csv = require('csvtojson')
            csv()
                .fromFile(csvFilePath)
                .then((jsonObj) => {
                    console.log("json Obj", jsonObj)
                    let isValid = false
                    jsonObj.forEach((element, index) => {



                        if (index == 0) {

                            Object.keys(element).forEach(key => {
                                if (key == "Cooling_Capacity" || key == "Power_Input" || key == "COP") {
                                    isValid = true
                                } else {
                                    isValid = false
                                }
                            })

                        }

                    })

                    console.log('isValid', isValid)

                    if (isValid) {
                        res.json({
                            success: true,
                            result: jsonObj
                        })
                    } else {
                        res.json({
                            success: false,
                            result: "Invalid format. Please upload a efficiency profile with given format."
                        })
                    }


                }).catch(err => {
                    res.json({
                        success: true,
                        errorDEscription: err
                    })
                })

        }

    })


})
router.get("/GetProductDetails", function (req, res) {

    let query = `Select * from dbo.CondensorList`
    // if (req.query.Startdate && req.query.Enddate) {
    //     query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).add('1', 'day').subtract(10, 'minute').toISOString()}'`
    // }
    // if (req.query.Startdate && !req.query.Enddate) {
    //     query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    // }
    if (req.query.ProductName) {
        // ////console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and ProductName ='${req.query.ProductName}' `
        }
        else {
            // ////console.log("comming 2")
            query = `${query} where ProductName ='${req.query.ProductName}' `
        }

    }
    if (req.query.ProductCategory) {
        if (req.query.Startdate || req.query.ProductName) {
            query = `${query} and ProductCategory ='${req.query.ProductCategory}' `
        }
        else {
            query = `${query} where ProductCategory ='${req.query.ProductCategory}' `
        }
    }
    if (req.query.ProductInventory) {
        if (req.query.Startdate || req.query.ProductName || req.query.ProductCategory) {
            query = `${query} and ProductInventory ='${req.query.ProductInventory}' `
        }
        else {
            query = `${query} where ProductInventory ='${req.query.ProductInventory}' `
        }
    }

    ////console.log(query)

    query = query + ' ORDER BY createdOn DESC;'
    console.log("query", query)

    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            let ProductInventory = 'In Stock'
            result.forEach(element => {

                if (element.Quantity > 1) {
                    ProductInventory = 'In Stock'
                } else if (element.Quantity == 1) {
                    ProductInventory = 'Limited'
                } else {
                    ProductInventory = 'Out Of Stock'
                }
                element.ProductInventory = ProductInventory


                if (element.createdOn)
                    element.CreatedOn = moment(new Date(element.createdOn)).format("DD MMM YYYY")
                else
                    element.createdOn = 'NULL'





            });


            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetProductList",
                result: result
            })

        }
    })

})
router.get("/ExportProductDetails", function (req, res) {

    let query = `Select * from dbo.CondensorList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.ProductName) {
        // ////console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and ProductName ='${req.query.ProductName}' `
        }
        else {
            // ////console.log("comming 2")
            query = `${query} where ProductName ='${req.query.ProductName}' `
        }

    }
    if (req.query.ProductCategory) {
        if (req.query.Startdate || req.query.ProductName) {
            query = `${query} and ProductCategory ='${req.query.ProductCategory}' `
        }
        else {
            query = `${query} where ProductCategory ='${req.query.ProductCategory}' `
        }
    }
    if (req.query.ProductInventory) {
        if (req.query.Startdate || req.query.ProductName || req.query.ProductCategory) {
            query = `${query} and ProductInventory ='${req.query.ProductInventory}' `
        }
        else {
            query = `${query} where ProductInventory ='${req.query.ProductInventory}' `
        }
    }

    ////console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            result.forEach(element => {

                element.CreatedOn = moment(new Date(element.CreatedOn)).format("DD MMM YYYY")




            });

            const csvString = json2csv(result);
            res.setHeader('Content-disposition', 'attachment; filename=Product-report.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csvString);


        }
    })

})
router.get("/getOrderChart", function (req, res) {
    let Startdate = new Date(req.query.Startdate)
    let Enddate = new Date(req.query.Enddate)
    if (!Enddate) {
        Enddate = new Date()
    }
    let query = `Select * from dbo.OrderList where OrderDate between '${new Date(Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    if (Startdate) {
        let i = moment(Startdate).format("YYYY-MM-DD")
        let array = []
        do {
            let day = moment(i).format('DD/M')
            // if (day == moment(new Date()).format('DD/M')) {
            //     day = 'Today'
            // }
            let obj = { Day: day, SubCount: 0, OneCount: 0 }
            array.push(obj)
            ////console.log("i", i)
            i = moment(i).add(1, "days").format("YYYY-MM-DD")

        }
        while (i <= moment(Enddate).format("YYYY-MM-DD"));


        request.query(query, function (err, set) {
            if (err) {
                ////console.log("err", err)
                res.status(400)
                res.json({
                    success: false,
                    message: err.originalError.info.message
                })

            } else {

                let result = set.recordset
                array.forEach((arr, i) => {

                    result.forEach(element => {

                        if (arr.Day == moment(element.OrderDate).format("DD/M")) {
                            if (element.OrderType == "S") {
                                array[i].SubCount = array[i].SubCount + 1

                            }
                            if (element.OrderType == "O") {
                                array[i].OneCount = array[i].OneCount + 1

                            }
                        }
                    });

                })
                let complete = []
                let cancel = []
                let install = []
                let dispatched = []
                let pending = []
                let Processing = []
                let OM = []
                result.forEach(res => {
                    if (res.OrderStatus == "CA") {
                        cancel.push(res)
                    }
                    if (res.OrderStatus == "CO") {
                        complete.push(res)

                    } if (res.orderFlow == "IN") {
                        pending.push(res)

                    } if (res.OrderStatus == "DI") {
                        dispatched.push(res)

                    } if (res.orderFlow == "OR") {
                        pending.push(res)

                    } if (res.orderFlow == "SV") {
                        pending.push(res)

                    }
                    if (res.OrderStatus == "OM") {
                        OM.push(res)

                    }
                })
                let OrderStatus = {

                    Pending: !isNaN((100 * pending.length / result.length).toFixed(2)) ? (100 * pending.length / result.length).toFixed(2) : 0,
                    Completed: !isNaN((100 * complete.length / result.length).toFixed(2)) ? (100 * complete.length / result.length).toFixed(2) : 0,

                    Cancelled: !isNaN((100 * cancel.length / result.length).toFixed(2)) ? (100 * cancel.length / result.length).toFixed(2) : 0,

                }

                array.forEach(element => {
                    if (element.Day == moment(new Date()).format('DD/M')) {
                        element.Day = "Today"
                    }
                })


                res.json({ success: true, result: array, OrderStatus })

            }
        })

    }
    else {
        res.json({ success: false, msg: "Startdate Required" })
    }
})
router.get("/getCustomerChart", function (req, res) {
    let Startdate = new Date(req.query.Startdate)
    let Enddate = new Date(req.query.Enddate)
    if (!Enddate) {
        Enddate = new Date()
    }

    let query = `Select * from dbo.Customer_New where CreatedOn between '${new Date(Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}' and isFromWeb <> '1'`
    //console.log("custoemr chart query", query)
    if (Startdate) {
        let i = moment(new Date(Startdate)).format("YYYY-MM-DD")
        let array = []

        do {
            let day = moment(i).format('DD/M')
            // if (day == moment(new Date()).format('DD/M')) {
            //     day = 'Today'
            // }
            let obj = { Day: day, Count: 0 }
            array.push(obj)
            ////console.log("i", i)
            i = moment(i).add(1, "days").format("YYYY-MM-DD")

        }
        while (i <= moment(Enddate).format("YYYY-MM-DD"));

        //console.log("array", array)

        request.query(query, function (err, set) {
            if (err) {
                ////console.log("err", err)
                res.status(400)
                res.json({
                    success: false,
                    message: err.originalError.info.message
                })

            } else {


                let result = set.recordset

                array.forEach((arr, i) => {


                    result.forEach(element => {

                        if (arr.Day == moment(element.CreatedOn).format("DD/M")) {

                            array[i].Count = array[i].Count + 1



                        }
                    });

                })



                let array2 = []

                let previous_datecount = Math.ceil((new Date() - new Date(Startdate)) / (1000 * 60 * 60 * 24))
                if (Enddate) {
                    previous_datecount = Math.ceil((new Date(Enddate) - new Date(Startdate)) / (1000 * 60 * 60 * 24))
                }
                ////console.log(previous_datecount)
                let previousdate = moment(new Date(req.query.Startdate)).subtract(previous_datecount, 'days').toISOString()

                let j = moment(new Date(Startdate)).subtract(previous_datecount, 'days').format("YYYY-MM-DD")
                let date1 = moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()
                do {
                    let obj = { Day: moment(j).format("DD/M"), Count: 0 }
                    array2.push(obj)

                    j = moment(j).add(1, "days").format("YYYY-MM-DD")

                }
                while (j <= moment(date1).format("YYYY-MM-DD"));
                let ActiveS = []
                let Lead = []
                let OneT = []
                let SusW = []

                result.forEach(res => {
                    if (res.CustomerType == "AS") {
                        ActiveS.push(res)
                    }
                    if (res.CustomerType == "OT") {
                        OneT.push(res)

                    } if (res.CustomerType == "L") {
                        Lead.push(res)

                    } if (res.CustomerType == "SW") {
                        SusW.push(res)

                    }
                })
                let CustomerStatus = {

                    ["Subscriber"]: !isNaN((100 * ActiveS.length / result.length).toFixed(2)) ? (100 * ActiveS.length / result.length).toFixed(2) : 0,
                    ["One-Time"]: !isNaN((100 * OneT.length / result.length).toFixed(2)) ? (100 * OneT.length / result.length).toFixed(2) : 0,
                    Leads: !isNaN((100 * Lead.length / result.length).toFixed(2)) ? (100 * Lead.length / result.length).toFixed(2) : 0,

                }
                let query2 = `Select * from dbo.Customer_New where CreatedOn between '${previousdate}'  and  '${moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()}' and isFromWeb <> '1'`
                //console.log("Query is", query2)
                request.query(query2, function (err, set) {
                    if (err) {
                        ////console.log("err", err)
                        res.status(400)
                        res.json({
                            success: false,
                            message: err.originalError.info.message
                        })

                    } else {
                        let result2 = set.recordset

                        array2.forEach((arr, i) => {
                            let count = 0

                            result2.forEach(element => {

                                if (arr.Day == moment(element.CreatedOn).format("DD/M")) {

                                    array2[i].Count = array2[i].Count + 1



                                }
                            });

                        })


                        array.forEach(element => {
                            if (element.Day == moment(new Date()).format('DD/M')) {
                                element.Day = "Today"
                            }
                        })
                        res.json({ success: true, result: array, CustomerStatus, previousresult: array2 })
                    }
                })




            }
        })

    }
    else {
        res.json({ success: false, msg: "Startdate Required" })
    }
})
router.get("/BrandSegment", function (req, res) {
    let query = `SELECT ProductName, COUNT(id)  AS count
    FROM CondensorList
    GROUP BY ProductName`
    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset


            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetProductList",
                result: result
            })

        }
    })
})
router.get("/productBrandSegment", function (req, res) {
    let query = `SELECT ProductName, COUNT(id)  AS count
    FROM ProductDetails
    GROUP BY ProductName`
    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            let total = 0
            result.forEach(element => {
                total = total + element.count
            });

            result.forEach((res) => {

                res.ProductPercentage = (res.count * 100 / total).toFixed(2)

            })

            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetProductList",

                total: total,
                result: result
            })

        }
    })
})
router.get("/getDashBoardChart", function (req, res) {
    let Startdate = new Date(req.query.Startdate)
    let Enddate = new Date(req.query.Enddate)
    if (!Enddate) {
        Enddate = new Date()
    }
    let query = `Select * from OrderList where OrderDate between '${new Date(Startdate).toISOString()}'  and  '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}' `


    if (Startdate) {
        let i = moment(Startdate).format("YYYY-MM-DD")
        let array = []


        do {
            let day = moment(i).format('DD/M')
            // if (day == moment(new Date()).format('DD/M')) {
            //     day = 'Today'
            // }
            let obj = { Day: day, Count: 0, amount: 0 }
            array.push(obj)

            //console.log("i", i)
            i = moment(i).add(1, "days").format("YYYY-MM-DD")

        }
        while (i <= moment(Enddate).format("YYYY-MM-DD"));


        request.query(query, function (err, set) {
            if (err) {
                ////console.log("err", err)
                res.status(400)
                res.json({
                    success: false,
                    message: err.originalError.info.message
                })

            } else {


                let result = set.recordset
                array.forEach((arr, i) => {
                    let count = 0

                    result.forEach(element => {

                        if (arr.Day == moment(element.OrderDate).format("DD/M")) {

                            array[i].Count = array[i].Count + 1
                            array[i].amount = Number(Number(array[i].amount) + Number(element.OrderTotal)).toFixed(2)



                        }
                    });

                })
                let array2 = []


                let previous_datecount = Math.ceil((new Date() - new Date(Startdate)) / (1000 * 60 * 60 * 24))
                if (Enddate) {
                    previous_datecount = Math.ceil((new Date(Enddate) - new Date(Startdate)) / (1000 * 60 * 60 * 24))
                }
                console.log("previous_datecount", previous_datecount)
                let previousdate = moment(new Date(req.query.Startdate)).subtract(previous_datecount, 'days').toISOString()

                let j = moment(new Date(Startdate)).subtract(previous_datecount, 'days').format("YYYY-MM-DD")
                let date1 = moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()
                do {
                    let day = moment(j).format('DD/M')
                    if (day == moment(new Date()).format('DD/M')) {
                        day = 'Today'
                    }
                    let obj = { Day: day, Count: 0, amount: 0 }
                    array2.push(obj)

                    j = moment(j).add(1, "days").format("YYYY-MM-DD")

                }
                while (j <= moment(date1).format("YYYY-MM-DD"));

                console.log("array2", array2)


                let query2 = `Select * from OrderList where OrderDate between '${previousdate}'  and  '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}' `
                request.query(query2, async function (err, set) {
                    if (err) {
                        ////console.log("err", err)
                        res.status(400)
                        res.json({
                            success: false,
                            message: err.originalError.info.message
                        })

                    } else {
                        let result2 = set.recordset
                        array2.forEach((arr, i) => {
                            let count = 0

                            result2.forEach(element => {
                                if (arr.Day == moment(element.OrderDate).format("DD/M")) {
                                    array2[i].Count = array2[i].Count + 1
                                    array2[i].amount = Number(Number(array2[i].amount) + Number(element.OrderTotal)).toFixed(2)
                                }
                            });

                        })

                        let array3 = await getEnergyDetails(req.query.Startdate, req.query.Enddate)
                        let array4 = await getEnergyDetails(previousdate, moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString())

                        array.forEach(element => {
                            if (element.Day == moment(new Date()).format('DD/M')) {
                                element.Day = "Today"
                            }
                        })

                        let tempArray = array

                        // array.forEach(element => {

                        //     tempArray.push({
                        //         Day: element.Day,
                        //         Count: element.Count != 0 ? Number(element.amount) / Number(element.Count).toFixed(2) : 0
                        //     })

                        // })
                        res.json({
                            success: true,
                            sales: tempArray,
                            previoussales: array2,
                            energyconsumption: array3.array,
                            previousEnegryConsumption: array4.array,
                            totalEnergyConsumption: Number(array3.total).toFixed(2),
                            totalPreviousConsumption: getString(PlusorNot(Number(array3.total).toFixed(2), Number(array4.total).toFixed(2)) + (Number(array3.total).toFixed(2) > 0 ? Number((Number(array3.total).toFixed(2) - Number(array4.total).toFixed(2)) * 100 / Number(array3.total).toFixed(2)).toFixed(2) : 0) + "%")

                        })



                    }
                })




            }
        })

    }
    else {
        res.json({ success: false, msg: "Startdate Required" })
    }
})
function getEnergyDetails(startDate, endDate) {


    return new Promise((resolve, reject) => {

        let query

        query = `Select * from [EnergyConsumptionFromJob] order by updatedOn `

        //console.log('start, ends', startDate, endDate)



        request.query(query, function (err, set) {
            if (err) {
                console.log("err", err)

            } else {


                // console.log("set.recordsets", set.recordsets[0])

                let result = set.recordsets[0]


                result.forEach((element, index) => {

                    element.updatedOn = moment(element.updatedOn).format('MM/DD/YYYY')

                })




                let resultFinal = groupBy(result, 'updatedOn')

                // console.log(resultFinal)

                let groupedData = []

                Object.keys(resultFinal).forEach(element => {

                    let data = groupBy(resultFinal[element], 'Device_ID')
                    Object.keys(data).forEach(elementInner => {
                        groupedData.push(data[elementInner][data[elementInner].length - 1])
                    })

                    // groupedData.push(resultFinal[element][resultFinal[element].length - 1])

                })








                let ab = moment(startDate).format('YYYY-MM-DD')
                let bb = moment(endDate).format('YYYY-MM-DD')

                let final = []
                for (var m = moment(ab); m.diff(bb, 'days') <= 0; m.add(1, 'days')) {

                    // console.log("mmm", m.day())
                    let isAvailable = false
                    groupedData.forEach(element => {


                        // console.log("elemen", element)

                        if (moment(element.updatedOn).format('YYYY-MM-DD') == m.format('YYYY-MM-DD')) {
                            final.push({
                                Day: m.format('DD/M'),
                                Energy: element.EnergyConsumed.toString(),

                            })


                            isAvailable = true

                        }

                    })
                    if (!isAvailable) {
                        final.push({
                            Day: m.format('DD/M'),
                            Energy: "0",

                        })
                    }
                }

                let finalGroup = groupBy(final, 'Day')

                let finalArray = []

                Object.keys(finalGroup).forEach(element => {

                    let obj = {
                        Day: element,
                        Energy: 0
                    }

                    finalGroup[element].forEach(elementInner => {
                        obj.Energy = (Number(obj.Energy) + Number(elementInner.Energy)).toFixed(2)
                    })

                    finalArray.push(obj)


                })

                console.log("final array", finalArray)

                let total = 0

                finalArray.forEach((element, index) => {

                    if (element.Energy != 0) {
                        if (index == 0) {
                            total = Number(element.Energy)

                        } else {
                            total = total + (Number(element.Energy))

                        }

                    }

                })
                console.log('total', total)

                resolve({ array: finalArray, total: total })



            }
        })
    })





}
router.get("/TopProductdetails", function (req, res) {
    let query = `select CondensorList.Quantity, OrderList.ProductId, OrderList.OrderTotal, CondensorList.productName from OrderList inner join CondensorList on OrderList.ProductId = CondensorList.Id and OrderList.OrderStatus='CO' and 
   OrderList.OrderDate between  '${new Date(req.query.Startdate).toISOString()}' and '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`

    //console.log("query topprodcust", query)
    request.query(query, function (err, set) {
        if (err) {
            ////console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordsets[0]
            let result2 = groupBy(result, "ProductId")
            let array = []
            Object.keys(result2).forEach(function (i) {
                let obj = { "ProductName": result2[i][0].productName, "ProductId": result2[i][0].ProductId, "ProductSalesPercentage": Number(100 * result2[i].length / result2[i][0].Quantity), "ProductQuantity": result2[i][0].Quantity }
                let amt = 0
                if (result2[i].length > 1) {

                    result2[i].forEach(element => {
                        amt = amt + Number(element.OrderTotal)
                    });
                    obj = { "ProductName": result2[i][0].productName, "ProductId": result2[i][0].ProductId, "ProductSalesPercentage": Number(100 * result2[i].length / result2[i][0].Quantity).toFixed(2), "Sales": amt, "ProductQuantity": result2[i][0].Quantity, "SaleCount": result2[i].length }
                }
                else {
                    obj = { "ProductName": result2[i][0].productName, "ProductId": result2[i][0].ProductId, "ProductSalesPercentage": Number(100 * result2[i].length / result2[i][0].Quantity).toFixed(2), "Sales": result2[i][0].OrderTotal, "ProductQuantity": result2[i][0].Quantity, "SaleCount": result2[i].length }
                }

                array.push(obj)
                array.sort(dynamicSort("SaleCount"))

            });
            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetProductList",


                result: array
            })

        }
    })
})
router.get("/GetMapdetails", function (req, res) {
    let Startdate = new Date(req.query.Startdate)

    let Enddate = new Date(req.query.Enddate)
    if (!Enddate) {
        Enddate = new Date()
    }

    let query = `SELECT EnergyConsumption.product_Name,EnergyConsumption.energy,	EnergyConsumption.created_on,Customer_New.ServiceLocation,Customer_New.Id
    FROM Customer_New
    INNER JOIN EnergyConsumption
    ON Customer_New.Id = EnergyConsumption.user_ID and Customer_New.isFromWeb <> '1'
     `
    if (Startdate) {
        query = `${query}and created_on between '${new Date(Startdate).toISOString()}' and '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
    }
    // //console.log("query",query)
    request.query(query, function (err, set) {
        if (err) {
            //console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {
            let data = []
            data = set.recordset
            let result = groupBy(data, "ServiceLocation")
            let energy = []

            Object.keys(result).forEach(function (i) {
                // //console.log(i)
                let obj = {}
                let energy1 = 0
                result[i].forEach(ele => {


                    energy1 = energy1 + Number(ele.energy)
                    //    //console.log(energy1)
                    let location = ele.ServiceLocation
                    obj.value = Number(energy1).toFixed(2)
                    var loc = location.split(",")
                    //console.log("loc", loc)
                    if (loc.length > 1) {
                        obj.lat = loc[0]
                        obj.long = loc[1].trim()
                    } else {
                        obj.lat = ""
                        obj.long = ""
                    }

                    obj.CreatedOn = ele.created_On
                })
                //   //console.log(obj)
                energy.push(obj)
            })
            let query1 = `SELECT OrderList.orderTotal,	OrderList.OrderDate,Customer_New.ServiceLocation,Customer_New.Id,OrderList.OrderStatus
               FROM Customer_New
               INNER JOIN OrderList
               ON Customer_New.Id = OrderList.userID and OrderStatus='CO' and Customer_New.isFromWeb <> '1'
                `
            if (Startdate) {
                query1 = `${query1}and OrderDate between '${new Date(Startdate).toISOString()}' and '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
            }
            request.query(query1, function (err, set) {
                if (err) {
                    //console.log("err", err)
                    res.status(400)
                    res.json({
                        success: false,
                        message: err.originalError.info.message
                    })

                } else {
                    let result2 = groupBy(set.recordset, "ServiceLocation")

                    let sales = []

                    Object.keys(result2).forEach(function (i) {
                        // //console.log(i)

                        let obj = {}

                        let OrderTotal = 0
                        result2[i].forEach(ele => {


                            OrderTotal = OrderTotal + Number(ele.orderTotal)
                            //    //console.log(energy1)
                            let location = ele.ServiceLocation
                            obj.value = "$" + Number(OrderTotal).toFixed(2)
                            var loc = location.split(",")
                            if (loc.length > 1) {
                                obj.lat = loc[0]
                                obj.long = loc[1].trim()
                            } else {
                                obj.lat = ""
                                obj.long = ""
                            }

                            obj.OrderDate = ele.OrderDate



                        })
                        sales.push(obj)


                    })
                    let query2 = `SELECT OrderList.orderTotal,	OrderList.OrderDate,Customer_New.ServiceLocation,Customer_New.Id,OrderList.OrderStatus
               FROM Customer_New
               INNER JOIN OrderList
               ON Customer_New.Id = OrderList.userID and OrderStatus='OM' and Customer_New.isFromWeb <> '1'
                `
                    if (Startdate) {
                        query2 = `${query2}and OrderDate between '${new Date(Startdate).toISOString()}' and '${moment(new Date(req.query.Enddate)).endOf('day').toISOString()}'`
                    }
                    request.query(query2, function (err, set) {
                        if (err) {
                            //console.log("err", err)
                            res.status(400)
                            res.json({
                                success: false,
                                message: err.originalError.info.message
                            })

                        } else {
                            mainreq = []
                            result3 = groupBy(set.recordset, "ServiceLocation")
                            Object.keys(result3).forEach(function (i) {
                                // //console.log(i)


                                let obj2 = {}
                                let count = 0

                                result3[i].forEach(ele => {


                                    count = result3[i].length
                                    obj2.value = count
                                    obj2.OrderDate = ele.OrderDate
                                    var loca = ele.ServiceLocation.split(",")
                                    obj2.lat = loca[0]
                                    obj2.long = loca[1].trim()





                                })
                                mainreq.push(obj2)


                            })
                            res.json({ success: true, energyconsumption: energy, Sales: sales, MaintenaceRequest: mainreq })
                        }
                    })
                }
            })



        }
    })

})
router.get("/GetProductSaleDetails", function (req, res) {

    let query = `Select * from cart where ISNULL(orderID, ' ') <> ' '`

    request.query(query, function (err, recordset) {

        let productsCU = []
        let productsFCU = []

        if (!err) {
            recordset.recordsets[0].forEach(element => {
                productsCU.push(JSON.parse(element.product_Id).CondensorDetails)
                productsFCU.push(JSON.parse(element.product_Id).FCUDetails)
            })

            let derivedCU = []
            let derivedFCU = []
            productsCU.forEach(element => {
                element.forEach(elementInner => {
                    derivedCU.push(elementInner)
                })
            })
            productsFCU.forEach(element => {
                element.forEach(elementInner => {
                    derivedFCU.push(elementInner)
                })
            })

            derivedCU = groupBy(derivedCU, "name")
            derivedFCU = groupBy(derivedFCU, "productName")

            let final = []

            Object.keys(derivedCU).forEach((key, index) => {

                final[index] = ({
                    productName: key,
                    productPrice: 0,
                    count: 0
                })

                derivedCU[key].forEach(element => {

                    final[index].productPrice = Number(final[index].productPrice) + (Number(element.count) * Number(element.price))
                    final[index].count = final[index].count + Number(element.count)
                })

            })
            let finalFCU = []
            Object.keys(derivedFCU).forEach((key, index) => {

                finalFCU[index] = ({
                    productName: key,
                    productPrice: 0,
                    count: 0
                })

                derivedFCU[key].forEach(element => {
                    console.log("element", element)

                    finalFCU[index].productPrice = Number(finalFCU[index].productPrice) + (Number(element.quantity) * Number(element.price))
                    finalFCU[index].count = finalFCU[index].count + Number(element.quantity)
                })

            })






            res.json({
                success: true,
                message: "Successfully got form GetProductList",
                PopularProductsFCUList: finalFCU,
                PopularProductsCondensorList: final

            })
        }

    })

    // let query = `select CondensorList.Quantity, OrderList.ProductId, OrderList.OrderTotal, CondensorList.productName, CondensorList.Brand 
    // from OrderList 
    // inner join CondensorList 
    // on OrderList.ProductId = CondensorList.id and OrderList.OrderStatus='CO'`

    // let queryFCU = `select  OrderList.ProductId, OrderList.OrderTotal, FCU_New.FCUName, FCU_New.Price, CondensorList.Brand
    // from OrderList 
    // inner join FCU_New 
    // on OrderList.ProductId = FCU_New.CondenserId and OrderList.OrderStatus='CO'
    // inner join CondensorList on CondensorList.id = FCU_New.CondenserId`


    // request.query(query, function (err, set) {
    //     if (err) {
    //         ////console.log("err", err)
    //         res.status(400)
    //         res.json({
    //             success: false,
    //             message: err.originalError.info.message
    //         })

    //     } else {

    //         let result = set.recordsets[0]
    //         let result2 = groupBy(result, "ProductId")
    //         let result3 = groupBy(result, "Brand")
    //         let array = [], arrayBrand = []
    //         let tempArray = [], tempArrayBrand = []
    //         Object.keys(result2).forEach(function (i) {
    //             let obj = { "ProductName": result2[i][0].productName, "ProductId": result2[i][0].ProductId, "ProductSalesPercentage": Number(100 * result2[i].length / result.length), "ProductQuantity": result2[i][0].Quantity }
    //             let amt = 0
    //             if (result2[i].length > 1) {

    //                 result2[i].forEach(element => {
    //                     amt = amt + Number(element.OrderTotal)
    //                 });
    //                 obj = { "ProductName": result2[i][0].productName, "ProductId": result2[i][0].ProductId, "ProductSalesPercentage": Number(100 * result2[i].length / result.length).toFixed(2), "Sales": amt, "ProductQuantity": result2[i][0].Quantity, "SaleCount": result2[i].length }
    //             }
    //             else {
    //                 obj = { "ProductName": result2[i][0].productName, "ProductId": result2[i][0].ProductId, "ProductSalesPercentage": Number(100 * result2[i].length / result.length).toFixed(2), "Sales": result2[i][0].OrderTotal, "ProductQuantity": result2[i][0].Quantity, "SaleCount": result2[i].length }
    //             }

    //             array.push(obj)
    //             array.sort(dynamicSort("SaleCount"))

    //             tempArray = array.sort(dynamicSort("SaleCount"))

    //         });
    //         Object.keys(result3).forEach(function (i) {
    //             let obj = { "ProductName": result3[i][0].Brand, "ProductId": result3[i][0].ProductId, "ProductSalesPercentage": Number(100 * result3[i].length / result.length), "ProductQuantity": result3[i][0].Quantity }
    //             let amt = 0
    //             if (result3[i].length > 1) {

    //                 result3[i].forEach(element => {
    //                     amt = amt + Number(element.OrderTotal)
    //                 });
    //                 obj = { "ProductName": result3[i][0].Brand, "ProductId": result3[i][0].ProductId, "ProductSalesPercentage": Number(100 * result3[i].length / result.length).toFixed(2), "Sales": amt, "ProductQuantity": result3[i][0].Quantity, "SaleCount": result3[i].length }
    //             }
    //             else {
    //                 obj = { "ProductName": result3[i][0].Brand, "ProductId": result3[i][0].ProductId, "ProductSalesPercentage": Number(100 * result3[i].length / result.length).toFixed(2), "Sales": result3[i][0].OrderTotal, "ProductQuantity": result3[i][0].Quantity, "SaleCount": result3[i].length }
    //             }

    //             arrayBrand.push(obj)

    //             arrayBrand.sort(dynamicSort("SaleCount"))

    //             tempArrayBrand = arrayBrand.sort(dynamicSort("SaleCount"))

    //         });
    //         let PopularProductsCondensor = tempArray
    //         let BrandSegmentCondensor = tempArrayBrand
    //         // res.status(200)
    //         // res.json({
    //         //     success: true,
    //         //     message: "Successfully got form GetProductList",         

    //         //     result:tempArray
    //         // })
    //         request.query(queryFCU, function (err, set) {
    //             if (err) {
    //                 ////console.log("err", err)
    //                 res.status(400)
    //                 res.json({
    //                     success: false,
    //                     message: err.originalError.info.message
    //                 })

    //             } else {

    //                 let result = set.recordsets[0]
    //                 let result2 = groupBy(result, "FCUName")
    //                 let result3 = groupBy(result, "Brand")
    //                 let array = [], arrayBrand = []
    //                 let tempArray = [], tempArrayBrand = []
    //                 Object.keys(result2).forEach(function (i) {
    //                     let obj = { "ProductName": result2[i][0].FCUName, "ProductSalesPercentage": Number(100 * result2[i].length / result.length) }
    //                     let amt = 0
    //                     if (result2[i].length > 1) {

    //                         result2[i].forEach(element => {
    //                             amt = amt + Number(element.Price)
    //                         });
    //                         obj = { "ProductName": result2[i][0].FCUName, "ProductSalesPercentage": Number(100 * result2[i].length / result.length).toFixed(2), "Sales": amt }
    //                     }
    //                     else {
    //                         obj = { "ProductName": result2[i][0].FCUName, "ProductSalesPercentage": Number(100 * result2[i].length / result.length).toFixed(2), "Sales": result2[i][0].Price }
    //                     }

    //                     array.push(obj)
    //                     array.sort(dynamicSort("ProductSalesPercentage"))

    //                     tempArray = array.sort(dynamicSort("ProductSalesPercentage"))

    //                 });
    //                 Object.keys(result3).forEach(function (i) {
    //                     let obj = { "ProductName": result3[i][0].Brand, "ProductSalesPercentage": Number(100 * result3[i].length / result.length) }
    //                     let amt = 0
    //                     if (result3[i].length > 1) {

    //                         result3[i].forEach(element => {
    //                             amt = amt + Number(element.Price)
    //                         });
    //                         obj = { "ProductName": result3[i][0].Brand, "ProductSalesPercentage": Number(100 * result3[i].length / result.length).toFixed(2), "Sales": Number(amt).toFixed(2) }
    //                     }
    //                     else {
    //                         obj = { "ProductName": result3[i][0].Brand, "ProductSalesPercentage": Number(100 * result3[i].length / result.length).toFixed(2), "Sales": Number(result3[i][0].Price).toFixed(2) }
    //                     }

    //                     arrayBrand.push(obj)
    //                     arrayBrand.sort(dynamicSort("ProductSalesPercentage"))

    //                     tempArrayBrand = arrayBrand.sort(dynamicSort("ProductSalesPercentage"))

    //                 });

    //                 let PopularProductsFCU = tempArray
    //                 let BrandSegmentFCU = tempArrayBrand
    //                 res.status(200)
    //                 res.json({
    //                     success: true,
    //                     message: "Successfully got form GetProductList",

    //                     result: {
    //                         PopularProductsFCUList: PopularProductsFCU,
    //                         PopularProductsCondensorList: PopularProductsCondensor,
    //                         BrandSegmentationCondensor: BrandSegmentCondensor,
    //                         BrandSegmentationFCU: BrandSegmentFCU

    //                     }
    //                 })

    //             }
    //         })

    //     }
    // })
})

router.get('/slots', function (req, res) {

    request.query(`Select * From Slots`, function (err, set) {

        if (!err) {
            res.json({
                success: true,
                message: "Slots details for Visit and Installation date",
                result: set.recordsets[0]
            })
        }


    })

})

function getOrderID(id) {

    return new Promise((resolve, reject) => {
        // //console.log("rqyert", `select Id from orderList where UserId = '${id}' and OrderStatus = 'PE'`)
        request.query(`select Id from orderList where UserId = '${id}' and OrderStatus = 'PE'`, function (err, recordset) {

            //console.log("err", err)
            if (recordset.recordset.length) {
                //console.log("res", id)

                resolve(recordset.recordset[0].Id)

            } else {
                resolve('')

            }

        })
    })



}
router.post('/updateSiteVisitDateByUser',
    [check("visitDay").exists()],
    middleware.authenticate, async function (req, res) {

        let orderID = await getOrderID(req.decoded.id)

        if (orderID != '') {
            request.query(`select * from SubscriptionManagement where userID = ${req.decoded.id} and orderID = ${orderID}`, function (err, recordset) {

                //console.log("err", err, recordset)

                if (recordset.recordsets[0].length) {
                    let query = `Update SubscriptionManagement
       
        set visitDay = '${JSON.stringify(req.body.visitDay)}' where userID =  ${req.decoded.id} and orderID = ${orderID}`

                    //console.log("query", query)

                    request.query(query, function (err, response) {

                        if (!err) {
                            res.json({
                                success: true,
                                message: "Successfully updated",
                                date: new Date()
                            })
                        } else {
                            //console.log("err", err)
                            res.json({
                                success: false,
                                message: "Error updating status"
                            })
                        }

                    })

                } else {
                    let query = `INSERT INTO [dbo].[SubscriptionManagement]
        ([visitDay],
        [visitStatus],[userID]
        ,[addedOn]
        ,[updatedOn],[orderID])
    VALUES
        ('${JSON.stringify(req.body.visitDay)}',
        1,${req.decoded.id},'${new Date().toISOString()}','${new Date().toISOString()}',${orderID})`

                    //console.log("query", query)

                    request.query(query, function (err, response) {

                        if (!err) {
                            res.json({
                                success: true,
                                message: "Successfully updated",
                                date: new Date()
                            })
                        } else {
                            //console.log("err", err)
                            res.json({
                                success: false,
                                message: "Error updating status"
                            })
                        }

                    })
                }

            })
        } else {
            res.json({
                success: false,
                message: 'No order found'
            })
        }





    })
router.post('/updateSiteVisitDateByAdmin/:userID/:orderID',
    [check("visitDate").exists(), check("visitSlot").exists()],
    function (req, res) {

        let query = `update SubscriptionManagement set visitDate = '${req.body.visitDate}',visitSlot = ${req.body.visitSlot}, visitStatus = 2, updatedOn='${new Date().toISOString()}' where userID = ${req.params.userID} and orderID = ${req.params.orderID}`

        request.query(query, function (err, response) {

            if (!err) {

                res.json({
                    success: true,
                    message: "Successfully updated",
                })
            } else {
                //console.log("err", err)
                res.json({
                    success: false,
                    message: "Error updating status"
                })
            }

        })

    })

router.post('/updateInstallationDateByUser',
    [check("installationDay").exists()],
    middleware.authenticate, async function (req, res) {

        let orderID = await getOrderID(req.decoded.id)

        if (orderID != '') {
            request.query(`select * from SubscriptionManagement where userID = ${req.decoded.id} and orderID = ${orderID}`, function (err, recordset) {

                //console.log("err", err, recordset)

                if (recordset.recordsets[0].length) {
                    let query = `Update SubscriptionManagement
       
        set installationDay = '${JSON.stringify(req.body.installationDay)}', installationStatus = '1'  where userID =  ${req.decoded.id} and orderID = ${orderID}`

                    //console.log("query", query)

                    request.query(query, function (err, response) {

                        if (!err) {
                            res.json({
                                success: true,
                                message: "Successfully updated",
                                date: new Date()
                            })
                        } else {
                            //console.log("err", err)
                            res.json({
                                success: false,
                                message: "Error updating status"
                            })
                        }

                    })

                } else {
                    let query = `INSERT INTO [dbo].[SubscriptionManagement]
        ([installationDay],
        [installationStatus],[userID]
        ,[addedOn]
        ,[updatedOn],[orderID])
    VALUES
        ('${JSON.stringify(req.body.installationDay)}',
        1,${req.decoded.id},'${new Date().toISOString()}','${new Date().toISOString()}',${orderID})`

                    //console.log("query", query)

                    request.query(query, function (err, response) {

                        if (!err) {
                            res.json({
                                success: true,
                                message: "Successfully updated",
                                date: new Date()
                            })
                        } else {
                            //console.log("err", err)
                            res.json({
                                success: false,
                                message: "Error updating status"
                            })
                        }

                    })
                }

            })
        } else {
            res.json({
                success: false,
                message: 'No order found'
            })
        }





    })
router.post('/updateinstallationDateByAdmin/:userID/:orderID',
    [check("installationDate").exists(), check("installationSlot").exists()],
    function (req, res) {

        let query = `update SubscriptionManagement set installationDate = '${req.body.installationDate}',installationSlot = ${req.body.installationSlot}, installationStatus = 2, updatedOn='${new Date().toISOString()}' where userID = ${req.params.userID} and orderID = ${req.params.orderID}`

        request.query(query, function (err, response) {



            if (!err) {
                res.json({
                    success: true,
                    message: "Successfully updated",
                })
            } else {
                //console.log("err", err)
                res.json({
                    success: false,
                    message: "Error updating status"
                })
            }

        })

    })

router.get('/subscriptionManagementDetails/:id', async function (req, res) {

    let orderID = await getOrderID(req.params.id)
    //console.log("orderID", orderID)

    if (orderID != '') {
        //console.log("orderID", orderID)

        let query = `Select o.OrderNo, sm.*, p.propertySize, p.totalRooms, c.product_Id as productDetails, c.total as totalAmount, c.subcription_Type, c.isSubscription  From SubscriptionManagement as sm
        inner join Cart as c on c.orderID = ${orderID}
        inner join OrderList as o on o.Id = ${orderID}
        LEFT JOIN UserConfiguration p ON (
               p.userID = ${req.params.id}
           AND NOT EXISTS (
             SELECT 1 FROM UserConfiguration p1
             WHERE p1.userID = ${req.params.id}
             AND p1.id > p.id
           )
        )
        where sm.userID = ${req.params.id} and sm.orderID  = ${orderID}
        
        `
        //console.log("order", query)

        request.query(query, function (err, recordset) {

            if (!err) {



                try {
                    recordset.recordset[0].productDetails = JSON.parse(recordset.recordset[0].productDetails)
                    recordset.recordset[0].propertySize = Number(recordset.recordset[0].propertySize).toFixed(2)

                    recordset.recordset[0].visitDay = JSON.parse(recordset.recordset[0].visitDay)

                    recordset.recordset[0].InstallationDay = JSON.parse(recordset.recordset[0].InstallationDay)
                    res.json({
                        success: true,
                        response: recordset.recordset[0],
                        message: "SubscriotionManagement details"
                    })
                } catch {
                    res.json({
                        success: true,
                        response: recordset.recordset[0],
                        message: "SubscriotionManagement details"
                    })
                }


            } else {
                res.json({
                    success: false,
                    message: err
                })
            }


        })
    } else {
        res.json({
            success: false,
            message: "This user doesn't has any pending order to proceed."
        })
    }



})

router.post('/updateOrderStatus/:userID/:orderID', function (req, res) {

    let status = req.body.status

    if (status == 'OR' || status == 'SV' || status == 'IN') {
        request.query(`update OrderList set orderFlow = '${status}' where UserId = '${req.params.userID}' and Id = '${req.params.orderID}'`, function (err, recordset) {

            request.query(`update OrderList set OrderStatus = 'PE' where UserId = '${req.params.userID}' and Id = '${req.params.orderID}'`)
            //console.log('err', err)
            if (!err) {
                res.json({
                    success: true,
                    message: 'Successfully updated.'
                })
            }

        })
    } else if (status == 'CO') {

        request.query(`update OrderList set orderFlow = '${status}' where UserId = '${req.params.userID}' and Id = '${req.params.orderID}'`, function (err, recordset) {

            request.query(`update OrderList set OrderStatus = '${status}' where UserId = '${req.params.userID}' and Id = '${req.params.orderID}'`)
            //console.log('err', err)
            if (!err) {
                res.json({
                    success: true,
                    message: 'Successfully updated.'
                })
            }

        })

    } else if (status == 'CA') {



        request.query(`update OrderList set OrderStatus = '${status}' where UserId = '${req.params.userID}' and Id = '${req.params.orderID}'`, function (err, response) {
            if (!err) {
                res.json({
                    success: true,
                    message: 'Successfully updated.'
                })
            }
        })
        //console.log('err', err)






    }

})





function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
}
var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


module.exports = router; 