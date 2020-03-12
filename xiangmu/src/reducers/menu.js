import _ from 'lodash';
import md5 from 'crypto-js/md5';

import { env } from '@/api/env.js';
import {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_ERROR,
  SWITCH_ORG_CONTEXT_SUCCESS,
} from '../actions/auth';

import {
  GET_ALL_MENU,
  GET_ALL_MENU_SUCCESS,
  UPDATE_NAVPATH,
  RECORD_USER_FUNC_CLICK,
  RECORD_USER_FUNC_LOAD,
  SWITCH_MENU_COLLAPSE
} from '../actions/menu';

const initialState = {
  items: [],
  roles: [],
  navpath: [],
  dailyFuns: [],//日常功能
};
const firstMenuIcons = ['user-manage', 'org-manage','customer-manage','teach-manage', 'academic-manage', 'financial-manage','bulb-manage','compass-manage']
//将返回来的用户授权功能转换为可以使用的json树
const convertToStandardMenus = function (zbItems) {
  let safeCode = md5(env.getToken()).toString();
  //默认首页是第一个
  var firstMenus = [{
    key: "001",
    name: "首页",
    url: `/home/${safeCode}`,
    icon: "home",
    depth: 0,
  }];
  zbItems.filter(a => (a.depth == 1 || a.parentId == null)).sort((a, b) => { return (a.orderNo < b.orderNo ? 0 : 1); }).map((firstItem, index) => {
    let firstMenu = firstMenus.find(aa => aa.key == `${firstItem.funId}`);
    //判断一级菜单是否存在
    if (!firstMenu) {
      //二级菜单准备
      var secondtMenus = [];
      zbItems
        .filter(a => a.parentId == firstItem.funId)//过滤二级菜单
        .sort((a, b) => { 
            if(a.orderNo < b.orderNo) {
                return -1;
            } else if(a.orderNo > b.orderNo) {
                return 1;
            } else {
                return 0;
            }
        })//升序排序
        .map((secondItem) => {
          //判断二级菜单是否存在？
          let findSecondMenu = secondtMenus.find(aa => aa.key == `${secondItem.path.replace(/,/g, "-")}`);
          if (!findSecondMenu) {
            //三级菜单准备
            var thridMenus = [];
            zbItems
              .filter(a => a.parentId == secondItem.funId)
              .sort((a, b) => { 
                  if(a.orderNo < b.orderNo) {
                      return -1;
                  } else if(a.orderNo > b.orderNo) {
                      return 1;
                  } else {
                      return 0;
                  }
              })
              .map((thridItem) => {
                let findThridMenu = thridMenus.find(aa => aa.key == `${thridItem.path.replace(/,/g, "-")}`);
                if (!findThridMenu) {
                  findThridMenu = {
                    key: `${thridItem.path.replace(/,/g, "-")}`,
                    name: `${thridItem.name}`,
                    url: `${thridItem.urlRule}/${safeCode}`,
                    depth: 3,
                  };
                  thridMenus.push(findThridMenu);
                }
              });
            findSecondMenu = {
              key: `${secondItem.path.replace(/,/g, "-")}`,
              name: `${secondItem.name}`,
              depth: 2,
              child: thridMenus,
            };
            secondtMenus.push(findSecondMenu);
          }
        });
      firstMenu = {
        key: `${firstItem.funId}`,
        name: `${firstItem.name}`,
        icon: firstMenuIcons[index],
        depth: 1,
        child: secondtMenus,
      };
      firstMenus.push(firstMenu);
    }
  });
 
  return firstMenus;
}
export default function menu(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_SUCCESS:
    case FETCH_PROFILE_SUCCESS:
    case SWITCH_ORG_CONTEXT_SUCCESS:
      {
        let { funList } = action.payload.data.data;
        let menuTree = convertToStandardMenus(funList);
        return {
          ...state,
          items: menuTree
        }
      }
      break;
    case GET_ALL_MENU_SUCCESS:
      //let safeCode = md5(window.localStorage.getItem("token")).toString();
      let safeCode = md5(env.getToken()).toString();
      action.payload.data.menus.map((item) => {
        if (item.url) {
          item.url += `/${safeCode}`
        }
        if (item.child) {
          item.child.map((A) => {
            A.url += `/${safeCode}`
            if (A.child) {
              A.child.map(B => {
                B.url += `/${safeCode}`
              })
            }
          })
        }
      })
      return Object.assign({}, initialState, { items: action.payload.data.menus });
    //令牌过期时，清空功能菜单
    case FETCH_PROFILE_ERROR:
      {
        return {
          ...state,
          items: [],
        };
      }
    case UPDATE_NAVPATH:
      let navpath = [], tmpOb, tmpKey, child;
      if (Array.isArray(action.payload.data)) {
        action.payload.data.reverse().map((item) => {
          if (item.indexOf('sub') != -1) {
            tmpKey = item.replace('sub', '');
            if (tmpKey != 'undefined') {
              tmpOb = _.find(state.items, function (o) {
                return o.key == tmpKey;
              });
              if (!tmpOb) {
                var _funReverse = function (_items) {
                  for (var i = 0; i < _items.length; i++) {
                    tmpOb = _.find(_items[i].child, function (o) {
                      return o.key == tmpKey;
                    })
                    if (tmpOb) {
                      break;
                    }
                  }
                }
                _funReverse(state.items);
              }
              child = tmpOb.child;
              navpath.push({
                key: tmpOb.key,
                name: tmpOb.name
              })
            }
          }
          if (item.indexOf('menu') != -1) {
            tmpKey = item.replace('menu', '');
            if (child) {
              tmpOb = _.find(child, function (o) {
                return o.key == tmpKey;
              });
              navpath.push({
                key: tmpOb.key,
                name: tmpOb.name
              });
            }
          }
        })
      }
      return Object.assign({}, state, {
        currentIndex: action.payload.key,
        navpath: navpath
      });
    case RECORD_USER_FUNC_LOAD:
      {
        let dailyFunKey = 'userDailyFuns';
        let jsonStr = window.localStorage.getItem(dailyFunKey);
        if (jsonStr == null) {
          jsonStr = "[]"
        }
        let jsonResult = eval('(' + jsonStr + ')');
        return {
          ...state,
          dailyFuns: jsonResult.sort((a, b) => { return a.times > b.times ? 1 : -1 }),
        };
      }
    case RECORD_USER_FUNC_CLICK:
      {
        //最后一个访问地址
        let lastMenuInfo = 'lastMenuInfo';
        window.localStorage.setItem(lastMenuInfo, JSON.stringify(action.payload.lastMenuInfo));

        let dailyFunKey = 'userDailyFuns';
        let jsonStr = window.localStorage.getItem(dailyFunKey);
        if (jsonStr == null) {
          jsonStr = "[]"
        }
        let jsonResult = eval('(' + jsonStr + ')');
        let findUrl = jsonResult.find((item) => (item.url || '').toLowerCase() == action.payload.data.toLowerCase());
        if (findUrl) {
          findUrl.times += 1;
        }
        else {
          jsonResult.push({ url: action.payload.data, times: 1 })
        }
        //存储
        window.localStorage.setItem(dailyFunKey, JSON.stringify(jsonResult));
        return {
          ...state,
          dailyFuns: jsonResult.sort((a, b) => { return a.times > b.times ? 1 : -1 }),
        };
      }
    case SWITCH_MENU_COLLAPSE:
      {
        return {
          ...state,
          menuCollapsed: action.payload.data === true ? true : (!state.menuCollapsed)
        }
      }
    default:
      return state;
  }
}
