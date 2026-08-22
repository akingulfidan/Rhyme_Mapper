from phonemizer.backend import EspeakBackend
from phonemizer.punctuation import Punctuation

def get_available_languages():
    return EspeakBackend.supported_languages()

def init_backend(language):

    backend = EspeakBackend(language, with_stress=True)
    return backend

def generate_word_occurance_array(text):

    lines = []
    for line in text.splitlines():
        line = Punctuation(';:,.!"”?()-—/').remove(line)
        line = [word.lower() for word in line.split()]
        lines.append(line)

    return lines

def phonemizeWord(word,backend,separator):
    
    phones = backend.phonemize([word],separator=separator,strip=True)
    phones = tuple(phone for phone in phones[0].split(' '))

    return phones

def text_position_map(word_array):
    text_poisiton_map = {}
    line_number = 0
    index = 0
    for line in word_array:
        word_order = 0
        for word in line:
            text_poisiton_map[index] = (line_number, word_order)
            word_order += 1 
            index += 1
        line_number +=1

    return text_poisiton_map

def phonemize_text(word_array, backend, separator):

    word_array_flat = [word for line in word_array for word in line]
    words = set(word_array_flat)
    
    lexicon = {word: phonemizeWord(word, backend, separator) for word in words}

    return lexicon

def stress_to_end(phones):
    for phone in reversed(phones):
        if 'ˈ' in phone:
            index = phones.index(phone)
            return phones[index:]
    for phone in reversed(phones):
        if 'ˌ' in phone:
            index = phones.index(phone)
            return phones[index:]

def check_rhyme(phones1, phones2):
    if stress_to_end(phones1) == stress_to_end(phones2):
        if stress_to_end(phones1):
            return True
    return False

def find_rhyme(start_index, word_array, lexicon, window_length, path_array):
    
    first_phone = lexicon[word_array[start_index]]
    for shift in range(1,window_length+1):
        try:
            second_phone = lexicon[word_array[start_index+shift]]
        except IndexError:
            return path_array

        if check_rhyme(first_phone, second_phone):
            path_array.append(start_index+shift)
            return find_rhyme(start_index+shift, word_array,lexicon, window_length, path_array)

    return path_array        

def remove_contained_lists(lists):
    sorted_lists = sorted(lists, key=len, reverse=True)

    result = []
    sets_in_result = []

    for lst in sorted_lists:
        s = set(lst)

        if not any(s.issubset(other) for other in sets_in_result):
            result.append(lst)
            sets_in_result.append(s)

    return result

def flat_to_2d_array(flat_index, array_2d):
    for row_index, row in enumerate(array_2d):
        if flat_index < len(row):
            return row_index, flat_index

        flat_index -= len(row)

def generate_rhyme_paths(lexicon, word_array):
    word_array_flat = [word for line in word_array for word in line]
    rhyme_paths = []

    for index in range(len(word_array_flat)):
        rhyme_path = find_rhyme(index,word_array_flat,lexicon,25,[])
        if rhyme_path:
            rhyme_path.insert(0,index)
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


 

