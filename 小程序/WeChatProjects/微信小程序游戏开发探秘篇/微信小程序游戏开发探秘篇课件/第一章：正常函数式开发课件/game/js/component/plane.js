export default function(ctx){
  var obj = {
    screenWidth:window.innerWidth,
    screenHeight:window.innerHeight,
    x:0,
    y:0,
    isrender:true,
    imgwidth:80,
    imgheight:80,
    ismove:false,
    planeImg: new Image(),
    drawPlane:function(){
      ctx.drawImage(this.planeImg, 0, 0, this.planeImg.width, this.planeImg.height, this.x, this.y, this.imgwidth, this.imgheight)
    },
    move:function(){
      canvas.addEventListener('touchstart',function(e){
        e.preventDefault()
        var clientX = e.changedTouches[0].clientX
        var clientY = e.changedTouches[0].clientY

        if (clientX > obj.x && clientX < obj.x + obj.imgwidth && clientY > obj.y && clientY < obj.y + obj.imgheight){
          obj.ismove = true
        }
      })
      canvas.addEventListener('touchmove',function(e){
        e.preventDefault()
        var clientX = e.changedTouches[0].clientX
        var clientY = e.changedTouches[0].clientY

        if (obj.ismove){
          var x = clientX - obj.imgwidth / 2
          var y = clientY - obj.imgheight / 2
          if(x<0){
            x = 0
          }
          if (x > obj.screenWidth - obj.imgwidth){
            x = obj.screenWidth - obj.imgwidth
          }
          if(y<0){
            y = 0
          }
          if (y > obj.screenHeight - obj.imgheight){
            y = obj.screenHeight - obj.imgheight
          }
          obj.x = x
          obj.y = y
        }
      })
      canvas.addEventListener('touchend',function(e){
        e.preventDefault()
        obj.ismove = false
      })
    },
    isbang:function(enemy){
      var centerX = enemy.x + enemy.imgW / 2
      var centerY = enemy.y + enemy.imgH / 2

      if (centerX > this.x && centerX < this.x + this.imgwidth && centerY > this.y && centerY < this.y + this.imgheight){
        this.isrender = false
      }
    }
  }
  obj.planeImg.src = 'images/hero.png'
  obj.planeImg.width = 186
  obj.planeImg.height = 130

  obj.x = obj.screenWidth / 2 - obj.imgwidth / 2
  obj.y = obj.screenHeight - obj.imgheight - 30

  return obj
}