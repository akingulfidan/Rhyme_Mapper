from phonemizer.backend import EspeakBackend
from phonemizer.punctuation import Punctuation
from phonemizer.separator import Separator


def get_available_languages() -> list[str]:
    return EspeakBackend.supported_languages()


def init_backend(language: str) -> EspeakBackend:
    backend = EspeakBackend(language, with_stress=True)
    return backend


def generate_word_occurance_array(text: str) -> list[list[str]]:
    lines = []
    for line in text.splitlines():
        line = Punctuation(';:,.!"”?()-—/').remove(line)
        line = [word.lower() for word in line.split()]
        lines.append(line)

    return lines


def phonemizeWord(
    word: str, backend: EspeakBackend, separator: Separator
) -> tuple[str, ...]:

    phones = backend.phonemize([word], separator=separator, strip=True)
    phones = tuple(phone for phone in phones[0].split(" "))

    return phones


def phonemize_text(
    word_array: list[list[str]], backend: EspeakBackend, separator: Separator
) -> dict[str, tuple[str, ...]]:

    word_array_flat = [word for line in word_array for word in line]
    words = set(word_array_flat)

    lexicon = {word: phonemizeWord(word, backend, separator) for word in words}

    return lexicon


def stress_to_end(phones: tuple[str, ...]) -> tuple[str, ...]:
    for phone in reversed(phones):
        if "ˈ" in phone:
            index = phones.index(phone)
            return phones[index:]
    for phone in reversed(phones):
        if "ˌ" in phone:
            index = phones.index(phone)
            return phones[index:]


def check_rhyme(phones1: tuple[str, ...], phones2: tuple[str, ...]) -> bool:
    return bool(
        stress_to_end(phones1) == stress_to_end(phones2) and stress_to_end(phones1)
    )


def find_rhyme(
    start_index: int,
    word_array: list[list[str]],
    lexicon: dict[str, tuple[str, ...]],
    window_length: int,
    path_array: list,
) -> list[list[int]]:

    first_phone = lexicon[word_array[start_index]]
    for shift in range(1, window_length + 1):
        try:
            second_phone = lexicon[word_array[start_index + shift]]
        except IndexError:
            return path_array

        if check_rhyme(first_phone, second_phone):
            path_array.append(start_index + shift)
            return find_rhyme(
                start_index + shift, word_array, lexicon, window_length, path_array
            )

    return path_array


def remove_contained_lists(lists: list[list[int]]) -> list[list[int]]:
    sorted_lists = sorted(lists, key=len, reverse=True)

    result = []
    sets_in_result = []

    for lst in sorted_lists:
        s = set(lst)

        if not any(s.issubset(other) for other in sets_in_result):
            result.append(lst)
            sets_in_result.append(s)

    return result


def flat_to_2d_array(flat_index: int, word_array: list[list[str]]) -> tuple[int, int]:
    for row_index, row in enumerate(word_array):
        if flat_index < len(row):
            return row_index, flat_index

        flat_index -= len(row)


def generate_rhyme_paths(
    lexicon: dict[str, tuple[str, ...]], word_array: list[list[str]]
) -> list[list[tuple[int, int]]]:

    word_array_flat = [word for line in word_array for word in line]
    rhyme_paths = []

    for index in range(len(word_array_flat)):
        rhyme_path = find_rhyme(index, word_array_flat, lexicon, 25, [])
        if rhyme_path:
            rhyme_path.insert(0, index)
            rhyme_paths.append(rhyme_path)
    cleaned = remove_contained_lists(rhyme_paths)

    map_2d = []
    for path in cleaned:
        new_path = []
        for index in path:
            index_2d = flat_to_2d_array(index, word_array)
            new_path.append(index_2d)
        map_2d.append(new_path)

    return map_2d
