
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
    destination: async function(req, file, callback) {
        
        var filepath = filePath.ProductImagePath + req.body.Id
        await createFolder(filepath)
        callback(null, filepath);
    },
    filename: function(req, file, callback) {
        // console.log("name",file);
        callback(null, file.originalname)
    }
  });


  var storageEff = multer.diskStorage({
    destination: async function(req, file, callback) {
        var data = JSON.parse(req.body.data)
        var filepath = 'public/' +data.ProductName.replace(/ /g,'')
        await createFolder(filepath)
        callback(null, filepath);
    },
    filename: function(req, file, callback) {
      let name= file.originalname
      var data = JSON.parse(req.body.data)
        console.log("name",name.substr(name.lastIndexOf('.')))
        callback(null, data.ProductName+"-"+new Date().getTime()+name.substr(name.lastIndexOf('.')))
    }
  });
  function createFolder(filepath) {
    return new Promise(async function(resolve, reject) {
        // var filepath = pdfpath + folderName
        fs.access(filepath, async function(err) {
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
                let previousdate = moment(new Date()).subtract(previous_datecount, 'days').toISOString()



                // console.log(previousdate)
                //    console.log("previous_date",previousdate)
                query2 = `Select * from dbo.OrderList where OrderDate between  '${new Date(previousdate).toISOString()}' and '${new Date(req.query.Startdate).toISOString()}'`
               console.log("query2",query2)
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
                        console.log("query3",query3)
                        request.query(query3, function (err, set) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err.originalError.info.message
                                })
                            }
                            else {
                                let energyconsumption = set.recordset
                                
                                let query4 = `Select * from EnergyConsumption where created_On between  '${new Date(previousdate).toISOString()}' and '${new Date(req.query.Startdate).toISOString()}'`
                                console.log("query4",query4)
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
                                        console.log("query5",query5)
                                        request.query(query5, function (err, set) {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: err.originalError.info.message
                                                })
                                            }
                                            else {
                                                let customerList = set.recordset.length
                                                query6 = `Select * from dbo.Customer_New where CreatedOn between  '${new Date(previousdate).toISOString()}' and '${new Date(req.query.Startdate).toISOString()}'`
                                                console.log("query6",query6)
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
                                                    console.log("query5",query5)
                                                    request.query(query5, function (err, set) {
                                                        if (err) {
                                                            res.json({
                                                                success: false,
                                                                message: err.originalError.info.message
                                                            })
                                                        }else{
                                                            let OrderDetails = set.recordsets
                                                           
                                                            request.query(`Select * from OrderList where OrderDate between  '${new Date(previousdate).toISOString()}' and '${new Date(req.query.Startdate).toISOString()}' and OrderStatus = 'CO'`, function (err, set) {
                                                                if (err) {
                                                                    res.json({
                                                                        success: false,
                                                                        message: err.originalError.info.message
                                                                    })
                                                                }else{
                                                                    
                                                            let perviousOrderList = set.recordset
                                                            res.status(200)

                                                            res.json({
                                                                success: true,
                                                                message: "Successfully got form GetOrdersList",
                                                                totalorder: result.length,
                                                                pendingOrder: pendingOrder,
                                                                Installation: Installation.length,
                                                                OrderModification: OrderModification.length,
                                                                previousorderresult: previousresult,
                                                                totalenergyconsumption: energyconsumption.length,
                                                                energyconsumption: energyconsumption,
                                                                previousEnegryConsumption: previousEnegryConsumption,
                                                                customerList: customerList,
                                                                perviousCustomerList: perviousCustomerList,
                                                                salesDetails:OrderDetails,
                                                                previousSalesDetails:perviousOrderList


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
                    else if (res.CustomerType == "LE") {
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
router.get('/ProductCategory',function(req,res){

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
        '${req.body.Description?req.body.Description:""}',
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
        '${req.body.ProductInventory?req.body.ProductInventory:"IS"}',
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

                upload(req, res, function(err) {
           
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
router.post('/uploadEff',function(req,res){
    upload(req, res, function(err) {
           
        if (err) {
            return res.send("Error uploading file.");
        } else {
           
             
            
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
router.get("/GetProductSaleDetails", function (req, res) {
    let query = `select CondensorList.Quantity, OrderList.ProductId, OrderList.OrderTotal, CondensorList.productName 
    from OrderList 
    inner join CondensorList 
    on OrderList.ProductId = CondensorList.CondenserId and OrderList.OrderStatus='CO' and OrderList.orderDate between '${req.query.Startdate}' and '${req.query.Enddate}'`

    let queryFCU = `select  OrderList.ProductId, OrderList.OrderTotal, FCUList.FCUName, FCUList.Price 
    from OrderList 
    inner join FCUList 
    on OrderList.ProductId = FCUList.CondenserId and OrderList.OrderStatus='CO' and OrderList.orderDate between '${req.query.Startdate}' and '${req.query.Enddate}'`
    
    request.query(query, function (err, set) {
        if (err) {
            //console.log("err", err)
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
                let obj={"ProductName":result2[i][0].productName,"ProductId":result2[i][0].ProductId,"ProductSalesPercentage":Number(100*result2[i].length/result.length),"ProductQuantity":result2[i][0].Quantity}
                let amt=0
                if(result2[i].length>1){
                    
                    result2[i].forEach(element => {
                        amt=amt+Number(element.OrderTotal)
                    });
                    obj={"ProductName":result2[i][0].productName,"ProductId":result2[i][0].ProductId,"ProductSalesPercentage":Number(100*result2[i].length/result.length).toFixed(2),"Sales":amt,"ProductQuantity":result2[i][0].Quantity,"SaleCount":result2[i].length}
                }
                else{
                    obj={"ProductName":result2[i][0].productName,"ProductId":result2[i][0].ProductId,"ProductSalesPercentage":Number(100*result2[i].length/result.length).toFixed(2),"Sales":result2[i][0].OrderTotal,"ProductQuantity":result2[i][0].Quantity,"SaleCount":result2[i].length} 
                }
                
                array.push(obj)
                array.sort(dynamicSort("SaleCount"))

                tempArray =  array.sort(dynamicSort("SaleCount"))

              });
              let PopularProductsCondensor = tempArray
            // res.status(200)
            // res.json({
            //     success: true,
            //     message: "Successfully got form GetProductList",         
               
            //     result:tempArray
            // })
            request.query(queryFCU, function (err, set) {
                if (err) {
                    //console.log("err", err)
                    res.status(400)
                    res.json({
                        success: false,
                        message: err.originalError.info.message
                    })
        
                } else {
        
                    let result = set.recordsets[0]
                    let result2 =groupBy(result,"FCUName")
                    let array=[]
                    let tempArray = []
                    Object.keys(result2).forEach(function (i) {
                        let obj={"ProductName":result2[i][0].FCUName,"ProductSalesPercentage":Number(100*result2[i].length/result.length)}
                        let amt=0
                        if(result2[i].length>1){
                            
                            result2[i].forEach(element => {
                                amt=amt+Number(element.Price)
                            });
                            obj={"ProductName":result2[i][0].FCUName,"ProductSalesPercentage":Number(100*result2[i].length/result.length).toFixed(2),"Sales":amt}
                        }
                        else{
                            obj={"ProductName":result2[i][0].FCUName,"ProductSalesPercentage":Number(100*result2[i].length/result.length).toFixed(2),"Sales":result2[i][0].Price} 
                        }
                        
                        array.push(obj)
                        array.sort(dynamicSort("ProductSalesPercentage"))
        
                        tempArray =  array.sort(dynamicSort("ProductSalesPercentage"))
        
                      });
                      let PopularProductsFCU = tempArray
                    res.status(200)
                    res.json({
                        success: true,
                        message: "Successfully got form GetProductList",         
                       
                        result:{
                            PopularProductsFCUList:PopularProductsFCU,
                            PopularProductsCondensorList:PopularProductsCondensor
                        
                        }
                    })
        
                }
            })

        }
    })
})
router.get("/BrandSegment", function (req, res) {
    let query = `SELECT ProductName, COUNT(id)  AS count
    FROM CondensorList
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
module.exports = router;