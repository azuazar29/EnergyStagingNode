
// const { Sequelize } = require('sequelize');
  var sql = require("mssql");

   // config for your database
   const config = {
    user :'genadmin',
    password :'Genad@123',
    server:'genserv.database.windows.net',
    database:'dbgen',   
    options:{

        trustServerCertificate: true,
        encrypt:true
    },
    port : 1433
  }
      sql.connect(config, function (err) { 
        if (err) {
          console.log("connection error",err);
        }else{
          console.log("database connected");
        }
    
    }); 

module.exports = sql;

// const sequelize = new Sequelize('dbgen', 'genadmin', 'Genad@123', {
//   host: 'genserv.database.windows.net',
//   dialect: 'mssql',
// });

// sequelize.authenticate().then(res=>{
//   console.log('Connection has been established successfully.');
// }).catch(err=>{
//   console.error('Unable to connect to the database:', err);
// })
  


  