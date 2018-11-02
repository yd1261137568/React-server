const express = require('express');
const wd5 = require('blueimp-md5');
//创建Router应用对象
const Router = express.Router;
//创建路由对象
const router = new Router();
const Users = require('../models/users');
router.use(express.urlencoded({extended: true}));

//创建登录路由
router.post('/login',async (req,res) => {
  const {username,password} = req.body;
  if(!username || !password){
    res.json('您输入的不合法,请重新输入');
    return;
  }
  try{
    const data = await Users.findOne({username,password:wd5(password)})
    if(data){
      res.json({
        data: 0,
        _id: data.id,
        username: data.username,
        type: data.type
      })
    }else{
      res.json('用户名或密码错误')
    }
  }catch(e){
    res.json('网络不稳定,请重新刷新')
  }
})
//创建注册路由
router.post('/register', async (req, res) => {
  const {username, password, type} = req.body;
  if (!username || !password || !type) {
    res.json('您输入的不合法,请重新输入');
    return;
  }

  try {
    //去数据库中查找该用户是否存在
    const data = await Users.findOne({username});
    if (data) {
      //找到了数据,用户已存在
      res.json('用户已存在');
    } else {
      //没有找到数据,可以注册,注册后并将数据保存在数据库中
      const data = Users.create({username, password: wd5(password), type})
      //返回成功的响应
      res.json({
        data: 0,
        _id: data.id,
        username: data.username,
        type: data.type
      })
    }
  } catch (e) {
    //方法出错
    res.json('网络不稳定,请刷新重试')
  }
});

