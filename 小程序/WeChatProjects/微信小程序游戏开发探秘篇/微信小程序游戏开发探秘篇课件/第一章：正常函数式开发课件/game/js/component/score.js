export default function(ctx){
  var screenW = window.innerWidth
  var screenH = window.innerHeight
  var obj = {
    img:new Image(),
    scoretext: function (score) {
      ctx.fillStyle = '#fff'
      ctx.font = '40px arial'
      ctx.fillText(score, 10, 40)
    },
    drawLast:function(){
      ctx.drawImage(this.img, 0, 0, 119, 108, screenW / 2 - 150, screenH / 2 -100,300,300)
    },
    lasttext:function(){
      ctx.font = '20px arial'
      ctx.fillText('游戏结束', screenW / 2 - 40, screenH / 2 - 100 + 50)
    },
    lastnum: function (score){
      ctx.fillText('得分: ' + score, screenW / 2 - 40, screenH / 2 - 100 + 130)
    },
    button:function(){
      ctx.drawImage(
        this.img,120, 6, 39, 24,screenW / 2 - 60,screenH / 2 - 100 + 180,120, 40
      )
      ctx.fillText('重新开始', screenW / 2 - 40, screenH / 2 - 100 + 205)
    }
  }
  obj.img.src = 'images/Common.png'
  return obj
}