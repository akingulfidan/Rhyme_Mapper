/*
Module containing the RhymeGraph Class
The class uses D3 to draw phonemes and rhyme paths calculated via the backend as svg.

Interface:
graphMode(mode):
  Determines how the phonemes will be drawn in the visualization. (current available modes are radial and linear)
inputData(lexicon, word_array, rhyme_paths):
  Takes lexicon (map: word => phonemes), word_array (2d array of lines and words in text order) and rhyme_paths (array of paths containing arrays of word_array indicies) as input. Creates phone and word objects, calculates positions based on graph mode, calls onDatachange callbacks and calls renderGraph().
renderGraph():
  Does the d3 join and generates elements of the visualization in the DOM.
filter(filters):
  Checks paths for each filter in filters and hides ones that do not pass every check.
getSvgElement():
  Returns the svg element
*/

import * as d3 from "d3";

export class RhymeGraph {
  constructor() {
    // Creates the graph instance

    // Create the svg container and groups
    this.container = d3
      .create("svg")
      .attr("width", window.innerWidth * 0.7)
      .attr("height", window.innerHeight);

    this.graph = this.container.append("g");
    this.rhymeGroup = this.graph.append("g").attr("class", "RhymeGroup");
    this.phonemeGroup = this.graph.append("g").attr("class", "PhonemeGroup");
    this.lineNumberGroup = this.graph
      .append("g")
      .attr("class", "LineNumberGroup");

    this.maxPathLength = 0; // Intial no data max path length
    this.onDataChanged = []; // Initialize empty array to store callbacks on data change
    this.lineStartHeights = []; // Initialize empty array for line start heights (to draw line numbers)

    // Initialize the zoom event
    this.zoom = d3.zoom().on("zoom", (event) => {
      this.graph.attr("transform", event.transform);
    });

    // Center the identity transformation to the center of the container
    this.identityTransform = d3.zoomIdentity.translate(
      this.container.attr("width") / 2,
      this.container.attr("height") / 2,
    );
    this.container.call(this.zoom, this.identityTransform);

    this.graphState = "linear"; // set inital graphState as linear
    this.words = [];

    document.body.prepend(this.container.node());
  }

  resizeCanvas() {
    // Method to resize container proportional to window dimensions
    this.container
      .attr("width", window.innerWidth * 0.7)
      .attr("height", window.innerHeight);

    this.identityTransform = d3.zoomIdentity.translate(
      this.container.attr("width") / 2,
      this.container.attr("height") / 2,
    );
  }

  maxLineLength() {
    // Helper to get max line length in the input
    return Math.max(
      ...this.words.map((line) => {
        let total_phones = 0;
        for (const word of line) {
          total_phones += word.phones.length;
        }
        return total_phones;
      }),
    );
  }

  updatePositions() {
    // Calculate and assing positions for each phoneme according to the chosen graph mode

    const line_shift = 50; // Space Between 2 lines
    this.lineStartHeights = [];

    // Radial plot
    if (this.graphState == "radial") {
      const total_line_count = this.words.length;

      const phone_spacing = 0.2;

      const max_line_length = this.maxLineLength();
      // Determine an initial radius so that the largest line can fit the smallest perimeter
      const initial_radius =
        5 * max_line_length + total_line_count * line_shift + 10;

      for (const [lineIndex, line] of this.words.entries()) {
        let phone_count = 0;
        const radius = initial_radius - lineIndex * line_shift;
        this.lineStartHeights.push(lineIndex * line_shift - initial_radius);

        for (const [wordIndex, word] of line.entries()) {
          // Calculate the phone position in polar coordinates
          const angle_shift = Math.PI / (radius * phone_spacing);
          const word_shift = wordIndex * 2 * angle_shift;

          for (const phone of word.phones) {
            let angle = phone_count * angle_shift - Math.PI / 2 + word_shift;
            // Switch to cartesian coordinates and assign positions to phonemes
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);

            phone.assignPosition(x, y);

            phone_count++;
          }
        }
      }
    }

    // Linear plot
    if (this.graphState == "linear") {
      const phone_spacing = 14;

      for (const [lineIndex, line] of this.words.entries()) {
        let phone_count = 0;
        const y = lineIndex * line_shift; // end of line shift in y
        this.lineStartHeights.push(y);

        for (const [wordIndex, word] of line.entries()) {
          const word_shift = wordIndex * 2 * phone_spacing;

          for (const phone of word.phones) {
            const x = phone_count * phone_spacing + word_shift; // Shift in x to seperate phones and words

            phone.assignPosition(x, y);

            phone_count++;
          }
        }
      }
    }
  }

  graphMode(mode) {
    // Method to change graph state

    this.graphState = mode;
    this.updatePositions();
    this.resetView();
    this.renderGraph();
  }

  inputData(lexicon, word_array, rhyme_paths) {
    // Method to input data to the visualization

    this.rhyme_paths = rhyme_paths.reverse(); // The array comes sorted from longest to shortest from the backend it is visually cleaner to draw the shortest first
    this.words = [];
    this.maxPathLength = Math.max(...rhyme_paths.map((path) => path.length)); // Determine the max path length

    for (const line of word_array) {
      let line_object_array = [];

      for (const word of line) {
        const phones = lexicon[word];
        // For each word create phonemes
        let phone_array = [];
        for (const sound of phones) {
          let phone = new Phone(sound);
          phone_array.push(phone);
        }
        // Determine phonemes from the stress to end
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
        // Construct a word object
        let word_obj = new Word(word, phone_array, stress_to_end);
        line_object_array.push(word_obj);
      }
      this.words.push(line_object_array);
    }
    // Call onDataChanged calbacks
    for (const callback of this.onDataChanged) {
      callback();
    }
    // update or assign positions reset view and render graph
    this.updatePositions();
    this.resetView();
    this.renderGraph();
  }

  calculateRhymePosition(phones, dim) {
    // method to find the avarage position of phonemes present in a set of phones. Used to draw paths between rhyming phones
    if (dim == "x") {
      return phones.reduce((sum, phone) => sum + phone.x, 0) / phones.length;
    }
    if (dim == "y") {
      return phones.reduce((sum, phone) => sum + phone.y, 0) / phones.length;
    }
  }

  createSvgPath(target_words) {
    // method to draw the rhyme path (probably will need refactoring at one point)

    // Calcualte the position of the first point
    const first_target = target_words[0];
    const start_phonemes =
      this.words[first_target[0]][first_target[1]].stress_to_end;
    var last_x = this.calculateRhymePosition(start_phonemes, "x");
    var last_y = this.calculateRhymePosition(start_phonemes, "y");

    //SVG path segment. More info: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths
    var path = `M ${last_x},${last_y}`;

    // For each word beyond the first
    for (const target of target_words.slice(1)) {
      // Get stress the end and phoneme midpoint
      const target_phonemes = this.words[target[0]][target[1]].stress_to_end;
      const x = this.calculateRhymePosition(target_phonemes, "x");
      const y = this.calculateRhymePosition(target_phonemes, "y");

      // Determine the position of the control point

      //Calculate the vector difference between 2 points
      const dx = last_x - x;
      const dy = last_y - y;
      // Determine the amplitude of the curve relative to the distance of endpoints
      const amplitude = 50 + 0.5 * Math.hypot(dx, dy);
      // Find the perpendicular vector to the [dx,dy]
      const perpendicular = {
        x: -dy / Math.hypot(dx, dy),
        y: dx / Math.hypot(dx, dy),
      };
      // Find the midpoint
      const mid = {
        x: (last_x + x) / 2,
        y: (last_y + y) / 2,
      };
      // Calculate the position of the control point
      const control_point = {
        x: mid.x + amplitude * perpendicular.x,
        y: mid.y + amplitude * perpendicular.y,
      };
      // Add a quadratic segment to the svg.
      path += ` Q ${control_point.x},${control_point.y} ${x},${y}`;
      // Update the last point
      last_x = x;
      last_y = y;
    }

    return path;
  }

  drawPaths() {
    // Method to draw rhyme paths

    // Create group per path
    const connections = this.rhymeGroup
      .selectAll("g.RhymePath")
      .data(this.rhyme_paths)
      .join("g")
      .attr("class", "RhymePath")
      .attr("data-path_length", (path) => path.length);

    // Draw the paths between endpoints
    connections
      .selectAll("path")
      .data((targets) => [targets])
      .join("path")
      .attr("class", "PathTargetConnection")
      .attr("d", (targets) => this.createSvgPath(targets))
      .attr("stroke", function () {
        const connectionLength = d3.select(this.parentNode).datum().length;
        return `hsla(from var(--rhyme_path_color) h ${Math.min(connectionLength * 10, 100)}% l / alpha)`; // Saturation of the path depends on its length
      });

    connections //Draw Background colored circles at endpoints to hide intersections
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

    connections // Draw the circles at the endpoints
      .selectAll("circle.PathTarget")
      .data((target) => target)
      .join("circle")
      .attr("class", "PathTarget")
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
      )
      .attr("stroke", function () {
        const connectionLength = d3.select(this.parentNode).datum().length;
        return `hsla(from var(--rhyme_path_color) h ${Math.min(connectionLength * 10, 100)}% l / alpha)`;
      });
  }

  drawPhonemes() {
    // Draw phonemes
    this.phonemeGroup
      .selectAll("circle.Phoneme")
      .data(this.words.flat().flatMap((word) => word.phones))
      .join("circle")
      .attr("class", "Phoneme")
      .attr("cx", (phone) => phone.x)
      .attr("cy", (phone) => phone.y)
      .attr(
        "r",
        (phone) => (phone.primaryStress ? 7 : phone.secondaryStress ? 5 : 3), // phoneme size is determined by stress on the phoneme
      );
  }

  drawLineNumbers() {
    // Method to draw Line numbers and dividers

    // Constants related to render positions
    const lineNumberX = -60;
    const lineNumberDividerExtenstion = 25;
    const horizontalDividerShift = 10;
    const verticalDividerShift = 30;

    this.lineNumberGroup
      .selectAll(".LineNumber")
      .data(this.lineStartHeights) // Start heights are set by input positions it is an array containing the height of every line
      .join("text")
      .attr("class", "LineNumber")
      .attr("x", String(lineNumberX))
      .attr("y", (data) => data)
      .text((data) => this.lineStartHeights.indexOf(data) + 1);

    this.lineNumberGroup
      .selectAll(".LineNumberDivider")
      .data(this.lineStartHeights.slice(1)) // there are 1 less divider per line because they are in between lines
      .join("line")
      .attr("class", "LineNumberDivider")
      .attr("x1", String(lineNumberX + horizontalDividerShift))
      .attr("x2", String(lineNumberX / 2 + horizontalDividerShift))
      .attr("y1", (data) => String(data - verticalDividerShift))
      .attr("y2", (data) => String(data - verticalDividerShift));

    this.lineNumberGroup
      .append("line")
      .attr("x1", String(lineNumberX / 2))
      .attr("x2", String(lineNumberX / 2))
      .attr(
        "y1",
        String(this.lineStartHeights[0] - lineNumberDividerExtenstion),
      )
      .attr(
        "y2",
        String(this.lineStartHeights.at(-1) + lineNumberDividerExtenstion),
      )
      .attr("class", "LineNumberDivider"); // The appended horizontal line has the same class as vertical dividers to sync the removal of the appended line when new data is joined
  }

  renderGraph() {
    // render calls
    this.drawPaths();
    this.drawPhonemes();
    this.drawLineNumbers();
  }

  resetView() {
    // helper to reset view
    this.container.call(this.zoom.transform, this.identityTransform);
  }

  filter(filter_set) {
    // For each path evaluates each filter if any return false sets display to none
    this.rhymeGroup.selectAll(".RhymePath").style("display", (path) => {
      for (const filter of filter_set) {
        if (!filter(path)) {
          return "none";
        }
      }

      return null;
    });
  }

  getSvgElement() {
    // Getter for the svg node
    return d3.select("svg").node();
  }
}

class Phone {
  // Helper class to represent phonemes
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
  // Helper class to represnet words and store its phonemes
  constructor(text, phones, stress_to_end) {
    this.text = text;
    this.phones = phones;
    this.stress_to_end = stress_to_end;
  }
}
