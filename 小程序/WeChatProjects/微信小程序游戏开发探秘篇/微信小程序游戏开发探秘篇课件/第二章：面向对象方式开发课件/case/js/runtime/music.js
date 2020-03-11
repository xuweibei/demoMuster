export default class Music{
  constructor(){
    this.bgm = new Audio()
    this.bgm.src = 'audio/bgm.mp3' 
    this.bgm.loop = true

    this.shootbgm = new Audio()
    this.shootbgm.src = 'audio/bullet.mp3'

    this.boombgm = new Audio()
    this.boombgm.src = 'audio/boom.mp3'


    this.playbgm()
  }
  playbgm(){
    this.bgm.play()
  }
  playshootbgm(){
    this.shootbgm.currentTime = 0
    this.shootbgm.play()
  }
  playboombgm() {
    this.boombgm.currentTime = 0
    this.boombgm.play()
  }
}