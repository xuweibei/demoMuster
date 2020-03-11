import Sprite from '../base/sprite.js'
import Bullet from './bullet.js'
import Pool from '../base/pool.js'
import DataBus from '../databus.js'

const screenW = window.innerWidth
const screenH = window.innerHeight

const PLANE_IMG_SRC = 'images/hero.png'
const PLANT_IMG_WIDTH = 80
const PLANE_IMG_HEIGHT = 80

let databus = new DataBus()


export default class Plane extends Sprite{
  constructor(){
    super(PLANE_IMG_SRC, PLANT_IMG_WIDTH, PLANE_IMG_HEIGHT)
    this.touched = false
    this.init()  
    this.initEvent()
  }
  //初始化x，y
  init(){
    this.x = screenW / 2 - this.width / 2
    this.y = screenH - this.height - 30
  }
  //判断是否点击到飞机上了
  ischeckedPlane(x,y){
      return   x > this.x
            && x < this.x + this.width
            && y > this.y
            && y < this.y + this.height
  }
  //设置飞机的x、y
  setPoint(x, y) {
    let disX = x - this.width /2
    let disY = y - this.height / 2
    if (disX<0){
      disX = 0
    }
    if (disX > screenW - this.width ){
      disX = screenW - this.width
    }

    if (disY<0){
      disY = 0
    }

    if (disY > screenH - this.height) {
      disY = screenH - this.height
    }

    this.x = disX
    this.y = disY
  }
  //监听当前事件
  initEvent(){
    canvas.addEventListener('touchstart',(e)=>{
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      if (this.ischeckedPlane(x,y)){
        this.touched = true
        this.setPoint(x, y)
      }
    })
    canvas.addEventListener('touchmove',(e)=>{
      e.preventDefault()
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      if (this.touched){
        this.setPoint(x,y)
      }
    })
    canvas.addEventListener('touchend',()=>{
      this.touched = false
    })
  }
  //子弹发射的方法
  shoot(){
    let bullet = databus.pool.checkpoolDicNum('bullet', Bullet)
    let bulletX = this.x + this.width / 2 - bullet.width / 2
    let bulletY = this.y + 20

    bullet.init(
      bulletX,
      bulletY,
      10
    )
    databus.bullets.push(bullet)
  }
}
