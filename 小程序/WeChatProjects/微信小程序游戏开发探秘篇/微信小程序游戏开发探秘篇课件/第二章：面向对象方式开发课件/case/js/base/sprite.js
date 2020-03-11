export default class Sprite{
  constructor(imgSrc = '',width = 0,height = 0,x = 0,y = 0){
    this.img = new Image()
    this.img.src = imgSrc
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.visible = true
  }
  darwToCanvas(ctx){
    if(!this.visible){
      return
    }
    ctx.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }
  isbang(sp){
    let centerX = sp.x + sp.width / 2
    let centerY = sp.y + sp.height / 2

    if(!this.visible || !sp.visible){
      return false
    }
    return (
         centerX>this.x
      && centerX < this.x + this.width
      && centerY > this.y
      && centerY < this.y + this.height
    )
  }
}