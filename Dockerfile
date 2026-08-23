FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng

COPY pyproject.toml . 
COPY uv.lock .

RUN pip install uv
RUN uv sync --frozen --no-dev

copy . .
EXPOSE 8000

CMD ["uv", "run", "fastapi", "run", "src/backend/main.py", "--host", "0.0.0.0", "--port", "8000"]