export class RhymeGraph {

  constructor(SSAA, context = "2d"){ // SSAA -> Super Sampling Anti-Aliasing

    const canvas = document.createElement("canvas");
    document.body.prepend(canvas);
    const ctx = canvas.getContext(context);
    this.SSAA = SSAA;
    this.ctx = ctx;
    this.graphState = "radial"; 
    this.words = [];

    this.resizeCanvas();
    this.initMouse();
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

  updatePositions(){

    const canvas = this.ctx.canvas  
    const line_count = Math.max(...this.words.map(word => word.line));
    let line_size_lookup = {}

    for (let i = 0; i <= line_count; i++) {
      line_size_lookup[i] = 0
    }

    if (this.graphState == 'radial'){
      
      const radius_shift = 15;
      const initial_radius = line_count * radius_shift + 90;

      for (const word of this.words){

        const line = word.line;
        const angle_shift = Math.PI/24*(25/line+Number.EPSILON);

        for (const phone of word.phones){
          let radius = initial_radius - line*radius_shift;
          let angle = line_size_lookup[line]*angle_shift;

          let x = radius*Math.cos(angle);
          let y = radius*Math.sin(angle);

          phone.assignPosition(x+canvas.drawingWidth/2, y+canvas.drawingHeight/2);

          line_size_lookup[line] += 1;
        }
      }
    }

    if (this.graphState == 'linear'){


    }
  }

  graphMode(mode){
    this.graphState = mode;
    this,this.updatePositions();
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
      
      let stress_to_end = [];

      let stressIndex = phone_array.findLastIndex(phone => phone.primaryStress == true);

      if (stressIndex == -1){
         stressIndex = phone_array.findLastIndex(phone => phone.secondaryStress == true);
      }

      if (stressIndex != -1){
        stress_to_end = phone_array.slice(stressIndex);
      }

      let position = position_map[index];
      let word_obj = new Word(word, position[0], position[1], phone_array, stress_to_end);
      this.words.push(word_obj);
      index++;
    }
    this.updatePositions();

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const word of this.words){

      for (const phone of word.phones){
        this.drawPhoneme(phone.x +this.offsetX,phone.y+this.offsetY, phone.primaryStress ? 15 : phone.secondaryStress ? 10 : 5);
      }
    }
  }

  initMouse(){

    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    const canvas = this.ctx.canvas;
    
    canvas.addEventListener("mousedown", (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (this.dragging) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;

        this.offsetX += dx;
        this.offsetY += dy;

        this.lastX = e.clientX;
        this.lastY = e.clientY;

        this.renderGraph();
      }
    });

    canvas.addEventListener("mouseup", () => {
      this.dragging = false;
    });

    canvas.addEventListener("mouseleave", () => {
      this.dragging = false;
    });


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