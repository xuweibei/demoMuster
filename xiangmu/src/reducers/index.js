import { combineReducers } from 'redux';
import auth from './auth';
import menu from './menu';
import dic from './dic';
import zs from './other';
import twoLevel from './level';
import stateValue from './state';

const rootReducer = combineReducers({
  auth,
  menu,
  dic,
  zs,
  twoLevel,
  stateValue
});

export default rootReducer;
