export default function(ctx,bx,by){
  var obj = {
    num:0,
    isshow:true,
    drawboom: function (boomarr){
      this.num++
      if(this.num>18){
        this.num = 18
        this.isshow = false
      }
      ctx.drawImage(boomarr[this.num], 0, 0, 64, 48, bx, by, 60, 60)
    }
  }

  var boom = new Audio()
  boom.src = 'audio/boom.mp3'
  boom.play()

  return obj
}