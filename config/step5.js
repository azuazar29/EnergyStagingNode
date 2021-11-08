const hs = require('./hourly_true_load');
function start1(input1,roomslen,occ_patt,true_load,eff,total_true_load,installed_rooms,roomsArray,type,res) {
////console.log("installed_rooms",installed_rooms)
  //////////console.log("input",input1.length)
  var mon=[],tue=[],wed=[],thurs=[],fri=[],sat=[],sun=[]
  var mon_load=[],tue_load=[],wed_load=[],thurs_load=[],fri_load=[],sat_load=[],sun_load=[]
  var configid=occ_patt[0].configID 
  var room_weekdays=[]
  var room_weekends=[]

  //////////////console.log("configid",configid)
  occ_patt.forEach(element => {

    // ////////////console.log()
   element.mondayList = JSON.parse(element.mondayList)
   element.tuesdayList = JSON.parse(element.tuesdayList)
   element.wednesdayList = JSON.parse(element.wednesdayList)
   element.thursdayList = JSON.parse(element.thursdayList)
   element.fridayList = JSON.parse(element.fridayList)
   element.saturdayList = JSON.parse(element.saturdayList)
   element.sundayList = JSON.parse(element.sundayList)
  })

const callit=(am,pm)=>{
var a=[]  
  for(var i=1;i<=11;i++){
    if(am.indexOf(i+"AM") > -1){a.push(1)}else{a.push(0)}
  }
if(pm.indexOf("12PM") > -1){a.push(1)}else{a.push(0)}
  for(var j=1;j<=11;j++){
       if(pm.indexOf(j+"PM") > -1){a.push(1)}else{a.push(0)}  
  }
if(am.indexOf("12AM") > -1){a.push(1)}else{a.push(0)}
return a
}

//....................mon...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      mon=[]
      // mon_load=[]
      room_weekdays.push(occ_patt[i].mondayList.length+occ_patt[i].tuesdayList.length+occ_patt[i].wednesdayList.length+occ_patt[i].thursdayList.length+occ_patt[i].fridayList.length)
      room_weekends.push(occ_patt[i].saturdayList.length+occ_patt[i].sundayList.length)
      for(var j=0;j<occ_patt[i].mondayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].mondayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].mondayList[j])}
        else{pm.push(occ_patt[i].mondayList[j])} 
      }
    r=r+1
    ////////////console.log("am pm",am,pm)

    mon.push(callit(am,pm))
    ////////////console.log("monday",mon)
    mon_load.push(hs.mon_true_load(mon,r,true_load))
    }
}
////////////////console.log(mon_load)

//....................tue...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      tue=[]
      // mon_load=[]
      for(var j=0;j<occ_patt[i].tuesdayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].tuesdayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].tuesdayList[j])}
        else{pm.push(occ_patt[i].tuesdayList[j])} 
      }
    r=r+1
    tue.push(callit(am,pm))
    // //////////////console.log(mon)
    tue_load.push(hs.tue_true_load(tue,r,true_load))
    }
}
// //////////////console.log(tue_load)


//....................wed...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      wed=[]
      // mon_load=[]
      for(var j=0;j<occ_patt[i].wednesdayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].wednesdayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].wednesdayList[j])}
        else{pm.push(occ_patt[i].wednesdayList[j])} 
      }
    r=r+1
    wed.push(callit(am,pm))
    // //////////////console.log(mon)
    wed_load.push(hs.wed_true_load(wed,r,true_load))
    }
}
// //////////////console.log(wed_load)


//....................thurs...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      thurs=[]
      // mon_load=[]
      for(var j=0;j<occ_patt[i].thursdayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].thursdayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].thursdayList[j])}
        else{pm.push(occ_patt[i].thursdayList[j])} 
      }
    r=r+1
    thurs.push(callit(am,pm))
    // //////////////console.log(mon)
    thurs_load.push(hs.thurs_true_load(thurs,r,true_load))
    }
}
// //////////////console.log(thurs_load)


//....................fri...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      fri=[]
      // mon_load=[]
      for(var j=0;j<occ_patt[i].fridayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].fridayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].fridayList[j])}
        else{pm.push(occ_patt[i].fridayList[j])} 
      }
    r=r+1
    fri.push(callit(am,pm))
    // //////////////console.log(mon)
    fri_load.push(hs.fri_true_load(fri,r,true_load))
    }
}
// //////////////console.log(fri_load)

//....................sat...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      sat=[]
      // mon_load=[]
      for(var j=0;j<occ_patt[i].saturdayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].saturdayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].saturdayList[j])}
        else{pm.push(occ_patt[i].saturdayList[j])} 
      }
    r=r+1
    sat.push(callit(am,pm))
    // //////////////console.log(mon)
    sat_load.push(hs.sat_true_load(sat,r,true_load))
    }
}
// //////////////console.log(sat_load)


//....................sun...................................

var am=[]
var pm=[]
var r=0;
for(var i=0;i<occ_patt.length;i++){
    if(occ_patt[i].configID==configid){
      sun=[]
      // mon_load=[]
      for(var j=0;j<occ_patt[i].sundayList.length;j++){
        // //////////////console.log(occ_patt[i].mondayList[j])
        // //////////////console.log("i"+(r+1))
        const [digits,word] = occ_patt[i].sundayList[j].match(/\D+|\d+/g);
        if(word==="AM"){am.push(occ_patt[i].sundayList[j])}
        else{pm.push(occ_patt[i].sundayList[j])} 
      }
    r=r+1
    sun.push(callit(am,pm))
    ////////////console.log("sunday list",mon)
    sun_load.push(hs.sun_true_load(sun,r,true_load))
    }
}
 ////////////console.log("sunday",sun_load)



// //////////////console.log(input1)
//hourly_operating_load
var mon_opt_load=[],tue_opt_load=[],wed_opt_load=[],thurs_opt_load=[],fri_opt_load=[],sat_opt_load=[],sun_opt_load=[];
var ty=[]
for(var i=0;i<input1.length;i++){
 // //////////////console.log(input1[i])
 // //////////////console.log("-------------")
   for(var j=0;j<input1[i].length;j++){
    // //////////////console.log(input1[i][j].manufacturer)
  mon_opt_load=[];
  tue_opt_load=[];
  wed_opt_load=[];
  thurs_opt_load=[];
  fri_opt_load=[];
  sat_opt_load=[];
  sun_opt_load=[];
      for(var k=0;k<mon_load.length;k++){
        mon_opt_load.push(Math.round(mon_load[k]/input1[i][j].cooling_capacity)*100)
      }

      for(var k=0;k<tue_load.length;k++){
        tue_opt_load.push(Math.round(tue_load[k]/input1[i][j].cooling_capacity)*100)
      }

      for(var k=0;k<wed_load.length;k++){
        wed_opt_load.push(Math.round(wed_load[k]/input1[i][j].cooling_capacity)*100)
      }

      for(var k=0;k<thurs_load.length;k++){
        thurs_opt_load.push(Math.round(thurs_load[k]/input1[i][j].cooling_capacity)*100)
      }

      for(var k=0;k<fri_load.length;k++){
        fri_opt_load.push(Math.round(fri_load[k]/input1[i][j].cooling_capacity)*100)
      }

      for(var k=0;k<sat_load.length;k++){
        sat_opt_load.push(Math.round(sat_load[k]/input1[i][j].cooling_capacity)*100)
      }

      for(var k=0;k<sun_load.length;k++){
        sun_opt_load.push(Math.round(sun_load[k]/input1[i][j].cooling_capacity)*100)
      }
      let tot=[]
      tot=[mon_opt_load,tue_opt_load,wed_opt_load,thurs_opt_load,fri_opt_load,sat_opt_load,sun_opt_load]
//////////////console.log("total",tot)
input1[i][j].hourly_operating_load=tot;
      // //////////////console.log(input1[i][j].hourly_operating_load)

}
}


// //////////////console.log()

//hourly_cop
var inner1=[],outer1=[],outer2=[]
for(var i=0;i<input1.length;i++){
 
 for(var j=0;j<input1[i].length;j++){
 outer1=[] 
    for(var k=0;k<input1[i][j].hourly_operating_load.length;k++){
      // //////////////console.log(input1[i][j].hourly_operating_load[k])
      inner1=[]
      for(var l=0;l<input1[i][j].hourly_operating_load[k].length;l++){
      
      for(var t=0;t<eff.length;t++){
        if(input1[i][j].hourly_operating_load[k][l] == eff[t].hourly_operating_load){
             // //////////////console.log("input1.hourly_operating_load - "+input1[i][j].hourly_operating_load[k][l]+" "+
             //  "eff.hourly_operating_load"+eff[t].hourly_cop)
             inner1.push(eff[t].hourly_cop)
        }
        
      }
      }
      
     outer1.push(inner1)
    
    }
    outer2.push(outer1)
    // //////////////console.log(outer1)
    input1[i][j].hourly_cop = outer1 
}
}


// //////////////console.log(outer2)


//hourly_operating_power
var inn=[],out=[],out1=[]
for(var i=0;i<input1.length;i++){
 
 for(var j=0;j<input1[i].length;j++){ 
    
    out=[]
    for(var k=0;k<input1[i][j].hourly_cop.length;k++){
      // ////////////console.log("hourly cop",input1[i][j].hourly_cop[k])  
      inn=[]
       for(var l=0;l<input1[i][j].hourly_cop[k].length;l++){
          
          inn.push(input1[i][j].hourly_cop[k][l]*input1[i][j].cooling_capacity)
       }
       out.push(inn)
    }
    input1[i][j].hourly_operating_power=out
    // ////////////console.log('put',out)
  }
  out1.push(out)
  // //////////////console.log(out)
}



var usage_adherence=1 //0.75; //(75%) get value from user
//weekday
var inn1=[]
for(var i=0;i<input1.length;i++)
{
  for(var j=0;j<input1[i].length;j++)
  { inn1=[]
    for(var k=0;k<input1[i][j].hourly_operating_power.length-2;k++){
    
    // //////////////console.log("===>"+input1[i][j].hourly_operating_power[k])
    // //////////////console.log(input1[i][j].hourly_operating_power[k].reduce((a, b) => a + b, 0))
     inn1.push(input1[i][j].hourly_operating_power[k].reduce((a, b) => a + b, 0))
   
  }
  input1[i][j].weekday_operating_power = inn1
  
}
  
}



//sum of weekdays
var sum=[]
for(var i=0;i<input1.length;i++){
  for(var j=0;j<input1[i].length;j++){
    sum=[]
    sum.push((input1[i][j].weekday_operating_power).reduce((partial_sum, a) => partial_sum + a,0))
    var s=[]
    s.push(sum*usage_adherence)
    // //////////////console.log(s/1000)
    input1[i][j]["weekday_operating_power"]=s
  }
}


//weekend
var inn1=[]
for(var i=0;i<input1.length;i++)
{
  for(var j=0;j<input1[i].length;j++)
  { inn1=[]
    for(var k=5;k<=input1[i][j].hourly_operating_power.length-1;k++){
    
    // //////////////console.log("===>"+input1[i][j].hourly_operating_power[k])
    // //////////////console.log(input1[i][j].hourly_operating_power[k].reduce((a, b) => a + b, 0))
     inn1.push(input1[i][j].hourly_operating_power[k].reduce((a, b) => a + b, 0))
   
  }
  input1[i][j].weekend_operating_power = inn1
  
}
  
}


//sum of weekend
var sum=[]
for(var i=0;i<input1.length;i++){
  for(var j=0;j<input1[i].length;j++){
    sum=[]
    sum.push((input1[i][j].weekend_operating_power).reduce((partial_sum, a) => partial_sum + a,0))
    var s=[]
    s.push(sum*usage_adherence)
    input1[i][j]["weekend_operating_power"]=s    
  }
}


//monthly_operating_power
for(var i=0;i<input1.length;i++){
  for(var j=0;j<input1[i].length;j++){
    var week=input1[i][j].weekday_operating_power[0] + input1[i][j].weekend_operating_power[0]
    input1[i][j].monthy_operating_power = (usage_adherence*week*4)/1000
  }
}

//yearly_operating_power
for(var i=0;i<input1.length;i++){
  for(var j=0;j<input1[i].length;j++){
    
    input1[i][j].yearly_operating_power = (usage_adherence*input1[i][j].monthy_operating_power*54)
  }
}

var electricity_tariff=0.29 //1.25
///electricity tariff for week
for(var i=0;i<input1.length;i++){
  for(var j=0;j<input1[i].length;j++){
    // //////////////console.log((input1[i][j].weekday_operating_power[0]/1000))
    // //////////////console.log((input1[i][j].weekend_operating_power[0]/1000))
    var week=((input1[i][j].weekday_operating_power[0]/1000) + (input1[i][j].weekend_operating_power[0]/1000))
    var week_electricity_cost=week*electricity_tariff
    var month_electricity_cost=week_electricity_cost*4
    var year_electricity_cost=month_electricity_cost*12
    // //////////////console.log(year_electricity_cost)
    input1[i][j].weekly_electricity_cost = week_electricity_cost
    input1[i][j].monthly_electricity_cost = month_electricity_cost
    input1[i][j].yearly_electricity_cost = year_electricity_cost
  }
}
result = []


//////////console.log("input",input1.length)
var final_datas = []
var disp_monthy_operating_power =0
var disp_price=0
var disp_year_electricity_cost=0
var disp_month_electricity_cost = 0
var disp_product_ID = ''

installed_rooms= installed_rooms.reduce((r, e) => (r.push(...e), r), [])
////console.log("\n\n\n")
////console.log(input1.length +" - "+installed_rooms.length)

////console.log("---------------------------------------")
////console.log("products displaying and their req rooms")
////console.log("---------------------------------------")

for(var i=0;i<input1.length;i++){
  disp_monthy_operating_power=0
  disp_price=0
  disp_product_name=""
  disp_product_ID = ""
  for(var j=0;j<input1[i].length;j++){
    ////console.log(input1[i][j].product_id+" - "+input1[i][j].manufacturer)
    if(j==0){
      disp_product_name=input1[i][j].manufacturer

    }else{
    disp_product_name=disp_product_name+"-"+input1[i][j].manufacturer

    }
    if(j==0){
      disp_product_Img=input1[i][j].product_img

    }else{
      disp_product_Img=disp_product_Img+"{{}}"+input1[i][j].product_img

    }
    
    disp_monthy_operating_power+=input1[i][j].monthy_operating_power
    disp_price+=Number(input1[i][j].price)
    disp_year_electricity_cost+=input1[i][j].yearly_electricity_cost
    disp_month_electricity_cost+=input1[i][j].monthly_electricity_cost
  }
  

  let temp = []
  //console.log("installed_rooms[i]",installed_rooms[i])
  installed_rooms[i].forEach((element,outerIndex)=>{

    
    if(element.length>1){
      temp[outerIndex] = {
        rooms:[],
        weekdayhours:[],
        weekendhours:[]
      }
      element.forEach((rooms,index)=>{
        
        temp[outerIndex].rooms.push(
          {
          name:roomsArray[rooms-1].roomName,
          ideal_temperature:roomsArray[rooms-1].idealRoomTemparature,
          area:roomsArray[rooms-1].roomSize
        })
        temp[outerIndex].weekdayhours.push(room_weekdays[rooms-1])
        temp[outerIndex].weekendhours.push(room_weekends[rooms-1])
         
       })
    }else{
      temp.push({
        rooms:[ {
          name:roomsArray[element[0]-1].roomName,
          ideal_temperature:roomsArray[element[0]-1].idealRoomTemparature,
          area:roomsArray[element[0]-1].roomSize
        }],
        weekdayhours:[room_weekdays[element[0]-1]],
        weekendhours:[room_weekends[element[0]-1]]
      })
    }
   
  })

  //console.log("installed_rooms[i]",temp)

  final_datas.push(
    {
     display_installed_rooms:temp,
     display_product_manufacturer:disp_product_name,
     display_product_img:disp_product_Img,   
     display_monthly_operating_power:disp_monthy_operating_power,
     display_price:disp_price,
     display_yearly_electricity_cost:disp_year_electricity_cost,
     display_monthly_electricity_cost:disp_month_electricity_cost,
     totalRooms :  roomsArray.length,
     compressor_needed : res.locals.compressor_needed,
   })
  ////console.log("--------------")
}
let finalDataForArray = []

//console.log("roomsArray",roomsArray)

final_datas.forEach(element=>{

  let temp = element.display_product_manufacturer.split('-') 
  let temp2 =element.display_product_img.split('{{}}') 

    let indexData = element.display_installed_rooms 
    
    indexData.forEach((fcudata,index)=>{

      input1.forEach(products=>{

        //console.log("products.manufacturer == temp[index]",products[0],temp[index])
        if(products[0].manufacturer == temp[index]){
          fcudata.FCU = []
          fcudata.rooms.forEach(element=>{
            fcudata.FCU.push(products[0])
          })

          fcudata.ProductName = temp[index] + " " + "Electric Startmax"
         
        }
      
        

      })
     
    })
    let name = groupItem(temp)
    let imageName = groupItem(temp2)
    let nametoreturn = ''
    name.forEach((names,index)=>{
      if(index==0){
        nametoreturn = names
      }else{
        nametoreturn = nametoreturn+"/"+names
      }

    })
    element.display_product_manufacturer = nametoreturn
    element.display_product_img = []
    if(name.length>1){
      element.display_product_img = imageName

    }else{
      element.display_product_img.push(imageName[0])

    }

  })



////console.log("finalDataForArray",finalDataForArray)

function groupItem(a){
  var result = [];
  a.forEach(function(item) {
       if(result.indexOf(item) < 0) {
           result.push(item);
       }
  });

  

  return result


}
    




////console.log(final_datas)
////console.log("Total products - "+final_datas.length)

console.log("room_weekdays",room_weekdays)
console.log("room_weekends",room_weekends)

let finalDataObj = {
  roomName:"",
  roomTemperature:'',
  roomSize:"",
  weekdayhours:'',
  weekendhours:'',
  FCU:'',
  ProductName:''
}
let tempData = []
let tempFianlData = []

final_datas.forEach((element,rootIndex)=>{

  element.display_installed_rooms.forEach((installedRooms,outerIndex)=>{

    installedRooms.rooms.forEach((eachRoom,index)=>{

      finalDataObj.roomName = eachRoom.name
      finalDataObj.roomTemperature = eachRoom.ideal_temperature,
      finalDataObj.roomSize = eachRoom.area,
      finalDataObj.weekdayhours = installedRooms.weekdayhours[index]
      finalDataObj.weekendhours = installedRooms.weekendhours[index]
      finalDataObj.FCU = installedRooms.FCU[index]
      finalDataObj.productName = installedRooms.FCU[index].manufacturer + " " + "Electric StarMax"
      
      tempData.push(finalDataObj)
      finalDataObj = {
        roomName:"",
        roomTemperature:'',
        roomSize:"",
        weekdayhours:'',
        weekendhours:'',
        FCU:'',
        ProductName:''
      }
  
    })

    tempFianlData[outerIndex] = tempData
    tempData = []
   
  })

  final_datas[rootIndex].display_installed_rooms = tempFianlData




})

let tempObj = {
  compressor:'',
  productName:'',
  pump:'',
  power:'',
  products:[]

}
let tempDataArray = []
let finalTempDataArray = []

final_datas.forEach((element,rootIndex)=>{

  element.display_installed_rooms.forEach((eachCondensor,index)=>{
    eachCondensor.forEach((innerCondensor,innerIndex)=>{
      tempObj.compressor = "Condensor "+ (index+1)
      tempObj.productName = innerCondensor.FCU.manufacturer
      tempObj.pump = innerCondensor.FCU.val1
      tempObj.power = (Number(innerCondensor.FCU.monthy_operating_power) /1000).toFixed(2)
      tempObj.products.push(innerCondensor)
  
      tempDataArray[index] = tempObj
      
    })
    if(tempDataArray != null){
      finalTempDataArray[index] = tempDataArray

    }

    tempObj = { compressor:'',
    productName:'',
    pump:'',
    power:'',
    products:[]}
    tempDataArray = []  

  })
  final_datas[rootIndex].display_installed_rooms = finalTempDataArray
})

// let tempDat= []
final_datas.forEach((element,rootIndex)=>{

  final_datas[rootIndex].display_installed_rooms = Array.prototype.concat.apply([], element.display_installed_rooms);
})


let temp =[]
final_datas.forEach((element,index)=>{

  element.display_installed_rooms.forEach((element,indexInner)=>{

   if(element != undefined){
     console.log("inner index",indexInner)
     temp.push(element)
   }

  })
  element.display_installed_rooms = temp
  temp =[]
    
  
})


return(final_datas)



};

module.exports = { start1 };






