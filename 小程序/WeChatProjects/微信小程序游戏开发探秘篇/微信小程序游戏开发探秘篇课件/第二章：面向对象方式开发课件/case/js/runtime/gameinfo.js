import DataBus from '../databus.js'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let anis = new Image()
anis.src = 'images/Common.png'

let databus = new DataBus()
export default class Gameinfo{
  constructor(){
    this.posXY = {}
  }
  drawInfo(ctx){
    ctx.fillStyle = '#fff'
    ctx.font = '25px Arial'
    ctx.fillText(databus.score,20,30)
  }
  //游戏结束
  drawFinish(ctx){
    ctx.drawImage(anis, 0, 0, 119, 108, screenWidth / 2 - 150, screenHeight / 2 - 100, 300, 300)

    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"

    ctx.fillText(
      '游戏结束',
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 50
    )

    ctx.fillText(
      '得分: ' + databus.score,
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 130
    )

    ctx.drawImage(
      anis,
      120, 6, 39, 24,
      screenWidth / 2 - 60,
      screenHeight / 2 - 100 + 180,
      120, 40
    )
    ctx.fillText(
      '重新开始',
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 205
    )

    this.posXY = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 - 100 + 180,
      endX: screenWidth / 2 + 50,
      endY: screenHeight / 2 - 100 + 255
    }
  }
}