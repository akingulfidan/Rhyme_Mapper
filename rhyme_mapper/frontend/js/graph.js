import "./d3.v7.js";

export class RhymeGraph {
  constructor() {
    this.container = d3
      .create("svg")
      .attr("width", window.innerWidth * 0.7)
      .attr("height", window.innerHeight);

    this.graph = this.container.append("g");
    this.rhymeGroup = this.graph.append("g").attr("class", "RhymeGroup");
    this.phonemeGroup = this.graph.append("g").attr("class", "PhonemeGroup");

    this.zoom = d3.zoom().on("zoom", (event) => {
      this.graph.attr("transform", event.transform);
    });

    this.identityTransform = d3.zoomIdentity.translate(
      this.container.attr("width") / 2,
      this.container.attr("height") / 2,
    );

    this.container.call(this.zoom, this.identityTransform);
    this.graphState = "radial";
    this.words = [];

    document.body.prepend(this.container.node());
  }

  setColors({ background, rhyme_path, phoneme }) {
    if (background != undefined) {
      this.background_color = background;
    }
    if (rhyme_path != undefined) {
      this.rhyme_path_color = rhyme_path;
    }
    if (phoneme != undefined) {
      this.phoneme_color = phoneme;
    }
  }

  resizeCanvas() {
    this.container
      .attr("width", window.innerWidth * 0.7)
      .attr("height", window.innerHeight);

    this.identityTransform = d3.zoomIdentity.translate(
      this.container.attr("width") / 2,
      this.container.attr("height") / 2,
    );
  }

  updatePositions() {
    if (this.graphState == "radial") {
      const total_line_count = this.words.length;

      const radius_shift = 50;
      const phone_spacing = 0.2;

      const max_line_length = Math.max(
        ...this.words.map((line) => {
          let total_phones = 0;
          for (const word of line) {
            total_phones += word.phones.length;
          }
          return total_phones;
        }),
      );

      const initial_radius =
        5 * max_line_length + total_line_count * radius_shift + 10;

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

    if (this.graphState == "linear") {
    }
  }

  graphMode(mode) {
    this.graphState = mode;
    this.updatePositions();
  }
  updatePaths(paths) {
    this.rhyme_paths = paths;
  }
  inputData(lexicon, word_array, rhyme_paths) {
    this.rhyme_paths = rhyme_paths.reverse(); // The array comes sorted from longest to shortest from the backend it is cleaner to draw the shortes first
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

        let stressIndex = phone_array.findLastIndex(
          (phone) => phone.primaryStress == true,
        );

        if (stressIndex == -1) {
          stressIndex = phone_array.findLastIndex(
            (phone) => phone.secondaryStress == true,
          );
        }

        if (stressIndex != -1) {
          stress_to_end = phone_array.slice(stressIndex);
        }
        let word_obj = new Word(word, phone_array, stress_to_end);
        line_object_array.push(word_obj);
      }
      this.words.push(line_object_array);
    }
    this.updatePositions();
  }

  calculateRhymePosition(phones, dim) {
    if (dim == "x") {
      return phones.reduce((sum, phone) => sum + phone.x, 0) / phones.length;
    }
    if (dim == "y") {
      return phones.reduce((sum, phone) => sum + phone.y, 0) / phones.length;
    }
  }
  createSvgPath(target_words) {
    const first_target = target_words[0];
    const start_phonemes =
      this.words[first_target[0]][first_target[1]].stress_to_end;
    var last_x = this.calculateRhymePosition(start_phonemes, "x");
    var last_y = this.calculateRhymePosition(start_phonemes, "y");
    var path = `M ${last_x},${last_y}`;

    for (const target of target_words.slice(1)) {
      const target_phonemes = this.words[target[0]][target[1]].stress_to_end;
      const x = this.calculateRhymePosition(target_phonemes, "x");
      const y = this.calculateRhymePosition(target_phonemes, "y");

      const dx = last_x - x;
      const dy = last_y - y;
      const amplitude = 50 + 0.5 * Math.hypot(dx, dy);

      const perpendicular = {
        x: -dy / Math.hypot(dx, dy),
        y: dx / Math.hypot(dx, dy),
      };

      const mid = {
        x: (last_x + x) / 2,
        y: (last_y + y) / 2,
      };

      const control_point = {
        x: mid.x + amplitude * perpendicular.x,
        y: mid.y + amplitude * perpendicular.y,
      };

      path += ` Q ${control_point.x},${control_point.y} ${x},${y}`;
      last_x = x;
      last_y = y;
    }

    return path;
  }

  drawPaths() {
    const connections = this.rhymeGroup
      .selectAll("g.RhymePath")
      .data(this.rhyme_paths)
      .join("g")
      .attr("class", "RhymePath")
      .attr("data-path_length", (path) => path.length);

    connections
      .selectAll("path")
      .data((targets) => [targets])
      .join("path")
      .attr("class", "PathTargetConnection")
      .attr("d", (targets) => this.createSvgPath(targets))
      .attr("stroke", function () {
        const connectionLength = d3.select(this.parentNode).datum().length;
        return `hsla(from var(--rhyme_path_color) h ${Math.min(connectionLength * 10, 100)}% l / alpha)`;
      });

    connections
      .selectAll("circle.Background")
      .data((target) => target)
      .join("circle")
      .attr("class", "Background")
      .attr("cx", (target) =>
        this.calculateRhymePosition(
          this.words[target[0]][target[1]].stress_to_end,
          "x",
        ),
      )
      .attr("cy", (target) =>
        this.calculateRhymePosition(
          this.words[target[0]][target[1]].stress_to_end,
          "y",
        ),
      )
      .attr(
        "r",
        (target) => this.words[target[0]][target[1]].stress_to_end.length * 9,
      );

    connections
      .selectAll("circle.PathTarget")
      .data((target) => target)
      .join("circle")
      .attr("class", "PathTarget")
      .attr(
        "cx",
        (target) =>
          this.calculateRhymePosition(
            this.words[target[0]][target[1]].stress_to_end,
            "x",
          ),
        this.phonemeGroup,
      )
      .attr("cy", (target) =>
        this.calculateRhymePosition(
          this.words[target[0]][target[1]].stress_to_end,
          "y",
        ),
      )
      .attr(
        "r",
        (target) => this.words[target[0]][target[1]].stress_to_end.length * 9,
      )
      .attr("stroke", function () {
        const connectionLength = d3.select(this.parentNode).datum().length;
        return `hsla(from var(--rhyme_path_color) h ${Math.min(connectionLength * 10, 100)}% l / alpha)`;
      });
  }

  drawPhonemes() {
    this.phonemeGroup
      .selectAll("circle.Phoneme")
      .data(this.words.flat().flatMap((word) => word.phones))
      .join("circle")
      .attr("class", "Phoneme")
      .attr("cx", (phone) => phone.x)
      .attr("cy", (phone) => phone.y)
      .attr("r", (phone) =>
        phone.primaryStress ? 7 : phone.secondaryStress ? 5 : 3,
      );
  }
  renderGraph() {
    this.drawPaths();
    this.drawPhonemes();
  }

  reset_view() {
    this.container.call(this.zoom.transform, this.identityTransform);
  }

  filter(filter_set) {
    this.rhymeGroup
      .selectAll(".RhymePath")
      .style("display", (path) => {
        for (const filter of filter_set){
          if (!filter(path)){
            return "none";
          }
        }
        
        return null;

      });
  }

}


class Phone {
  constructor(sound) {
    this.sound = sound;

    if (sound.includes("ˈ")) {
      this.primaryStress = true;
    } else {
      this.primaryStress = false;
    }

    if (sound.includes("ˌ")) {
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
