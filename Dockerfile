FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install flask requests openai

CMD ["python", "backend/app.py"]