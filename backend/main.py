# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware # Для разрешения запросов с Frontend
from sqlalchemy.orm import Session
from typing import List, Optional

import crud, models, schemas, external_fetcher
from database import SessionLocal, engine

# Создаем таблицы в БД (если их нет).
# В реальном проекте лучше использовать Alembic для миграций.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Система управления и отображения цитат выдающихся личностей",
    description="Веб-приложение на Python (FastAPI) и MySQL для работы с цитатами.",
    version="1.0.0"
)

# Настройка CORS (Cross-Origin Resource Sharing)
# Это позволит вашему frontend (который будет на другом порту/домене)
# отправлять запросы к backend.
origins = [
    "http://localhost",       # Если frontend и backend на одном домене, но разных портах
    "http://localhost:3000",  # Стандартный порт для React (create-react-app)
    "http://localhost:5173",  # Стандартный порт для Vite (React/Vue)
    "http://localhost:8080",  # Стандартный порт для Vue CLI
    # Добавьте сюда URL вашего frontend, если он будет другим
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Разрешенные источники
    allow_credentials=True, # Разрешить куки
    allow_methods=["*"],    # Разрешить все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],    # Разрешить все заголовки
)

# Зависимость для получения сессии БД
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API Цитат!"}

@app.post("/quotes/", response_model=schemas.Quote, summary="Добавить новую цитату", tags=["Quotes"])
def create_new_quote(quote: schemas.QuoteCreate, db: Session = Depends(get_db_session)):
    # Проверка, существует ли уже такая цитата от этого автора
    existing_quote = db.query(models.Quote).filter(models.Quote.text == quote.text, models.Quote.author == quote.author).first()
    if existing_quote:
        raise HTTPException(status_code=400, detail="Такая цитата этого автора уже существует")
    return crud.create_quote(db=db, quote=quote)

@app.get("/quotes/", response_model=List[schemas.Quote], summary="Получить список всех цитат", tags=["Quotes"])
def read_all_quotes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db_session)):
    quotes = crud.get_quotes(db, skip=skip, limit=limit)
    return quotes

@app.get("/quotes/random/", response_model=schemas.Quote, summary="Получить случайную цитату", tags=["Quotes"])
def read_random_quote(db: Session = Depends(get_db_session)):
    quote = crud.get_random_quote(db)
    if quote is None:
        raise HTTPException(status_code=404, detail="Цитаты не найдены")
    return quote

@app.get("/quotes/search/", response_model=List[schemas.Quote], summary="Поиск цитат по автору или тексту", tags=["Quotes"])
def search_existing_quotes(query: str = Query(..., min_length=1, description="Текст для поиска в цитатах или авторах"),
                           db: Session = Depends(get_db_session)):
    quotes = crud.search_quotes(db, query=query)
    if not quotes:
        # Если в локальной базе не найдено, можно сразу попытаться найти во внешнем источнике
        # Но это может замедлить ответ. Лучше, если это будет инициировано с фронтенда
        # или через отдельный эндпоинт /external/fetch
        pass
    return quotes

@app.get("/quotes/{quote_id}", response_model=schemas.Quote, summary="Получить цитату по ID", tags=["Quotes"])
def read_single_quote(quote_id: int, db: Session = Depends(get_db_session)):
    db_quote = crud.get_quote(db, quote_id=quote_id)
    if db_quote is None:
        raise HTTPException(status_code=404, detail="Цитата не найдена")
    return db_quote

@app.put("/quotes/{quote_id}", response_model=schemas.Quote, summary="Отредактировать цитату", tags=["Quotes"])
def update_existing_quote(quote_id: int, quote: schemas.QuoteUpdate, db: Session = Depends(get_db_session)):
    db_quote = crud.update_quote(db, quote_id=quote_id, quote_update=quote)
    if db_quote is None:
        raise HTTPException(status_code=404, detail="Цитата не найдена для обновления")
    return db_quote

@app.delete("/quotes/{quote_id}", response_model=schemas.Quote, summary="Удалить цитату", tags=["Quotes"])
def delete_existing_quote(quote_id: int, db: Session = Depends(get_db_session)):
    db_quote = crud.delete_quote(db, quote_id=quote_id)
    if db_quote is None:
        raise HTTPException(status_code=404, detail="Цитата не найдена для удаления")
    return db_quote

@app.get("/external/fetch/", summary="Получить цитату из интернета", tags=["External"])
async def fetch_quote_from_external(author: Optional[str] = None, query: Optional[str] = None):
    """
    Ищет цитату во внешнем источнике (например, Quotable API).
    Если цитата найдена, она возвращается. Frontend может предложить добавить её в базу.
    """
    if not author and not query:
        # Если ни автор, ни запрос не указаны, получаем случайную цитату из внешнего API
        fetched_data = external_fetcher.fetch_quote_from_quotable()
    else:
        fetched_data = external_fetcher.fetch_quote_from_quotable(author=author, query=query)

    if fetched_data and fetched_data.get("text") and fetched_data.get("author"):
        return {"text": fetched_data["text"], "author": fetched_data["author"], "source": "Quotable API"}
    else:
        raise HTTPException(status_code=404, detail="Цитата не найдена во внешнем источнике.")

# Для запуска: uvicorn backend.main:app --reload
# Убедитесь, что вы находитесь в папке quote_app/ (на один уровень выше backend/)