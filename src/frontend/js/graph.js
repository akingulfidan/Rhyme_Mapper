export class RhymeGraph {

  constructor(SSAA, context = "2d"){ // SSAA -> Super Sampling Anti-Aliasing

    const canvas = document.createElement("canvas");
    document.body.prepend(canvas);
    const ctx = canvas.getContext(context);
    this.SSAA = SSAA;
    this.ctx = ctx;

    this.resizeCanvas()

  }

  resizeCanvas() {
    const canvas = this.ctx.canvas;

    canvas.drawingWidth = window.innerWidth*0.7;
    canvas.drawingHeight = window.innerHeight;

    canvas.width = canvas.drawingWidth*this.SSAA;
    canvas.height = canvas.drawingHeight*this.SSAA;

    canvas.style.width = `${canvas.drawingWidth}px`; 
    canvas.style.height = `${canvas.drawingHeight}px`;

    this.ctx.scale(this.SSAA, this.SSAA);

  }

  inputData(lexicon, word_array, position_map, rhyme_paths){
    this.rhyme_paths = rhyme_paths;
    this.words = [];

    let index = 0;
    for (const word of word_array){
      const phones = lexicon[word];

      let phone_array = [];
      for (const sound of phones){
        let phone = new Phone(sound);
        phone_array.push(phone);
      }
      
      let stress_to_end = []

      let stressIndex = phone_array.findLastIndex(phone => phone.primaryStress == true)

      if (stressIndex == -1){
         stressIndex = phone_array.findLastIndex(phone => phone.secondaryStress == true)
      }

      if (stressIndex != -1){
        stress_to_end = phone_array.slice(stressIndex)
      }

      let position = position_map[index];
      let word_obj = new Word(word, position[0], position[1], phone_array, stress_to_end);
      this.words.push(word_obj)
      index++;
    }
    console.log(this.words)

  }

  drawPhoneme(x,y,stress) {
    const ctx = this.ctx;

    this.ctx.beginPath();
    ctx.arc(x,y,stress,0,2*Math.PI);
    ctx.stroke();
    ctx.closePath();

  }

  renderGraph(){
    const ctx = this.ctx;
    const canvas = this.ctx.canvas;

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
    this.pos = position;
    this.phones = phones;
    this.stress_to_end = stress_to_end;    
  }

}