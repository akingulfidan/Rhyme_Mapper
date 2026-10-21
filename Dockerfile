FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng nodejs npm

COPY pyproject.toml . 
COPY uv.lock .

RUN pip install --no-cache-dir uv

COPY . .

WORKDIR /app/frontend
RUN npm ci
RUN npm run build

WORKDIR /app
RUN uv build && pip install dist/*.whl 

EXPOSE 8000

CMD ["rhyme-mapper"]