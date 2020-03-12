import {
  LOAD_DICTIONARY_SUCCESS
} from '../actions/dic';

const initialState = {
  Dictionarys: {},
};

export default function dic(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_DICTIONARY_SUCCESS:
      {
        let newDic = action.payload.data.data;
        let allDic = { ...state.Dictionarys, ...newDic };//合并属性   
        return {
          ...state,
          Dictionarys: allDic,
        };
      }
    case 'SET_DICTIONARY':
      {
        let newDic = action.data;
        let allDic = { ...state.Dictionarys, ...newDic };//合并属性   
        return {
          ...state,
          Dictionarys: allDic,
        };
      }
    default:
      return state;
  }
}
