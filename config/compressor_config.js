var output=[]
var arr=[]
const combineElements = (sum) => {
   
  const findCombination = (remain, path, start) => {
      if (remain < 0) {
        return;
      }
      if (remain === 0) {
        output.push([...path]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        findCombination(remain - arr[i], [...path, arr[i]], i);
      }
  }
for(var g=0;g<sum;g++){
arr[g]=g+1;
}
  findCombination(sum, [], 0);
  return output;
};


module.exports = { combineElements };