import {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_ERROR,
  SWITCH_ORG_CONTEXT_SUCCESS,
  ChangUserInfo_SUCCESS
} from '../actions/auth';
import { setCookie, getCookie, delCookie } from '@/utils/index'
const initialState = {
  currentUser: null,
};

export default function auth(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_SUCCESS:
    case FETCH_PROFILE_SUCCESS:
    case SWITCH_ORG_CONTEXT_SUCCESS:
    case ChangUserInfo_SUCCESS:
      {
        let currentUser = action.payload.data.data;
        //cookie保存token，有效期：关闭窗口后失效//window.localStorage.setItem('token',user.token)
        setCookie("token", currentUser.token)
        window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return {
          ...state,
          currentUser: currentUser,
        };
      }
    case FETCH_PROFILE_ERROR:
    case LOGOUT_SUCCESS:
      {
        delCookie('token');
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('currentUser');
        window.localStorage.removeItem('lastMenuInfo');
        return {
          ...state,
          currentUser: null,
        };
      }
    default:
      return state;
  }
}
