export default function (ctx){
  var obj = {
    planeImg: new Image(),
    srentWidth:window.innerWidth,
    srentHieght:window.innerHeight,
    x:0,
    y:0,
    imgWidth:80,
    imgHiehgt:80,
    isMove:false,
    dramPlane: function (ctx) {
      ctx.drawImage(this.planeImg, 0, 0, this.planeImg.width, this.planeImg.height, this.x, this.y, this.imgWidth, this.imgHiehgt)
    },
    move:function(){
      canvas.addEventListener('touchstart',function(e){
        var clientX = e.changedTouches[0].clientX;
        var clientY = e.changedTouches[0].clientY;
        
        if(clientX > obj.x && clientX < obj.x + obj.imgWidth && clientY>obj.y && clientY < obj.y + obj.imgHiehgt){
          obj.isMove = true
        }
      })

      canvas.addEventListener('touchmove', function (e) {
        var clientX = e.changedTouches[0].clientX;
        var clientY = e.changedTouches[0].clientY;

        if(obj.isMove){
          obj.x = clientX - obj.imgWidth / 2;
          obj.y = clientY - obj.imgHiehgt / 2;
        }
        
      })

      canvas.addEventListener('touchend',function(){
        obj.isMove = false
      })
    }
  }
  obj.planeImg.src = './images/hero.png';
  obj.planeImg.width = 186;
  obj.planeImg.height = 130;
  obj.x = obj.srentWidth / 2 - obj.imgWidth / 2
  obj.y = obj.srentHieght - obj.imgHiehgt - 30
  return obj;
}