from phonemizer.backend import EspeakBackend
from phonemizer.punctuation import Punctuation
from phonemizer.separator import Separator

def get_available_languages():
    return EspeakBackend.is_available()

def generate_word_occurance_array(text):

    lines = []
    for line in text.splitlines():
        line = Punctuation(';:,.!"?()-—/').remove(line)
        line = [word.lower() for word in line.split()]
        if line:
            lines.append(line)

    return lines

def phonemizeWord(word, language):
    
    backend = EspeakBackend(language, with_stress=True)
    separator =Separator(phone=' ',word=None)
    phones = backend.phonemize([word],separator=separator,strip=True)
    phones = tuple(phone for phone in phones[0].split(' '))

    return phones

def phonemize_text(text, language):

    word_array = generate_word_occurance_array(text)
    words = set([word for line in word_array for word in line])
    
    lexicon = {word: phonemizeWord(word, language) for word in words}

    return lexicon, word_array

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
 

    phonemize_text(text,"en-us")