//const {step1,step2,step3} = require('./functions');

const compressor_config = require("../config/compressor_config");
const room_permutations = require('../config/room_permutations');
const room_perm_for_each_config = require('../config/room_perm_for_each_config');
const step5 = require('../config/step5');

var sql = require("../database");
let installed_rooms=[]
let installed_rooms1=[]
var request = new sql.Request();
let rocc = []
let sys1 = []
let sys2 = []
let sys3 = []
var RoomPermutations = []
let sys4 = []
var req_len=0
var fg=[]
var fg1=[]

let efficiency_profile = [

]
var totrooms1 = 0;
const localvar = {};

let rooms = [];
var load_rating_factor = 1.15;
var sum_of_all_true_loads = 0;
let dbobj = [];
let db1obj = {};
var b1 = 0; var li1count = 0;
var li1 = []; var li2 = []; var li3 = [];
let each_room_cooling_load = [];
let each_room_load = [];
var user_current_rating = 8
let min_true_load
let max_true_load
let fs=[]


function step1(area, idealRoomTemparature, ceilingHeightFeet) {

  var basic_cooling_load = 0;
  var room_height_to_ceiling = 0;

  // //////////////////////console("dbobj",dbobj)
  dbobj.forEach(function (element) {
    if (Number(ceilingHeightFeet) <= 3) {
      room_height_to_ceiling = "1"
    } else if (Number(ceilingHeightFeet) >= 11) {
      room_height_to_ceiling = "1.3"
    } else if (Number(ceilingHeightFeet) === Number(element.ceiling_value)) {
      room_height_to_ceiling = element.ceil_factor;
    }
  });

  db1obj.forEach(function (element) {
    if (Number(idealRoomTemparature) === Number(element.roomtemp)) {
      basic_cooling_load = element.wsqm;
    }
  });
  const Cooling_load = basic_cooling_load * room_height_to_ceiling;
  return Cooling_load;
}
function step2(area, cl) {
  const true_load = area * cl * load_rating_factor;
  totrooms1 = totrooms1 + 1;
  // sum_of_all_true_loads = sum_of_all_true_loads+true_load;
  return true_load;
}

function step3(sum_of_all_true_loads) {

  var min_load_factor = 1;
  var max_load_factor = 1.5;
  var comp = 1;
  var system_cooling_limit = 8510;
  localvar.min_true_load = min_load_factor * sum_of_all_true_loads;
  localvar.max_true_load = max_load_factor * sum_of_all_true_loads;
  localvar.compressor_needed = Math.round(sum_of_all_true_loads / system_cooling_limit)
  
}


function qwe4(arr,res) {
  var li3 = []; var alltrueload = [];

  for (var i = 0; i < arr.length; i++) {
    alltrueload.push(each_room_load[arr[i] - 1])
  }
  var cool = 0
  for (var j = 0; j < alltrueload.length; j++) {
    cool += alltrueload[j]
  }
  li3 = []

  
  for (var i = 0; i < sys4.length; i++) {
    if (sys4[i].cooling_capacity >= cool) {
      if (sys4[i].cooling_capacity <= res.locals.min_true_load && sys4[i].cooling_capacity <= res.locals.max_true_load) {
        if (sys4[i].current_rating <= user_current_rating) {
          li3.push(sys4[i]);
        }
      }
    }

  }
  return li3;
}
function qwe3(arr,res) {
  var li3 = []; var alltrueload = [];

  for (var i = 0; i < arr.length; i++) {
    alltrueload.push(each_room_load[arr[i] - 1])
  }
  var cool = 0
  for (var j = 0; j < alltrueload.length; j++) {
    cool += alltrueload[j]
  }

  li3 = []
  
 
  for (var i = 0; i < sys3.length; i++) {
    if (sys3[i].cooling_capacity >= cool) {
      if (sys3[i].cooling_capacity <= res.locals.min_true_load && sys3[i].cooling_capacity <= res.locals.max_true_load) {
        if (sys3[i].current_rating <= user_current_rating) {
          li3.push(sys3[i]);
        }
      }
    }

  }
  return li3;
}

function qwe2(arr,res) {
  var li3 = []; var alltrueload = [];

  for (var i = 0; i < arr.length; i++) {
    alltrueload.push(each_room_load[arr[i] - 1])
  }
  var cool = 0
  for (var j = 0; j < alltrueload.length; j++) {
    cool += alltrueload[j]
  }

  li3 = []
  
 
  for (var i = 0; i < sys2.length; i++) {
    if (sys2[i].cooling_capacity >= cool) {
      if (sys2[i].cooling_capacity <= res.locals.min_true_load && sys2[i].cooling_capacity <= res.locals.max_true_load) {
        if (sys2[i].current_rating <= user_current_rating) {
          li3.push(sys2[i]);
        }
      }
    }

  }
  return li3;
}

function qwe1(arr,res) {
  var lisys11 = []; var alltrueload = [];
  for (var i = 0; i < arr.length; i++) {
    alltrueload.push(each_room_load[arr[i] - 1])
  }
  var cool = 0
  for (var j = 0; j < alltrueload.length; j++) {
    cool += alltrueload[j]
  }

  lisys11 = []
  //////console("cool",cool)
  for (var i = 0; i < sys1.length; i++) {
    if (sys1[i].cooling_capacity >= cool) {

      // //////console(sys1[i].cooling_capacity,res.locals.min_true_load,res.locals.max_true_load)


      if (sys1[i].cooling_capacity <= res.locals.min_true_load && sys1[i].cooling_capacity <= res.locals.max_true_load) {
        
        if (sys1[i].current_rating <= user_current_rating) {
          lisys11.push(sys1[i]);
        }
      }
    }

  }
  return lisys11;
}

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
let input2=[]
if(fs.length>=2){
   input2 = fs.reduce((r, e) => (r.push(...e), r), [])  
}
else{
  input2=fs
}

module.exports = {

  CoolingConfiguration(req, res, next) {
    return new Promise((resolve, reject) => {
      sys1 = []
      sys2 = []
      sys3 = []
      sys4 = []
      db1obj = []
      dbobj = []
      each_room_cooling_load = []
      sum_of_all_true_loads = 0
      each_room_load = []
      

      let query1 = `Select * from System11`
      let query2 = `Select * from System22`
      let query3 = `Select * from System33`
      let query4 = `Select * from System44`
      let query5 = `Select * from idealRoomTemparature_coolings`
      let query6 = `Select * from ceiling_factors`
      let query7 = `Select * from UserOccupancyPattern Where ConfigID = '${req.params.id}'`
      let query8 = `Select * from efficiency_profile`
      request.query(query1, function (err, set) {
        sys1 = set.recordsets[0]
        request.query(query2, function (err, set) {
          sys2 = set.recordsets[0]
          request.query(query3, function (err, set) {
            sys3 = set.recordsets[0]
            request.query(query4, function (err, set) {
              sys4 = set.recordsets[0]
              request.query(query5, function (err, set) {
                db1obj = set.recordsets[0]
                request.query(query6, function (err, set) {
                  dbobj = set.recordsets[0]
                  request.query(query7, function (err, set) {
                    rocc = set.recordsets[0]
                    request.query(query8, function (err, set) {
                      efficiency_profile = set.recordsets[0]
                      req.body.rooms.forEach(element => {
                        each_room_cooling_load.push(step1(element.roomSize, element.idealRoomTemparature, element.ceilingHeightFeet));
                        res.locals.each_room_cooling_load = each_room_cooling_load;
                      });


                      req.body.rooms.forEach((element, i) => {
                        each_room_load.push(step2(element.roomSize, each_room_cooling_load[i]));
                        res.locals.each_room_load = each_room_load;
                      });

                      sum_of_all_true_loads=0;

                      Object.keys(each_room_load).forEach(function (i) {
                        sum_of_all_true_loads = sum_of_all_true_loads + each_room_load[i];
                      });

                    
                      step3(sum_of_all_true_loads);


                      const { min_true_load, max_true_load, compressor_needed } = localvar;
                      


                      res.locals.sum_of_all_true_loads = sum_of_all_true_loads;
                      res.locals.min_true_load = min_true_load;
                      res.locals.max_true_load = max_true_load;
                      res.locals.totrooms1 = totrooms1;
                      res.locals.compressor_needed = compressor_needed;
                      
                      //console.log('res.local',res.locals)

                      var arr = [];
                      for (var g = 0; g < totrooms1; g++) {
                        arr[g] = g + 1;
                      }



                      var totnoofcomp = compressor_needed        //compressor_needed

                      var output = []

                      output = compressor_config.combineElements(totrooms1);
                      //console.log(output)
                      //console.log("-----------------------------")
                      //console.log("Compressors Configurations")
                      //console.log("-----------------------------")
                      //console.log(output)
                      for(var i=0;i<output.length;i++){
                        flag=true
                        if(output[i].length==totnoofcomp){
                          for(var j=0;j<output[i].length;j++){
                              if(output[i][j]>4){flag=false}
                          }
                        if(flag==true){
                          //console.log(output[i])
                          fg.push(output[i])
                          req_len++
                        }
                        }
                      }
                      //console.log("-----------------------------")
                      //console.log("Room Permutations")
                      //console.log("-----------------------------")
                     
                      
                      for(var i=1;i<=2;i++){
                        RoomPermutations.push(room_permutations.random(totrooms1))  
                      }

                      //console.log(RoomPermutations)


 
                      if(req_len>3 && rooms.length>8){
                          fg1.push(fg[0])
                          fg1.push(fg[1])
                      }
                      else{
                        fg1.push(fg)
                        console.log("fg1",fg1)
                        if(fg1.length){
                          fg1 = fg1.reduce((r, e) => (r.push(...e), r), [])

                        }
                      }

                      var room_perm_for_each_config1 = room_perm_for_each_config.start(totnoofcomp, fg1, RoomPermutations);

                      //console.log("permutaion",room_perm_for_each_config1)
                      var roomid = []
                      var compressorno = []
                      var configno = []

                      for (var i = 0; i < room_perm_for_each_config1.length; i++) {
                        for (var j = 0; j < room_perm_for_each_config1[i].length; j++) {
                          for (var k = 0; k < room_perm_for_each_config1[i][j].length; k++) {
                            roomid.push(room_perm_for_each_config1[i][j][k])
                            compressorno.push(j + 1)
                            configno.push(i + 1)
                          }
                        }
                      }

                      res.locals.roomid = roomid
                      res.locals.compressorno = compressorno
                      res.locals.configno = configno


                      var p1=[]
                      installed_rooms1=[] 
                      var products=[]
                      var output1 = []
                      output1 = room_perm_for_each_config1


                      var a = [], b = []

                      var ccc = 0;
                      var selected_product_list = []
                      var selected_product_list1 = []
                      for (var i = 0; i < output1.length; i++) {
                        ccc = 0
                        p1=[]
                        installed_rooms1=[]

                        for (var j = 0; j < output1[i].length; j++) {
                          a = output1[i]

                          if (a[j].length == 4) {
                         
                            if (qwe4(a[j],res).length){                           
                              p1.push(qwe4(a[j],res))
                              installed_rooms1.push(a[j])

                              // selected_product_list.push(qwe4(a[j], res));
                            }
                          }
                          if (a[j].length == 3) {                           
                            if (qwe3(a[j],res).length){
                              installed_rooms1.push(a[j])
                              p1.push(qwe3(a[j],res))
                            }
                          }
                          if (a[j].length == 2) {                         
                            if (qwe2(a[j],res).length){   
                              installed_rooms1.push(a[j])
                              p1.push(qwe2(a[j],res))                              
                            }
                          }
                          if (a[j].length == 1) {                          
                            if (qwe1(a[j],res).length){  
                              installed_rooms1.push(a[j])
                              p1.push(qwe1(a[j],res))                              
                            }
                          }
                        
                        }
                       
                        products.push(p1.reduce((a, b) => a.reduce((r, v) => r.concat(b.map(w => [].concat(v, w))), [])));

                        if(products[i].length==0){
                          // ////console("empty") 
                         }
                         else{
                          installed_rooms.push(Array(products[i].length).fill(installed_rooms1)) 
                        // ////console(products[i])
                         fs.push(products[i])
                         }
                      }


                      var sum = 0
                      for (var i = 0; i < each_room_load.length; i++) {
                        sum += each_room_load[i]
                      }
                      products = products.reduce((r, e) => (r.push(...e), r), [])

                      ////console("producst",products.length)

                      energy  = step5.start1(products,rooms.length,rocc,each_room_load,efficiency_profile,sum,installed_rooms,req.body.rooms,0,res)

                      

                      resolve({ EnergyWise: energy.sort(dynamicSort("display_yearr_electricity_cost")), PriceWise: energy.sort(dynamicSort("display_price")) })
                     //////console("energy",energy)

                      // let temp = selected_product_list
                      // temp.forEach(element => {

                      //   temp = temp.concat(element)

                      // })


                      // var obj = {};

                      // for (var i = 0, len = temp.length; i < len; i++)
                      //   obj[temp[i]['product_id']] = temp[i];

                      // temp = [];
                      // for (var key in obj)
                      //   temp.push(obj[key]);

                      // temp.sort(dynamicSort("price"));

                      // let PriceWise = temp
                      // products = products.reduce((r, e) => (r.push(...e), r), [])
                      ////////////////console("p1",products.length)

                      // resolve(products)
                      // let energy  = step5.start1(products,rooms.length,rocc,each_room_load,efficiency_profile,sum,req.body.rooms)

                      // //////////////////console("installed rooms",installed_rooms)
                      // if(req.params.productId){
                      //   energy  = step5.start1(selected_product_list,rooms.length,rocc,each_room_load,efficiency_profile,sum,installed_rooms,req.body.rooms,1)

                      //   resolve(energy)

                      // }else{
                      // energy  = step5.start1(selected_product_list,rooms.length,rocc,each_room_load,efficiency_profile,sum,installed_rooms,req.body.rooms,0)
                      // var obj1 = {};

                      // for (var i = 0, len = energy.length; i < len; i++)
                      //   obj1[energy[i]['product_id']] = energy[i];

                      // energy = new Array();
                      // for (var key in obj1)
                      //   energy.push(obj1[key]);

                      // energy.sort(dynamicSort("yearly_operating_power"));

                      // energy[0].forEach(element=>{

                      //   Object.keys(element).forEach(result=>{

                      //     if(typeof element[result] != "object")
                      //     element[result] =  element[result].toString()

                      //   })

                      // })

                      // PriceWise.forEach(element=>{

                      //   Object.keys(element).forEach(result=>{

                      //     if(typeof element[result] != "object")
                      //     element[result] =  element[result].toString()

                      //   })

                      // })

                      //  PriceWise.splice(PriceWise.length-1,1)
                     

                      // resolve({ EnergyWise: energy[0], PriceWise: PriceWise })

                      // }
                      
                      
                      rocc = []
                      sys1 = []
                      sys2 = []
                      sys3 = []
                      sys4 = []
                      efficiency_profile = []
                      totrooms1 = 0;
                      rooms = [];
                      load_rating_factor = 1.15;
                      sum_of_all_true_loads = 0;
                      dbobj = [];
                      db1obj = {};
                      b1 = 0; var li1count = 0;
                      li1 = []; var li2 = []; var li3 = [];
                      each_room_cooling_load = [];
                      each_room_load = [];
                      sys1 = []
                      sys2 = []
                      sys3 = []
                      sys4 = []
                      db1obj = []
                      dbobj = []
                      each_room_cooling_load = []
                      sum_of_all_true_loads = 0
                      each_room_load = []
                      selected_product_list = []
                      selected_product_list1 = []
                      installed_rooms = []
                      installed_rooms1=[]
                      fs = []
                      fg1 = []

                      
                      // //////////////////////console("selected_product_list",selected_product_list)

                    })
                  })
                })
              })
            })
          })
        })
      })

    })

  }
}