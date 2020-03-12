import { env } from './env';
import { Modal } from 'antd';
var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');
//var qs = require('qs');
import { transformRequest } from '@/utils';

//axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';  
//教学接口端口判断
var elearningUrl = '';
if(env.serverURL.indexOf('zbes.zbgedu.com')>-1){
  elearningUrl = 'https://api.zbgedu.com';
}else{
  elearningUrl = 'https://apidemo.zbgedu.com';
}


var normalAxios = axios.create({
  baseURL: env.serverURL, 
});
//第三方支付 url
var feeAxiosBase = axios.create({
  baseURL: env.getFeeQrCodeUrl
});
var testAxios = axios.create({
  baseURL: env.testServerURL
});

var mockAxios = axios.create();
var axios = normalAxios;
var feeAxios = feeAxiosBase;

//添加一个请求拦截器
axios.interceptors.request.use(function (config) {
  //在请求发送之前做一些事
  var token = env.getToken(); //window.localStorage.getItem('token') || '';
  //config.headers.common.token = token;
  if (config.method.toUpperCase() == "GET") {
    let data = JSON.parse(config["0"] || '{}');//特殊说明
    data.verTT = new Date().getTime();
    data.token = token;
    //转义参数
    var params = transformRequest(data);
    config.url += '?' + params;
  }
  else {
    let data = JSON.parse(config.data || "{}");
    data.verTT = new Date().getTime();
    data.token = token;//转义参数
    var params = transformRequest(data);
    config.data = params;
    // config.headers.token = token;
  }

  return config;
}, function (error) {
  //当出现请求错误是做一些事
  return Promise.reject(error);
});

let isNextResponse = true;//是否继续请求接口（解决登录过期连续提示的问题）

//添加一个返回拦截器
axios.interceptors.response.use(function (response) {
  if(!isNextResponse && response.data.data.code == 1000) return;
  //api 调用出错的标志state=='error';
  if (response.data.state === 'error') {
    //对返回的错误进行一些处理
    if (response.data.data && response.data.data.code && response.data.data.code == 1000) {
      isNextResponse = false;
      const modal = Modal.error({
        title: '登录过期了，请您重新登录！',
        content: '窗口自动关闭(3秒)',
      });
      setTimeout(() => {
        modal.destroy();
        env.loginHandler();
        return;
      }, 3000);
      return;
    }
    isNextResponse = true;
    return Promise.reject({ ...response.data, message: response.data.msg, result: false });
  }
  isNextResponse = true;
  //升级为业务对象
  //response.data = response.data.data || {};//兼容成功时没有数据情况
  response.data = response.data || {};//兼容成功时没有数据情况
  return response;
}, function (error) {
  //=================测试用，勿删==================
  /*error.data = {
    "data" : {
      "token" : "71c694b1-6ff6-480d-b433-c20c856a4e82",
      "user" : {
        "userId" : "4",
        "state" : 1,
        "loginName" : "zbadmin2",
        "realName" : "zbadmin2",
        "password" : "123456",
        "passwordRecoverKey" : null,
        "certificateType" : 1,
        "certificateNo" : null,
        "email" : null,
        "gender" : null,
        "mobile" : null,
        "birth" : null,
        "createDate" : 1524741729000,
        "createUid" : null,
        "modifyDate" : null
      },
      "userType" : {
        "userUsertypeId" : "10",
        "userId" : "4",
        "usertype" : 1,
        "orgId" : "00000000000000000000000000000001",
        "isAdmin" : 0,
        "createDate" : 1524741851000,
        "createUid" : null
      },
      "userTypeList": [],
    }
  };
  return error;*/
  isNextResponse = true;
  if (error.response && error.response.status == 401) {//因安全问题被拒绝
    //对返回的错误进行一些处理
    window.location.href = "#/login";
    //return Promise.reject(error);
  }
  else {
    //对返回的错误进行一些处理
    return Promise.reject({ message: "网络故障，请检查网络!", result: false });
  }
});

//添加一个请求拦截器
feeAxios.interceptors.request.use(function (config) {
  //在请求发送之前做一些事
  var token = env.getToken(); //window.localStorage.getItem('token') || '';
  //config.headers.common.token = token;
  if (config.method.toUpperCase() == "GET") {
    let data = JSON.parse(config["0"] || '{}');//特殊说明
    data.verTT = new Date().getTime();
    data.token = token;
    //转义参数
    var params = transformRequest(data);
    config.url += '?' + params;
  }
  else {
    let data = JSON.parse(config.data || "{}");
    data.verTT = new Date().getTime();
    data.token = token;//转义参数
    var params = transformRequest(data);
    config.data = params;
  }

  return config;
}, function (error) {
  //当出现请求错误是做一些事
  return Promise.reject(error);
});

//======================= 测试
//添加一个请求拦截器
testAxios.interceptors.request.use(function (config) {
  //在请求发送之前做一些事
  var token = env.getToken(); //window.localStorage.getItem('token') || '';
  //config.headers.common.token = token;
  if (config.method.toUpperCase() == "GET") {
    let data = JSON.parse(config["0"] || '{}');//特殊说明
    data.verTT = new Date().getTime();
    data.token = token;
    //转义参数
    var params = transformRequest(data);
    config.url += '?' + params;
  }
  else {
    let data = JSON.parse(config.data || "{}");
    data.verTT = new Date().getTime();
    data.token = token;//转义参数
    var params = transformRequest(data);
    config.data = params;
  }

  return config;
}, function (error) {
  //当出现请求错误是做一些事
  return Promise.reject(error);
});

//添加一个返回拦截器
testAxios.interceptors.response.use(function (response) {
  //api 调用出错的标志state=='error';
  if (response.data.state === 'error') {
    //对返回的错误进行一些处理
    if (response.data.msg == 'nologin') {
      const modal = Modal.error({
        title: '当前账号在别的设备上登录了，请您重新登录！',
        content: '窗口自动关闭(3秒)',
      });
      setTimeout(() => {
        modal.destroy();
        env.loginHandler();
      }, 3000);
      return;
    }
    else if (response.data.data.code == '1000') {
      setTimeout(() => {
        modal.destroy();
        env.loginHandler();
      }, 1000);
    }
    return Promise.reject({ ...response.data, message: response.data.msg, result: false });
  }
  //升级为业务对象
  //response.data = response.data.data || {};//兼容成功时没有数据情况
  response.data = response.data || {};//兼容成功时没有数据情况
  return response;
}, function (error) {
  if (error.response && error.response.status == 401) {//因安全问题被拒绝
    //对返回的错误进行一些处理
    window.location.href = "#/login";
    //return Promise.reject(error);
  }
  else {
    //对返回的错误进行一些处理
    return Promise.reject({ message: "网络故障，请检查网络!", result: false });
  }
});
//======================= end
// mock 数据
var mock = new MockAdapter(mockAxios);
//自动数据载入
mock.onPut('/loadDictionary').reply(config => {
  //return [200, require('./mock/dic')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/systCommon/get', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//获取学生来源子集字典
mock.onPut('/systemCommonChild').reply(config => {
  //return [200, require('./mock/dic')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/systemCommonChild/get', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//用户登录
mock.onPut('/login').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/login', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//退出登录
mock.onPut('/logout').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/login/loginout').then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//刷新时获取登录者信息
mock.onPut('/profile').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/login/getMember').then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//OA跳转到教务获取登录者信息
mock.onPut('/setMember').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/login/setMember').then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//切换用户机构上下文
mock.onPut('/switchOrgContext').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/login/setUserOrg', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//获取用户功能菜单
mock.onPut('/menu').reply(config => {
  //return [200, require('./mock/menu')];
  var data = [200, require('./mock/menu')];
  var d = JSON.parse(config.data);
  if (d.depth == 0) {
    for (var i = 0; i < data[1].menus.length; i++) {
      if (data[1].menus[i].depth == d.depth) {
        data[1].menus[i].child = null;
      }
    }
  }
  return data;
  /*
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/user/GetUserMenus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
  */
});

//================ 功能菜单管理 =================
mock.onPut('/getFunctionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/adminFun/get', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/addFunctionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminFun/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/editFunctionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminFun/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/deleteFunctionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminFun/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//================ 功能URL管理 =================
mock.onPut('/getFunctionUrlList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/adminPageurl/get', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/addFunctionUrlInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminPageurl/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/editFunctionUrlInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminPageurl/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/deleteFunctionUrlInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminPageurl/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//================ 机构用户管理==================
mock.onPut('/getOrgUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//历史订单缴费确认列表
mock.onPut('/queryPageByHistory').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryPageByHistory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//历史订单缴费确认
mock.onPut('/paymentByHistory').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/paymentByHistory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//日志查询
mock.onPut('/LogQuerySearch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/operate/queryOperateByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//高校管理 - 列表
mock.onPut('/universityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/university/getPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//高校管理 - 新增（编辑）
mock.onPut('/universityAddOrEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/university/addOrEdit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//首页-分部-页面所需参数
mock.onPut('/getParmForBranchIndex').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getParmForBranchIndex', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//首页-总部/分部/大区-查询未审批订单数 + 首页-总部/大区-分部优惠规则待终审的数量
mock.onPut('/getUnapprovedOrderCount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchIndex/getUnapprovedOrderCount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//首页-总部-页面所需参数
mock.onPut('/getParmForZB').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/getParmForZB', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/addOrgUserInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/getUserInfoByLoginName').reply(config => {
  /*
  var params = JSON.parse(config.data);
  var mockData = {
    data: {
      loginName: params.loginName,
      realName: `${params.loginName}姓名`,
    }
  }
  return [200, mockData];
  */
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/getByLoginName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据姓名 机构 查用户列表
mock.onPut('/GetUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/getByRealNameTypeOrgId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部首页饼型图表的数据 == 按分部
mock.onPut('/mainpie').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    // normalAxios.post('/edu/branchIndex/feePayInfoPieByHeadquarters', config.data).then((res) => { 原先的接口
      normalAxios.post('/edu/feeIncomeBranchItem/feePayInfoPieByHeadquarters', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部首页饼型图表的数据 ==> 按大区
mock.onPut('/mainpieByRegion').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    // normalAxios.post('/edu/branchIndex/feePayInfoPieByHeadquarters', config.data).then((res) => { 原先的接口
      normalAxios.post('/edu/feeIncomeBranchItem/feePayInfoPieByHeadquartersRegion', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部首页线形图 == 按分部
mock.onPut('/mainLine').reply(config=>{
  return new Promise(function(resolve,reject){
    // normalAxios.post('/edu/branchIndex/feePayInfoByHeadquarters',config.data).then((res)=>{
      normalAxios.post('/edu/feeIncomeBranchItem/feePayInfoByHeadquarters',config.data).then((res)=>{
      resolve([200,res.data]);
    }).catch((err)=>{
      resolve([500,err]);
    });
  });
});
//总部首页线形图 == 按大区
mock.onPut('/mainLineByRegion').reply(config=>{
  return new Promise(function(resolve,reject){
    // normalAxios.post('/edu/branchIndex/feePayInfoByHeadquarters',config.data).then((res)=>{
      normalAxios.post('/edu/feeIncomeBranchItem/feePayInfoByHeadquartersRegion',config.data).then((res)=>{
      resolve([200,res.data]);
    }).catch((err)=>{
      resolve([500,err]);
    });
  });
});
//首页线型图表数据
mock.onPut('/mainecharts').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feeIncomeBranchItem/feePayInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//请求首页各项人数
mock.onPut('/studentNum').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchIndex/studentInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//本周和本月的订单数量orderForACertainTime
// mock.onPut('./orderForACertainTime').reply(config=>{
//   return new Promise(function(resolve,reject){
//     normalAxios.post('/edu/branchIndex/orderInfo',config.data).then((res)=>{
//       resolve([200,res.data])
//     }).catch((err)=>{
//       resolve([500,err])
//     })
//   })
// })
mock.onPut('/orderForACertainTime').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchIndex/orderInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//================ 首页模块管理 =================
//模块查询
mock.onPut('/adminHomeModule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminHomeModule/getPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//模块添加
mock.onPut('/adminHomeModuleAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminHomeModule/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//模块修改
mock.onPut('/adminHomeModuleEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminHomeModule/edit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//模块删除
mock.onPut('/adminHomeModuleDel').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminHomeModule/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据角色id查询首页模块权限接口
mock.onPut('/getRoleModule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRoleModule/getRoleModule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//新增/更新角色首页模块权限信息接口
mock.onPut('/editRoleModule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRoleModule/addOrEdit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//
//================ 角色及权限管理 =================
mock.onPut('/getRoleList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/getPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/addRoleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/editRoleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/edit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/deleteRoleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/getRoleFunList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/adminRoleFun/getRoleFun', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/saveRoleFun').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRoleFun/sevRoleFun', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//userId
mock.onPut('/getUserRole').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/userRole/getUserRole', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//userId,roleids
mock.onPut('/saveUserRole').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/userRole/sevUserRole', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//================ 上传模板管理 =================
mock.onPut('/getExcelTempleteList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/getPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/addExcelTempleteInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/editExcelTempleteInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/edit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/deleteExcelTempleteInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminRole/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//系统自动维护
mock.onPut('/getDictionaryList').reply(config => {
  return [200, require('./mock/dic')];
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetDictionaryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/saveDictionaryInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveDictionaryInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//================ 基础 =================
//----------------用户管理
mock.onPut('/modifyUser').reply(config => {
  //return [200, require('./mock/org')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/user/usertype/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//用户下拉查询
mock.onPut('/postSelectRecruitUser').reply(config => {
  //return [200, require('./mock/org')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/queryBranchByToken', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//用户查询
mock.onPut('/postSearchRecruitUser').reply(config => {
  //return [200, require('./mock/org')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/userquery/queryUserByRegin', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//----------------用户管理之管理员删除
mock.onPut('/deleteAdmin').reply(config => {
  //return [200, require('./mock/org')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/user/usertype/deleteByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//---------------- 机构管理
mock.onPut('/getOrgList').reply(config => {
  //return [200, require('./mock/org')];
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/getOrganization', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//获取上级机构(所有大区)列表 供下拉框用
mock.onPut('/getLastDepthList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/organization/getLastDepthList').then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//机构保存
mock.onPut('/addOrgInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/addOrganization', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//机构保存
mock.onPut('/updateOrgInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/updateOrganization', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//删除机构
mock.onPut('/deleteOrgInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/deleteByOrgId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//设置机构管理员信息
mock.onPut('/setOrgAdminInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/super/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//按大区模糊查分部列表
mock.onPut('/orgBranchList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/organization/queryBranchByOrgId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//按大区Id查分部列表
mock.onPut('/orgBranchListByParentId').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.get('/edu/organization/getBranchByParentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询 分部下教学点
mock.onPut('/orgTeachCenterList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/teachCenter/selectTeachCenterByUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询 分部下教学点
mock.onPut('/orgTeachCenterByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/teachCenter/queryTeachCenterByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询 分部下教学点下课程班
mock.onPut('/courseplanNameList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/courseArrangeDetailAttendance/getCoursePlanNameInTeachCent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询 缴费方式
mock.onPut('/getPaymentWay').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/systCommon/getPaymentWay', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//订单缴费记录清除列表
mock.onPut('/OrderPaymentRecordList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/order/queryPageByCleanOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//订单缴费记录清除 删除
mock.onPut('/DeleteOrderPaymentRecord').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/order/cleanOrderPayfee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




/*
查询 分部下启用的教学点
2018-05-31
lixuliang
support_api: 丁昊天
*/
mock.onPut('/orgTeachCenterOnByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/teachCenter/selectTeachCenterByUserOnOpen', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部下的院校列表  或 所有院校列表
mock.onPut('/allUniversityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //var d = JSON.parse(config.data);    // { universityName: '' }
    normalAxios.post('/edu/university/queryUniversity', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部下的院校列表
mock.onPut('/orgUniversityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/organization/university', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//未在分部下的院校列表
mock.onPut('/orgUniversityNotInList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/organization/selectUniversityNotIn', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部添加院校
mock.onPut('/orgAddUniversitys').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST // { branchId: '', universityIds: '1,2,3' }
    normalAxios.post('/edu/organization/insertUniversityNotIn', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部删除院校
mock.onPut('/orgDeleteUniversity').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.get('/edu/organization/deleteUniversityByID', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//------------------- 项目管理 -----------------------
//查询
mock.onPut('/getItemList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/item/qryByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//增加
mock.onPut('/addItem').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/item/addItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//修改
mock.onPut('/editItem').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/item/updItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//------------------- 科目管理 -----------------------
//查询
mock.onPut('/getCourseCategoryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseCategory/qryByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//增加
mock.onPut('/addCourseCategory').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseCategory/addCourseCategory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//修改
mock.onPut('/editCourseCategory').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseCategory/updCourseCategory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//根据项目ids获取项目课程树
mock.onPut('/getItemCourseTreeByItemIds').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseCategory/getItemCourseTreeByItemIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//------------------- 课程管理 -----------------------
//查询
mock.onPut('/getCourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/course/qryByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//增加
mock.onPut('/addCourse').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/course/addCourse', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//修改
mock.onPut('/editCourse').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/course/updCourse', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//删除
mock.onPut('/delCourseByIds').reply(config => {
  return new Promise(function (resolve, reject) {
    //未完成
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/course/delCourseByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询一个课程
mock.onPut('/getCourseBycourseId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/course/getCourse', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//=================== 大客户管理 =======================
//大客户列表分页查询
mock.onPut('/GetPartnerList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户收费方明细管理
mock.onPut('/getPartyList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户列表分页查询
mock.onPut('/GetPartnerInfoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/searchPageList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大区分部下拉
mock.onPut('/LargeAreaDepartmentalDropDown').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/getBranchByParentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户新增
mock.onPut('/AddPartner').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户 按 Id 查询（1. 列表返回的信息不全；2.列表的信息可能是旧的）
mock.onPut('/GetPartnerById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/getById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户收费方明细管理的详情
mock.onPut('/getPartnerDetails').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/getById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户明细公司账户的匹配
mock.onPut('/getCompanyAccount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/bankAccount/getBankAccountByZbPayeeTypeAndPayeeType', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大客户修改
mock.onPut('/UpdatePartner').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户明细修改
mock.onPut('/modifyPartner').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/updateForSingle', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户删除
mock.onPut('/DeletePartner').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
按分部过滤大客户
2018-05-31
lixuliang
support_api: 谭必庆
*/
mock.onPut('/queryPartnerByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/searchRecruitStateByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大客户-项目列表
mock.onPut("/GetPartnerItemList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/item/getByPartnerId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-项目列表修改
mock.onPut("/UpdatePartnerItemList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/item/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-收费方列表
mock.onPut("/GetPartnerPayeeList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/getByPartnerId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-收费方列表修改
mock.onPut("/UpdatePartnerPayeeList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户收费明细之批量修改
mock.onPut("/batchModification").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/updateForBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-收费方删除
mock.onPut("/DeletePartnerPayee").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-用户负责统计 列表
mock.onPut("/GetPartnerUserStatList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/user/searchUserPartnerCountPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-用户负责 列表
mock.onPut("/GetPartnerInUserList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/user/searchInUserPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-用户未负责 列表
mock.onPut("/GetPartnerNotInUserList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/user/searchOutUserPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-用户负责 删除
mock.onPut("/DeletePartnerInUser").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/user/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户-用户负责 添加
mock.onPut("/AddPartnerNotInUser").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/user/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大客户 -合同管理
mock.onPut("/getPartnerContractList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/contract/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//批量删除大客户合同
mock.onPut("/batchDeletePartnerContract").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/contract/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大客户 -新增合同
mock.onPut("/addParterContractInfo").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/contract/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大客户 -新增合同
mock.onPut("/updateParterContractInfo").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/contract/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//根据id查询大客户新增合同
mock.onPut("/getPartnerContractById").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/contract/getById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
按 大客户Id、公司 （默认 共管账户） 查询 账户列表
2018-06-28
lixuliang
support_api: 王强
*/
mock.onPut('/queryPartnerAccount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/bankAccount/getBankAccountByPantnerIdAndPayeeType', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
订单查询 中 使用的 大客户列表
2018-07-11
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryByOrderSearch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/queryByOrderSearch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//订单原始分部查询中 使用的 大客户列表
mock.onPut('/queryAllPartners').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/queryAllPartners', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
大客户 合作收费方 新增
2018-07-12
lixuliang
support_api: 谭必庆
*/
mock.onPut("/addPartnerPayeeType").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/payeetype/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//=================================大客户协议价============================//
//大客户协议价-分页查询（总部、大区、分部）
mock.onPut("/partnerProductPriceApplyList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-详情
mock.onPut("/partnerProductPriceApplyGetById").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/getById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-添加
mock.onPut("/partnerProductPriceApplyAdd").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-修改
mock.onPut("/partnerProductPriceApplyUpdate").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-删除
mock.onPut("/partnerProductPriceApplyDelete").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-查看分期价格
mock.onPut("/partnerProductPriceApplyCaculatorProductTermPrice").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/caculatorProductTermPrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-检索符号条件商品
mock.onPut("/partnerProductPriceApplySearchZPriceForPartner").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/searchZPriceForPartner', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-批量提交
mock.onPut("/partnerProductPriceApplyBatchSubmit").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/submitAuditBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-审核
mock.onPut("/partnerProductPriceApplyAudit").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/audit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-批量审核
mock.onPut("/partnerProductPriceApplyBatchAudit").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/auditBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大客户协议价-批量复制
mock.onPut("/partnerProductPriceApplyBatchCopy").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/partner/copyBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//当前用户大客户数据范围
mock.onPut("/searchUserPartnerScope").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/user/searchUserPartner', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部-大客户-大客户合同信息-大客户签约信息-列表查询
mock.onPut("/partnerSignSelectList").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partnerSign/selectList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部-大客户-大客户合同信息-大客户签约信息-新增
mock.onPut("/partnerSignInsert").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partnerSign/insert', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部-大客户-大客户合同信息-大客户签约信息-编辑
mock.onPut("/partnerSignUpdate").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partnerSign/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部-大客户-大客户合同信息-大客户签约信息-编辑按钮/查看按钮查询
mock.onPut("/partnerSignSelectById").reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partnerSign/selectById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//=================== END 大客户管理 =======================

//=================== 招生管理 =======================
//招生季下拉列表
mock.onPut('/recruitBatchList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/recruit/select', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//招生季列表(总部)
mock.onPut('/recruitBatchPageList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/edu/recruit/selectPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//招生季保存
mock.onPut('/recruitBatchUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    //var params = config.data;
    normalAxios.post('/edu/recruit/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//招生季保存
mock.onPut('/recruitBatchAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/recruit/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//匹配学生来源的子项
mock.onPut('/subitem').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/systemCommonChild/getByParentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//========================= 活动与咨询 ===============================
// 电咨信息管理 按学生查询 yzl
mock.onPut('/getStudentAskPList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/qryStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理 按明细查询 yzl
mock.onPut('/getStudentAskP2List').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/qryStudentAsk', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理 按学生ID查询  yzl
mock.onPut('/qryByStudentId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/qryByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理 批量删除  yzl
mock.onPut('/delAsk').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理  根据学生id查询学生信息  yzl
mock.onPut('/getStudentById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/student/queryById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理  添加咨询信息  yzl
mock.onPut('/addAskP').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理  根据 咨询ID 查询 学生咨询记录  yzl
mock.onPut('/qryById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/qryById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理  修改 咨询信息  yzl
mock.onPut('/updAskP').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/upd', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 电咨信息管理  获取当前招生季  yzl
mock.onPut('/selectNowRecruitBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/recruit/selectNowRecruitBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//----- -----2. 商品标准价格
//----- 2.1 总部
//2.1.01 商品标准价格管理列表
mock.onPut('/recruitProductPriceList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/selectZ', config.data).then((res) => {
      //testAxios.post('/edu/productPrice/selectZ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//2.1.02 商品标准价格管理 新增商品定价 列表
mock.onPut('/recruitProductPriceAddList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/selectNotBindPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//2.1.07 商品标准价格管理 新增商品定价 新增提交
mock.onPut('/recruitProductPriceAddListSave').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/addProductPrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//2.1.02 商品标准价格管理 修改列表1
mock.onPut('/recruitProductPriceUpdateList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/termTule/selectByTermRuleId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//2.1.03 商品标准价格管理 修改提交（课程商品）
mock.onPut('/recruitProductPriceOfProductUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/updateProductPrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//2.1.04 商品标准价格管理 修改提交（捆绑商品）
mock.onPut('/recruitProductPriceOfProductCourseUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/updateProductCoursePrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//绑定商品标准价格详情
mock.onPut('/recruitBindProductPriceInfoById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/selectCourcePriceZ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//绑定商品标准价格详情
mock.onPut('/recruitBindProductPriceInfoUpById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/selectCourcePriceUpZ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//课程商品标准价格详情
mock.onPut('/recruitCourseProductPriceInfoById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/selectRelevance', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//绑定商品标准价格修改
mock.onPut('/recruitBindProductPriceInfoUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/updateProductCoursePrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//课程商品标准价格修改
mock.onPut('/recruitCourseProductPriceInfoUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/updateProductPrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//取消发布
mock.onPut('/recruitProductPriceCancelPublish').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/cancelPublicshState', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});



//2.1.08 商品标准价格管理 复制
mock.onPut('/recruitProductPriceCopy').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/copyPreviousRecruitData', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//2.1.09 商品标准价格管理 发布
mock.onPut('/recruitProductPricePublish').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/updateStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大区商品标准价格查看
mock.onPut('/recruitProductPriceListDQ').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/selectDorF', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//分部商品标准价格查看
mock.onPut('/recruitProductPriceListFB').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/selectDorF', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//总部 - 限价及特价申请开放管理 - 查询列表
mock.onPut('/queryProductPriceLimitVos').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceLimit/queryProductPriceLimitVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部-商品限价及特价申请开放管理-带批量开头的全部操作
mock.onPut('/batchLimitPrice').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceLimit/batchLimitPrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//=========================分部商品特价申请===============================
//列表
mock.onPut('/selectByFProductPricePriceApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/selectByFProductPricePriceApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//添加
mock.onPut('/addFProductPricePriceApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/addFProductPricePriceApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//修改
mock.onPut('/updateFProductPricePriceApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/updateFProductPricePriceApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//分部查看详情
mock.onPut('/getByProductPriceApplyRelevanceF').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/getByProductPriceApplyRelevanceF', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部查看详情
mock.onPut('/getByProductPriceApplyRelevanceZ').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/getByProductPriceApplyRelevanceZ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//初审列表
mock.onPut('/queryByFSubmitProductPricePriceApplyZExamine').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/queryByFSubmitProductPricePriceApplyZExamine', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//终审列表
mock.onPut('/queryByFSubmitProductPricePriceApplyZFinallyExamine').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/queryByFSubmitProductPricePriceApplyZFinallyExamine', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//初审操作
mock.onPut('/getFirstAuditZ').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/getFirstAuditZ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//终审操作
mock.onPut('/getFinalAuditZ').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPriceApply/getFinalAuditZ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//总部、大区查看分部价格列表
mock.onPut('/selectByFProductPriceZorD').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/selectByFProductPriceZorD', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//查看分部价格列表
mock.onPut('/selectByFProductPriceF').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/selectByFProductPriceF', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
订单 选择商品列表
2018-06-04
lixuliang
support_api: 谭必庆
*/
mock.onPut('/queryProductPriceForOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/searchByProductPriceForOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
商品详情列表
support_api: 谭必庆
*/
mock.onPut('/getByIdsForOrderView').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/getByIdsForOrderView', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单选择商品 根据商品价格id获取商品详情
mock.onPut('/productPriceGetById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/getById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//商品-价格-查询（订单新增用）-后台指定招生季
mock.onPut('/productForOrderByRecruitBatchId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/searchByProductPriceForOrderRecruitBatchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单管理-分部-历史订单新增的接口
mock.onPut('/addOrderByHistory').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/addOrderByHistory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单管理-分部-历史订单修改的接口
mock.onPut('/updateOrderByHistory').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateOrderByHistory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单管理-分部-修改订单创建时间
mock.onPut('/updateOrderCreateDate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateOrderCreateDate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单管理-获取官网缴费路径
mock.onPut('/getQuickPayPathByOrderId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getQuickPayPathByOrderId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//根据订单商品ids 校验收费方
mock.onPut('/checkProductForOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productPrice/checkProductForOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//分部订单管理，暂存

//订单管理-分部-历史订单修改的接口
mock.onPut('/TemporaryStorageInterface').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateAyableToTemporarily', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//判断用户是否存在在学科目接口
mock.onPut('/checkCourseIsStudy').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/checkCourseIsStudy', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//预报信息维护人管理列表查询
mock.onPut('/selectFeePreReportManagePage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feePreReport/selectFeePreReportManagePage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//预报信息维护人管理 - 调整维护人员
mock.onPut('/updateFeePreReportProtectId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feePreReport/updateFeePreReportProtectId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
订单 分部个人订单收费方设置
2018-06-23
lixuliang
support_api: 王强
*/
mock.onPut('/queryPayeeTypeByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchZbPayeeType/getPayeeTypeByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//----- -----3. 优惠管理
//----- 3.1总部
//3.1.01 统一优惠规则管理列表
mock.onPut('/discountRuleQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/queryAllHeadRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.02 统一优惠规则管理 新增
mock.onPut('/discountRuleCreate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.03 统一优惠规则管理 修改
mock.onPut('/discountRuleUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.04 统一优惠规则管理 批量修改有效期
mock.onPut('/discountRuleBatchUpdateExpiryDate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/updateExpiryDate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.05 统一优惠规则管理 适用商品列表（已添加）
mock.onPut('/discountRuleProductQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/productDiscountProduct/queryByRuleId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//3.1.06 统一优惠规则管理 适用商品列表（未添加）
mock.onPut('/discountRuleNotProductQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountProduct/queryProductNotDiscount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.07 统一优惠规则管理 适用商品 添加
mock.onPut('/discountRuleProductAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountProduct/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.08 统一优惠规则管理 适用商品 删除
mock.onPut('/discountRuleProductDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/productDiscountProduct/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.09 统一优惠规则管理 互斥 列表查询
mock.onPut('/discountRuleMutexQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/ProductDiscountMutex/queryDiscountMutexRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//3.1.10 统一优惠规则管理 互斥 操作
mock.onPut('/discountRuleMutexSet').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/ProductDiscountMutex/defineMutex', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
分部-招生管理-创建订单-整单优惠规则下拉框
2018-06-04
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryDiscountBySingle').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/queryDiscountBySingle', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
/*
分部-招生管理-创建订单-商品优惠规则下拉框
2018-06-04
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryDiscountByFold').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/queryDiscountByFold', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
分部-招生管理-创建订单-读取优惠限额
maxDiscountQuota
getMaxDiscountRulePrice
2018-06-13
lixuliang
support_api: 王文君
*/
mock.onPut('/queryMaxDiscountQuotaByItems').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/discountRule/getMaxDiscountRulePrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//----- 3.2大区

//----- 3.3分部
mock.onPut('/getOrderAchievementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/OrderAchievementController/queryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//查工作人员
mock.onPut('/queryUserByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/OrderAchievementController/queryUserByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
mock.onPut('/updateOrderAchievementUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/OrderAchievementController/updateUserByOrderIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
mock.onPut('/updateArea').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/OrderAchievementController/updateAreaByBranchIdAndAreaId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//====================招生管理-活动与咨询-学生电咨分配
mock.onPut('/getStudentAskBenefitList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/queryBenefit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//=======招生管理-活动与咨询-邀约记录
mock.onPut('/getStudentInviteList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/queryInvitePage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//----- -----4. 订单管理
//----- 4.1 学生管理
//----- 4.1.01 查询学生列表
mock.onPut('/studentQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/branchQuery', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//公海学生查询
mock.onPut('/HighSeasStudentInquiryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/queryStudentIsPublic', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

mock.onPut('/canOrderStudentQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/studentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//----- 4.1.02 新增学生(订单中)
mock.onPut('/studentCreate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//学生新增（来自管网分部）
mock.onPut('/studentCreateOnline').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/onlineCreate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//----- 4.1.02 新增学生(活动中)
mock.onPut('/studentCreateInActive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/activeCreate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//----- 4.1.03 按id查询学生
mock.onPut('/studentById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/student/queryById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//----- 4.1.04 修改学生
mock.onPut('/studentUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//----- 4.1.04  学生修改(来自官网分部)
mock.onPut('/studentUpdateOnline').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/onlineUpdate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//----- 4.1.04 修改学生
mock.onPut('/studentUpdateInActive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/activeUpdate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//根据活动名查询当前用户分部数据范围下的活动（下拉框）
mock.onPut('/queryByActivityName').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/queryByActivityName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*4.1.05 学生验证是否存在
  2018-06-14
  lixuliang
  api supply from 王文君
*/
mock.onPut('/studentCheck').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/checkInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//----- 4.1.00 获取“了解中博的方式”
mock.onPut('/gainWayList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/gainWay/all', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//----- 4.1 订单管理

/*
4.2.05 新增订单 新增保存
2018-06-01
lixuliang
support_api: 徐建丰
*/
mock.onPut('/createOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/addOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//=============总部-招生管理-订单管理-订单分部调整-列表
mock.onPut('/getOrderList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/OrderAchievementController/getOrderList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//=============总部-招生管理-订单管理-订单分部调整
mock.onPut('/updateOrderBranchAndRegion').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateOrderBranchAndRegion', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


/*
4.2.06 新增订单 修改保存
2018-06-01
lixuliang
support_api: 徐建丰
*/
mock.onPut('/updateOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


/*
4.2.07 订单管理列表
2018-06-05
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryOrderManage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryPageByManager', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.08 分部 订单管理 订单列表
       分部 订单查询
       总部 订单查询
       大区 订单查询
2018-06-01
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
mock.onPut('/queryOrder2').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryPage2', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
/*
    4.2.08 分部 费用管理-订单异地缴费
       分部 订单查询
       总部 订单查询
       大区 订单查询
2018-06-01
dinghaotian
support_api: 徐建丰
*/
mock.onPut('/queryByOffsite').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryByOffsite', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//根据当前登录用户分部id查询状态为启用的POS机编号列表
mock.onPut('/getPosCode').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/getPosCodeByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.09 根据订单Id获取订单详情 方向班
2018-06-04
lixuliang
support_api: 徐建丰
*/
mock.onPut('/getDirectionOrderById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getDirectionInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//分部 招生管理 订单管理 快捷支付订单匹配 支付流水列表
mock.onPut('/OrderFastPayList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOtherPay/queryByQuick', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//分部 招生管理 订单管理 快捷支付订单匹配 匹配订单号列表
mock.onPut('/OrderNumberList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryPageByQuick', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//分部 招生管理 订单管理 快捷支付订单匹配 匹配订单号绑定
mock.onPut('/OrderMatchUpd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateMatchByQuick', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.10 根据订单Id获取订单详情 非方向班
2018-06-04
lixuliang
support_api: 徐建丰
*/
mock.onPut('/getNotDirectionOrderById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getNotDirectionInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.11 根据订单Id获取订单详情 统一详情接口
2018-06-04
lixuliang
support_api: 徐建丰
*/
mock.onPut('/getOrderById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getOrderById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


/*
4.2.12 根据订单Id获取订单详情 缴费
2018-06-04
lixuliang
support_api: 徐建丰
*/
mock.onPut('/getOrderFeeById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getOrderPayfeeInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
/*
4.2.13 根据订单Id获取订单详情 退费
2018-06-19
lixuliang
support_api: 徐建丰
*/
mock.onPut('/getOrderRefundById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getOrderRefundInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
/*
4.2.14 根据订单Id获取订单详情 扣费
2018-06-19
lixuliang
support_api: 徐建丰
*/
mock.onPut('/getOrderDeductById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getOrderDeductInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


/*
4.2.13 调用Pos机成功后，调用 服务端 缴费
2018-06-06
lixuliang
support_api: 徐建丰
*/
mock.onPut('/paymentByPos').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/paymentByPos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.14 订单作废
2018-06-08
lixuliang
support_api: 徐建丰
*/
mock.onPut('/abandonOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateAbandoned', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/**
 * 电子签
 */
mock.onPut('/getContractUrl').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getContractUrl', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.15 订单提交
2018-06-09
lixuliang
support_api: 徐建丰
*/
mock.onPut('/submitOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/submitOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.16 订单审核列表
2018-06-11
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryOrderForAudit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryPageByAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

/*
4.2.16 订单审核
2018-06-11
lixuliang
support_api: 徐建丰
*/
mock.onPut('/auditOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateOrderByAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
/*
4.2.17 获取订单已缴金额
2018-07-08
lixuliang
support_api: 徐建丰
*/
mock.onPut('/queryOrderByPayment').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryOrderByPayment', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单收费方变更申请管理 - 列表
mock.onPut('/orderPayeeChangeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPayeeChange/queryPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单收费方变更申请管理 - 新增申请 - 列表
mock.onPut('/addOrderPayeeChangeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPayeeChange/queryOrderPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//订单收费方变更申请管理 - 新增申请 - 变更
mock.onPut('/addOrderPayeeChange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPayeeChange/addChangeApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//订单收费方变更申请管理 - 删除
mock.onPut('/OrderPayeeChangeDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPayeeChange/deleteById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//订单收费方变更申请管理 - 查看
mock.onPut('/OrderPayeeChangeInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPayeeChange/getInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});




//订单POS临时缴费管理 - 首页列表
mock.onPut('/OrderPOSList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryOrderDepositList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});



//订单POS临时缴费管理 - 定金详情列表
mock.onPut('/OrderPOSDetailsList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getOrderDepositInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单POS临时缴费管理 - 匹配流水号
mock.onPut('/MatchingFlowCode').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/paymentDepositByQuick', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//订单收费方变更申请管理 - 总部 - 提交审核
mock.onPut('/auditPayeeChangeApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPayeeChange/auditChangeApplyById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//订单收费方变更申请管理 - 总部 - 批量提交审核
mock.onPut('/auditPayeeChangeApplyByBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/orderPayeeChange/auditChangeApplyByBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//总部 - 订单金额及分期特殊调整 - 列表
mock.onPut('/queryBySpecialList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryBySpecial', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//总部 - 订单金额及分期特殊调整 - 调整
mock.onPut('/queryBySpecialUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateOrderBySpecial', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//总部 - 官网订单查询
mock.onPut('/queryOrderListByWebsite').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderTeacherCenter/queryOrderListByWebsite', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//大区 - 订单分部调整 - 列表
mock.onPut('/queryOrderPageByRegionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryOrderPageByRegion', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//大区 - 订单分部调整 - 调整
mock.onPut('/updateBranchByOrderIds').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/updateBranchByOrderIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//=================== END 招生管理 =======================

//=================== 学服学务管理 =======================
//----- -----1 面授开课计划及排课
//-----1.1 总部
//1.1.01 开课批次管理 列表
mock.onPut('/getCoursePlanBatchList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplanBatch/selectCourseplanBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.1.02 开课批次管理 修改
mock.onPut('/updateCoursePlanBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplanBatch/updateCourseplanBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.1.03 开课批次管理 新增
mock.onPut('/addCoursePlanBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplanBatch/createCourseplanBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.1.04 开课批次 按id查
mock.onPut('/getCoursePlanBatchById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplanBatch/getCourseplanBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.1.05 开课批次 按项目id查
mock.onPut('/getCoursePlanBatchByItemId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplanBatch/selectCourseplanBatchByItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//1.2.06 开课计划-新增列表
mock.onPut('/getCoursePlanAddList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/selectStudentStatistics', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.2.07 开课计划-新增/补报时，获取部分详情
mock.onPut('/getCoursePlanPartInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/selectCreateCourseplanInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//1.2.08 开课计划-新增课程班 新增
mock.onPut('/createCoursePlanAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/createCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//1.2.09 开课计划-补报课程班 新增
mock.onPut('/createCoursePlanAdditional').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/createAppendCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//1.2.10 考季列表 根据项目Id
mock.onPut('/getExamBatchByItem').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/examBatch/selectExamBatchByItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.2.11 开课计划-管理列表
mock.onPut('/getCoursePlanList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/selectCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.2.12 开机计划-按id查看
mock.onPut('/getCoursePlanById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/getCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.2.13 开课计划- 修改
mock.onPut('/updateCoursePlan').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/updateCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.2.14 开课计划- 删除
mock.onPut('/deleteCoursePlan').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/deleteCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//1.2.15 开课计划- 总部 审核列表
mock.onPut('/getCoursePlanAuditList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/selectCourseplanReview', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.2.16 开课计划- 总部 审核详情
mock.onPut('/getCoursePlanAuditById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/getCourseplanReview', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.2.17 开课计划 - 总部 审核操作
mock.onPut('/auditCoursePlan').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/auditCourseplanReview', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.2.18 分部 开课计划 - 提交列表
mock.onPut('/getCoursePlanSubmitList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/selectCourseplanSubmit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.2.19 分部 开课计划 - 提交
mock.onPut('/submitCoursePlan').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/courseplanSubmit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.2.20 分部 开课计划 - 导出
/*mock.onPut('/exportCoursePlan').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/courseplan/courseplanExport', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})*/

//总部-开课计划查询-修改是否是教服试点状态
mock.onPut('/updateIspilot').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/updateIspilot', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.3.21 （分部）异动管理 查询学生转出订单
mock.onPut('/courseStudentOutOrderQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMove/selectOrderOut', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.3.22 （分部）异动管理 查询学生转入订单
mock.onPut('/courseStudentInOrderQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMove/selectOrderIn', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.3.23 （分部）异动管理 查询学生转出订单详情 按订单id
mock.onPut('/courseStudentOutOrderDetailQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMove/selectOrderOutDetail', config.data).then((res) => {
      //testAxios.post('/edu/courseStudentMove/selectOrderOutDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.3.24 （分部）异动管理 查询学生转入订单详情 按订单id
mock.onPut('/courseStudentInOrderDetailQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMove/selectOrderInDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.3.25 （分部）异动管理 提交
mock.onPut('/courseStudentMoveSubmit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMove/studentMoveApplication', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.26 （总部）课表明细管理 列表
mock.onPut('/courseArrangeDetailListQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetail/list', config.data).then((res) => {
      //testAxios.post('/edu/courseArrangeDetail/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.27 （总部）课表明细管理 冲突查询
mock.onPut('/courseArrangeConflictQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetail/conflick', config.data).then((res) => {
      //testAxios.post('/edu/courseArrangeDetail/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.28 （总部） 课表明细管理 删除
mock.onPut('/courseArrangeDetailDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/deleteByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.29 （总部） 课表明细管理 按DetailId查找
mock.onPut('/courseArrangeByDetailIdQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/check', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.30 （总部） 课表明细管理 修改
mock.onPut('/courseArrangeDetailUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.30 （总部） 课表导入管理 明细新增
mock.onPut('/courseArrangeDetailCreate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.30 （总部） 课表导入管理 明细新增前验证
mock.onPut('/courseArrangeDetailAddConflick').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/addConflick', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.30 （总部） 课表导入管理 根据课表id查部分信息
mock.onPut('/courseArrangeBaseInfoById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/getOneCourseInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.31 （总部） 课表明细管理 批量修改上课日期
mock.onPut('/courseArrangeDateBatchUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetail/updateByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.32 （总部） 课表明细管理 批量修改讲师
mock.onPut('/courseArrangeTeacherBatchUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetail/updateTeacherIdByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.33 （总部）课表明细管理 日历显示按月
mock.onPut('/courseArrangeByCalendarMonth').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetail/queryByCalendar', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.34 （总部）课表明细管理 日历显示按年
mock.onPut('/courseArrangeByCalendarYear').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetail/queryByCalendarForYear', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.35 （总部） 课表导入 按课程班查询
mock.onPut('/courseArrangeListByCourseArrange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/courseplanList', config.data).then((res) => {
      //testAxios.post('/edu/courseArrangeNew/courseplanList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.36 （总部） 课表导入 按讲师查询
mock.onPut('/courseArrangeListByTeacher').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/selectByTeacherId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.37 （总部） 课表导入管理 按Id查找
mock.onPut('/courseArrangeByIdQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/getOne', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.38 （总部） 课表导入管理 删除
mock.onPut('/courseArrangeDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/deleteCourseArrangeAndDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.39 （总部） 课表导入管理 确认
mock.onPut('/courseArrangeCommit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeNew/courseArrangeSure', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.40 （总部） 课表导入管理 导入
/*mock.onPut('/courseArrangeImport').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeImport/importCourseExcel', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})*/

//1.4.40 （分部） 课表查询 列表
mock.onPut('/courseArrangeListQuery2').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeCheck/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.4.41 （分部） 课表发布 列表
mock.onPut('/courseArrangePublishListQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeBranchPublish/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.42 （分部） 课表发布 详情列表
mock.onPut('/courseArrangePublishDetailQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeBranchPublish/getOne', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//1.4.43 （分部） 课表发布 确认发布
mock.onPut('/courseArrangePublishCommit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeBranchPublish/publish', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//1.5  班级管理 到人
//1.5.44 （分部） 学生课表冲突查询列表
mock.onPut('/studentCourseArrangeConflictQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/studentConflict', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 转班申请管理列表
mock.onPut('/getCourseStudentMoveManagerList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveManager/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 转班申请管理删除
mock.onPut('/deleteCourseStudentMoveManager').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveManager/deleteOne', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 转班申请管理 根据id查询
mock.onPut('/getCourseStudentMoveManagerById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveManager/getOneInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//
//（分部） 转班申请管理 转出订单课程商品费用处理明细
mock.onPut('/getChangeDetailInfoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveManager/getChangeDetailInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（总部） 转班申请管理 转出订单课程商品费用处理明细
mock.onPut('/getChangeDetailMoveInfoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveHeadquartersManager/getChangeDetailInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 转班申请管理 转出订单课程商品费用处理明细
mock.onPut('/getChangeDetailHeadquartersInfoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveHeadquartersManager/getChangeDetailInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 考季管理 分页查询
mock.onPut('/examBatchSelectByItem').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/examBatch/selectByItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 考季管理 新增
mock.onPut('/examBatchAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/examBatch/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 考季管理 修改
mock.onPut('/examBatchUpd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/examBatch/upd', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 考季管理 删除
mock.onPut('/examBatchDel').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/examBatch/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（总部） 项目课程阶段管理 查询列表
mock.onPut('/queryItemStageVosList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/itemStage/queryItemStageVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 项目课程阶段管理 新增/编辑
mock.onPut('/addOrEditItemStage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/itemStage/addOrEditItemStage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 项目课程阶段管理 删除
mock.onPut('/delItemStage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/itemStage/delItemStage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 退学退费申请管理 列表
mock.onPut('/getCourseStudentRefundManagerList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefundManager/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})


//（分部） 退学退费申请管理 删除
mock.onPut('/deleteCourseStudentRefundManager').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefundManager/deleteOne', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 退学退费申请管理 查看详情
mock.onPut('/getCourseStudentRefundManagerById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefundManager/getOneInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部）退费退学申请-查询学生订单
mock.onPut('/getCourseStudentRefundSelectOrderOut').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefund/selectOrderOut', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部）退费退学申请-查询学生订单详情
mock.onPut('/getCourseStudentRefundSelectOrderOutDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefund/selectOrderOutDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（总部）退费退学申请-提交退费退学审核
mock.onPut('/courseStudentRefundApplication').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefund/studentRefundApplication', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部）退学查询-列表查询
mock.onPut('/getCourseStudentLeaveManagerList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentLeaveManager/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（总部、分部）退费退学审核-列表查询
mock.onPut('/leaveRefundAuditQueryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentChange/selectStudentChangeForExamine', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})


//（总部、分部）新的退费退学审核-列表查询
mock.onPut('/NewleaveRefundAuditQueryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentChange/selectStudentChangeForAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//退费退学财务确认-修改按钮
mock.onPut('/leaveRefundUpdateOperateDate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentChange/updateOperateDate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 划查询-列表查询
mock.onPut('/getCourseplanList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/courseplanQuery', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 班级管理  课程班成绩管理
mock.onPut('/queryCourseArrangeScoreVosList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/queryCourseArrangeScoreVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//（总部） 班级管理  课程班学生成绩查询
mock.onPut('/querySelectCourseArrangeScoreList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/selectCourseArrangeScore', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 班级管理  课程班成绩管理 - 成绩查看
mock.onPut('/queryCourseArrangeScoreVosLook').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/queryCourseArrangeScoreVos2', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 班级管理  课程班成绩管理 - 成绩管理 - 列表
mock.onPut('/queryCourseArrangeScoreVosManageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/queryCourseArrangeScoreVos3', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//（分部） 班级管理  课程班成绩管理 - 成绩管理 - 录入成绩/编辑/删除/报考
mock.onPut('/addOrEditOrDelStudentScoreManage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentScore/addOrEditOrDelStudentScore', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})


//（分部） 班级管理  课程班结束管理 -结束课程班
mock.onPut('/CloseAllCourse').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/finishCourseArrange', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//(总部)网络课程 激活管理
mock.onPut('/getCourseActiveList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseActive/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//(总部)网络课程 激活管理 课程激活
mock.onPut('/courseActiveOperationCourseActive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseActiveOperation/courseActive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//(总部)网络课程 激活管理 修改记录
mock.onPut('/getCourseActiveOperationSelectLogList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseActiveOperation/selectLog', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//(总部)网络课程 激活管理 取消激活
mock.onPut('/courseActiveOperationCourseCancelActive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseActiveOperation/courseCancelActive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//(总部)网络课程 激活管理 修改时间
mock.onPut('/courseActiveOperationCourseUpdateEndTime').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseActiveOperation/updateEndTime', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//=================== 分部课程管理=================== 


//延期申请-列表

mock.onPut('/ApplicationForPostponementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/selectCourseActive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})


//延期审查-查看

mock.onPut('/ApplicationForPostponementSee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/viewHistory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//延期审查-批量申请

mock.onPut('/ApplicationForPostponementBachApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/applyCourseActive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//分部-学服学务-课程管理-延期审核管理、特殊延期初审、总部延期终审-批量申请

mock.onPut('/DelayManagementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseApply/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})





//分部-学服学务-课程管理-延期审核管理/特殊延期审核/延期终审-查看/审核

mock.onPut('/DeferredAuditSee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseApply/getOneInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})


//分部-学服学务-课程管理-延期审核管理-批量删除

mock.onPut('/DeferredAuditDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/deleteApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//分部-学服学务-课程管理-延期审核管理-批量删除

mock.onPut('/DeferredAuditApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/branchAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//分部-学服学务-课程管理-特殊延期初审-批量审核

mock.onPut('/DeferredAuditBatchApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/branchBatchAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//总部-学服学务-网络课程管理-延期终审-审核

mock.onPut('/NetAuditApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/headquarterAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//总部-学服学务-网络课程管理-延期终审-批量审核

mock.onPut('/NetAuditBatchApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOnlineCourseExtensionApply/headquarterBatchAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//总部-学服学务-网络课程管理-延期终审-批量审核

mock.onPut('/NetOpenHomeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourse/allUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//总部-学服学务-网络课程管理-延期终审-批量审核

mock.onPut('/NetOpenView').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourse/courseActiveList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//总部-学服学务-网络课程管理-新开网课

mock.onPut('/NewNetClassList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourse/courseList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})






//总部-学服学务-网络课程管理-新开网课确认

mock.onPut('/NewNetClassSure').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourseOperation/openingSpecialCourse', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})



//总部-学服学务-网络课程管理-修改记录

mock.onPut('/ModifyTheRecord').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseActiveOperation/selectLog', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//总部-学服学务-网络课程管理-批量终止

mock.onPut('/BatchTermination').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourseOperation/courseCancelActiveBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//总部-学服学务-网络课程管理-修改时长查询

mock.onPut('/ModifiedTimeSearch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourseOperation/getInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})






//总部-学服学务-网络课程管理-修改时长

mock.onPut('/ModifiedTimeLength').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourseOperation/updateEndTime', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//总部-学服学务-网络课程管理-修改时长

mock.onPut('/ModifiedTimeLengthBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourseOperation/updateEndTimeBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})





//总部-学服学务-网络课程管理-修改时长

mock.onPut('/ReactivationInterface').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/specialOnlineCourseOperation/courseActive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//(总部)网课订单及激活统计表---列表

mock.onPut('/OnlineActivationList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/statistics/get', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//(总部)网课订单及激活统计表---列表

mock.onPut('/ListOfPrepaidStatistics').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPreCharge/queryPreChargeList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//(总部)网课订单及激活统计表---缴费订单列表

mock.onPut('/ListOfPrepaidPaymentOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPreCharge/queryPreChargeListByOrder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//(总部)网课订单及激活统计表---退费订单列表

mock.onPut('/ListOfPrepaidRefundOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPreCharge/queryPreChargeListByRefunds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})




//(总部)网课订单及激活统计表---各种费用

mock.onPut('/VariousOfPrepaidCostOrder').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/orderPreCharge/queryPreChargeListByFee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})





//分部、总部-学服学务-班级管理-教学点学生查询列表
mock.onPut('/teachingStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/selectPageByStudentItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//分部、总部-学服学务-班级管理-教学点学生查询--二级列表
mock.onPut('/teachingStudentTwoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenterStudentQuery/firstList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//分部、总部-学服学务-班级管理-教学点学生查询--三级列表
mock.onPut('/teachingStudentThreeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenterStudentQuery/checkList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//分部、总部-学服学务-班级管理-教学点学生查询--三级列表(王文君新写)
mock.onPut('/queryCourseCategoryStudyInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenterStudentQuery/queryCourseCategoryStudyInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})


//   学生报班管理--学生所属教学点---下拉框
mock.onPut('/TeachingPointDropdown').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/selectStudentTeacherCenterList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//   学生报班管理--学生所属教学点(已加入学生所属教学点。)---下拉框
mock.onPut('/AlreadyTeachingPointDropdown').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/selectStudentTeacherCenterList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
// ===========总部====网课订单及激活统计表===========

//新增激活课程   列表
mock.onPut('/NewActivationCourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/statistics/queryActiveCourses', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})






//新增激活学员   列表
mock.onPut('/NewActivationStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/statistics/queryActiveStudents', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})






//=================== END 学服学务管理 =======================

//------------------- 用户负责项目管理 -----------------------
//查询分页
mock.onPut('/getAdminUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//------------------- 用户负责项目管理 -用户设置区域-更改区域 -----------------------
//查询分页
mock.onPut('/updQuyuOfUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/updQuyuOfUser ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//------------------- 用户负责项目管理 -用户设置区域-更改区域 -----------------------
//查询分页
mock.onPut('/qryQuyuOfUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryQuyuOfUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//批量设置项目

mock.onPut('/editBatchAdminUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/updItemOfManyUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//------------------- 用户负责项目管理 -----------------------
//查询分页
mock.onPut('/getBranchAdminUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryBranchUserByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//批量设置高校
mock.onPut('/editBranchAdminUserUniversities').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/updUserUniversities', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//单个用户负责项目列表
mock.onPut('/getItemListByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryItemOfUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//商品管理-复制
mock.onPut('/productCopy').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/copy', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//查询所有高校
mock.onPut('/getAllUniversityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryAllUniversityList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//查询除了已设置高校外的所有高校
mock.onPut('/getOtherUniversityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryUniversityList ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//查询某个用户的负责高校
mock.onPut('/getUniversitiesByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryUniversitiesByUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});



//查询某个用户的负责教学点
mock.onPut('/getTeacheringByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/queryUserManageTeachCenterList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//删除某个用户的负责教学点
mock.onPut('/deleteTeacheringByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/deleteUserScopeById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//查询某个用户的尚未管理的教学点
mock.onPut('/getNotTeacheringByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/selectUserNotManageTeacherInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//批量设置多用户多个教学点权限
mock.onPut('/BatchSettingTeacheringByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/updateUserTeachCenterScopes', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//删除选中的负责高校
mock.onPut('/delUserUniversity').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/delUserUniversity', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//------------------- 用户负责分部管理 -----------------------
//查询分页
mock.onPut('/getBranchParternList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryUserBranchByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//编辑
mock.onPut('/editBranchPartern').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/updUserBranchScope', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取某个用户负责的高校
mock.onPut('/getUniverstyByToken').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/campus/queryUniversityByToken', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});



//获取用户负责的分部列表
mock.onPut('/qryBranchListByUserVo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryBranchListByUserVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取管理分部列表
mock.onPut('/getOrganizationVoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryOrganizationVoList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取大区管理分部列表 -- 设置分部 
mock.onPut('/LargeAreaGetOrganizationVoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/qryRegionOrganizationVoList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取大区管理分部列表 -- 设置分部 -- 修改
mock.onPut('/LargeAreaGetOrganizationVoListEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/adminUser/updateUserRegionBranchScope', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取全部分部列表
mock.onPut('/queryAllBranch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/queryAllBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//获取区域列表
mock.onPut('/getAreaByBranchList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/queryAreaByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//修改区域
mock.onPut('/editAreaByBranch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/updateAreaByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//用户负责的所有区域
mock.onPut('/selectAreaByUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/OrderAchievementController/selectAreaByUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//用户负责的所有区域
mock.onPut('/selectAreaByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/queryAreaByBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//增加区域
mock.onPut('/addAreaByBranch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/addAreaByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取设置-新增用户列表
mock.onPut('/getUserByNotInList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/queryUserByNotInAreaId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取设置用户列表
mock.onPut('/getUserByAreaList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/queryUserByAreaId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//设置用户-添加用户列表
mock.onPut('/addUserByAreaId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/addUserByAreaId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//设置用户-删除用户列表
mock.onPut('/deleteUserByUsersId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/deleteUsersByUsersIdOnArea', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});


//------------------- 教学点管理-----------------------
//获取分部下的教学点列表
mock.onPut('/getTeachCenterByBranchIdList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryTeachCenterListByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取分部下的教学点列表
mock.onPut('/addTeachCenter').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/addTeachCenter', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取该分部下的高校列表
mock.onPut('/getUniversityByBranchId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryUniversityByBranchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取该分部下的高校校区列表
mock.onPut('/getCampusByUniversityId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryCampusByUniversityId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//修改分部下的教学点
mock.onPut('/editTeachCenter').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/updateTeachCenterByTeachCenterId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//删除分部下的教学点
mock.onPut('/deleteTeachCenter').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/deleteTeachCenterById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//查询教学点下的用户
mock.onPut('/getUserByTeachList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryUserByTeachCenterId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//查询教学点下的用户 新写
mock.onPut('/getTeacherList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/getTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//删除教学点下的用户
mock.onPut('/deleteUserByIdOnTechCenter').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/deleteUsersByUsersIdOnTeachCenter', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//查询不在此教学点下的用户
mock.onPut('/getUserByNotTeachList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryUserByNotITeachCenterId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//新增此教学点下的用户
mock.onPut('/addUserByTeachCenterId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/addUserByTeachCenterId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//------------------- 班型管理-----------------------
mock.onPut('/getClassList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classType/queryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//修改
mock.onPut('/editClass').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classType/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//新增
mock.onPut('/addClass').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classType/insert', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//获取商品协议类型
mock.onPut('/getAllStudyAgreement').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classType/queryAllStudyAgreement', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});
//================ 商品管理 =================
mock.onPut('/getProductList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/searchPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/addProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/editProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/deleteProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/getCourseProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/getCourseProductInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/updateProductCource').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/updateProductCource', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/getBindProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/getBindProductInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/searchPageForNotBind').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/searchPageForNotBind', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/addBindProductCourse').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/addCourseProuct', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/deleteBindProductCource').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/deleteProductCource', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/updateBindProductCourseIsGiveYes').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/upCourseProductIsGiveYes', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/updateBindProductCourseIsGiveNo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productCource/upCourseProductIsGiveNo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询多个项目下的科目列表
mock.onPut('/getCourseCategoryListByItemIds').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseCategory/getCourseCategoryListByItemIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//------------------- 高校管理-----------------------
//查询列表
mock.onPut('/getUniversityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/campus/queryUniversityList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//修改
mock.onPut('/editUniversity').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/campus/updateCampusByUniversityId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//新增
mock.onPut('/addUniversity').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/campus/addCampusByUniversityId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//删除
mock.onPut('/deleteUniversity').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/campus/deleteCampus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-------------------  总部教学点查询管理-----------------------
//查询列表
mock.onPut('/getZbTeachCenterList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryTeachCenter', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询下拉分部列表
mock.onPut('/getBranchList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/queryBranchByBranchName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询省市列表
mock.onPut('/getAreaList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/area/getAreas', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询所有省市列表
mock.onPut('/getAllAreas').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/area/getAllAreas', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//-------------------  总部公司账户管理-----------------------
//查询列表
mock.onPut('/getBankAccountList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST

    normalAxios.post('/edu/bankAccount/selectBankAccount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//增加
mock.onPut('/addBankAccount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/bankAccount/insertBankAccount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//编辑
mock.onPut('/editBankAccount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/bankAccount/updateBankAccount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根椐收费方查询相关大客户
mock.onPut('/getByPayeeType').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/partner/getByPartnerName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-------------------  POS机管理-----------------------
//查询列表
mock.onPut('/getPosList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/getPosList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//编辑
mock.onPut('/editPos').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/updatePos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//增加
mock.onPut('/addPos').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/insertPos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询收费方列表
mock.onPut('/getPosAccountTypeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/getPosAccountType', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//批量设置分部
mock.onPut('/updateBranchBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/updateBranchBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//导入Pose机信息
mock.onPut('/importPos').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/pos/importPos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 面授延期管理-----------------------
//查询列表
mock.onPut('/getFaceToFaceDelayList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseCategoryDetail/selectFaceToFaceDelayList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询用户的教学点
mock.onPut('/getTeachCenterByUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teachCenter/selectTeachCenterByUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//终止延期
mock.onPut('/editFinishStatusByPrimaryKey').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/updateFinishStatusByPrimaryKey', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 商品标准管理-----------------------

//查询分期付款规则列表
mock.onPut('/getByTermRuleList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/termTule/selectByTermRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查询按ID分期付款规则
mock.onPut('/getByTermRuleId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/termTule/selectByTermRuleId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//编辑
mock.onPut('/updateTermRule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/termTule/updateTermRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 总部学籍规则管理-----------------------
//总部-学服学务-学籍规则管理-查询列表
mock.onPut('/getStudyRuleList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/queryStudyRuleByUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-学籍规则管理-修改学籍规则和添加学籍规则
mock.onPut('/studyRuleUpd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/updateStudyRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-学籍规则管理-删除规则 && 删除特殊科目
mock.onPut('/studyRuleDel').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/deleteSpecialRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-学籍规则管理-特殊科目列表
mock.onPut('/specialCourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/querySpecialStudyRuleByUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-学籍规则管理-未设置普通科目列表
mock.onPut('/normalCourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/queryAllNomarlCourse', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-学籍规则管理- 新增特殊科目
mock.onPut('/specialCourseAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/insert', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-学籍规则管理- 修改编辑特殊科目
mock.onPut('/specialCourseUpd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/updateSpecial', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-学服学务-开课计划审核/开课计划查询/(分部，学服学务，开课计划管理)-点击审核或查看里的学生列表
mock.onPut('/StudentsWhoStartTheProgram').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/courseplan/selectCourseArrangeStudentNewAndOld', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//=========================分部优惠规则申请与审批===============================
//列表查询
mock.onPut('/getAuditDiscountRuleList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/queryAuditList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//优惠规则查询
mock.onPut('/getAuditDiscountRuleSearch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/branchDiscountRulePage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//已惠学员查询
mock.onPut('/alreadyBenefit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/order/queryByProductDiscountId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//修改
mock.onPut('/editStudyRule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/updateRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//审核
mock.onPut('/auditDiscountRulePass').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/audit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//新增
mock.onPut('/addStudyRule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/studyRoleAdd', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查看
mock.onPut('/auditDiscountRuleDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/productDiscountRule/queryById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//删除
mock.onPut('/deleteStudyRule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudyRule/deleteSpecialRule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//查看的审核类型
mock.onPut('/getProductDiscountAuditStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/systCommon/getQueryProductDiscountAuditStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//审核时的类型
mock.onPut('/getAuditProductDiscountAuditStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/systCommon/getAuditProductDiscountAuditStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//========================= 大区优惠限额管理===============================
//列表查询
mock.onPut('/getAreaDiscountManageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/discountRule/manageList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//编辑
mock.onPut('/editReginDiscount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/discountRule/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//获取大区
mock.onPut('/getReginList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/selectReginByReginName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//按项目统一设置
mock.onPut('/BatchByItemEditDiscount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/discountRule/createByItem', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//批量修改限额
mock.onPut('/BatchEditDiscount').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/discountRule/batchUpdate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根椐项目查询大区列表
mock.onPut('/getByItemOrg').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/discountRule/manageOrgList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//按大区设置
mock.onPut('/editByItemOrg').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/discountRule/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//获取大区最大限额
mock.onPut('/queryDiscountPriceByItemId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/discountRule/queryDiscountPriceByItemId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 学生报班管理-----------------------
//查询列表
mock.onPut('/getCourseArrangeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/getCourseArrangeList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//学生-学生列表
mock.onPut('/selectCourseArrangeStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/selectCourseArrangeStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//学生-新增学生-学生列表
mock.onPut('/selectStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseCategoryDetail/selectStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//批量删除学生
mock.onPut('/deleteByPrimaryKeyForBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/deleteByPrimaryKeyForBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//学生-新增学生-确定按钮
mock.onPut('/insertCourseStudentBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/insertCourseStudentBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//学生报班管理-面授完成按钮
mock.onPut('/updateFinishStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/updateFinishStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-------------------  大区优惠管理-----------------------
//查询列表
mock.onPut('/getSpecialDiscountRuletManageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/discountRule/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-------------------  分部优惠规则申请-----------------------
//列表查询
mock.onPut('/getProductDiscountRuleList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/queryBranchApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//新增
mock.onPut('/addproductDiscountRule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//编辑
mock.onPut('/editproductDiscountRule').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//查看分部优惠规则查看
mock.onPut('/getDiscountRuleBranchList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/productDiscountRule/queryBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-------------------  分部员工优惠限额设置-----------------------
//列表查询
mock.onPut('/getDiscountRuleEmployeeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/discountRule/employee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//批更新
mock.onPut('/BatchEditEmployee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/discountRule/employeeUpdate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 分部的招生管理管理学生归属调整-----------------------
//列表查询
mock.onPut('/getAscriptionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/queryAscription', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//批量调整学生所属区域
mock.onPut('/editAdjustBranch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/adjustBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//批量调整学生所属区域1 ：dht
mock.onPut('/editAreaByAreaId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/changeRegion', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//批量调整学生所属用户1 ：dht
mock.onPut('/editUser').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/changeBenefitUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//批量调整学生所属教学点
mock.onPut('/changeTeachCenter').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/changeTeachCenter', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//------------------- 分部的招生管理市场与咨询学生归属管理-----------------------
//列表查询
mock.onPut('/getFBAdjustBranchList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/branchAscriptionManage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//-----------------------------财务管理-----------------------------------------
//
//（总部） 收入月报计算日期设置  列表
mock.onPut('/feePayMonthTimeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feePayMonthTime/selectList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 收入月报计算日期设置  编辑日期
mock.onPut('/feePayMonthUpdateTime').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feePayMonthTime/updateTime', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 转班财务确认 查询审核列表
mock.onPut('/getCourseStudentMoveAuditList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveHeadquartersManager/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/getCourseFBStudentMoveAuditList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveBranchManager/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部） 转班财务确认 审核前检查
mock.onPut('/getCheckStudentChange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/CourseStudentMoveHeadquartersAudit/checkStudentChange', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//(分部） 转班财务确认 审核前检查
mock.onPut('/getFBCheckStudentChange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/CourseStudentMoveBranchAudit/checkStudentChange', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部） 转班财务确认 审核
mock.onPut('/courseStudentMoveAudit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/CourseStudentMoveHeadquartersAudit/studentChangeAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（分部） 转班财务确认 审核
mock.onPut('/courseFBStudentMoveAudit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/CourseStudentMoveBranchAudit/studentChangeAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部） 退费退学申请 列表
mock.onPut('/getCourseStudentRefundHeadquartersManagerList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefundHeadquartersManager/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//
//（总部） 退费退学申请 查看详情
mock.onPut('/getCourseStudentRefundHeadquartersManagerById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefundHeadquartersManager/getOneInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部） 转班申请 查看详情
mock.onPut('/getCourseStudentMoveHeadquartersManagerById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentMoveHeadquartersManager/getOneInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 挂单费用查询
mock.onPut('/selectRegisterList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/selectRegisterList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部） 预收款月报查询
mock.onPut('/selectPayfeeStatement').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/selectPayfeeStatement', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部） 预收款月报 重新生成
mock.onPut('/reportFeePayMonthByDate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/task/reportFeePayMonthByDate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 学生收入确认明细
mock.onPut('/getincomeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/fee/income/incomeMonthList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 预收款财务确认列表
mock.onPut('/getStudentPayfeeConfirmList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentPayfeeConfirm/selectStudentPayfee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 预收款财务确认详情
mock.onPut('/getStudentPayfeeInfoById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentPayfeeConfirm/selectStudentPayfeeInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//（总部） 转班预收款财务确认详情
mock.onPut('/ShiftWorkStudentRefundCheckStudentChange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeConfirm/selectStudentPayfeeInfoByStudentMove', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 预收款财务确认(确认方法)
mock.onPut('/getStudentPayfeeConfirmBatchConfirm').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeConfirm/batchConfirm', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 预收款财务确认 限制日期
mock.onPut('/selectConfirmLastDay').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeConfirm/selectConfirmLastDay', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 预收款财务确认(修改方法)
mock.onPut('/updateConfirmStudentPayfee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeConfirm/updateConfirmStudentPayfee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//根据公司查询收费账户（级联绑定下拉列表）
mock.onPut('/getBankAccountByZbPayeeType').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/bankAccount/getBankAccountByZbPayeeType', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部-缴费记录拆分-列表
mock.onPut('/queryPageBysplitByStudentPayfee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/queryPageBysplitByStudentPayfee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部-缴费记录拆分-拆分
mock.onPut('/splitByStudentPayfee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/splitByStudentPayfee', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//-----------------------------分部-财务管理-费用管理-----------------------------------------
//（分部） 学生转账上报管理 分页获取学生转账流水列表接口
mock.onPut('/getStudentPayfeeByTransfer').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/queryPageByTransfer', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 学生转账查询 分页获取学生转账流水列表接口
mock.onPut('/queryPageByTransferHeadquarters').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/queryPageByTransferHeadquarters', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（分部） 学生转账上报管理 获取学生转账订单列表接口
mock.onPut('/getStudentTransferByStudentName').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryByTransfer', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（分部） 学生转账上报管理 费用管理-分部-缴费接口-转账
mock.onPut('/studentPayfeePaymentByTransfer').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/paymentByTransfer', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（分部） 学生转账上报管理 费用管理-分部-缴费接口-转账更新
mock.onPut('/studentPayfeeUpdateByTransfer').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/updateByTransfer', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（分部） 学生转账上报管理 费用管理-转账上报-删除转账接口
mock.onPut('/studentPayfeeDeleteTransferById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/deleteTransfer', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（分部） 学生转账上报管理 费用管理-分部-已确认转账修改转账时间接口
mock.onPut('/updatePayDateByTransfer').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/updatePayDateByTransfer', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//（分部） 获取转账详情接口
mock.onPut('/getTransferInfoById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfee/getTransferInfoById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 退费退学申请 审核前检查
mock.onPut('/getCourseStudentRefundCheckStudentChange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/CourseStudentRefundHeadquartersAudit/checkStudentChange', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 退费退学申请 审核前检查
mock.onPut('/courseStudentRefundChangeAudit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/CourseStudentRefundHeadquartersAudit/studentChangeAudit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//（总部） 副总退费审批最高限额 -- 查询
mock.onPut('/MaximumLimitForApproval').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/systCommon/queryRefundLimitedAmount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//（总部） 副总退费审批最高限额 -- 修改
mock.onPut('/MaximumLimitForEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/systCommon/updateRefundLimitedAmount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//（分部） 大客户导入收费查询 查看列表
mock.onPut('/getStudentPayfeeCustomersList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeCustomers/selectCustomers', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//（分部） 大客户导入收费查询 编辑页查询
mock.onPut('/studentPayfeeEditById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeCustomers/selectParamForEdit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





//（分部） 大客户导入收费查询 编辑页修改时间
mock.onPut('/studentPayfeeEditChangeTimeById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeCustomers/updatePayDate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//（总部） 未匹配订单快捷支付查询 列表
mock.onPut('/getOtherPayList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOtherPay/selectOtherPayList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部、分部） 未匹配订单快捷支付 删除
mock.onPut('/delOtherPayList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOtherPay/delOtherPayList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//（总部、分部） 未匹配订单快捷支付 恢复
mock.onPut('/recoveryOtherPayList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentOtherPay/recoveryOtherPayList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 大客户导入收费确认 查看列表
mock.onPut('/getStudentPayfeeCustomersConfirmList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeCustomersConfirm/selectCustomers', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 大客户导入收费确认 审核
mock.onPut('/studentPayfeeCustomersConfirmBatchConfirm').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeCustomersConfirm/batchConfirm', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 基础管理  分部个人订单收费方设置列表
mock.onPut('/payeeTypeNameList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchZbPayeeType/selectBranchZbPayeeTypeList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 基础管理  分部个人订单收费方修改
mock.onPut('/payeeTypeNameUpd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchZbPayeeType/updateBatchPayeeType', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 财务管理  学生预收款财务确认查询
mock.onPut('/studentPrepaymentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPrepayment/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 财务管理  分部预收款确认汇总表
mock.onPut('/fbAdvanceReceiveList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feeBranchPayMonth/selectFeeBranchPayMonthList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（总部） 财务管理  分部预收款确认明细表(查询，导出)
mock.onPut('/fbAdvanceReceiveDetailed').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/feeBranchPayMonth/exportFeeBranchPayMonthDetailed', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-----------------------------总部-招生管理-市场与咨询-学生查询-----------------------------------------
//列表查询
mock.onPut('/getFBStudentSelectList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/getFBStudentSelectList2').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/list2', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-----------------------------总部-教学管理-基础管理-教师管理-----------------------------------------
//总部-分部教师查询
mock.onPut('/getZBTeacherSelectList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teacher/page', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部用的查询教师的接口
mock.onPut('/getAllTeacherList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teacher/all', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//教师新增
mock.onPut('/createTeacher').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teacher/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//更新教师
mock.onPut('/updateTeacher').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/teacher/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//验证教师号唯一性
mock.onPut('/checkLoginNameUnique').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/user/checkLoginNameUnique', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分页查询网课批次
mock.onPut('/classBatchPageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classBatch/page', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//创建网课批次
mock.onPut('/classBatchCreate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classBatch/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//更新网课批次
mock.onPut('/classBatchUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classBatch/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据主键删除网课批次
mock.onPut('/classBatchDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classBatch/deleteByClassBatchId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分页查询网课班级
mock.onPut('/classPageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/class/page', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//新建网课班级
mock.onPut('/classPageCreate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/class/create', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//更新网课班级
mock.onPut('/classPageUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/class/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//删除网课班级
mock.onPut('/classPageDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/class/deleteByClassId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//根据课程获取教学版本
mock.onPut('/coursesversionlist').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post(elearningUrl + '/api/teachsource/course/coursesversionlist/data', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//根据课程的教学版本id获取教学计划或者学习计划，没有周计划的不取
mock.onPut('/getPlanByCourseId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post(elearningUrl + '/api/userAction/php/classAPi/getPlanBycourseId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//网课班级添加或修改课程
mock.onPut('/classCourseCreateOrUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classCourse/createOrUpdate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//班级详情
mock.onPut('/classInfoQueryById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/class/queryById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询可以添加到当前班级的学生
mock.onPut('/canAddClassStudent').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classStudent/canAdd', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询已经添加到当前班级的学生
mock.onPut('/alreadyAddClassStudent').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classStudent/page', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//添加学生到网课班级
mock.onPut('/classStudentAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classStudent/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据主键删除网课学生
mock.onPut('/deleteByClassStudentId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classStudent/deleteByClassStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据主键批量删除网课学生
mock.onPut('/deleteByClassStudentIdBetch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/classStudent/deleteByClassStudentIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//-----------------------------总部-招生管理-任务目标-----------------------------------------
//大区任务目标管理列表查询
mock.onPut('/taskObjectDQManageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feeKpi/regionPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//大区任务目标管理 修改任务目标
mock.onPut('/taskObjectDQManageAddOrUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feeKpi/addOrUpdateFeeKpi', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//领航校区任务目标管理
mock.onPut('/taskObjectCampusList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feeKpi/universityPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//验证领航高校是不是在当前招生季或历史招生季中有任务
mock.onPut('/checkUniversityHaveFeeKpi').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/university/checkUniversityHaveFeeKpi', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//-----------------------------分部-招生管理-市场与咨询-学生管理-----------------------------------------
//导出学生
mock.onPut('/exportStudent').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/student/exportStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//根据学生id查询科目学习情况
mock.onPut('/queryCourseStudyStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/studentCourseCategoryDetail/queryCourseStudyStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//根据学生id查询参加活动情况
mock.onPut('/queryByStudentId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.get('/edu/ActivityStudent/queryByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
});

//------------------- 分部-学服学务-班级管理-考勤管理-----------------------
//查询列表
mock.onPut('/selectAttendanceList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetailAttendance/selectAttendanceList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 分部-学服学务-班级管理-考勤管理-编辑讲师考勤-----------------------
//查询列表
mock.onPut('/selectAttendanceTeacher').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeTeacherAttend/updateTeacherAttend', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//------------------- 学生订单 -----------------------

//根据学生id查询学生订单信息
mock.onPut('/getOrderDetailInforList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/queryByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//根据学生id查询学生缴费记录
mock.onPut('/getStudentFeeRecordByStudentIdList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentFeeRecord/getStudentFeeRecordByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生数查询列表
mock.onPut('/selectCourseArrangeStudentListForAttend').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetailAttendance/selectCourseArrangeStudentListForAttend', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部-考勤管理-学生数-编辑
mock.onPut('/updateAttendStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetailAttendance/updateAttendStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部-学服学务-历史报班管理
mock.onPut('/getHistoryCourseArrangeList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/historyCourseArrangeStudent/getHistoryCourseArrangeList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部-学服学务-历史报班管理-学生列表
mock.onPut('/studentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/historyCourseArrangeStudent/studentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部-学服学务-学生情况查询-list
mock.onPut('/headquarterStudentStudyList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchStudentStudy/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部-学服学务-学生情况查询
mock.onPut('/branchStudentStudyCheckList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchStudentStudy/checkList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//总部-学服学务-学生情况查询-list
mock.onPut('/ZBheadquarterStudentStudyList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/headquarterStudentStudy/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部-学服学务-学生情况查询
mock.onPut('/ZBstudentStudyCheckList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/headquarterStudentStudy/checkList ', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})
//-----------------------------总部-市场与咨询-学生市场保护期设置------------------------------------------
//查询学生市场保护期
mock.onPut('/getProtectionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/systCommon/getProtectionInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//修改学生市场保护期
mock.onPut('/updateProtection').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/systCommon/updateProtection', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//-----------------------------总部-市场与咨询-活动查询------------------------------------------
//列表查询
mock.onPut('/getZBActivityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/queryPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//活动详情页
mock.onPut('/getActivityDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/queryById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//学员列表查询
mock.onPut('/getParticipateStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/headQuarters/student/participateStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//大区学员列表查询
mock.onPut('/getDQParticipateStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/bigRegion/student/participateStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/queryPage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/queryPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/selectUserByAreaId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/organization/selectUserByAreaId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/addActivity').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/addActivity', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/updateActivity').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/updateActivity', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/deleteById').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/deleteById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/participateStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/student/participateStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/addStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/student/addStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/addActivityAndStudent').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/student/addActivityAndStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/deleteByActivityStudentIds').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/activity/student/deleteByActivityStudentIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/qryAskByStudentId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentAsk/qryAskByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/selectNowRecruitBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/recruit/selectNowRecruitBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//======分部-活动咨询-学员识别

mock.onPut('/getStudentDistingushList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentDistinguish/queryStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===== 调用第三方接口 支付
/*
生成支付二维码
2018-07-08
lixuliang
support_api: 谭必庆
*/
mock.onPut('/getFeeQrCode').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
      feeAxios.post('', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    })
  })
})

//======学服学务-班级管理-学习情况列表查询

mock.onPut('/getStudySituation').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseCategory/getStudySituation', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//（分部）学服学务-班级管理-学习情况查询-查看按钮
mock.onPut('/getStudySituationInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseCategory/getStudySituationInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//======学服学务-班级管理-教学点学生订单查询

mock.onPut('/teachingPointStudent').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderTeacherCenter/queryOrderListByTeacherCenter', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//订单科目费用计算接口
mock.onPut('/getCourseCategoryPrice').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getCourseCategoryPrice', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// <<<<<<< .mine
//外呼任务下拉列表
mock.onPut('/OutCallTask').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/callcenterTaskList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//外呼任务列表
mock.onPut('/OutGoingTaskList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//外呼咨询查看列表
mock.onPut('/OutGoingConsultationViewList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentAsk/callAskList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//外呼任务新增

mock.onPut('/addOutGoingTask').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/insert', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//外呼任务编辑

mock.onPut('/updateOutGoingTask').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/update', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//外呼任务编辑前的数据查找

mock.onPut('/searchOutGoingTaskList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/check', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//外呼任务提交

mock.onPut('/SubmissionNew').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/submit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//外呼任务删除

mock.onPut('/deleteOutGoingTask').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTask/delete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//外呼任务学生数列表

mock.onPut('/OutCallTaskStudentNum').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTaskStudent/studentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//外呼任务学生数删除

mock.onPut('/OutCallTaskStudentNumDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTaskStudent/deleteStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//外呼任务产生机会

mock.onPut('/OutCallTaskCreateChange').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/callcenterTaskStudent/studentChangeList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//外呼机会查看
mock.onPut('/OutGoingTaskOppoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudentInvite/selectStudengtInviteTask', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//外呼机会到访反馈的批量到访
mock.onPut('/OutGoingTaskBatchArrive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudentInvite/upInviteStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//外呼机会到访反馈的批量未到访
mock.onPut('/OutGoingTaskBatcNohArrive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudentInvite/upNotStatusInviteByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//外呼机会到访反馈的批量未到访
mock.onPut('/ShareOpportunityList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudentInvite/selectStudentInviteList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});







//共享机会查看
mock.onPut('/ShareOpportunitySee').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudentInvite/selectStudentInviteById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//共享机会编辑保存
mock.onPut('/ShareOpportunityPreservation').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/StudentInvite/updateStudentInviteById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部 - 直播管理 - 分页-条件查询直播信息
mock.onPut('/queryLiveList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/queryLive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播管理 - 操作直播 --删除 更新 新增
mock.onPut('/operateLive').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/operateLive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播管理 - 根据直播id获取直播信息
mock.onPut('/getLiveDetaile').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/getLive', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播管理 - 批量--发布直播
mock.onPut('/batchReleaseLives').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/batchReleaseLives', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播管理 -预约明细
mock.onPut('/queryBookDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/queryBookDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播管理 - 批量/取消预约
mock.onPut('/batchCancelBook').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/batchCancelBook', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播回放 - 当前直播下的回放记录
mock.onPut('/queryLiveReplays').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/queryLiveReplays', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部 - 直播回放 - 新增直播回放信息
mock.onPut('/addLiveReplay').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/addLiveReplay', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据教师姓名模糊查询
mock.onPut('/queryTeacher').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/queryTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//根据直播名称模糊查询
mock.onPut('/queryByLiveName').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/queryByLiveName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//直播预约管理-课程班预约信息-分部-分页
mock.onPut('/queryAppointmentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/qryByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//直播预约管理-某课程班可预约的直播 - 分页
mock.onPut('/getLivesAppointmentList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/getLives', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//直播预约管理-某课程班预约直播的学员列表 - 分页
mock.onPut('/getNotLiveStudents').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/getNotLiveStudents', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//直播预约管理-批量预约
mock.onPut('/batchLiveBook').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/batchBook', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部/分部--学服学务--直播管理--直播预约查询
mock.onPut('/queryLiveStudentDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/live/queryLiveStudentDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部/分部--学服学务--直播管理--预约回放设置 - 分页查询项目观看直播次数
mock.onPut('/itemLiveHapPage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/itemLiveHap/page', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部/分部--学服学务--直播管理--预约回放设置 - 创建或修改项目直播观看和回顾次数
mock.onPut('/itemLiveHapCreateOrUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/itemLiveHap/createOrUpdate', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//========================= 资料管理 ===============================
//总部--资料管理--单个或分页查询资料
mock.onPut('/queryMaterialsList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/queryMaterials', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--资料管理--增加、删除、编辑
mock.onPut('/addOrEditOrDelMaterial').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/addOrEditOrDelMaterial', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--资料管理--打包资料--增加/删除
mock.onPut('/addOrRemoveChildMaterials').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/addOrRemoveChildMaterials', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--资料管理--单个查询资料(增加打包子资料时用)
mock.onPut('/queryMaterialVoList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/queryMaterialVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--资料申请审核--查询列表
mock.onPut('/queryMaterialApplyVosList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/queryMaterialApplyVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--资料申请审核--单个查看
mock.onPut('/queryMaterialApplyVoInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/queryMaterialApplyVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--资料申请审核--更新资料审核申请并记录流水
mock.onPut('/queryMaterialApplyAuditUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/updateMaterialApplyVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部--资料寄件管理--批量寄出
mock.onPut('/updSendState').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/updSendState', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部--资料寄件管理--寄件信息修改
mock.onPut('/sendInfoUpdata').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/sendInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部--网络课程管理--优播网课讲义领取信息管理 - 列表
mock.onPut('/onlineCourseMaterialGetManageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialOnlineCourseApply/queryMaterialOnlineVos2', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部--网络课程管理--优播网课讲义领取信息管理 - 批量设置
mock.onPut('/onlineCourseMaterialGetBatchUpdate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/batchUpdateStudentMaterial', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//转班财务信息查询

mock.onPut('/TransferFinanceList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeConfirm/queryPageByStudentMove', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部转班财务信息查询，确认

mock.onPut('/ShiftWorkStudentPayfeeConfirmBatchConfirm').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentPayfeeConfirm/batchConfirmByStudentMove', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部转班财务信息查询，确认

mock.onPut('/AttendanceStatisticsList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseAttendReport/queryCourseAttendReport', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//考勤明细查询

mock.onPut('/AttendanceDetailsList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetailAttendance/exportAttendDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表
mock.onPut('/DataApplicationManagementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/queryMaterialApplyVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部资料申请管理列表
mock.onPut('/DataApplicationViewList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/queryMaterialApplyVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表
mock.onPut('/DetailsOfInformation').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/queryMaterials', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表
mock.onPut('/DetailsOfEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/updMaterialApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部资料申请管理列表
mock.onPut('/DetailsOfChoiceSure').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/addOrRemoveChildMaterials', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//分部资料申请管理列表==提交
mock.onPut('/SubmissionOfInformation').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/submitMaterialApplyById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表==提交
mock.onPut('/SubmissionOfDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/delMaterialApplyById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表==到件反馈
mock.onPut('/FeedbackTParts').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/feedbackRemarkById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表==新增
mock.onPut('/NewDataManagement').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialApply/addMaterialApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料申请管理列表==公共子资料页
mock.onPut('/PublicSubpageQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/material/queryMaterialVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部资料领取查询
mock.onPut('/BrochureReleaseDesk').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/queryMaterialReceives', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部===教学点，课程班联动
mock.onPut('/TeachingPointCourseFB').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetailAttendance/getCourseplanNameForBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部===教学点，课程班联动
mock.onPut('/TeachingPointCourse').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeDetailAttendance/getCourseplanNameForHeadquarters', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
}); 

//分部资料领取查询
mock.onPut('/DataCollectionSingle').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/queryMaterialReceiveVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部资料领取查询 == 编辑和确认接口
mock.onPut('/EditAndDeleteInterfaces').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/updateOrDeleteMaterialReceives', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部==考勤统计==课次确认
mock.onPut('/ExaminationClass').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseAttendReport/queryCourseArrangeDetailById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部==考勤统计==考勤学生数
mock.onPut('/AttendanceNumber').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseAttendReport/queryCourseArrangeStudentById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//总部==考勤统计==考勤
mock.onPut('/StudentAttendance').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseAttendReport/queryCourseArrangeAttendById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部==考勤统计==考勤率
mock.onPut('/AttendanceRate').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseAttendReport/queryAttendRateById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
 

//总部==网课讲义领取管理 
mock.onPut('/ManagementOfCollectionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialOnlineCourseApply/queryMaterialOnlineVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//总部==网课讲义领取管理==批量设置
mock.onPut('/OnlineBatchSettingMethod').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/batchUpdateReceiveWay', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//总部==优播网课讲义领取==讲义领取数
mock.onPut('/NumberOfHandoutsReceived').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialOnlineCourseApply/queryMaterials', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//订单详情里的资料领取
mock.onPut('/OrderBrochureList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/queryByStudentIdAndOrderId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部即将失效学员
mock.onPut('/AbouTtoFail').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchIndex/queryStudentListForStudentCount', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===== 分部==资料领取查询==新增资料查询
mock.onPut('/NewlyReceivedList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/queryStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===== 分部==资料领取查询==新增资料查询=>资料
mock.onPut('/NewlyReceivedListData').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/queryUnReceiveMaterials', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/NewDataPreservation').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/materialReceive/addReceiveMaterial', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/HighSeasBranchManagementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchPublic/getBranchPublicList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/HighSeasBranchManagementAddBranch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchPublic/insertBranchPublic', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/HighSeasBranchManagementDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/branchPublic/delBranchPublic', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/TransferStatusSearch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/getStudentMoveByOrderId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 总部 - 专属学服 - 回访任务管理 - 分页查询
mock.onPut('/returnVisitGetByPage').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisit/getByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 总部 - 专属学服 - 回访任务管理 - 新增
mock.onPut('/returnVisitAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisit/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 总部 - 专属学服 - 回访任务管理 - 编辑
mock.onPut('/returnVisitUpd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisit/upd', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 总部 - 专属学服 - 回访任务管理 - 删除
mock.onPut('/returnVisitDel').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisit/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 分部 - 专属学服 - 学生回访管理 - 列表
mock.onPut('/returnVisitGetByPageInBranch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisit/getByPageInBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 分页查询学生
mock.onPut('/returnVisitSelectStudent').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 查询学生该任务下的回访记录
mock.onPut('/returnVisitSelectReturnSivit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectReturnSivit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 添加学生回访记录
mock.onPut('/returnVisitStudentAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 分部 - 专属学服 - 学生回访管理 - 回访管理 - 删除 学生回访记录
mock.onPut('/returnVisitStudentDel').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 分部 - 专属学服 - 回访信息查询
mock.onPut('/returnVisitStudentSelectSivitInFb').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectSivitInFb', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



// 分部 - 专属学服 -学生专属学服管理
mock.onPut('/StudentsExclusiveList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/selectStudentPrivateTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





// 分部 - 专属学服 -学生专属学服管理 == 批量设置
mock.onPut('/StudentsExclusiveBatch').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/addStudentPrivateTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




// 分部 - 专属学服 -学生信息管理
mock.onPut('/StudentInformationManagementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/selectManageStudentPrivateTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



// 分部 - 专属学服 -学生信息管理 -- 编辑
mock.onPut('/ResultInputEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/student/exclusiveUniformUpdateStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});






// 分部 - 专属学服 -学生成绩录入
mock.onPut('/ResultInputList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentScore/queryStudentVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



// 分部 - 专属学服 -学生成绩录入
mock.onPut('/ResultInputListOne').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentScore/queryStudentScoreVo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



// 分部 - 专属学服 -学生成绩录入 == 保存
mock.onPut('/ResultInputListSave').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentScore/addOrEditOrDelStudentScore', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


// 分部 - 专属学服 -学生成绩管理列表
mock.onPut('/StudentAchievementManagementList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentScore/queryStudentScoreVos', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 分部 - 专属学服 -学生选课
mock.onPut('/StudentElectiveCourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseSelection/selectStudentCourseSelectionList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


// 分部 - 专属学服 -学生选课管理
mock.onPut('/ManagementOfStudentsCourseSelectionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseSelection/selectStudentCourseSelectionManageList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 分部 - 专属学服 -学生选课管理 ==> 课程班下拉
mock.onPut('/courseplanNameSelectionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/selectCoursePlanFullNameForManage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 分部 - 专属学服 -学生选课管理 ==> 编辑
mock.onPut('/ManagementOfStudentsCourseSelectiotEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/editStudentClass', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 分部 - 专属学服 -学生选课--选课列表
mock.onPut('/CourseSelectionList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourseCategoryDetail/studentSelectClassList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


// 分部 - 专属学服 -学生选课--下拉课程班
mock.onPut('/CourseSelectionDropDown').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/selectCoursePlanFullName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 分部 - 专属学服 -学生选课--历史科目选课的下拉
mock.onPut('/SubjectRequestList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/selectCourseCategoryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//学生选课 -- 选课、历史科目选课 -  确认修改
mock.onPut('/ConfirmationOfCourseSelection').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeStudent/insertOneStudentToMoreClass', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===== 分部==课程班班主任管理
// 总部 - 专属学服 - 回访信息查询
mock.onPut('/returnVisitStudentselectSivitInZb').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectSivitInZb', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 总部 - 专属学服 - 回访情况统计 - 列表
mock.onPut('/returnVisitStudentSelectReturnVisitTj').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectReturnVisitTj', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
// 总部 - 专属学服 - 回访情况统计 - 明细
mock.onPut('/returnVisitStudentSelectReturnVisitTjmx').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectReturnVisitTjmx', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 学生详细信息 - 回访情况 - 分页查询
mock.onPut('/returnVisitStudentSelectByStudentId').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/returnVisitStudent/selectByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/TeacherOfTheCourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/selectCourseArrangeClassTeacherPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/TeacherOfTheCourseSubmit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/setUpClassTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//===== 分部==资料领取查询==新增资料查询=>资料保存
mock.onPut('/CallCenterList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/order/selectCallCenterParticipateOrderPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//===== -总部-流水对账查询
mock.onPut('/PipelineReconciliationQueryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderother/getPayStatements', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===== -分部--开课计划查询
mock.onPut('/InquiryOnTheOpeningScheduleList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseplan/queryCourseplan', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//===== -总部--课表取消发布及确认
mock.onPut('/ClassScheduleReleaseConfirmation').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrange/cancelOperation', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===== -总部--课表取消发布及确认
mock.onPut('/DeleteAttendance').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/courseArrangeDetail/delAttend', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 订单业绩相关调整 -- 业绩教师 -- 查询
mock.onPut('/PerformanceTeachersList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/order/queryOrderActivityTeacherByOrderId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


// 订单业绩相关调整 -- 业绩教师 -- 新增
mock.onPut('/PerformanceTeachersAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/order/addOrderActivityTeacher', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

// 订单业绩相关调整 -- 业绩教师 -- 删除
mock.onPut('/PerformanceTeachersDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/order/deleteOrderActivityTeacherByIds', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//获取大区管理分部列表 -- 设置用户来源--列表
mock.onPut('/SettingUserSourcesList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/user/queryUserSourceList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//获取大区管理分部列表 -- 设置用户来源--修改
mock.onPut('/SettingUserSources').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/user/updateUserSource', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//分部-考勤二维码打印列表
mock.onPut('/TwoDimensionalList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/courseArrangeDetail/getByPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部-考勤二维码打印 -- 二维码详情页
mock.onPut('/TwoDimensionalNew').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/courseArrangeDetail/getByDetailId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部-考勤二维码打印 -- 批量导出二维码
mock.onPut('/TwoDimensionalBatchExport').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/courseArrangeDetail/exportQrcode', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//分部-考勤二维码打印 -- 图
mock.onPut('/TwoDimensionalImg').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/courseArrangeDetail/getQrcode', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//商品管理--适用分部--回显
mock.onPut('/ApplicableDivisionShow').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/productApplyBranch/queryProductBranchList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//商品管理--适用分部--编辑
mock.onPut('/ApplicableDivisionEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/productApplyBranch/updateProductBranch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部 、分部 -- 讲师业绩情况查询  - - 列表
mock.onPut('/LecturerPerformanceQueryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/order/queryOrderActivityTeacherPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部学服学务--专属学服--好学生查询
mock.onPut('/GoodStudentInquiryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/selectGoodStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//总部学服学务--专属学服--好学生申请审核
mock.onPut('/GoodStudentsApplicationAuditList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent//selectGoodStudentAuditList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部学服学务--专属学服--好学生申请审核
mock.onPut('/GoodStudentsApplicationAuditSure').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/auditGoodStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部学服学务--专属学服--好学生申请审核 -- 发放奖金
mock.onPut('/BonusPayment').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/grantMoneyBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部学府学务 --- 班级管理 --- 班主任好学生申请
mock.onPut('/GoodSApplicationHeadTeacherList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/selectGoodStudentTeacherApplyList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部学府学务 --- 班级管理 --- 班主任好学生申请/专属学服好学生申请 -- 暂存 -- 申请
mock.onPut('/TemporaryStorageApply').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/goodStudentApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//===== 用户来源分部下拉框
mock.onPut('/UserSourceDivision').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/user/queryUserSourceByScope', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --列表
mock.onPut('/GoodSApplicationHeadTAdminList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/selectGoodStudentClassManageList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --批量提交审核
mock.onPut('/BatchSubmissionForAudit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent//auditBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --批量删除
mock.onPut('/BatchSubmissionForDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent//deleteBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部学服学务 --- 班级管理 --- 班主任好学生申请管理/专属学服好学生申请 --编辑
mock.onPut('/BatchSubmissionForEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/updateGoodStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部学服学务 --- 专属学服好学生申请
mock.onPut('/ExclusiveStudentApplicationList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/goodStudent/selectGoodStudentServerApplyList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//批次下拉
mock.onPut('/BatchDropDown').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/StudyRule/queryStudyRuleBatch', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});






//预报信息查询
mock.onPut('/ForecastInformationQueryList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/feePreReport/queryFeePreReports', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//查询超级管理员页面列表
mock.onPut('/SuperAdministratorPageList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/usertype/selectAdminUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//超级管理员删除
mock.onPut('/SuperAdministratorPageDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/user/usertype/deleteAdminUser', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//小程序菜单管理列表
mock.onPut('/SmallProgramMenuList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/smallProgram/getPage', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//小程序菜单管理 -- 添加
mock.onPut('/SmallProgramMenuAdd').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/smallProgram/add', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//小程序菜单管理 -- 编辑
mock.onPut('/SmallProgramMenuEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/smallProgram/edit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//小程序菜单管理 -- 删除
mock.onPut('/SmallProgramMenuDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/smallProgram/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//角色管理，小程序按钮
mock.onPut('/SmallProgramModleView').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/smallProgramRoleModule/getRoleModule', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//角色管理，小程序按钮 -- 编辑
mock.onPut('/SmallProgramModleEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/smallProgramRoleModule/addOrEdit', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//总部学服学务审核重听申请
mock.onPut('/ApplicationAuditionAardHearing').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourse/getApplyList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//总部学服学务审核重听申请
mock.onPut('/ApplicationDetails').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourse/getApplyById', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





//总部学服学务审核重听申请 -- 审核
mock.onPut('/ApplicationExamine').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourse/auditApply', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





//总部学服学务审核重听申请 -- 发送短信
mock.onPut('/SendingSMS').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentCourse/sendMsg', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





//总部-商品管理-添加商品的授课方式验证
mock.onPut('/VerificationTeachingMethod').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/product/updateTeachMode', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部分部 -- 退费退学查询接口
mock.onPut('/RefundAndWithdrawalEnquiry').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentLeaveManager/selectPageByRefund', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//大客户详细信息-意向高校情况-列表查询
mock.onPut('/IntentionalCollegesUniversitiesList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/intentionUniversities/selectList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//大客户详细信息-意向高校情况-编辑
mock.onPut('/IntentionalCollegesUniversitiesEdit').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/intentionUniversities/updateInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//总部--互联网预收款情况统计
mock.onPut('/StatisticsInternetAdvances').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/orderPreCharge/queryInternetList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});







//分部--3日内需电咨人员
mock.onPut('/ConsultantWithinThreeDays').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentAsk/countNeedAskStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部--1日内需电咨人员
mock.onPut('/ConsultantWithinOneDays').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentAsk/countNeedAskStudentForOneDay', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});




//分部--首页统计参加其它分部活动学生数量提醒
mock.onPut('/DivisionalActivities').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentAct/countActivityStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//分部--参加其它分部活动学生查询
mock.onPut('/InquiriesForParticipantsList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('edu/studentAct/activityStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部--退费退学（新）--保存匹配新订单
mock.onPut('/MatchNewOrdersSave').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefund/queryOrderListByRefund', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//分部--退费退学（新）--新订单费用处理
mock.onPut('/NewOrderCostProcessing').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentChangeApplication/studentRefundApplicationDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//分部--退费退学（新）--提交申请
mock.onPut('/EndApplicationSubmission').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentChangeApplication/studentRefundApplication', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//退费退学详情页的查看订单明细
mock.onPut('/CheckDetails').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseStudentRefund/queryOrderCourseProductListByRefund', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});



//课程班学员删除列表
mock.onPut('/DeleteStudentClassList').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeSpecial/queryCourseArrangeStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//总部--基础管理--课程班学员删除 -- 删除
mock.onPut('/DeleteStudentClassDelete').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/courseArrangeSpecial/deleteCourseArrangeStudentByStudentId', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});





//总部--财务管理--订单缴费退费流水查询
mock.onPut('/OrderPaymentFeeRefundPipelineQuery').reply(config => {
  return new Promise(function (resolve, reject) {
    //请依据接口要求选择GET/POST
    normalAxios.post('/edu/studentFeeRecord/queryStudentFeeRecordList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});









export default mockAxios;  