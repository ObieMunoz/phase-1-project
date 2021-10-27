var canvas = document.createElement("canvas"),
  c = canvas.getContext("2d");
var w = canvas.width = window.innerWidth,
  h = canvas.height = window.innerHeight;



particles = {},
  particleIndex = 0,
  particleNum = 30;

document.body.prepend(canvas);
canvas.style.position = 'fixed';
canvas.style.top = "-500px";
function particle() {
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height/3+h*2/3-100;
  this.vx = Math.random() * 10 - 5;
  this.vy = Math.random() * 10 - 5;
  this.gravity = 0.3;
  particleIndex++;
  particles[particleIndex] = this;
  this.id = particleIndex;
  this.life = 0;
  this.maxLife = Math.random() * 90;
  this.shadeR = Math.floor(Math.random() * 255+150) + 50;
  this.shadeG = Math.floor(Math.random() * 150) + 50;
  this.shadeB = Math.floor(Math.random() * 0);
  this.color = 'rgba(' + this.shadeR + ',' + this.shadeG + ',' + this.shadeB + ',' + Math.random() * 0.7 + ')';
  this.size = Math.random() * 3;
}
particle.prototype.draw = function() {
  this.x += this.vx;
  this.y += this.vy;
  if (Math.random() < 0.1) {
    this.vx = Math.random() * 10 - 5;
    this.vy = -2;
  }

  this.life++;
  if (this.life >= this.maxLife) {
    delete particles[this.id];
  }

  c.beginPath();
  c.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
  c.fillStyle = this.color;
  c.fill();
};

function drawParticle() {
 c.clearRect(0, 0,w,h);
  for (var i = 0; i < particleNum; i++) {
    new particle();
  }
  for (var i in particles) {
    particles[i].draw();
  }
}

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

function loop() {

  window.requestAnimFrame(loop);

  drawParticle();
}

loop();