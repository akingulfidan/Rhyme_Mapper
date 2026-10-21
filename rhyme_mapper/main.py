import os
from importlib.metadata import version
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from phonemizer.separator import Separator
from pydantic import BaseModel

from rhyme_mapper.phoneme_analysis import (
    generate_rhyme_paths,
    generate_word_occurance_array,
    get_available_languages,
    init_backend,
    phonemize_text,
)

__version__ = version("rhyme_mapper")
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "static"
app = FastAPI()

separator = Separator(phone=" ", word=None)


class userInput(BaseModel):
    selected_lang: str
    input_text: str
    window_size: int


@app.get("/api/lang")
async def get_supported_langs():
    return get_available_languages()


@app.post("/api/generate")
async def generate_phoneme_graph(user_input: userInput):

    backend = init_backend(user_input.selected_lang)
    word_array = generate_word_occurance_array(user_input.input_text)
    lexicon = phonemize_text(word_array, backend, separator)
    paths = generate_rhyme_paths(lexicon, word_array, user_input.window_size)

    data = {"lexicon": lexicon, "word_array": word_array, "paths": paths}
    return data


@app.get("/api/version")
async def get_version():
    return __version__


SERVE_FRONTEND = os.getenv("SERVE_FRONTEND", "true").lower() == "true"
if SERVE_FRONTEND:
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
