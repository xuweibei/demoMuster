import api from '../api'

export const GET_ALL_MENU = 'GET_ALL_MENU';
export const GET_ALL_MENU_SUCCESS = 'GET_ALL_MENU_SUCCESS';
export const UPDATE_NAVPATH = 'UPDATE_NAVPATH';
export const RECORD_USER_FUNC_CLICK = 'RECORD_USER_FUN_CLICK';
export const RECORD_USER_FUNC_LOAD = 'RECORD_USER_FUNC_LOAD';
export const SWITCH_MENU_COLLAPSE = 'SWITCH_MENU_COLLAPSE';
export function updateNavPath(path, key) {
  return {
    type: UPDATE_NAVPATH,
    payload: {
      data: path,
      key: key
    }
  }
}

export function getAllMenu(depth: number) {
  var condition = depth >= 0 ? { depth: depth } : {};
  return {
    type: GET_ALL_MENU,
    payload: {
      promise: api.put('/menu', condition)
    }
  }
}
export function recordUserFunLoad() {
  return {
    type: RECORD_USER_FUNC_LOAD,
    payload: {
      data: {}
    }
  }
}

export function recordUserFunClick(currentMenuInfo) {
  let funUrl = window.location.hash.replace('#', '');
  return {
    type: RECORD_USER_FUNC_CLICK,
    payload: {
      data: funUrl,
      lastMenuInfo: { ...currentMenuInfo, url: funUrl },
    }
  }
}
export function switchMenuCollapse(status) {
  return {
    type: SWITCH_MENU_COLLAPSE,
    payload: {
      data: status
    }
  }
}
