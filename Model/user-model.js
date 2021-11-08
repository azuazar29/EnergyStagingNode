const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory');

class User extends Model {}

User.init({
 Id	:{
     type:DataTypes.INTEGER,
     allowNull:false
 },
FirstName:{
    type:DataTypes.STRING(100),
    allowNull:false
},
LastName:{
    type:DataTypes.STRING(50),
    allowNull:true
},	
Email:{
    type:DataTypes.STRING(50),
    allowNull:true
},
Password:{
    type:DataTypes.STRING(50),
    allowNull:true
},	
IsSocialLogin:{
    type:DataTypes.BOOLEAN(),
    allowNull:false
},
IsActive:{
    type:DataTypes.BOOLEAN(),
    allowNull:true
},		
CreatedOn:{
    type:DataTypes.DATE(7),
    allowNull:true
},	
UpdatedOn:{
    type:DataTypes.DATE(7),
    allowNull:true
},	
Location:{
    type:DataTypes.STRING(255),
    allowNull:true
},
PhoneNumber:{
    type:DataTypes.STRING(255),
    allowNull:true
},		
}, {
  
  sequelize, // We need to pass the connection instance
  modelName: 'Users' // We need to choose the model name
});

module.exports = User