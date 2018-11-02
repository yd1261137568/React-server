//引入express
const express = require('express');
const md5 = require('blueimp-md5');
//引入Users
const Users = require('../models/users');

//获取路由
const Router = express.Router;
//创建路由对象
const router = new Router();
//解析请求体的数据
router.use(express.urlencoded({extended: true}));

//创建登录路由
router.post('/login', async (req, res) => {
  const {username,password} = req.body;
  //判断用户的输入是否合法
  if(!username || !password) {
    //数据不合法
    res.json({
      "code": 2,
      "msg": "您输入的不合法,请重新输入"
    });
    // res.json('用户名或密码错误')
    return;
  }
  try {
    //去数据库中查找该用户名是否存在
    const data =await Users.findOne({username,password:md5(password)});
    if(data){
      res.json({
        code:0,
        data:{
          _id:data.id,
          username:data.username,
          password:data.password
        }
      });
    }else{
      res.json({
        "code": 1,
        "msg": "用户名或密码错误"
        //该用户不存在,请先注册
      });
    }

  } catch (ev) {
    //方法出错
    res.json({
      "code": 3,
      "msg": "网络不稳定，请重新试试~"
    });
    // res.json('网络不稳定，请重新试试~')
  }

});
//创建注册的路由
router.post('/register', async (req, res) => {
  //收集用户输入的信息
  const {username, password, type} = req.body;
  //判断用户输入的信息是否合法
  if (!username || !password || !type) {
    //数据不合法
    res.json({
      "code": 2,
      "msg": "用户输入不合法"
    });
    return;
  }
  try {
    //去数据库查找是有用户已存在
    const data = await Users.findOne({username});
    if(data){
      //说明用户已存在
      res.json({
        "code": 1,
        "msg": "用户已存在"
      });
    }else{
      //说明用户不存在,可以注册,并将数据保存到数据中
      const data = await Users.create({username, password: md5(password), type});
      //返回成功的响应
      res.json({
        code: 0,
        data: {
          _id: data.id,
          username: data.username,
          type: data.type
        }
      })
    }
  } catch (e) {
    //方法出错
    res.json({
      "code": 3,
      "msg": "网络不稳定，请重新试试~"
    });
  }
});
module.exports = router;