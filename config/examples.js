// insert customers
  var customerList  = require('../config/names')

  let name =  { 
    "Firstname": "Jaylon", 
    "Lastname": "Richmond", 
    "Email": "JaylonRichmond@testmail.com", 
    "Phone": "+1 582-333-1857", 
    "CreatedOn": "2021-08-09T18:30:00.000Z", 
    "LastService": "2021-08-14T18:30:00.000Z", 
    "plan": "prime", 
    "ServiceLocation": "Choa Chu Kang New Town",        
    "PurchasedType": "S", 
    "CustomerType": "AS" 
}

let customers = customerList.fakeName 
let email = customerList.fakeEmail 

let temp = []

for(let i=0;i<20;i++){

 let spiltName =  customers[30+i].split(" ")

  temp.push({
    "Firstname": spiltName[0], 
    "Lastname": spiltName[1], 
    "Email": email[30+i], 
    "Phone": "+1 582-333-1857", 
    "CreatedOn": moment(new Date("2021-10-20")).add(1*i,'days').toISOString(), 
    "LastService": moment(new Date("2021-10-23")).add(1*i,'days').toISOString(), 
    "plan": "prime", 
    "ServiceLocation": "Choa Chu Kang New Town",        
    "PurchasedType": "S", 
    "CustomerType": "AS" 
  })

}

let temp =  {    
    "ProductName":ACNAme,
    "ProductCategory": AC.Category[(randomIntFromInterval(0,1))],
    "Description": `${ACNAme} is a multinational manufacturer of home appliances based in Michigan, United States. ${ACNAme} entered India in 1987 and has grown to be one of the most favourite brands as far as home appliances are concerned. Whirlpool air conditioners rely on turbo cooling technology to deliver high performance.  ${ACNAme} ACs hold a market share of 25% in the AC market`,
    "Quantity": randomIntFromInterval(0,50),
    "Price": randomIntFromInterval(3000,5000),
    "ProductCode": getRandom(10),
    "Manufacturer":(ACNAme.replace("AC",'')).trim(),
    "ProductTax": (randomIntFromInterval(12,18))+"%",
    "CoolingCapacity": "NULL",
    "PowerConsumption": "NULL",
    "CurrentRating": "NULL",
    "FCUCapacity": "NULL",
    "EfficiencyProfile": "121",
    "ProductCategoryId": "NULL",
    "IsActive": "1",
    "CreatedOn": moment(new Date("2021-08-01")).add(1*i,'days').toISOString(),
    "UpdatedOn": "",
    "ProductInventory": "L",
    "Tags": (randomIntFromInterval(2,5)),
    "ImagePath": "loction/img",
    "ModelNo": getRandom(12)
  }
