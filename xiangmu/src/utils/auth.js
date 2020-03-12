import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { env } from '@/api/env.js';
import md5 from 'crypto-js/md5';

const validate = function (history) {
  const isLoggedIn = !!env.getToken()//window.localStorage.getItem("token");
  if (!isLoggedIn && history.location.pathname != "/login") {
    env.loginHandler();
    return false;
  }
  //url权限
  let saveCode = md5(env.getToken()/*window.localStorage.getItem("token")*/).toString();
  if (history.location.pathname.indexOf(saveCode) == -1) {
    history.replace(`/home/${saveCode}`)
    return false;
  }
  return true;
};

export function getUserLastMenuInfo() {
  let saveCode = md5(env.getToken()/*window.localStorage.getItem("token")*/).toString();
  let localStorageItem = window.localStorage.getItem('lastMenuInfo');
  if (window.location.hash.toLocaleLowerCase().indexOf('/home/') != -1) {
    localStorageItem = null;
  }
  let lastMenuInfoStr = localStorageItem || "{key:'menu001',keyPath:['menu001'],url:'/home/" + saveCode + "'}";
  let lastMenuInfo = eval('(' + lastMenuInfoStr + ')');
  if (env.product || lastMenuInfo.url.indexOf(saveCode) == -1) {
    lastMenuInfo = { key: 'menu001', keyPath: ['menu001'], url: '/home/' + saveCode };
  }
  return lastMenuInfo;
}
/**
 * Higher-order component (HOC) to wrap restricted pages
 */
export function authHOC(BaseComponent) {
  class Restricted extends Component {
    isChecked = false;
    componentWillMount() {
      this.checkAuthentication(this.props);
    }
    componentWillReceiveProps(nextProps) {
      if (nextProps.location !== this.props.location) {
        this.checkAuthentication(nextProps);
      }
    }
    checkAuthentication(params) {
      const { history } = params;
      this.isChecked = validate(history);
    }
    render() {
      if (!this.isChecked) {
        return null;
      }
      else {
        return <BaseComponent {...this.props} />;
      }
    }
  }
  return withRouter(Restricted);
}
