import './js/components/weapp-adapter.js';
import Audio from './js/components/audio.js';
import Background from './js/components/background.js';
import Plane from './js/components/plane.js';

// var canvas = wx.createCanvas();

var ctx = canvas.getContext('2d');
var bgmMain = Background(ctx);
var plane = Plane()
plane.move()
// Plane(ctx);
render();
function render(){
    var top = 0;
    move()
    function move() {
      top++;
      if (top > window.innerHeight) top = 0;
      requestAnimationFrame(function () {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        bgmMain.move(top)
        plane.dramPlane(ctx)
        move()
      })
    }
}
// var bg = wx.createImage();
// Audio()