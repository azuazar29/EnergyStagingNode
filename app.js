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
const moment = require("moment");



// tuya 

const axios = require('axios');
const qs = require('qs');
var CryptoJS = require("crypto-js");
const config = require("./config.json")
const { calcSign, stringToSign } = require("./utils")

const base_url = config.base_url
const client_id = config.client_id
const secret = config.secret
const httpMethod = 'GET'
//var accessToken=""
var device_id = config.device_id
var nonce = config.nonce
const path = '/v1.0/devices/' + device_id + '/statistics/days?code=add_ele';

var tuyo = require('./routes/tuyo')


const get_access_token = function () {
  return new Promise(function (resolve, reject) {

    var timestamp = new Date().getTime();


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

    let path = '/v1.0/devices/' + device_id + `/statistics/days?code=add_ele&start_day=${moment(new Date()).format('YYYYMMDD')}&end_day=${moment(new Date()).format('YYYYMMDD')}`;
    const query = { start_day: moment(new Date()).format('YYYYMMDD'), end_day: moment(new Date()).format('YYYYMMDD') }
    const [uri, pathQuery] = path.split('?');
    const queryMerged = Object.assign(query, qs.parse(pathQuery));
    const sortedQuery = {};
    Object.keys(queryMerged)
      .sort()
      .forEach((i) => (sortedQuery[i] = query[i]));

    const querystring = decodeURIComponent(qs.stringify(sortedQuery));
    const url = querystring ? `${uri}?${querystring}` : uri;
    console.log('urlllll', url)

    var signStr = stringToSign(url, httpMethod)
    var timestamp = new Date().getTime();

    let access_token = await get_access_token()
    var sign = calcSign(client_id, timestamp, nonce, signStr, secret, access_token);


    // console.log('header',)
    axios({

      method: httpMethod,

      url: base_url + path,

      headers: { 'content-type': 'application/x-www-form-urlencoded', 'client_id': client_id, 'sign': sign, 't': timestamp, 'sign_method': 'HMAC-SHA256', 'access_token': access_token }
    }).then(function (response) {
      console.log("reponse", response.data, device_id)

      resolve(response.data.result.days[moment(new Date()).format("YYYYMMDD")])
      // resolve(response.data.result.total)

    }, err => {
      resolve("0")
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
      // console.log('err', err)
      // console.log('response', response)

      resolve(true)

    })
  })




}


var job = new CronJob(
  '*/15 * * * *',
  // '* * * * *',
  async function () {
    console.log('running a task every minute');


    request.query(`SELECT DISTINCT deviceID FROM OrderList WHERE ISNULL(deviceID, ' ') <> ' '`, async function (err, res) {

      if (!err) {

        console.log(res.recordsets[0])

        for (let i = 0; i < res.recordsets[0].length; i++) {
          await updateEnergyDetails(res.recordsets[0][i].deviceID, "")
        }
      }

    })

  },
  null,
  true,
  false
);





var server = app.listen(process.env.PORT || 49320, function () {
  console.log("app running on port.", server.address().port);
});
module.exports = app;
