import Sprite from '../base/sprite.js'

const screenW = window.innerWidth
const screenH = window.innerHeight

const BG_IMG_SRC = 'images/bg.jpg'
const BG_IMG_WIDTH = screenW
const BG_IMG_HEIGHT = screenH

export default class BackGround extends Sprite{
  constructor(ctx){
    super(BG_IMG_SRC, BG_IMG_WIDTH, BG_IMG_HEIGHT)
    this.top = 0

  }
  //背景绘制
  render(ctx){
    ctx.drawImage(
      this.img,
      0, 
      this.top,
      this.width,
      this.height
    )
    ctx.drawImage(
      this.img, 
      0, 
      -this.height + this.top, 
      this.width, 
      this.height
    )
  }
  //背景y的位置更新
  update(){
    this.top++
    if (this.top > this.height){
      this.top = 0
    }
  }
}