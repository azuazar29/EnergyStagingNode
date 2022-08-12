//const {step1,step2,step3} = require('./functions');

const compressor_config = require("../config/compressor_config");
const room_permutations = require("../config/room_permutations");
const room_perm_for_each_config = require("../config/room_perm_for_each_config");
const step5 = require("../config/step5");

var sql = require("../database");

var request = new sql.Request();
let rocc = [];
let condenser = [];
let productList = [];
let fcu = [];
let efficiency_profile = [];
var totrooms1 = 0;
const localvar = {};
let rooms = [];
var load_rating_factor = 1.15;
var sum_of_all_true_loads = 0;
let dbobj = [];
let db1obj = {};
let each_room_cooling_load = [];
let each_room_load = [];
var user_current_rating = 0;
let fs = [];

function step1(area, idealRoomTemparature, ceilingHeightMeter) {
  var basic_cooling_load = 0;
  var room_height_to_ceiling = 0;

  // ////////////////////////console ("dbobj",dbobj)
  dbobj.forEach(function (element) {
    if (Number(ceilingHeightMeter) <= 3) {
      room_height_to_ceiling = "1";
    } else if (Number(ceilingHeightMeter) >= 11) {
      room_height_to_ceiling = "1.3";
    } else if (Number(ceilingHeightMeter) === Number(element.ceiling_value)) {
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
  localvar.compressor_needed = Math.ceil(
    sum_of_all_true_loads / system_cooling_limit
  );
}

let input2 = [];
if (fs.length >= 2) {
  input2 = fs.reduce((r, e) => (r.push(...e), r), []);
} else {
  input2 = fs;
}

module.exports = {
  CoolingConfiguration(req, response, next) {
    return new Promise((resolve, reject) => {
      productList = [];
      select_product_list = [];
      sys1 = [];
      sys2 = [];
      sys3 = [];
      sys4 = [];
      db1obj = [];
      dbobj = [];
      each_room_cooling_load = [];
      sum_of_all_true_loads = 0;
      each_room_load = [];
      condenser = [];

      rocc = [];
      condenser = [];
      productList = [];
      fcu = [];
      efficiency_profile = [];
      rooms = [];
      dbobj = [];
      db1obj = {};
      each_room_cooling_load = [];
      each_room_load = [];
      fs = [];
      let query1 = `Select * from CondensorList`;
      let query2 = `Select * from FCU_New`;
      let query3 = `Select * from System33`;
      let query4 = `Select * from System44`;
      let query5 = `Select * from idealRoomTemparature_coolings`;
      let query6 = `Select * from ceiling_factors`;
      let query7 = `Select * from UserOccupancyPattern Where ConfigID = '${req.params.id}'`;
      let query8 = `Select * from efficiency_profile`;
      request.query(query1, function (err, set) {
        condenser = set.recordsets[0];
        request.query(query2, function (err, set) {
          fcu = set.recordsets[0];
          request.query(query5, function (err, set) {
            db1obj = set.recordsets[0];
            request.query(query6, function (err, set) {
              dbobj = set.recordsets[0];
              request.query(query7, function (err, set) {
                rocc = set.recordsets[0];
                request.query(query8, function (err, set) {
                  efficiency_profile = set.recordsets[0];
                  req.body.rooms.forEach((element) => {
                    let height;
                    if (element.ceilingHeightFeet != "0") {
                      height = element.ceilingHeightFeet;
                    }
                    if (element.ceilingHeightMeter != "0") {
                      height = element.ceilingHeightMeter;
                    }
                    each_room_cooling_load.push(
                      step1(
                        element.roomSize,
                        element.idealRoomTemparature,
                        height
                      )
                    );
                    response.locals.each_room_cooling_load =
                      each_room_cooling_load;
                  });

                  req.body.rooms.forEach((element, i) => {
                    each_room_load.push(
                      step2(element.roomSize, each_room_cooling_load[i])
                    );
                    response.locals.each_room_load = each_room_load;
                  });

                  sum_of_all_true_loads = 0;

                  Object.keys(each_room_load).forEach(function (i) {
                    sum_of_all_true_loads =
                      sum_of_all_true_loads + each_room_load[i];
                  });

                  step3(sum_of_all_true_loads);

                  const { min_true_load, max_true_load, compressor_needed } =
                    localvar;

                  var totrooms1 = req.body.rooms.length;

                  response.locals.sum_of_all_true_loads = sum_of_all_true_loads;
                  response.locals.min_true_load = min_true_load;
                  response.locals.max_true_load = max_true_load;
                  response.locals.totrooms1 = totrooms1;
                  response.locals.compressor_needed = compressor_needed;

                  //console .log('res.local', response.locals)

                  var arr = [];
                  for (var g = 0; g < totrooms1; g++) {
                    arr[g] = g + 1;
                  }

                  // var totnoofcomp = compressor_needed        //compressor_needed

                  var output = [];
                  var RoomPermutations = [];
                  //console .log('totalroom', totrooms1)
                  output = compressor_config.combineElements(totrooms1);

                  RoomPermutations = room_permutations.permute(arr);

                  //console .log("output.lrngth", output.length)

                  var room_perm_for_each_config1 =
                    room_perm_for_each_config.start(
                      compressor_needed,
                      output,
                      RoomPermutations
                    );
                  console.log(
                    "room_perm_for_each_config1",
                    room_perm_for_each_config1
                  );

                  var roomid = [];
                  var compressorno = [];
                  var configno = [];

                  for (var i = 0; i < room_perm_for_each_config1.length; i++) {
                    for (
                      var j = 0;
                      j < room_perm_for_each_config1[i].length;
                      j++
                    ) {
                      for (
                        var k = 0;
                        k < room_perm_for_each_config1[i][j].length;
                        k++
                      ) {
                        roomid.push(room_perm_for_each_config1[i][j][k]);
                        compressorno.push(j + 1);
                        configno.push(i + 1);
                      }
                    }
                  }

                  response.locals.roomid = roomid;
                  response.locals.compressorno = compressorno;
                  response.locals.configno = configno;

                  var p1 = [];
                  installed_rooms1 = [];
                  var products = [];
                  var output1 = [];
                  output1 = room_perm_for_each_config1;

                  //console .log("room_perm_for_each_config1")

                  for (var i = 0; i < room_perm_for_each_config1.length; i++) {
                    // display_to_rooms.push(room_perm_for_each_config1[i])
                    for (
                      var j = 0;
                      j < room_perm_for_each_config1[i].length;
                      j++
                    ) {
                      // ////console .log(room_perm_for_each_config1[i][j])
                      var tot = 0,
                        sum = 0,
                        fcuarrays = [];
                      for (
                        var k = 0;
                        k < room_perm_for_each_config1[i][j].length;
                        k++
                      ) {
                        sum +=
                          each_room_load[
                            room_perm_for_each_config1[i][j][k] - 1
                          ];
                        fcuarrays.push(
                          each_room_load[
                            room_perm_for_each_config1[i][j][k] - 1
                          ]
                        );
                        tot += 1;
                      }
                      console.log("element fcu",fcuarrays)
                      console.log("sum",sum)
                      var status = "system" + tot;
                      var listt = [];
                      user_current_rating = Number(
                        req.body.rooms[0].currentRating
                      );
                      console.log(condenser.length)
                      for (var l = 0; l < condenser.length; l++) {
                        var num = condenser[l].CurrentRating.replace(/\D/g, "");
                      // console.log("user_current_rating",num)

                        if (
                          num >= user_current_rating &&
                          sum_of_all_true_loads >= min_true_load &&
                          sum_of_all_true_loads <= max_true_load &&
                          condenser[l].CoolingCapacity >= sum &&
                          condenser[l].FCUCapacity >= sum
                        ) {
                          // console.log("it came here if condition",condenser[l].id)
                          var allfcunames = [],
                            allfcus = [];

                          for (var i1 = 0; i1 < fcu.length; i1++) {
                            if (
                              condenser[l].id.toString() ===
                              fcu[i1].CondenserId.toString()
                            ) {
                              allfcunames.push(fcu[i1]);
                              allfcus.push(fcu[i1].FCU);
                            }
                          }
                       
                          // console.log("allfcus",allfcus)
                        

                          flag1 = 1;
                          var count = 0;
                          for (var i2 = 0; i2 < fcuarrays.length; i2++) {
                            
                            // if(allfcus[i2] == '4600' || allfcus[i2] == '1200' || allfcus[i2] == '1650'){
                            //   console.log('fcuarrays[i2]',fcuarrays[i2]<=allfcus[i2])

                            // }
                            let isTrue = false
                            allfcus.forEach(element=>{

                              if(fcuarrays[i2] <= element){
                                isTrue = true
                              }else{
                                isTrue = false
                              }

                            })
                            if(isTrue)
                            count++
                           
                          }
                          //  console.log("count",count,fcuarrays.length)
                          if ((count === fcuarrays.length) && (count === allfcus.length)  ) {
                            // console.log("finall ifff",allfcunames.length,allfcus.length)
                            listt.push(
                              `{"rooms":"${
                                room_perm_for_each_config1[i][j]
                              }","condensername":"${
                                condenser[l].ProductName
                              }","condenserid":${JSON.stringify(
                                condenser[l]
                              )},"fcusname":${JSON.stringify(
                                allfcunames
                              )},"fcus":"${allfcus}","coolingcapacity":"${
                                condenser[l].CoolingCapacity
                              }","price":"${
                                condenser[l].Price
                              }","currentrating":"${
                                condenser[l].CurrentRating
                              }"}`
                            );
                          } else {
                          }
                        
                          allfcunames = [];
                          allfcus = [];
                        }
                      }
                      productList.push(listt);
                    }
                  }

                  // console.log("product lenth", JSON.parse(productList))
                

                  //grouping products with based on it's rooms
                  var temporary = chunk(productList);
                  // console.log("chunk",JSON.parse(temporary))
                  function chunk(arr) {
                    var i,
                      j,
                      tempor = [],
                      chunk = compressor_needed;
                    for (i = 0, j = arr.length; i < j; i += chunk) {
                      tempor.push(arr.slice(i, i + chunk));
                    }
                    return tempor;
                  }

                  //removing unwanted products EX:like [1,3] will have no prod but [2,4] will have products
                  var li = [],
                    rtt = [];
                  for (var i = 0; i < temporary.length; i++) {
                    var flag = 0;
                    for (var j = 0; j < temporary[i].length; j++) {
                      if (temporary[i][j].length === 0) {
                        flag = 1;
                      }
                    }
                    if (flag === 0) {
                      li.push(temporary[i]);
                    }
                  }
                // console.log('li',li)

                  //evening the all products as same amount
                  var val = [];
                  var curr = 0;
                  const allEqual = (arr) => arr.every((v) => v === arr[0]);
                  // console.log("allequal",allEqual)
                  function call(val, i1) {
                    if (!allEqual(val)) {
                      curr = val.indexOf(Math.min(...val));
                      for (
                        var k = 0;
                        k < Math.max(...val) - Math.min(...val);
                        k++
                      ) {
                        li[i1][curr].push(li[i1][curr][Math.min(...val) - 1]);
                      }
                    }
                    // console.log('val',val)

                    val = [];
                    for (var j = 0; j < li[i].length; j++) {
                      val.push(li[i][j].length);
                    }
                    if (!allEqual(val)) {
                      call(val, i1);
                    }
                  }

                  for (var i = 0; i < li.length; i++) {
                    val = [];

                    if (val.length != 1) {
                      call(val, i);
                    }
                  }
                  // console.log('li.length',li.length)

                  //combining the product datas based on index
                  var res = [];
                  for (var i = 0; i < li.length; i++) {
                    res.push(
                      li[i].reduce((a, b) => a.map((v, i) => v + "$" + b[i]))
                    );
                  }

                  // console.log("res.length",res.length)
                  //splitting a string based on $
                  var temp = [];
                  for (var i = 0; i < res.length; i++) {
                    for (var j = 0; j < res[i].length; j++) {
                      temp.push(res[i][j].split("$"));
                    }
                  }

                  //list view
                  // console .log(temp.length)

                  //converting list to meaningful obj
                  let r = [],
                    select_product_list = [];
                  for (var i = 0; i < temp.length; i++) {
                    r = [];
                    for (var j = 0; j < temp[i].length; j++) {
                      r.push(JSON.parse(temp[i][j]));
                    }
                    select_product_list.push(r);
                  }
                // console .log("selected list",select_product_list)

                  var sum = 0;
                  for (var i = 0; i < each_room_load.length; i++) {
                    sum += each_room_load[i];
                  }
                  let responseFinal = step5.start1(
                    select_product_list,
                    rooms.length,
                    rocc,
                    each_room_load,
                    efficiency_profile,
                    sum,
                    req.body.rooms
                  );

                  resolve({
                    EnergyWise: responseFinal.energyWise,
                    PriceWise: responseFinal.priceWise,
                  });

                  rocc = [];
                  sys1 = [];
                  sys2 = [];
                  sys3 = [];
                  sys4 = [];
                  efficiency_profile = [];
                  totrooms1 = 0;
                  rooms = [];
                  load_rating_factor = 1.15;
                  sum_of_all_true_loads = 0;
                  dbobj = [];
                  db1obj = {};
                  b1 = 0;
                  var li1count = 0;
                  li1 = [];
                  var li2 = [];
                  var li3 = [];
                  each_room_cooling_load = [];
                  each_room_load = [];
                  sys1 = [];
                  sys2 = [];
                  sys3 = [];
                  sys4 = [];
                  db1obj = [];
                  dbobj = [];
                  each_room_cooling_load = [];
                  sum_of_all_true_loads = 0;
                  each_room_load = [];
                  select_product_list = [];
                  selected_product_list = [];
                  selected_product_list1 = [];
                  installed_rooms = [];
                  installed_rooms1 = [];
                  fs = [];
                  fg1 = [];
                });
              });
            });
          });
        });
      });
    });
  },
};
