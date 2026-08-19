from phonemizer.backend import EspeakBackend
from phonemizer.punctuation import Punctuation
from phonemizer.separator import Separator

def get_available_languages():
    return EspeakBackend.is_available()

def init_backend(language):

    backend = EspeakBackend(language, with_stress=True)
    separator = Separator(phone=' ',word=None)

    return backend, separator

def generate_word_occurance_array(text):

    lines = []
    for line in text.splitlines():
        line = Punctuation(';:,.!"?()-—/').remove(line)
        line = [word.lower() for word in line.split()]
        if line:
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

def phonemize_text(text, backend, separator):

    word_array_2d = generate_word_occurance_array(text)
    position_map = text_position_map(word_array_2d)
    word_array = [word for line in word_array_2d for word in line]
    words = set(word_array)
    
    lexicon = {word: phonemizeWord(word, backend, separator) for word in words}

    return lexicon, word_array, position_map

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
        return True
    else:
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

def generate_rhyme_paths(lexicon, word_array):
    rhyme_paths = []

    for index in range(len(word_array)):
        rhyme_path = find_rhyme(index,word_array,lexicon,10,[])
        if rhyme_path:
            rhyme_path.insert(0,index)
            rhyme_paths.append(rhyme_path)
    cleaned = remove_contained_lists(rhyme_paths)
    return cleaned

if __name__ == '__main__':
    text = '''
    No rays from the holy Heaven come down
    On the long night-time of that town;
    But light from out the lurid sea
    Streams up the turrets silently—
    Gleams up the pinnacles far and free—
    Up domes—up spires—up kingly halls—
    Up fanes—up Babylon-like walls—
    Up shadowy long-forgotten bowers
    Of sculptured ivy and stone flowers—
    Up many and many a marvellous shrine
    Whose wreathed friezes intertwine
    The viol, the violet, and the vine.
    Resignedly beneath the sky
    The melancholy waters lie.
    So blend the turrets and shadows there
    That all seem pendulous in air,
    While from a proud tower in the town
    Death looks gigantically down.
    '''
 
    backend, separator = init_backend("en-us")
    lexicon, word_array, pos_map = phonemize_text(text,backend, separator)
    paths = generate_rhyme_paths(lexicon,word_array)
    print(word_array)
    print(pos_map)   
    print(paths)  
