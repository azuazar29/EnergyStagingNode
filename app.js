var express = require('express');
const bodyParser = require('body-parser');
var app = express();
var indexRouter = require('./routes/api');
var roomRouter = require('./routes/room');
var cartRouter = require('./routes/cart')
var coolingConfig = require('./routes/cooling-config')
var dashboardRouter = require('./routes/dashboard')
var orders =require('./routes/order')

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('view engine', 'ejs');
app.use(function(req, res, next) {
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
app.use('/api',orders)
app.set('rootDir', __dirname);
app.use("/public", express.static(__dirname + '/public/'));



var server = app.listen(3005, function () {
  console.log("app running on port.", server.address().port);
});
module.exports = app;
