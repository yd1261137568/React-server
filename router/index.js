//引入express
const express = require('express');
const md5 = require('blueimp-md5');
//引入cookie-parser
const cookieParser = require('cookie-parser');

//引入Users
const Users = require('../models/users');

//获取路由
const Router = express.Router;
//创建路由对象
const router = new Router();
router.use(cookieParser());
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
      "meg": "您输入的不合法,请重新输入"
    });
    // res.json('用户名或密码错误')
    return;
  }
  try {
    //去数据库中查找该用户名是否存在
    const data =await Users.findOne({username,password:md5(password)});
    if(data){
      //说明用户找到了，登录成功，返回成功的响应
      //返回cookie
      res.cookie('userid',data.id,{maxAge:1000*3600*24*7});
      res.json({
        "code":0,
        "data":{
          "_id":data.id,
          "username":data.username,
          "type":data.type
        }
      });
    }else{
      res.json({
        "code": 1,
        "meg": "用户名或密码错误"
        //该用户不存在,请先注册
      });
    }

  } catch (ev) {
    //方法出错
    res.json({
      "code": 3,
      "meg": "网络不稳定，请重新试试~"
    });
    // res.json('网络不稳定，请重新试试~')
  }

});


//创建注册的路由
router.post('/register', async (req, res) => {
  //收集用户输入的信息
  const {username, password, type} = req.body;
  // console.log(username, password, type);
  //判断用户输入的信息是否合法
  if (!username || !password || !type) {
    //数据不合法
    res.json({
      "code": 2,
      "meg": "用户输入不合法"
    });
    return;
  }
  try {
    //去数据库查找是有用户已存在
    const data = await Users.findOne({username},{__v:0});//findOne方法中第二个参数是映射,将返回值中__v:0过滤掉
    console.log(data);
    if(data){
      //说明用户已存在
      res.json({
        "code": 1,
        "meg": "用户已存在"
      });
    }else{
      //说明用户不存在,可以注册,并将数据保存到数据中
      const data = await Users.create({username, password: md5(password), type});
      //返回成功的响应
      //返回cookie
      res.cookie('userid',data.id,{maxAge:1000*3600*24*7});
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
      "meg": "网络不稳定，请重新试试~"
    });
  }
});

// 更新用户信息的路由
router.post('/update', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.json({code: 1, meg: '请先登陆'});
  }
  // 存在, 根据userid更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  Users.findByIdAndUpdate({_id: userid}, user)
    .then(oldUser => {
      if (!oldUser) {
        //更新数据失败
        // 通知浏览器删除userid cookie
        res.clearCookie('userid');
        // 返回返回一个提示信息
        res.json({code: 1, meg: '请先登陆'});
      } else {
        //更新数据成功
        // 准备一个返回的user数据对象
        const {_id, username, type} = oldUser;
        //此对象有所有的数据
        const data = Object.assign({_id, username, type}, user)
        // 返回成功的响应
        res.json({code: 0, data})
      }
    })
    .catch(error => {
      // console.error('登陆异常', error)
      res.send({code: 3, meg: '网络不稳定，请重新试试~'})
    })
});

// 获取用户信息的路由(根据cookie中的userid)
router.get('/user', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid;
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.send({code: 1, meg: '请先登陆'})
  }
  // 根据userid查询对应的user
  Users.findOne({_id: userid}, {__v: 0, password: 0})
    .then(user => {
      if (user) {
        res.send({code: 0, data: user})
      } else {
        // 通知浏览器删除userid cookie
        res.clearCookie('userid');
        res.send({code: 1, meg: '请先登陆'})
      }
    })
    .catch(error => {
      console.error('获取用户异常', error);
      res.send({code: 3, meg: '网络不稳定，请重新试试~'})
    })
})


// 获取用户列表(根据类型)
router.get('/userlist', (req, res) => {
  const {type} = req.query;
  Users.find({type}, {__v: 0, password: 0})//findOne方法中第二个参数是映射,将返回值中__v:0,password: 0过滤掉,不需要返回
    .then(users => {
      res.send({code: 0, data: users})
    })
    .catch(error => {
      console.error('获取用户列表异常', error);
      res.send({code: 1, meg: '网络不稳定，请重新试试~'})
    })
});
module.exports = router;