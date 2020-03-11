import './js/component/weapp-adapter.js'
import Audio from './js/component/audio.js'
import Background from './js/component/background.js'
import Plane from './js/component/plane.js'
import Bullet from './js/component/bullet.js'
import Enemy from './js/component/enemy.js'
import Animation from './js/component/animation.js'
import Score from './js/component/score.js'
// var canvas = wx.createCanvas()

var ctx = canvas.getContext('2d')

// var bg = wx.createImage()


var width = window.innerWidth
var height = window.innerHeight

Audio()
var background = Background(ctx)
var plane = Plane(ctx)
var score = Score(ctx)
// var enemy = Enemy(ctx)
var bullet = null
var bulletarr = []
var enemy = null
var enemyarr = []
var animation = null
var animationarr = []
var scorenum = 0  

var boomimg = null
var boomarr = []
for(var i=1;i<20;i++){
  var src = 'images/explosion'
  boomimg = new Image()
  boomimg.src = src+i+'.png'
  boomarr.push(boomimg)
}



setInterval(function(){
  bullet = Bullet(ctx, plane.x, plane.y, plane.imgwidth)
  bulletarr.push(bullet)
},500)

setInterval(function(){
  enemy = Enemy(ctx)
  enemyarr.push(enemy)
},1000)

var top = 0
// 调用移动时间
plane.move()
render()
function render(){
    top++
    if (top > window.innerHeight)
      top = 0
  requestAnimationFrame(function(){
    ctx.clearRect(0, 0, width, height)
    background.move(top)
    score.scoretext(scorenum)
    // bullet.drawBullet()
    //绘制子弹
    bulletarr = bulletarr.filter(item => item.isshow)
    // console.log(bulletarr)
    bulletarr.forEach(item=>{
      item.drawBullet()
    })
    //绘制飞机
    plane.drawPlane()
    // enemy.drawEnemy()
    //绘制敌机
    enemyarr = enemyarr.filter(item=>item.isshow)
    // console.log(enemyarr)
    enemyarr.forEach(item=>{
      plane.isbang(item)
      item.drawEnemy()
      for (let i = 0; i < bulletarr.length; i++){
        var bulletboolean = item.isbang(bulletarr[i])
        if (bulletboolean){
          bulletarr[i].isshow = false
          //收集当前需要爆炸的个数
          animation = Animation(ctx, item.x, item.y)
          animationarr.push(animation)
          scorenum++
        }
      }
    })
    //爆炸效果
    animationarr = animationarr.filter(item => item.isshow)
    animationarr.forEach(item=>{
      item.drawboom(boomarr)
    })
    if(plane.isrender){
      render()
    }else{
      score.drawLast()
      score.lasttext()
      score.lastnum(scorenum)
      score.button()
    }
  
  })
}
// var width = window.innerWidth
// var height = window.innerHeight

// move();
// function move() {
//   top++
//   if (top > height)
//     top = 0

//   requestAnimationFrame(function () {
//     ctx.clearRect(0, 0, width, height)
//     
//     move()
//   })
// }


