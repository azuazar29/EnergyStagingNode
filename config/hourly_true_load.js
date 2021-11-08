function mon_true_load(mon,r,true_load){
 var mon_load=[] 
for(var i=0;i<mon.length;i++){
  var sum=0
for(var j=0;j<mon[i].length;j++){  
  if(mon[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
mon_load.push(sum)
}
return mon_load
}

function tue_true_load(tue,r,true_load){
 var tue_load=[] 
for(var i=0;i<tue.length;i++){
  var sum=0
for(var j=0;j<tue[i].length;j++){  
  if(tue[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
tue_load.push(sum)
}
return tue_load
}

function wed_true_load(wed,r,true_load){
 var wed_load=[] 
for(var i=0;i<wed.length;i++){
  var sum=0
for(var j=0;j<wed[i].length;j++){  
  if(wed[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
wed_load.push(sum)
}
return wed_load
}


function thurs_true_load(thurs,r,true_load){
 var thurs_load=[] 
for(var i=0;i<thurs.length;i++){
  var sum=0
for(var j=0;j<thurs[i].length;j++){  
  if(thurs[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
thurs_load.push(sum)
}
return thurs_load
}


function fri_true_load(fri,r,true_load){
 var fri_load=[] 
for(var i=0;i<fri.length;i++){
  var sum=0
for(var j=0;j<fri[i].length;j++){  
  if(fri[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
fri_load.push(sum)
}
return fri_load
}


function sat_true_load(sat,r,true_load){
 var sat_load=[] 
for(var i=0;i<sat.length;i++){
  var sum=0
for(var j=0;j<sat[i].length;j++){  
  if(sat[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
sat_load.push(sum)
}
return sat_load
}


function sun_true_load(sun,r,true_load){
 var sun_load=[] 
for(var i=0;i<sun.length;i++){
  var sum=0
for(var j=0;j<sun[i].length;j++){  
  if(sun[i][j]===1){sum+=true_load[r-1]}
    else{sum+=0}
  }
sun_load.push(sum)
}
return sun_load
}
module.exports = { mon_true_load,tue_true_load,wed_true_load,thurs_true_load,fri_true_load,sat_true_load,sun_true_load };