const __ = {
  poolDic: Symbol('poolDic')
}

export default class Pool{
  constructor(){
    this[__.poolDic] = {}
  }
  havepoolDic(name){
    return this[__.poolDic][name] || (this[__.poolDic][name] = [])
  }
  checkpoolDicNum(name,className){
    let pool = this.havepoolDic(name)
    let result = pool.length ? pool.shift(): new className()

    return result
  }
  recover(name,instance){
    this.havepoolDic(name).push(instance)
  }
}