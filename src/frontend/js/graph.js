export class RhymeGraph {

  constructor(SSAA, context = "2d"){ // SSAA -> Super Sampling Anti-Aliasing

    let canvas = document.createElement("canvas");
    document.body.prepend(canvas);
    let ctx = canvas.getContext(context);
    this.SSAA = SSAA;
    this.ctx = ctx;

    this.resizeCanvas()

  }

  resizeCanvas() {
    let canvas = this.ctx.canvas;

    canvas.drawingWidth = window.innerWidth*0.7;
    canvas.drawingHeight = window.innerHeight;

    canvas.width = canvas.drawingWidth*this.SSAA;
    canvas.height = canvas.drawingHeight*this.SSAA;

    canvas.style.width = `${canvas.drawingWidth}px`; 
    canvas.style.height = `${canvas.drawingHeight}px`;

    this.ctx.scale(this.SSAA, this.SSAA);

  }

  drawPhoneme(x,y,stress) {
    let ctx = this.ctx;

    this.ctx.beginPath();
    ctx.arc(x,y,stress,0,2*Math.PI);
    ctx.stroke();
    ctx.closePath();

  }

  renderGraph(){
    let ctx = this.ctx;
    let canvas = this.ctx.canvas;

    this.drawPhoneme(canvas.drawingWidth/2,canvas.drawingHeight/2,50);    


  }

}


class Phone {
  constructor(sound) {
    this.sound = sound;

    if (sound.includes('ˈ')){
      this.primaryStress = true;
    }else{
      this.primaryStress = false;
    }

    if (sound.includes('ˌ')){
      this.secondaryStress = true;
    }else{
      this.secondaryStress = false;
    }
  }

  assignPosition(x,y){
    this.x = x;
    this.y = y;
  }

}

class Word {
  constructor(text, line, position, phones, stress_to_end){
    this.text = text;
    this.line = line;
    this.pos = pos;
    this.phones = phones;
    this.stress_to_end = stress_to_end    
  }

}