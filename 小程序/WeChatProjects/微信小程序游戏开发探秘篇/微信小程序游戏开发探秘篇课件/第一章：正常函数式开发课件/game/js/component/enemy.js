export default function(ctx){
  var obj = {
    img:new Image(),
    x:0,
    y:-60,
    imgW:60,
    imgH:60,
    isshow:true,
    drawEnemy:function(){
      this.y+=5
      if (this.y>window.innerHeight){
        this.isshow = false
      }
      ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.x, this.y, this.imgW, this.imgH)
    },
    isbang:function(bullet){
      var centerX = bullet.x + bullet.imgWidth / 2
      var centerY = bullet.y + bullet.imgHeight / 2
      
      if (centerX > this.x && centerX < this.x + this.imgW && centerY > this.y && centerY < this.y + this.imgH && this.y>30){
        this.isshow = false
        return true
      }
    }
  }
  obj.img.src = 'images/enemy.png'
  obj.img.width = 120
  obj.img.height = 79

  obj.x = Math.random() * (window.innerWidth - obj.imgW)
  return obj
}