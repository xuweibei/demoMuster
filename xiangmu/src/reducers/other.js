
import {
  CHANGE
} from '../actions/dic';

const initialState = {
  Dictionarys: {},
};
export default function zs(state = initialState, action = {}) {
  switch (action.type) {
    case 'CHANGE':
      {
        let a = Object.assign({},state);
        a = action.data;
        return a
      }
    default:
      return state;
  }
}
