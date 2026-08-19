from fastapi import FastAPI
from pydantic import BaseModel

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = FastAPI()


class userInput(BaseModel):
    input_text: str


@app.post("/generate")
async def generatePhonemeGraph(userInput: userInput):
    print(userInput.input_text)
    return {"message": "Hello Back"}
    

app.frontend("/", directory=FRONTEND_DIR, fallback="index.html")
