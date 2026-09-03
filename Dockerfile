FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng

COPY pyproject.toml . 
COPY uv.lock .

RUN pip install --no-cache-dir uv

COPY . .
RUN uv build && pip install dist/*.whl 

EXPOSE 8000

CMD ["rhyme-mapper"]