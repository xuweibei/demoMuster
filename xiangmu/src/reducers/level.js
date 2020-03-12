
export default function twoLevel(state = {},action={}){
    switch(action.type){
      case 'LEVEL':
      {
        let a = Object.assign({},state);
        a = action.data;
        return a
      }
    default:
      return state;
    }
  }