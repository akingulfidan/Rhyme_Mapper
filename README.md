# Rhyme Mapper

Rhyme Mapper is a tool for visually exploring the phonetic structure and rhyme patterns of text, with a focus on poetry.

![screenshot](assets/readme_photo.png)


The tool generates a phonetic representation of a poem where each phoneme is drawn as a circle. Phoneme size is used to indicate stress, with different sizes representing primary and secondary stress.

Using phoneme sequences, the tool detects chains of rhyming words and represents the chains as paths connecting the drawn phonemes.

Rhyme Mapper supports [127 languages](https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md) supported by espeak-ng.

The project is ongoing and still in its early stages.

## Installation

### Pip

> [!NOTE]
> Rhyme mapper requires espeak-ng to work. Installation guide can be found [here](https://github.com/espeak-ng/espeak-ng/blob/master/docs/guide.md#installation).

```sh
pip install rhyme-mapper
```
Launch Rhyme Mapper:
```sh
rhyme-mapper
```
Rhyme Mapper is accessible at http://localhost:8000
### Docker

```sh
# Start the container
docker run -p 8000:8000 akingulfidan/rhyme-mapper:latest 
```
Rhyme Mapper is accessible at http://localhost:8000
## Usage
1. Enter or paste your text.
2. Select the language.
3. Generate the rhyme graph.
4. Use the chain-length slider to filter the displayed rhyme paths.
5. Drag the graph to move it and scroll to zoom.

## Roadmap

### Short Term :

- [ ] Allow selecting phones in the visualization
- [ ] Display information on selected words and phones
- [ ] Line numbers on the text area and the visualization.
- [ ] Better rhyme path filtering tools.
- [ ] Improve documentation.
- [ ] Publish package to PyPI.

### Long Term:

- [ ] Add detection for non-perfect rhymes.
- [ ] Highlight stress patterns in the visualization and display measure.
- [ ] Rhyme Scheme detection.

## Attributions

Phonemization in Rhyme Mapper is done using [Phonemizer](https://github.com/bootphon/phonemizer) library.

```bibtex
@article{Bernard2021,
doi = {10.21105/joss.03958},
url = {https://doi.org/10.21105/joss.03958},
year = {2021},
publisher = {The Open Journal},
volume = {6},
number = {68},
pages = {3958},
author = {Mathieu Bernard and Hadrien Titeux},
title = {Phonemizer: Text to Phones Transcription for Multiple Languages in Python},
journal = {Journal of Open Source Software}
}
```
## License

[GNU Affero General Public License v3.0](LICENSE)