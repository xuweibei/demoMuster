import moment from 'moment';
import { message } from 'antd'
var qs = require('qs');
export function isPromise(value) {
  if (value !== null && typeof value === 'object') {
    return value.promise && typeof value.promise.then === 'function';
  }
}

export function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}
export function setCookie(name, value, hour) {
  if (hour) {
    var Days = 1;
    var exp = new Date();
    exp.setTime(exp.getTime() + hour * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
  }
  else {
    document.cookie = name + "=" + escape(value);
  }
}

export function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}


export function getDictionaryTitle(dic, value, defaultTitle) {
  dic = dic || [];
  if (value === value + '' && value.indexOf(',') >= 0) {
    var titles = "";
    dic.map(item => {
      value.split(',').map(v => {
        if (v == item.value) {
          titles += item.title + " ";
        }
      })
    });
    return titles
  }
  var findItem = dic.find((item) => { return item.value == value; });
  if (findItem != null) {
    return findItem.title;
  }
  if (defaultTitle) return defaultTitle;
  else return value;
}
export function getDictionaryTitleByCode(dic, value, defaultTitle) {
  dic = dic || [];
  var findItem = dic.find((item) => { return item.code == value.toString(); });
  if (findItem != null) {
    return findItem.title;
  }
  if (defaultTitle) return defaultTitle;
  else return value;
}
//获取编辑模式描述
export function getViewEditModeTitle(editMode, defaultValue) {
  let opTitle = '';
  switch (editMode.toLowerCase()) {
    case "create":
      opTitle = '添加';
      break;
    case "edit":
      opTitle = '修改';
      break;
    case "view":
      opTitle = '查看';
      break;
    case "delete":
      opTitle = '删除';
      break;
    case "design":
      opTitle = '设计';
      break;
    case "audit":
      opTitle = '审核';
      break;
  }
  if (opTitle == '' && defaultValue) {
    return defaultValue
  }
  else {
    return opTitle;
  }
}

//文本...显示
export function ellipsisText(source, maxLength, ellipsis) {
  source = source || "";
  maxLength = maxLength || 20;
  ellipsis = ellipsis || "...";
  if (source.length > maxLength) {
    let cutString = source.slice(0, maxLength)
    return `${cutString}...`;
  }
  else {
    return source;
  }
}

//文本内容转HTML格式显示
export function convertTextToHtml(source) {
  source = source || "";
  return source.replace(/\r/g, "<br/>").replace(/\n/g, "<br/>");
}
//获取周几名称
export function getWeekTitle(week) {
  var weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return weeks[week];
}
//获取当前时间戳
export function getCurrentTimeStamp() {
  let timestamp = (new Date()).valueOf();
  //timestamp = timestamp / 1000;
  return timestamp;
}
export function timestampToTime(timestamp: number, hasTime: boolean) {
  if (!timestamp) {
    return '';
  }
  if (typeof timestamp === 'number' && !isNaN(timestamp)) {

  } else {
    return timestamp;
  }
  var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  if (hasTime) {
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y + M + D + ' ' + h + m + s;
  }
  return Y + M + D;
}
//获取格林威治时间
export function convertToGTMDate(date) {
  var timeZone = new Date().getTimezoneOffset();
  if (typeof (date) === "string") {
    date = new Date(date);
  }
  return date.Minutes(date.getMinutes() + timeZone);
}
//JSON内时间对象转换为JS 内的Date
export function convertJSONDateToJSDateObject(JSONDateString) {
  var date = new Date(parseInt(JSONDateString.replace("/Date(", "").replace(")/", ""), 10));
  return date;
}
//日期直接相差天数
export function dateDiffOfDay(date1, date2) {
  //把相差的毫秒数转换为天数
  let iDays = parseInt(Math.abs(date1 - date2) / 1000 / 60 / 60 / 24)
  return iDays
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
export function dateFormat(dateTime, fmt) { //author: meizz
  Date.prototype.Format = function (fmt) {
    var o = {
      //"Y+": dateTime.getFullYear(),
      "M+": dateTime.getMonth() + 1, //月份
      "d+": dateTime.getDate(), //日
      //"D+": dateTime.getDate(), //日
      "h+": dateTime.getHours(), //小时
      "m+": dateTime.getMinutes(), //分
      "s+": dateTime.getSeconds(), //秒
      "q+": Math.floor((dateTime.getMonth() + 3) / 3), //季度
      "S": dateTime.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt) || /(Y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (dateTime.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      var r = new RegExp("(" + k + ")", "gi");
      if (r.test(fmt)) {
        //fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        fmt = fmt.replace(r, o[k] < 10 ? "0" + o[k] : "" + o[k]);
      }
    }
    return fmt;
  }
  return dateTime.Format(fmt);

}
//数组去重
export function distinctOfArray(sourceArray) {
  if (!sourceArray || sourceArray.length < 1) {
    return sourceArray;
  }
  var resultArray = [];
  sourceArray.map((item, index) => {
    if (item != '') {
      resultArray = [...resultArray.filter(A => A != item), item];
    }
  })
  return resultArray;
}
//数组乱选
export function randomOfArray(sourceArray) {
  var sWordsTemp = [];
  for (var k = 0; k < sourceArray.length; k++) {
    sWordsTemp.push(sourceArray[k]);
  }
  var sWords = [];
  while (sWordsTemp.length > 0) {
    var tempNum = parseInt(Math.random() * 10);
    if (sWordsTemp.length == 1)
      tempNum = 0;
    if (tempNum < sWordsTemp.length) {
      sWords.push(sWordsTemp[tempNum]);
      sWordsTemp.splice(tempNum, 1);
    }
  }
  return sWords;
}
//绑定值到组件
export function dataBind(value, isDate) {
  if (isDate) {
    return value ? moment(value) : undefined;
  }
  else {
    if (value == undefined) {
      return '';
    }
    //fixed 数组多选情况
    if (Array.isArray(value)) {
      return value;
    }
    else {
      return value.toString();
    }
  }
}

export function covertValueToDecimalType(value) {
  if (!value) return "";
  return value + (value.toString().indexOf('.') != -1 ? '' : '.00');
}

//把 json数据结构 转成 data-form 结构
export function transformRequest(data) {
  let ret = ''
  var d = typeof (data) == 'object' ? data : JSON.parse(data);
  for (let it in d) {
    if(typeof (d[it]) == 'string'){
      d[it] = d[it].replace(/(^\s+)|(\s+$)/g,'');
    }
   
  }
  //for (let it in d) {
  //  ret += encodeURIComponent(it) + '=' + encodeURIComponent(d[it]) + '&'
  //}
  //return ret
  return qs.stringify(d);
}

//字符串去除首位空格
function trim(data) {
  var str = data,
  str = str.replace(/^\s\s*/, ''),
  ws = /\s/,
  i = str.length;
  while (ws.test(str.charAt(--i)));
  return str.slice(0, i + 1);
}

//对于列表数据 改成树形嵌套数据 形如 {a: '', b:'', children: [{c:'', d:''},{c:'', d:''}]}
export function transformListToTree(list: array) {
  var tree = [];
  list.map(a => {
    if (a.orgType == 2) {
      a.children = a.children || [];
      list.map(b => {
        if (b.parentOrgid == a.orgId) {
          b.key = b.orgId;
          a.children.push(b);
        }
      });
      tree.push(a);
    };
  });
  return tree;
}
//','分割的字符串拆分为数组（兼容为空）
export function split(source, char) {
  if (typeof (source) == 'undefined' || source == null) return [];
  char = (char || ',');
  let result = source.toString().split(char).filter(a => a != '');
  return result;
}

//数组格式化为金额
export function formatMoney(s, emptyText) {
  emptyText = (emptyText || '--');
  if (typeof (s) === 'undefined' || s === null) {
    s = `${s || emptyText}`;
  }
  else {
    s = `${s}`
  }
  if (s == emptyText) return emptyText;
  if (s.indexOf('-') == 0) {
    return parseFloat(s);
  }
  if (/[^0-9\.]/.test(s)) return "invalid value";
  s = s.replace(/^(\d*)$/, "$1.");
  s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
  s = s.replace(".", ",");
  var re = /(\d)(\d{3},)/;
  while (re.test(s))
    s = s.replace(re, "$1,$2");
  s = s.replace(/,(\d\d)$/, ".$1");
  return s.replace(/^\./, "0.")
}

//moment对象格式
export function formatMoment(moment, fmt) {
  if (moment) {
    return moment.format(fmt || "YYYY-MM-DD");
  }
  else {
    return null;
  }
}
export function openExport(url) {
  window.open(url);
}
export function formatNumberDateToChineseDate(str) {
  var result = "";
  if (str) {
    if (str.length >= 4)
      result = str.substr(0, 4) + "年";
    if (str.length >= 6)
      result += str.substr(4, 2) + "月";
    if (str.length >= 8)
      result += str.substr(6, 2) + "日";
  }
  return result;
}
