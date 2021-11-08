
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

var storage = multer.diskStorage({
    destination: async function (req, file, callback) {

        var filepath = filePath.ProductImagePath + req.body.Id
        await createFolder(filepath)
        callback(null, filepath);
    },
    filename: function (req, file, callback) {
        // console.log("name",file);
        callback(null, file.originalname)
    }
});


var storageEff = multer.diskStorage({
    destination: async function (req, file, callback) {
        var data = JSON.parse(req.body.data)
        var filepath = filePath.EfficiencyProfilePath + data.ProductName.replace(/ /g, '') + "-" + data.ModelNo.replace(/ /g, '')
        await createFolder(filepath)
        callback(null, filepath);
    },
    filename: function (req, file, callback) {
        let name = file.originalname
        var data = JSON.parse(req.body.data)
        console.log("name", name.substr(name.lastIndexOf('.')))
        callback(null, data.ProductName + "-" + new Date().getTime() + name.substr(name.lastIndexOf('.')))
    }
});
function createFolder(filepath) {
    return new Promise(async function (resolve, reject) {
        // var filepath = pdfpath + folderName
        fs.access(filepath, async function (err) {
            if (err && err.code === 'ENOENT') {
                fs.mkdir(filepath, (err) => {
                    if (err) {
                        console.error(err);
                        resolve();
                    }
                    let res = "sucess"
                    // return res;
                    resolve()
                }); //Create dir in case not found
            } else {
                resolve();
            }

        });
    })
}
var upload = multer({ storage: storage }).array('document', 12);
var uploadEff = multer({ storage: storageEff }).single('document');


router.get("/GetDashboardDetails", function (req, res) {

    let query = `Select * from dbo.OrderList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }

    console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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
            result.forEach(res => {
                if (res.OrderStatus == "PE") {
                    pendingOrder.push(res)
                }
                if (res.OrderStatus == "OM") {
                    OrderModification.push(res)
                }
                if (res.OrderStatus == "IN") {
                    Installation.push(res)
                }
            });
            if (req.query.Startdate) {
                let previous_datecount = Math.ceil((new Date() - new Date(req.query.Startdate)) / (1000 * 60 * 60 * 24))
                if (req.query.Enddate) {
                    previous_datecount = Math.ceil((new Date(req.query.Enddate) - new Date(req.query.Startdate)) / (1000 * 60 * 60 * 24))
                }
                let previousdate = moment(new Date(req.query.Startdate)).subtract(previous_datecount, 'days').toISOString()



                // console.log(previousdate)
                //    console.log("previous_date",previousdate)
                query2 = `Select * from dbo.OrderList where OrderDate between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}'`
                console.log("query2", query2)
                request.query(query2, function (err, set) {
                    if (err) {
                        console.log("err", err)
                        res.status(400)
                        res.json({
                            success: false,
                            message: err.originalError.info.message
                        })

                    } else {
                        let previousresult = set.recordset.length
                        let query3 = `Select * from EnergyConsumption`

                        if (req.query.Startdate && req.query.Enddate) {
                            query3 = `${query3} where created_On between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
                        }
                        if (req.query.Startdate && !req.query.Enddate) {
                            query3 = `${query3} where created_On between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
                        }
                        console.log("query3", query3)
                        request.query(query3, function (err, set) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err.originalError.info.message
                                })
                            }
                            else {
                                let energyconsumption = set.recordset

                                let query4 = `Select * from EnergyConsumption where created_On between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}'`
                                console.log("query4", query4)
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
                                            query5 = `${query5} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
                                        }
                                        if (req.query.Startdate && !req.query.Enddate) {
                                            query5 = `${query5} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
                                        }
                                        console.log("query5", query5)
                                        request.query(query5, function (err, set) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: err.originalError.info.message
                                                })
                                            }
                                            else {
                                                let customerList = set.recordset.length
                                                query6 = `Select * from dbo.Customer_New where CreatedOn between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}'`
                                                console.log("query6", query6)
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
                                                            query5 = `${query5} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}' and OrderStatus = 'CO'`
                                                        }
                                                        if (req.query.Startdate && !req.query.Enddate) {
                                                            query5 = `${query5} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}' and OrderStatus = 'CO'`
                                                        }
                                                        console.log("query5", query5)
                                                        request.query(query5, function (err, set) {
                                                            if (err) {
                                                                res.json({
                                                                    success: false,
                                                                    message: err.originalError.info.message
                                                                })
                                                            } else {
                                                                let OrderDetails = set.recordset
                                                                let salescount=0
                                                                OrderDetails.forEach(element => {
                                                                    salescount=salescount+Number(element.OrderTotal)
                                                                   
                                                                });

                                                                request.query(`Select * from OrderList where OrderDate between  '${new Date(previousdate).toISOString()}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}' and OrderStatus = 'CO'`, function (err, set) {
                                                                    if (err) {
                                                                        res.json({
                                                                            success: false,
                                                                            message: err.originalError.info.message
                                                                        })
                                                                    } else {

                                                                        let perviousOrderList = set.recordset
                                                                        let previousSalescount=0
                                                                        perviousOrderList.forEach(e => {
                                                                            previousSalescount=previousSalescount+Number(e.OrderTotal)
                                                                        });
                                                                        res.status(200)
                                                                        // console.log(customerList,perviousCustomerListrs)

                                                                        res.json({
                                                                            success: true,
                                                                            message: "Successfully got form GetOrdersList",
                                                                            totalorder: result.length,
                                                                            pendingOrder: pendingOrder,
                                                                            Installation: Installation.length,
                                                                            OrderModification: OrderModification.length,
                                                                            previousorderresult: PlusorNot(result.length,previousresult)+Number((result.length-previousresult)*100/result.length).toFixed(2)+"%",
                                                                           
                                                                            energyconsumption: energyconsumption.length,
                                                                            previousEnegryConsumption: PlusorNot(energyconsumption.length,previousEnegryConsumption.length)+Number((energyconsumption.length-previousEnegryConsumption.length)*100/energyconsumption.length).toFixed(2)+"%",
                                                                            customerList: customerList,
                                                                            perviousCustomerList: PlusorNot(customerList,perviousCustomerList)+Number((customerList-perviousCustomerList)*100/customerList).toFixed(2)+"%",
                                                                            salesDetails: "$"+salescount,
                                                                            previousSalesDetails: PlusorNot(salescount,previousSalescount)+Number((salescount-previousSalescount)*100/salescount).toFixed(2)+"%"


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
function PlusorNot(x,y) {
    if(x>y){
        return "+"
    }
    else{
        return "-" 
    }
}
router.get("/GetOrdersList", function (req, res) {

    let query = `Select * from dbo.OrderList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.OrderType) {
        console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and OrderType ='${req.query.OrderType}' `
        }
        else {
            console.log("comming 2")
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
    console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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
                message: "Successfully got form GetOrdersList",
                result: result
            })

        }
    })

})
router.get("/GetOrdersOverviewTopCount", function (req, res) {

    let query = `Select * from dbo.OrderList`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where OrderDate between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    console.log(query)
    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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

            result.forEach(res => {
                if (res.OrderStatus == "PE") {

                    pending_Status.push(res)
                }
                else if (res.OrderStatus == "OM") {
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
                Total: result.length,
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
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.CustomerType) {
        console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and CustomerType ='${req.query.CustomerType}' `
        }
        else {
            console.log("comming 2")
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

    console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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
                    message: "Successfully got form GetOrdersList",
                    result: result
                })
            



        }
    })

})
router.get("/GetCustomerOverviewTopCount", function (req, res) {

    let query = `Select * from dbo.Customer_New`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    console.log(query)
    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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
                if (res.PurchaseType == "S") {

                    Subcribers.push(res)
                } if (res.CustomerType) {
                    if (res.CustomerType == "SO") {
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
            console.log("err", err)
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

router.post("/AddProductDetails",
    [
        check("ProductName").exists(),
        check("ProductCategory").exists(),
        check("Description").exists(),
        check("Quantity").exists(),
        check("Price").exists(),
        check("ProductCode").exists(),
        check("Manufacturer").exists(),
        check("ProductTax").exists(),
        check("CoolingCapacity").exists(),
        check("PowerConsumption").exists(),
        check("CurrentRating").exists(),
        check("FCUCapacity").exists(),
        check("EfficiencyProfile").exists(),
        check("ProductCategoryId").exists(),
        check("ProductInventory").exists(),
        check("Tags").exists(),
        check("ModelNo").exists(),
    ], function (req, res) {
        try {
            validationResult(req).throw()
            let query = `INSERT INTO ProductDetails
        ([ProductName]
        ,[ProductCategory]
        ,[Description]
        ,[Quantity]
        ,[Price]
        ,[ProductCode]
        ,[Manufacturer]
        ,[ProductTax]
        ,[CoolingCapacity]
        ,[PowerConsumption]
        ,[CurrentRating]
        ,[FCUCapacity]
        ,[EfficiencyProfile]
        ,[ProductCategoryId]
        ,[IsActive]
        ,[CreatedOn]
        ,[UpdatedOn]
        ,[ProductInventory]
        ,[Tags]
        ,[ImagePath]
        ,[ModelNo])
  VALUES
        (
        '${req.body.ProductName}',
        '${req.body.ProductCategory}',
        '${req.body.Description ? req.body.Description : ""}',
        '${req.body.Quantity}',
        '${req.body.Price}',
        '${req.body.ProductCode}',
        '${req.body.Manufacturer}',
        '${req.body.ProductTax}',
        '${req.body.CoolingCapacity}',
        '${req.body.PowerConsumption}',
        '${req.body.CurrentRating}',
        '${req.body.FCUCapacity}',
        '${req.body.EfficiencyProfile}',
        '${req.body.ProductCategoryId}',
        '${req.body.IsActive}',
        '${req.body.CreatedOn}',
        '${req.body.UpdatedOn}',
        '${req.body.ProductInventory ? req.body.ProductInventory : "IS"}',
        '${req.body.Tags}',
        '""',
        '${req.body.ModelNo}'
        ) SELECT SCOPE_IDENTITY() as id`
            console.log(query)
            request.query(query, function (err, set) {
                if (err) {

                    console.log("err", err)
                    res.status(400)
                    res.json({
                        success: false,
                        message: err.originalError.info.message
                    })

                } else {

                    req.body.Id = set.recordset[0].id

                    upload(req, res, function (err) {

                        if (err) {
                            return res.send("Error uploading file.");
                        } else {
                            res.status(200)
                            res.json({
                                success: true,
                                message: "Product Added successfully",
                                Id: set.recordset[0].id
                            })
                        }

                    })


                }
            })
        }
        catch (e) {
            res.status(400)
            res.json({
                success: false,
                message: "Error Occured While Processing"
            })
        }

    })
router.post('/uploadEfficiencyProfile', function (req, res) {
    uploadEff(req, res, function (err) {

        if (err) {
            return res.send("Error uploading file.");
        } else {
            console.log("req", req.files)
            const csvFilePath = req.files[0].path
            const csv = require('csvtojson')
            csv()
                .fromFile(csvFilePath)
                .then((jsonObj) => {

                    res.json({
                        success: true,
                        result: jsonObj
                    })
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

    let query = `Select * from dbo.ProductDetails`
    if (req.query.Startdate && req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date(req.query.Enddate).toISOString()}'`
    }
    if (req.query.Startdate && !req.query.Enddate) {
        query = `${query} where CreatedOn between '${new Date(req.query.Startdate).toISOString()}'  and  '${new Date().toISOString()}'`
    }
    if (req.query.ProductName) {
        // console.log("comming 1")
        if (req.query.Startdate) {
            query = `${query} and ProductName ='${req.query.ProductName}' `
        }
        else {
            // console.log("comming 2")
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

    console.log(query)

    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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
router.get("/getOrderChart", function (req, res) {
    let Startdate = req.query.Startdate
    let Enddate = req.query.Enddate
    if (!Enddate) {
        Enddate = new Date()
    }
    let query = `Select * from dbo.OrderList where OrderDate between '${new Date(Startdate).toISOString()}'  and  '${new Date(Enddate).toISOString()}'`
    if (Startdate) {
        let i = moment(Startdate).format("YYYY-MM-DD")
        let array = []
        do {
            let obj = { Day: moment(i).format('DD/M'),SubCount:0,OneCount:0 }
            array.push(obj)
            console.log("i", i)
            i = moment(i).add(1, "days").format("YYYY-MM-DD")

        }
        while (i <= moment(Enddate).format("YYYY-MM-DD"));


        request.query(query, function (err, set) {
            if (err) {
                console.log("err", err)
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
                result.forEach(res => {
                    if (res.OrderStatus == "CA") {
                        cancel.push(res)
                    }
                    if (res.OrderStatus == "CO") {
                        complete.push(res)

                    } if (res.OrderStatus == "IN") {
                        install.push(res)

                    } if (res.OrderStatus == "DI") {
                        dispatched.push(res)

                    } if (res.OrderStatus == "PE") {
                        pending.push(res)

                    } if (res.OrderStatus == "PR") {
                        Processing.push(res)

                    }
                })
                let OrderStatus = {
                    Total: result.length,
                    Pending: (100 * pending.length / result.length).toFixed(2),
                    cancel: (100 * cancel.length / result.length).toFixed(2),
                    Processing: (100 * Processing.length / result.length).toFixed(2),
                    dispatched: (100 * dispatched.length / result.length).toFixed(2),
                    complete: (100 * complete.length / result.length).toFixed(2),
                    install: (100 * install.length / result.length).toFixed(2),

                }


                res.json({ success: true, result: array, OrderStatus })

            }
        })

    }
    else {
        res.json({ success: false, msg: "Startdate Required" })
    }
})
router.get("/getCustomerChart", function (req, res) {
    let Startdate = req.query.Startdate
    let Enddate = req.query.Enddate
    if (!Enddate) {
        Enddate = new Date()
    }
    let query = `Select * from dbo.Customer_New where CreatedOn between '${new Date(Startdate).toISOString()}'  and  '${new Date(Enddate).toISOString()}'`
    if (Startdate) {
        let i = moment(Startdate).format("YYYY-MM-DD")
        let array = []

        do {
            let obj = { Day: moment(i).format("DD/M"),Count:0 }
            array.push(obj)
            console.log("i", i)
            i = moment(i).add(1, "days").format("YYYY-MM-DD")

        }
        while (i <= moment(Enddate).format("YYYY-MM-DD"));


        request.query(query, function (err, set) {
            if (err) {
                console.log("err", err)
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
                console.log(previous_datecount)
                let previousdate = moment(new Date(req.query.Startdate)).subtract(previous_datecount, 'days').toISOString()

                let j = moment(new Date(Startdate)).subtract(previous_datecount, 'days').format("YYYY-MM-DD")
                let date1 =moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()
                do {
                    let obj = { Day:  moment(j).format("DD/M"),Count:0}
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
                    Total: result.length,
                    Activesuscriber: (100 * ActiveS.length / result.length).toFixed(2),
                    OneTime: (100 * OneT.length / result.length).toFixed(2),
                    Lead: (100 * Lead.length / result.length).toFixed(2),
                    SuscriptionWithdrawn: (100 * SusW.length / result.length).toFixed(2),
                }
                let query2 = `Select * from dbo.Customer_New where CreatedOn between '${previousdate}'  and  '${moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()}'`
                console.log("Query is",query2)
                request.query(query2, function (err, set) {
                    if (err) {
                        console.log("err", err)
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
    FROM ProductDetails
    GROUP BY ProductName`
    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
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
            console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordset
            let total=0
            result.forEach(element => {
    total=total+element.count
});

result.forEach((res)=>{
    
    res.ProductPercentage=(res.count*100/total).toFixed(2)

})

            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetProductList",
                
                total:total,
                result:result
            })

        }
    })
})
router.get("/getDashBoardChart", function (req, res) {
    let Startdate = req.query.Startdate
    let Enddate = req.query.Enddate
    if (!Enddate) {
        Enddate = new Date()
    }
    let query =`Select * from OrderList where OrderDate between '${new Date(Startdate).toISOString()}'  and  '${new Date(Enddate).toISOString()}' and OrderStatus = 'CO'`
  
     
    if (Startdate) {
        let i = moment(Startdate).format("YYYY-MM-DD")
        let array = []


        do {
            let obj = { Day: moment(i).format("DD/M"),Count:0 }
            array.push(obj)
            
            console.log("i", i)
            i = moment(i).add(1, "days").format("YYYY-MM-DD")

        }
        while (i <= moment(Enddate).format("YYYY-MM-DD"));


        request.query(query, function (err, set) {
            if (err) {
                console.log("err", err)
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

                            

                        }
                    });

                })
                let array2 = []
               

                let previous_datecount = Math.ceil((new Date() - new Date(Startdate)) / (1000 * 60 * 60 * 24))
                if (Enddate) {
                    previous_datecount = Math.ceil((new Date(Enddate) - new Date(Startdate)) / (1000 * 60 * 60 * 24))
                }
                console.log(previous_datecount)
                let previousdate = moment(new Date(req.query.Startdate)).subtract(previous_datecount, 'days').toISOString()

                let j = moment(new Date(Startdate)).subtract(previous_datecount, 'days').format("YYYY-MM-DD")
                let date1 =moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()
                do {
                    let obj = { Day:  moment(j).format("DD/M"),Count:0 }
                    array2.push(obj)
                   
                    j = moment(j).add(1, "days").format("YYYY-MM-DD")

                }
                while (j <= moment(date1).format("YYYY-MM-DD"));
              
               
                let query2 =`Select * from OrderList where OrderDate between '${previousdate}'  and  '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}' and OrderStatus = 'CO'`
                request.query(query2, function (err, set) {
                    if (err) {
                        console.log("err", err)
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

                                   

                                }
                            });

                        })
                        let query3 = `Select * from EnergyConsumption where created_On between  '${new Date(Startdate).toISOString()}' and '${new Date(Enddate).toISOString()}'`
                        console.log("query 3",query3)
                        request.query(query3,function (err,set) {
                            if (err) {
                                console.log("err", err)
                                res.status(400)
                                res.json({
                                    success: false,
                                    message: err.originalError.info.message
                                })
                            }
                            else{ 
                                let result3=set.recordset
                                let E1 = moment(Startdate).format("YYYY-MM-DD")
                            
                                let array3=[]
                        
                                do {
                                    let obj = { Day:  moment(E1).format("DD/M"),Energy:0}
                                    array3.push(obj)
                                    
                                    
                                    E1 = moment(E1).add(1, "days").format("YYYY-MM-DD")
                        
                                }
                                while (E1 <= moment(Enddate).format("YYYY-MM-DD"));
                              console.log(array3)
                                array3.forEach((arr, i) => {
                                result3.forEach((element,j) => {
                                    
                                  
                                    if (arr.Day == moment(element.created_On).format("DD/M")) {
                                    
                                            array3[i].Energy =array3[i].Energy+ Number(result3[j].energy)
                                          
                                            console.log("day2",arr.Day,Number(result3[j].energy),array3[i].Energy)
    
                                    }
                                });
                            });
                            let query4=`Select * from EnergyConsumption where created_On between  '${previousdate}' and '${moment(new Date(req.query.Startdate)).subtract(1, 'days').toISOString()}'`
console.log(query4)
                            request.query(query4,function (err,set) {
                                if (err) {
                                    console.log("err", err)
                                    res.status(400)
                                    res.json({
                                        success: false,
                                        message: err.originalError.info.message
                                    })
                                }
                                else{ 
                                    let result4=set.recordset
                                   
                                    let E2 = moment(previousdate).format("YYYY-MM-DD")
                                  
                                    let array4=[]
                                    let date1 =moment(new Date(req.query.Startdate)).subtract(1, 'day').toISOString()
                                    do {
                                        let obj = { Day: moment(E2).format("DD/M"),Energy:0}
                                        array4.push(obj)
                                        
                                      
                                        E2= moment(E2).add(1, "days").format("YYYY-MM-DD")
                            
                                    }
                                    while (E2 <= moment(date1).format("YYYY-MM-DD"));
                                    array4.forEach((arr, i) => {
                                    result4.forEach((element,j) => {
                                       
  
                                        if (arr.Day == moment(element.created_On).format("DD/M")) {
                                           
                                            array4[i].Energy =array4[i].Energy+ Number(result4[j].energy)
                                            console.log("day",arr.Day,Number(result4[j].energy),array4[i].Energy)
                                           
        
                                        }
                                    });
                                });
                                res.json({ success: true, sales: array,  previoussales: array2,energyconsumption:array3,previousEnegryConsumption:array4})
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
        res.json({ success: false, msg: "Startdate Required" })
    }
})
router.get("/TopProductdetails", function (req, res) {
    let query = `select ProductDEtails.Quantity, OrderList.ProductId, OrderList.OrderTotal, productDetails.productName from OrderList inner join ProductDetails on OrderList.ProductId = ProductDetails.Id and OrderList.OrderStatus='CO'`
    
    request.query(query, function (err, set) {
        if (err) {
            console.log("err", err)
            res.status(400)
            res.json({
                success: false,
                message: err.originalError.info.message
            })

        } else {

            let result = set.recordsets[0]
            let result2 =groupBy(result,"ProductId")
            let array=[]
            let tempArray = []
            Object.keys(result2).forEach(function (i) {
                let obj={"ProductName":result2[i][0].productName,"ProductId":result2[i][0].ProductId,"ProductSalesPercentage":Number(100*result2[i].length/result2[i][0].Quantity),"ProductQuantity":result2[i][0].Quantity}
                let amt=0
                if(result2[i].length>1){
                    
                    result2[i].forEach(element => {
                        amt=amt+Number(element.OrderTotal)
                    });
                    obj={"ProductName":result2[i][0].productName,"ProductId":result2[i][0].ProductId,"ProductSalesPercentage":Number(100*result2[i].length/result2[i][0].Quantity).toFixed(2),"Sales":amt,"ProductQuantity":result2[i][0].Quantity,"SaleCount":result2[i].length}
                }
                else{
                    obj={"ProductName":result2[i][0].productName,"ProductId":result2[i][0].ProductId,"ProductSalesPercentage":Number(100*result2[i].length/result2[i][0].Quantity).toFixed(2),"Sales":result2[i][0].OrderTotal,"ProductQuantity":result2[i][0].Quantity,"SaleCount":result2[i].length} 
                }
                
                array.push(obj)
                array.sort(dynamicSort("SaleCount"))

                tempArray =  array.sort(dynamicSort("SaleCount"))

              });
            res.status(200)
            res.json({
                success: true,
                message: "Successfully got form GetProductList",         
               
                result:tempArray
            })

        }
    })
})
function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers, 
       * and you may want to customize it to your needs
       */
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  
module.exports = router;