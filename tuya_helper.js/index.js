const {get_access_token}=require("./get_access_token");
const {get_device_info}=require("./get_device_info");
const {send_device_command}=require("./send_device_command");
const {get_total_energy}=require("./get_total_energy")

module.exports={get_access_token,get_device_info,send_device_command,get_total_energy};