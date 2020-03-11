import DataBus from '../databus.js'

const BULLE_IMG_SRC = 'images/bullet.png'
const BULLET_IMG_WIDTH = 16
const BULLET_IMG_HEIGHT = 30

const __ = {
  speed : Symbol('speed')
}

let databus = new DataBus()

import Sprite from '../base/sprite.js'
export default class Bullet extends Sprite{
  constructor(){
    super(BULLE_IMG_SRC, BULLET_IMG_WIDTH, BULLET_IMG_HEIGHT)
  }
  init(x,y,speed){
    this.x = x
    this.y = y
    this[__.speed] = speed
    this.visible = true
  }
  update(){
    this.y -= this[__.speed]
    if(this.y< -this.height){
      databus.removeBullet(this)
    }
  }
}