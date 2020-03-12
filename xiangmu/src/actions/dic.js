import api from '../api'
export const LOAD_DICTIONARY_SUCCESS = 'LOAD_DICTIONARY_SUCCESS';
//获取字典
export function loadDictionary(dicTypes) {
  return {
    type: 'LOAD_DICTIONARY',
    payload: {
      promise: api.put('/loadDictionary', { groupName: dicTypes.join(',') })
    }
  }
}
//设置字典
export function setDictionary(dicTypes) {
  return {
    type: 'SET_DICTIONARY',
    data: dicTypes
  }
}
export function change(ll,hh){
  return {
    type:'CHANGE',
    data:{
      ll,
      hh
    }
  }
}
export function twoLevel(sta){
  return {
    type:'LEVEL',
    data:{
      sta
    }
  }
}
export function stateValue(value){
  return {
    type:'STATEVALUE',
    data:{
      value
    }
  }
}
//获取学生来源子集字典
export function systemCommonChild(dicTypes) {
  return {
    type: 'systemCommonChild',
    payload: {
      promise: api.put('/systemCommonChild', { groupName: dicTypes.join(',') })
    }
  }
}