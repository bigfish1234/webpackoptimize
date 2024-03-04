// context 其实就是源代码
module.exports = function(context) {
  if(context) {
    console.log('before--------',context);
    context = context.toUpperCase();
    console.log('after---------',context);
  }
  return `module.exports = '${context}'`
}