import Background from './runtime/background.js'
import Music from './runtime/music.js'
import Plane from './player/index.js'
import DataBus from './databus.js'
import Enemy from './npc/enemy.js'
import GameInfo from './runtime/gameinfo.js'

let databus = new DataBus()
let ctx = canvas.getContext('2d')


export default class Main{
  constructor(){
    this.restart() 
    this.id = 0
  }
  //初始化
  restart(){
    //初始化databus的数据
    databus.restart()

    canvas.removeEventListener('touchstart',()=>{
      this.touchHandel
    })

    this.istouch = false
    this.background = new Background()
    this.music = new Music()
    this.plane = new Plane()
    this.gameinfo = new GameInfo()
    

    //清空上一次动画
    window.cancelAnimationFrame(this.id)
    this.loop()
  }
  //全局碰撞检测
  bang(){
    //检测子弹和敌机的碰撞
    databus.bullets.forEach(bullet=>{
      for (let i = 0; i < databus.enemys.length;i++){
        let enemy = databus.enemys[i]
        let isbang = enemy.isbang(bullet)
        if (isbang){
          enemy.playExplosion()
          this.music.playboombgm()
          bullet.visible = false
          databus.score++
        }
      }
    })
    //检测飞机和敌机的碰撞
    for(let i = 0;i<databus.enemys.length;i++){
      let enemy = databus.enemys[i]
      let isbang = enemy.isbang(this.plane)
      if (isbang){
        databus.gameover = true
      }
    }
  }
  //创建敌机
  createEnemy(){
    if(databus.frame % 30 == 0){
      let enemy = databus.pool.checkpoolDicNum('enemy',Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }
  //绘制子弹和飞机
  draw(){
    databus.bullets.concat(databus.enemys).forEach(item=>{
      item.darwToCanvas(ctx)
    })
  }
  //更新绘制
  render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.background.render(ctx)
    this.draw()
    this.plane.darwToCanvas(ctx)
    databus.animations.forEach(ani=>{
      if (ani.playing){
        ani.anirender(ctx)
      }
    })

    this.gameinfo.drawInfo(ctx)
    //如果当前游戏结束做的事情
    if(databus.gameover){
      this.gameinfo.drawFinish(ctx)
      if (!this.istouch){
        this.istouch = true
        this.touchHandel()
      }
      
    }
  }
  touchHandel(){
    canvas.addEventListener('touchstart',(e)=>{
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      let posXY = this.gameinfo.posXY
      if (x > posXY.startX && x < posXY.endX && y > posXY.startY && y < posXY.endY){
        this.restart()
      }
    })
  }
  //更新数据
  update(){
    if (databus.gameover){
      return
    }
    this.createEnemy()
    this.background.update()
    if (databus.frame % 10 == 0){
      this.plane.shoot()
      this.music.playshootbgm()
    }
    databus.bullets.concat(databus.enemys).forEach(item=>{
      item.update()
    })
    this.bang()
  }
  //循环
  loop(){
    databus.frame++
    this.id = window.requestAnimationFrame(()=>{
        this.render()
        this.update()
        this.loop()
      }
    )
  }
}