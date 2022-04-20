const hs = require("./hourly_true_load");
const filePath = require("./filePath");
function start1(
  input1,
  roomslen,
  occ_patt,
  true_load,
  eff,
  total_true_load,
  roomsArray
) {
  // console.log("input", input1)

  var mon = [],
    tue = [],
    wed = [],
    thurs = [],
    fri = [],
    sat = [],
    sun = [];
  var mon_load = [],
    tue_load = [],
    wed_load = [],
    thurs_load = [],
    fri_load = [],
    sat_load = [],
    sun_load = [];
  var configid = occ_patt[0].configID;
  var room_weekdays = [];
  var room_weekends = [];

  occ_patt.forEach((element) => {
    element.mondayList = JSON.parse(element.mondayList);
    element.tuesdayList = JSON.parse(element.tuesdayList);
    element.wednesdayList = JSON.parse(element.wednesdayList);
    element.thursdayList = JSON.parse(element.thursdayList);
    element.fridayList = JSON.parse(element.fridayList);
    element.saturdayList = JSON.parse(element.saturdayList);
    element.sundayList = JSON.parse(element.sundayList);
  });

  const callit = (am, pm) => {
    var a = [];
    for (var i = 1; i <= 11; i++) {
      if (am.indexOf(i + "AM") > -1) {
        a.push(1);
      } else {
        a.push(0);
      }
    }
    if (pm.indexOf("12PM") > -1) {
      a.push(1);
    } else {
      a.push(0);
    }
    for (var j = 1; j <= 11; j++) {
      if (pm.indexOf(j + "PM") > -1) {
        a.push(1);
      } else {
        a.push(0);
      }
    }
    if (am.indexOf("12AM") > -1) {
      a.push(1);
    } else {
      a.push(0);
    }
    return a;
  };

  //....................mon...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      mon = [];
      // mon_load=[]
      room_weekdays.push(
        occ_patt[i].mondayList.length +
          occ_patt[i].tuesdayList.length +
          occ_patt[i].wednesdayList.length +
          occ_patt[i].thursdayList.length +
          occ_patt[i].fridayList.length
      );
      room_weekends.push(
        occ_patt[i].saturdayList.length + occ_patt[i].sundayList.length
      );
      for (var j = 0; j < occ_patt[i].mondayList.length; j++) {
        // ////////////////////console .log(occ_patt[i].mondayList[j])
        // ////////////////////console .log("i"+(r+1))
        const [digits, word] = occ_patt[i].mondayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].mondayList[j]);
        } else {
          pm.push(occ_patt[i].mondayList[j]);
        }
      }
      r = r + 1;

      mon.push(callit(am, pm));
      mon_load.push(hs.mon_true_load(mon, r, true_load));
    }
  }

  //....................tue...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      tue = [];
      // mon_load=[]
      for (var j = 0; j < occ_patt[i].tuesdayList.length; j++) {
        const [digits, word] = occ_patt[i].tuesdayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].tuesdayList[j]);
        } else {
          pm.push(occ_patt[i].tuesdayList[j]);
        }
      }
      r = r + 1;
      tue.push(callit(am, pm));
      tue_load.push(hs.tue_true_load(tue, r, true_load));
    }
  }

  //....................wed...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      wed = [];
      for (var j = 0; j < occ_patt[i].wednesdayList.length; j++) {
        const [digits, word] = occ_patt[i].wednesdayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].wednesdayList[j]);
        } else {
          pm.push(occ_patt[i].wednesdayList[j]);
        }
      }
      r = r + 1;
      wed.push(callit(am, pm));
      wed_load.push(hs.wed_true_load(wed, r, true_load));
    }
  }

  //....................thurs...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      thurs = [];
      for (var j = 0; j < occ_patt[i].thursdayList.length; j++) {
        const [digits, word] = occ_patt[i].thursdayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].thursdayList[j]);
        } else {
          pm.push(occ_patt[i].thursdayList[j]);
        }
      }
      r = r + 1;
      thurs.push(callit(am, pm));
      thurs_load.push(hs.thurs_true_load(thurs, r, true_load));
    }
  }

  //....................fri...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      fri = [];
      // mon_load=[]
      for (var j = 0; j < occ_patt[i].fridayList.length; j++) {
        const [digits, word] = occ_patt[i].fridayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].fridayList[j]);
        } else {
          pm.push(occ_patt[i].fridayList[j]);
        }
      }
      r = r + 1;
      fri.push(callit(am, pm));
      fri_load.push(hs.fri_true_load(fri, r, true_load));
    }
  }

  //....................sat...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      sat = [];
      // mon_load=[]
      for (var j = 0; j < occ_patt[i].saturdayList.length; j++) {
        const [digits, word] = occ_patt[i].saturdayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].saturdayList[j]);
        } else {
          pm.push(occ_patt[i].saturdayList[j]);
        }
      }
      r = r + 1;
      sat.push(callit(am, pm));
      sat_load.push(hs.sat_true_load(sat, r, true_load));
    }
  }

  //....................sun...................................

  var am = [];
  var pm = [];
  var r = 0;
  for (var i = 0; i < occ_patt.length; i++) {
    if (occ_patt[i].configID == configid) {
      sun = [];
      for (var j = 0; j < occ_patt[i].sundayList.length; j++) {
        const [digits, word] = occ_patt[i].sundayList[j].match(/\D+|\d+/g);
        if (word === "AM") {
          am.push(occ_patt[i].sundayList[j]);
        } else {
          pm.push(occ_patt[i].sundayList[j]);
        }
      }
      r = r + 1;
      sun.push(callit(am, pm));
      sun_load.push(hs.sun_true_load(sun, r, true_load));
    }
  }

  //hourly_operating_load
  var mon_opt_load = [],
    tue_opt_load = [],
    wed_opt_load = [],
    thurs_opt_load = [],
    fri_opt_load = [],
    sat_opt_load = [],
    sun_opt_load = [];
  var ty = [];
  for (var i = 0; i < input1.length; i++) {
    let tot = [];

    for (var j = 0; j < input1[i].length; j++) {
      // ////////////////////console .log(input1[i][j].manufacturer)
      mon_opt_load = [];
      tue_opt_load = [];
      wed_opt_load = [];
      thurs_opt_load = [];
      fri_opt_load = [];
      sat_opt_load = [];
      sun_opt_load = [];
      for (var k = 0; k < mon_load.length; k++) {
        mon_opt_load.push(
          Math.round(mon_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }

      for (var k = 0; k < tue_load.length; k++) {
        tue_opt_load.push(
          Math.round(tue_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }

      for (var k = 0; k < wed_load.length; k++) {
        wed_opt_load.push(
          Math.round(wed_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }

      for (var k = 0; k < thurs_load.length; k++) {
        thurs_opt_load.push(
          Math.round(thurs_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }

      for (var k = 0; k < fri_load.length; k++) {
        fri_opt_load.push(
          Math.round(fri_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }

      for (var k = 0; k < sat_load.length; k++) {
        sat_opt_load.push(
          Math.round(sat_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }

      for (var k = 0; k < sun_load.length; k++) {
        sun_opt_load.push(
          Math.round(sun_load[k] / input1[i][j].coolingcapacity) * 100
        );
      }
      tot = [];
      tot = [
        mon_opt_load,
        tue_opt_load,
        wed_opt_load,
        thurs_opt_load,
        fri_opt_load,
        sat_opt_load,
        sun_opt_load,
      ];
      ////////////////////console .log("total",tot)
      // ////////////////////console .log(input1[i][j].hourly_operating_load)
    }
    input1[i].hourly_operating_load = tot;
  }

  //hourly_cop
  var inner1 = [],
    outer1 = [];
  for (var i = 0; i < input1.length; i++) {
    outer1 = [];
    for (var j = 0; j < input1[i].hourly_operating_load.length; j++) {
      inner1 = [];
      for (var k = 0; k < input1[i].hourly_operating_load[j].length; k++) {
        for (var t = 0; t < eff.length; t++) {
          if (
            Number(input1[i].hourly_operating_load[j][k]) ===
            Number(eff[t].hourly_operating_load)
          ) {
            inner1.push(eff[t].hourly_cop);
          }
        }
      }
      outer1.push(inner1);
    }
    input1[i].hourly_cop = outer1;
  }

  //hourly_operating_power
  var inner1 = [],
    outer1 = [];

  for (var i = 0; i < input1.length; i++) {
    //  new change
    outer1 = [];

    var li = [];
    li = input1[i].map(function (obj) {
      return Number(obj.coolingcapacity);
    });
    var coolcap = li.reduce((a, b) => a + b, 0);
    // new Change

    for (var j = 0; j < input1[i].hourly_cop.length; j++) {
      inner1 = [];
      for (var k = 0; k < input1[i].hourly_cop[j].length; k++) {
        inner1.push(Number(input1[i].hourly_cop[j][k]) * coolcap);
      }
      outer1.push(inner1);
    }
    input1[i].hourly_operating_power = outer1;
    // ////////////////////console .log(out)
  }

  //console .log(eff)
  var usage_adherence = Number(occ_patt[0].usageAdherence) / 10; //0.75; //(75%) get value from user
  // var usage_adherence= 1//0.75; //(75%) get value from user
  //console .log("usage adherance",usage_adherence)
  //sum of weekday & sum of weekends
  var inner1 = [],
    inner2 = [];
  for (var i = 0; i < input1.length; i++) {
    (inner1 = []), (inner2 = []);
    for (var j = 0; j < input1[i].hourly_operating_power.length - 2; j++) {
      inner1.push(
        input1[i].hourly_operating_power[j].reduce((a, b) => a + b, 0)
      );
    }
    for (var j = 5; j < input1[i].hourly_operating_power.length; j++) {
      inner2.push(
        input1[i].hourly_operating_power[j].reduce((a, b) => a + b, 0)
      );
    }
    if (usage_adherence != 10) {
      let use = [];
      let use2 = [];
      for (var z = 0; z < inner1.length; z++) {
        use.push(usage_adherence * inner1[z]);
      }

      //console .log("inner",inner1)
      input1[i].weekdays = use;
      input1[i].weekends = inner2;
    } else {
      input1[i].weekdays = inner1;
      input1[i].weekends = inner2;
    }
  }

  // console.log(input1[0]);

  //monthly operating power
  for (var i = 0; i < input1.length; i++) {
    input1[i].monthy_operating_power =
      ((input1[i].weekdays.reduce((a, b) => a + b, 0) +
        input1[i].weekends.reduce((a, b) => a + b, 0)) *
        4) /
      1000;
  }

  //monthly operating power
  for (var i = 0; i < input1.length; i++) {
    input1[i].yearly_operating_power = input1[i].monthy_operating_power * 12;
  }

  var electricity_tariff = 0.29; //1.25
  ///electricity tariff for week
  for (var i = 0; i < input1.length; i++) {
    var week =
      input1[i].weekdays.reduce((a, b) => a + b, 0) / 1000 +
      input1[i].weekends.reduce((a, b) => a + b, 0) / 1000;
    var week_electricity_cost = week * electricity_tariff;
    var month_electricity_cost = week_electricity_cost * 4;
    var year_electricity_cost = month_electricity_cost * 12;

    input1[i].weekly_electricity_cost = week_electricity_cost;
    input1[i].monthly_electricity_cost = month_electricity_cost;
    input1[i].yearly_electricity_cost = year_electricity_cost;
  }

  result = [];
  for (var i = 0; i < input1.length; i++) {
    var li = [];
    li = input1[i].map(function (obj) {
      return Number(obj.price);
    });
    input1[i].totalprice = li.reduce((a, b) => a + b, 0);
  }

  let display_installed_rooms = [];
  let display_product_img = "";
  let finalProductOutput = [];
  let condenserIDs = [];
  let condenserImg = [];
  let display_price = 0;
  let tempName = "";
  let tempImg = [];
  // console.log('input1',...input1)
  input1.forEach((element, index) => {
    condenserIDs = [];
    condenserImg = [];
    display_price = 0;
    element.forEach((elementinner) => {
      // console.log("elementinner", elementinner);

      let imagePath = elementinner.condenserid.ImagePath.toString();
      if (imagePath.includes("public/images")) {
        imagePath = filePath.HostUrl1 + imagePath;
      }
      if (tempName != elementinner.condensername) {
        tempImg.push(imagePath);
      }
      tempName = elementinner.condensername;
      display_product_img = imagePath;
      display_price = display_price + Number(elementinner.condenserid.Price);
      condenserImg.push(imagePath);
      condenserIDs.push(elementinner.condenserid.id);
      let obj = {
        compressor: elementinner.condensername,
        productName: elementinner.condenserid.Brand,
        pump: Number(element.monthy_operating_power / 30)
          .toFixed(2)
          .toString(),
        power: elementinner.condenserid.PowerConsumption.toString(),
        price: Number(elementinner.condenserid.Price).toString(),
        products: [],
      };
      let rooms = elementinner.rooms.split(",");

      rooms.forEach((room, indexRoom) => {
        room = Number(room);
        let roomObj = roomsArray[room - 1];
        // console.log("room", roomObj);
        let weekendsHour, weekdaysHour;
        // ////console .log("elementinner",elementinner.fcusname[indexRoom])

        occ_patt.forEach((occ) => {
          if (occ.roomID.toString() == roomObj.Id.toString()) {
            weekendsHour = occ.weekendsHour;
            weekdaysHour = occ.weekdaysHour;
          }
        });

        let imagePathFCU = elementinner.fcusname[indexRoom].ImagePath
          ? elementinner.fcusname[indexRoom].ImagePath
          : "";

        if (imagePathFCU.includes("public/images")) {
          imagePathFCU = filePath.HostUrl1 + imagePathFCU;
        }

        Object.keys(elementinner.fcusname[indexRoom]).forEach((element) => {
          if (elementinner.fcusname[indexRoom][element] == null) {
            elementinner.fcusname[indexRoom][element] = "";
          }
        });
        elementinner.fcusname[indexRoom].ImagePath = imagePathFCU;

        let prodObj = {
          roomName: roomObj.roomName,
          roomTemperature: roomObj.idealRoomTemparature.toString(),
          roomSize: roomObj.roomSize.toString(),
          weekdayhours: weekdaysHour.toString(),
          weekendhours: weekendsHour.toString(),
          product: [elementinner.fcusname[indexRoom]],
        };

        obj.products.push(prodObj);
      });

      display_installed_rooms.push(obj);
    });
    // console.log("display_installed_rooms", display_installed_rooms);

    let subCost = 0;

    let cNumber = getProductName(display_installed_rooms);

    let totalCCost = 0;
    cNumber.forEach((element) => {
      totalCCost = totalCCost + Number(element.price) * Number(element.count);
    });

    subCost = Math.floor((Number(display_price) + totalCCost) / 36);
    let subCost5 = Math.floor((Number(display_price) + totalCCost) / 60);
    let subCost7 = Math.floor((Number(display_price) + totalCCost) / 84);
    let newImage  = []
   

    let obj = {
      display_installed_rooms: display_installed_rooms,
      display_product_manufacturer: getProductName(display_installed_rooms),
      display_product_img: condenserImg,
      display_monthly_operating_power: (
        element.monthy_operating_power / 1000
      ).toFixed(2),
      display_price: display_price.toString(),
      display_yearly_electricity_cost: element.yearly_electricity_cost
        .toFixed(2)
        .toString(),
      display_monthly_electricity_cost: element.monthly_electricity_cost
        .toFixed(2)
        .toString(),
      totalRooms: roomsArray.length.toString(),
      compressor_needed: display_installed_rooms.length.toString(),
      FCU_needed: roomsArray.length.toString(),
      condenserIDs: condenserIDs,
      product_subscription_cost: subCost.toString(),
      product_subscription_cost3: subCost.toString(),
      product_subscription_cost5: subCost5.toString(),
      product_subscription_cost7: subCost7.toString(),
      product_description:
        "Portable & lightweight.Widely appreciated model among beauty parlors, tattoo artists, food decoration, nail art parlors. Aerograph Airbrush air hose pipe is of good flexibility and quality than ordinary tube. Suitable For automotive painting, temporary body tattoo, Nail Art, Cake/Food decoration. Type: single cylinder piston: power: 1/5 horsepower Voltage: 220-240v/50hz. Suit for 0.2mm - 1.0mm airbrush",
    };

    let products = [];
    let price = 0;

    obj.display_installed_rooms.forEach((element) => {
      products.push(element.products);
    });

    let finalProd = [];

    products.forEach((element) => {
      element.forEach((element1) => {
        finalProd.push(element1);
        price = price + Number(element1.product[0].Price);
        newImage.push(element1.product[0].ImagePath)

      });
    });

    obj.display_installed_rooms = finalProd;
    // obj.display_price = Number(obj.display_price) + price;

    obj.display_product_manufacturer.forEach((element,index)=>{
      element.image = newImage[index]
  })

  obj.display_product_img = newImage

    

    finalProductOutput.push(obj);
    price = 0;
    display_price = 0;
    display_installed_rooms = [];
  });

  //console .log("final product lenght",finalProductOutput.length)

  function groupItem(array) {
    result = array.reduce(function (r, a) {
      r[a.productName] = r[a.productName] || [];
      r[a.productName].push(a);
      return r;
    }, Object.create(null));
    return result;
  }

  function getProductName(display_installed_rooms) {
    let name = groupItem(display_installed_rooms);
    // console.log("name", name);
    let nametoreturn = "";
    let namesArray = [];
    Object.keys(name).forEach((names, index) => {
      // console.log("name", names);

      namesArray.push({
        name: names,
        count: name[names].length,
        image: tempImg[index],
        price: name[names][0].price,
      });

      // if (index == 0) {
      //   nametoreturn = names

      //   namesArray.push({
      //     name:names
      //   })

      // } else {
      //   nametoreturn = nametoreturn + "/" + names
      // }
    });
    return namesArray;
  }

  // function getProductName(display_installed_rooms) {
  //   let name = groupItem(display_installed_rooms)
  //   let nametoreturn = ''
  //   Object.keys(name).forEach((names, index) => {
  //     // ////console .log("name",names)

  //     if (index == 0) {
  //       nametoreturn = names
  //     } else {
  //       nametoreturn = nametoreturn + "/" + names
  //     }

  //   })
  //   return nametoreturn
  // }

  let priceTemp = [...finalProductOutput];
  let energyTemp = [...finalProductOutput];

  let energyWise = energyTemp.sort((a, b) => {
    return (
      Number(a.display_monthly_operating_power) -
      Number(b.display_monthly_operating_power)
    );
  });

  let priceWise = priceTemp.sort((a, b) => {
    return Number(a.display_price) - Number(b.display_price);
  });

  return { energyWise: energyWise, priceWise: priceWise };
}

module.exports = { start1 };
