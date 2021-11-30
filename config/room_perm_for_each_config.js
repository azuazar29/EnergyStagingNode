var a1=[];
var ty=[];
function start(totnoofcomp,output,RoomPermutations){
   a1=[];
   ty=[];
// console.log(output)
console.log("---------------------------------")
console.log("Used compressor Configuration")
console.log("----------------------------------")
for(var i=0;i<output.length;i++){
    if(output[i].length==totnoofcomp){ //totnoofcomp      
        console.log(output[i])       
        output[i].sort(function(a, b){return b-a});
        a1.push(
          separate(RoomPermutations,output[i])
            )
         }  
         // console.log(...a1)
}
ty = all()

return ty
}


var outer=[],inner=[],z=0,count=0,inner1=[],outer1=[]
function separate(array,compconfig){
  outer=[],inner=[],z=0,count=0,inner1=[],outer1=[]
  inner1=[]
  for(var i=0;i<array.length;i++){
    inner1.push(permutee(array[i],compconfig))
  }

return inner1;
}

function permutee(arrr,aaa){         //-->this fun will give separate vals

outer=[]
count=0;
  for(var rc=0;rc<=aaa.length-1;rc++){
    inner=[]
    z=count
    for(var g=z;g<z+aaa[rc];g++){
      inner.push(arrr[g]);
    count=count+1;
     
    }
   
    outer.push(inner);
    
  }
  // console.log(outer)
  return outer;
}




var outer11=[],inner11=[],asal=[]
function all(){ 
  // console.log(...a1)
  outer11=[],inner11=[],asal=[]
for(var i=0;i<a1.length;i++){
	
  outer11=[]
  for(var j=0;j<a1[i].length;j++){
    inner11=[]
    for(var k=0;k<a1[i][j].length;k++){
      // console.log(a1[i][j][k])
      inner11.push(a1[i][j][k].sort(function(a, b){return a-b}))
    }
    outer11.push(inner11)
  }
asal.push(outer11)
}

// console.log(asal)


var single=[],mult=[]
for(var i=0;i<asal.length;i++){
  single=[]
  for(var j=0;j<asal[i].length;j++){
    single.push([].concat.apply([], asal[i][j]))
  }
  mult.push(single)
}

var s=""
var afterstep1check=[]
const set1 = new Set();
for(var i1=0;i1<mult.length;i1++){
  set1.clear();
  for(var j1=0;j1<mult[i1].length;j1++){
    s=""
    for(var k1=0;k1<mult[i1][j1].length;k1++){
    s+=mult[i1][j1][k1]+"" 
    }
    if(!set1.has(s)){
      set1.add(s)
      afterstep1check.push(asal[i1][j1])
    }
    
    
  }

}
// console.log("afterstep1check==>")
// console.log(afterstep1check)
// console.log(set1)

//........................................................................

 var one1=[],remain1=[],output123=[],mid1=[]
    for(var i=0;i<afterstep1check.length;i++){
      one1=[],remain1=[],mid1=[]
      for(var j=0;j<afterstep1check[i].length;j++){
        if(afterstep1check[i][j].length==1){
          one1.push(...afterstep1check[i][j])
        }
        else{
          remain1.push(afterstep1check[i][j])
         }
      }
      one1=one1.sort(function(a, b){return a-b})
      mid1.push(one1)
      mid1.push(remain1)
       output123.push(mid1)
    }
    // console.log(output123)
    var single1=[]
    for(var i=0;i<output123.length;i++){
      single1.push([].concat.apply([], output123[i]))
    }
   
    var s11="";var afterstep2check=[]
const set112 = new Set();
for(var i1=0;i1<single1.length;i1++){
  
   s11=""
  for(var j1=0;j1<single1[i1].length;j1++){
    // console.log(output123[i1])
   s11+=single1[i1][j1]+""
   
  }

 if(!set112.has(s11)){
      set112.add(s11)
      afterstep2check.push(afterstep1check[i1])
      // console.log(afterstep1check[i1])
    }
}
console.log("-----------------------------")
console.log("Room Permutations for each Compressor Configuration")
console.log("-----------------------------")

// console.log(afterstep2check)
// console.log(set112)
return afterstep2check
}



module.exports = {start};