import uvicorn


def main():
    uvicorn.run("rhyme_mapper.main:app", host="0.0.0.0", port=8000)