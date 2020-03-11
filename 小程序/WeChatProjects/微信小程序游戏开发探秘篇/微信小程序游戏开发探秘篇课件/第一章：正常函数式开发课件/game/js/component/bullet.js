export default function(ctx,px,py,pw){
  var obj = {
    img:new Image(),
    imgWidth:16,
    imgHeight:30,
    isshow:true,
    x:0,
    y:0,
    drawBullet:function(){
      obj.y -= 5
      //判断子弹是否飞出屏幕
      if (obj.y<-30){
        this.isshow = false
      }
      ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.x, this.y, this.imgWidth, this.imgHeight)
    }
  }
  obj.img.src = 'images/bullet.png'
  obj.img.width = 62
  obj.img.height = 108

  obj.x = px + pw / 2 - obj.imgWidth / 2
  obj.y = py + 10

  var biu = new Audio()
  biu.src = 'audio/bullet.mp3'
  biu.play()

  return obj
}