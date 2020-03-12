import api from '../api'

export const FETCH_PROFILE_PENDING = 'FETCH_PROFILE_PENDING';
export const FETCH_PROFILE_SUCCESS = 'FETCH_PROFILE_SUCCESS';
export const FETCH_PROFILE_ERROR = 'FETCH_PROFILE_ERROR';
export const ChangUserInfo_SUCCESS = 'ChangUserInfo_SUCCESS';
export const SWITCH_ORG_CONTEXT_SUCCESS = 'SWITCH_ORG_CONTEXT_SUCCESS';
export const LOGIN_PENDING = 'LOGIN_PENDING';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

//登录
export function login(user, password) {
  return {
    type: 'LOGIN',
    payload: {
      promise: api.put('/login', {
        loginName: user,
        password: password
      })
    }
  }
}
//退出登录
export function logout() {
  return {
    type: 'LOGOUT',
    payload: {
      promise: api.put('/logout')
    }
  }
}
//用户切换机构
export function switchOrgContext(orgId) {
  return {
    type: 'SWITCH_ORG_CONTEXT',
    payload: {
      promise: api.put('/switchOrgContext', { orgId })
    }
  }
}
//获取当前用户信息
export function fetchProfile() {
  return {
    type: 'FETCH_PROFILE',
    payload: {
      promise: api.put('/profile', {})
    }
  }
  /*
  let user = eval('(' + window.localStorage.getItem("profile") + ')');
  return {
    type: 'FETCH_PROFILE_SUCCESS',
    payload: {
      data: user
    }
  }*/
}

//获取来自其他平台的用户信息
export function setMember() {
  return {
    type: 'SETMEMBER',
    payload: {
      promise: api.put('/setMember', {})
    }
  }
  /*
  let user = eval('(' + window.localStorage.getItem("profile") + ')');
  return {
    type: 'FETCH_PROFILE_SUCCESS',
    payload: {
      data: user
    }
  }*/
}