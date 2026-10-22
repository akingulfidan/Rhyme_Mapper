/* 
JS module for filter functions

Each functions returns a function such that:
Rhyme Path => Bool
The wrapper function is necessary for the event listener on input to embed different parameters to the function that is evaluated when rhymegraph.filter() is called 

Rhyme Graph class takes a set of active filters. When the dataset is filtered only paths that return true for each function is rendered.
*/

export function min_length_filter(min_length) {
  // Filters for paths longer than given lenght
  return (path) => path.length >= min_length;
}

export function max_length_filter(max_length) {
  // Filters for paths shorter than given lenght
  return (path) => path.length <= max_length;
}
