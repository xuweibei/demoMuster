import Pool from '../js/base/pool.js'
let instance
//单例
export default class DataBus{
  constructor(){
    if (instance){
      return instance
    }
    instance = this
    this.pool = new Pool()
    this.restart()
  }
  //初始化
  restart(){
    this.bullets = []
    this.enemys = []
    this.animations = []
    this.frame = 0
    this.score = 0
    this.gameover = false
  }
  //回收子弹
  removeBullet(bullet){
    let temp = this.bullets.shift()

    this.pool.recover('bullet', bullet)
  }
  //回收敌机
  removeEnemy(enemy) {
    let temp = this.enemys.shift()

    this.pool.recover('enemy', enemy)
  }
}