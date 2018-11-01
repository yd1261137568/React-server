//引入mongoose模块
const mongoose = require('mongoose');
module.exports = new Promise((resolve,reject) => {
  //连接mongodb数据库
  mongoose.connect('mongodb://localhost:27017/zhiping',{useNewUrlParser:true});
  //绑定事件监听
  mongoose.connection.once('open', err => {
    if(!err) {
      console.log('数据库连接成功');
      resolve();
    }else{
      console.log(err);
      reject();
    }
  });
});
