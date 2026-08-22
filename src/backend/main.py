from fastapi import FastAPI
from pydantic import BaseModel

from pathlib import Path
import json 

from phoneme_analysis import get_available_languages, init_backend, generate_word_occurance_array, phonemize_text, generate_rhyme_paths
from phonemizer.separator import Separator

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = FastAPI()

separator = Separator(phone=' ',word=None)


class userInput(BaseModel):
    selected_lang: str
    input_text: str

@app.get("/lang")
async def get_supported_langs():
    return get_available_languages()

@app.post("/generate")
async def generate_phoneme_graph(user_input: userInput):

    backend = init_backend(user_input.selected_lang)
    word_array = generate_word_occurance_array(user_input.input_text)
    lexicon = phonemize_text(word_array, backend, separator)
    paths = generate_rhyme_paths(lexicon,word_array)
    
    data = {
        "lexicon": lexicon,
        "word_array": word_array,
        "paths":paths
    }
    return data
    

app.frontend("/", directory=FRONTEND_DIR, fallback="index.html")
