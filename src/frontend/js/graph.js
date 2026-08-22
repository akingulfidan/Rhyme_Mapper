export class RhymeGraph {

  constructor(SSAA, context = "2d") { // SSAA -> Super Sampling Anti-Aliasing

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

    canvas.drawingWidth = window.innerWidth * 0.7;
    canvas.drawingHeight = window.innerHeight;

    canvas.width = canvas.drawingWidth * this.SSAA;
    canvas.height = canvas.drawingHeight * this.SSAA;

    canvas.style.width = `${canvas.drawingWidth}px`;
    canvas.style.height = `${canvas.drawingHeight}px`;

    this.ctx.scale(this.SSAA, this.SSAA);

  }

  updatePositions() {

    if (this.graphState == 'radial') {

      const max_line_length = Math.max(...this.words.map(line => {
        let total_phones = 0;
        for (const word of line) {
          total_phones += word.phones.length;
        }
        return total_phones;
      }));

      const total_line_count = this.words.length;

      const radius_shift = 30;
      const phone_spacing = 0.2;
      const initial_radius = 5 * max_line_length + total_line_count * radius_shift + 10;

      for (const [lineIndex, line] of this.words.entries()) {
        let phone_count = 0;

        for (const [wordIndex, word] of line.entries()) {

          const radius = initial_radius - lineIndex * radius_shift;
          const angle_shift = Math.PI / (radius * phone_spacing);
          const word_shift = wordIndex * 2 * angle_shift;

          for (const phone of word.phones) {
            let angle = phone_count * angle_shift - Math.PI / 2 + word_shift;

            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);

            phone.assignPosition(x, y);

            phone_count++;
          }
        }
      }
    }

    if (this.graphState == 'linear') {


    }
  }

  graphMode(mode) {
    this.graphState = mode;
    this.updatePositions();
  }

  inputData(lexicon, word_array, rhyme_paths) {
    this.rhyme_paths = rhyme_paths;
    this.words = [];

    for (const line of word_array) {
      let line_object_array = [];

      for (const word of line) {
        const phones = lexicon[word];


        let phone_array = [];
        for (const sound of phones) {
          let phone = new Phone(sound);
          phone_array.push(phone);
        }

        let stress_to_end = [];

        let stressIndex = phone_array.findLastIndex(phone => phone.primaryStress == true);

        if (stressIndex == -1) {
          stressIndex = phone_array.findLastIndex(phone => phone.secondaryStress == true);
        }

        if (stressIndex != -1) {
          stress_to_end = phone_array.slice(stressIndex);
        }
        let word_obj = new Word(word, phone_array, stress_to_end);
        line_object_array.push(word_obj);

      }
      this.words.push(line_object_array)

    }

    this.updatePositions();

  }

  drawCircle(x, y, radius) {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();

  }

  calculateRhymePosition(phones){

    const avgX = phones.reduce((sum,phone) => sum + phone.x, 0) / phones.length;
    const avgY = phones.reduce((sum,phone) => sum + phone.y, 0) / phones.length;

    return [avgX,avgY];

  }

  drawRhymePath(path){
    for (const target of path){
      const [line, position] = target;
      const word = this.words[line][position];
      const stress_to_end = word.stress_to_end;

      const rhymePos = this.calculateRhymePosition(stress_to_end);

      this.drawCircle(rhymePos[0], rhymePos[1], stress_to_end.length*13);
    }

  }
  

  renderGraph() {

    const ctx = this.ctx;
    const canvas = this.ctx.canvas;
    ctx.save();

    ctx.clearRect(0, 0, canvas.drawingWidth, canvas.drawingHeight);
    ctx.translate(this.offsetX, this.offsetY)
    ctx.scale(this.scale, this.scale);

    ctx.translate(canvas.drawingWidth / 2, canvas.drawingHeight / 2)

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    for (const line of this.words) {

      for (const word of line) {
        for (const phone of word.phones) {
          this.drawCircle(phone.x, phone.y, phone.primaryStress ? 9 : phone.secondaryStress ? 7 : 4);
        }
      }
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(177, 39, 39)';

    for (const path of this.rhyme_paths){
      this.drawRhymePath(path);
    }

    ctx.restore();
  }

  initMouse() {
    const canvas = this.ctx.canvas;

    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1

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

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - this.offsetX) / this.scale;
      const worldY = (mouseY - this.offsetY) / this.scale;

      const zoom = e.deltaY < 0 ? 1.1 : 0.9;

      this.scale *= zoom;

      this.offsetX = mouseX - worldX * this.scale;
      this.offsetY = mouseY - worldY * this.scale;

      this.renderGraph();
    });

  }
}

class Phone {
  constructor(sound) {
    this.sound = sound;

    if (sound.includes('ˈ')) {
      this.primaryStress = true;
    } else {
      this.primaryStress = false;
    }

    if (sound.includes('ˌ')) {
      this.secondaryStress = true;
    } else {
      this.secondaryStress = false;
    }
  }

  assignPosition(x, y) {
    this.x = x;
    this.y = y;
  }

}

class Word {
  constructor(text, phones, stress_to_end) {
    this.text = text;
    this.phones = phones;
    this.stress_to_end = stress_to_end;
  }

}