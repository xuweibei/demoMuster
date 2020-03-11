import Sprite from '../base/sprite.js'
import DataBus from '../databus.js'
const ENEMY_IMG_SRC = 'images/enemy.png'
import Animation from '../base/animation.js'

const ENEMY_IMG_WIDTH = 60
const ENEMY_IMG_HEIGHT = 60


let databus = new DataBus()
const __ = {
  speed:Symbol('speed')
}

function rnd(start,end){
  let num = Math.floor(Math.random() * (end - start) + start)
  return num 
}
export default class Enemy extends Animation{
  constructor(){
    super(ENEMY_IMG_SRC, ENEMY_IMG_WIDTH, ENEMY_IMG_HEIGHT)
    this.initExplosionAnimation()
  }
  init(speed){
    this.x = rnd(0, window.innerWidth - ENEMY_IMG_WIDTH)
    this.y = -ENEMY_IMG_HEIGHT
    this[__.speed] = speed
    this.visible = true
  }
  //初始化爆炸
  initExplosionAnimation(){
    let img = []
    const IMG_COUNT = 19
    let imgSrc = 'images/explosion'
    for (let i = 0; i < IMG_COUNT;i++){
      let  src = imgSrc + (i + 1) + '.png'
      img.push(src)
    }
    this.explosionImg(img)
  }
  update(){
    this.y += this[__.speed]
    if (this.y>window.innerHeight){
      databus.removeEnemy(this)
    }
  }
}