export function min_length_filter(min_length) {
  return (path) => path.length >= min_length;
}

export function max_length_filter(max_length) {
  return (path) => path.length <= max_length;
}
