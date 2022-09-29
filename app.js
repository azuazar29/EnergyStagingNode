var express = require('express');
const bodyParser = require('body-parser');
var app = express();
var indexRouter = require('./routes/api');
var roomRouter = require('./routes/room');
var cartRouter = require('./routes/cart')
var coolingConfig = require('./routes/cooling-config')
var dashboardRouter = require('./routes/dashboard')
var orders = require('./routes/order')
var floormapRouter = require('./routes/floormap');
var twilio = require('./routes/twilio')
// var cron = require('node-cron');
var CronJob = require('cron').CronJob;

var sql = require("./database");
var request = new sql.Request();


// tuya 

const axios = require('axios');
const qs = require('qs');
var CryptoJS = require("crypto-js");
const config = require("./config.json")
const { calcSign, stringToSign } = require("./utils")

const base_url = config.base_url
const client_id = config.client_id
const secret = config.secret
var timestamp = new Date().getTime();
const httpMethod = 'GET'
//var accessToken=""
var device_id = config.device_id
var nonce = config.nonce
const path = '/v1.0/devices/' + device_id + '/statistics/total?code=add_ele';

var tuyo = require('./routes/tuyo')


const get_access_token = function () {
  return new Promise(function (resolve, reject) {

    var signStr = stringToSign('/v1.0/token?grant_type=1', 'GET')
    var sign = calcSign(client_id, timestamp, nonce, signStr, secret);

    // console.log("sign", sign)

    axios({

      method: 'GET',

      url: base_url + '/v1.0/token?grant_type=1',
      //data:data,
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'client_id': client_id, 'sign': sign, 't': timestamp, 'sign_method': 'HMAC-SHA256' }
    }).then(function (response) {
      console.log(response.data)

      resolve(response.data.result.access_token)


    })

  })

}
async function getTotalEnergy(device_id) {

  return new Promise(async (resolve, reject) => {

    let path = '/v1.0/devices/' + device_id + '/statistics/total?code=add_ele';
    var signStr = stringToSign(path, httpMethod)

    let access_token = await get_access_token()
    var sign = calcSign(client_id, timestamp, nonce, signStr, secret, access_token);


    // console.log('header',)
    axios({

      method: httpMethod,

      url: base_url + path,

      headers: { 'content-type': 'application/x-www-form-urlencoded', 'client_id': client_id, 'sign': sign, 't': timestamp, 'sign_method': 'HMAC-SHA256', 'access_token': access_token }
    }).then(function (response) {
      // console.log("reponse", response.data)

      resolve(response.data.result.total)
      // resolve(response.data.result.total)

    }, err => {
      console.log('err', err)
    })
  })


}












app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.use(express.json());
app.enable('trust proxy')
app.use(express.urlencoded({ extended: false }));

app.use('/api', indexRouter);
app.use('/api', roomRouter)
app.use('/api', cartRouter)
app.use('/api', coolingConfig)
app.use('/api', dashboardRouter)
app.use('/api', orders)
app.use('/api', floormapRouter)
app.use('/api', twilio)
app.use('/api', tuyo)
app.set('rootDir', __dirname);

app.use("/public", express.static(__dirname + '/public/'));


function updateEnergyDetails(deviceId, deviceName) {

  return new Promise(async (resolve, reject) => {

    let energy = await getTotalEnergy(deviceId)

    let query = `INSERT INTO [dbo].[EnergyConsumptionFromJob]
    ([Device_ID]
    ,[EnergyConsumed]
    ,[updatedOn]
    ,[DeviceName])
VALUES
    ('${deviceId}'
    ,'${energy}'
    ,'${new Date().toISOString()}'
    ,'${deviceName}')`

    // console.log("query", query)
    request.query(query, function (err, response) {
      console.log('err', err)
      console.log('response', response)

      resolve(true)

    })
  })




}


var job = new CronJob(
  '*/15 * * * *',
  async function () {
    console.log('running a task every minute');

    let device = [
      {
        devideId: 'bfc29c88239e88abfdfioi',
        deviceName: 'smart plug 3',
      },
      {
        devideId: 'bfbcd23d1b285a2391ul20',
        deviceName: 'smart plug 2',
      },
      {
        devideId: 'bf664ad3a1ff7085d7pyvr',
        deviceName: 'smart plug',
      }
    ]

    for (let i = 0; i < device.length; i++) {
      await updateEnergyDetails(device[i].devideId, device[i].deviceName)
    }
  },
  null,
  true,
  'America/Los_Angeles'
);





var server = app.listen(process.env.PORT || 49320, function () {
  console.log("app running on port.", server.address().port);
});
module.exports = app;
