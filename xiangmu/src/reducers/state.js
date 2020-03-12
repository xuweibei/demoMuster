
export default function stateValue(state = {},action={}){
    switch(action.type){
      case 'STATEVALUE':
      {
        let a = Object.assign({},state);
        a = action.data;
        return a
      }
    default:
      return state;
    }
  }