from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from phoneme_analysis import (
    generate_rhyme_paths,
    generate_word_occurance_array,
    get_available_languages,
    init_backend,
    phonemize_text,
)
from phonemizer.separator import Separator
from pydantic import BaseModel

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
    

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")