# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware # Для разрешения запросов с Frontend
from sqlalchemy.orm import Session
from typing import List, Optional

import crud, models, schemas # Обновленные абсолютные импорты
from database import SessionLocal, engine # Обновленный абсолютный импорт

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
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Разрешить все HTTP методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"], # Разрешить все заголовки
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Маршруты для работы с цитатами в собственной базе данных (CRUD) ---

@app.post("/quotes/", response_model=schemas.Quote, summary="Добавить новую цитату", tags=["Quotes"])
def create_quote(quote: schemas.QuoteCreate, db: Session = Depends(get_db)):
    """
    Добавляет новую цитату в базу данных.
    """
    return crud.create_quote(db=db, quote=quote)

@app.get("/quotes/", response_model=List[schemas.Quote], summary="Получить список всех цитат", tags=["Quotes"])
def read_quotes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Возвращает список всех цитат с пагинацией.
    """
    quotes = crud.get_quotes(db, skip=skip, limit=limit)
    return quotes

@app.get("/quotes/random/", response_model=schemas.Quote, summary="Получить случайную цитату", tags=["Quotes"])
def read_random_quote(db: Session = Depends(get_db)):
    """
    Возвращает случайную цитату из базы данных.
    """
    quote = crud.get_random_quote(db)
    if quote is None:
        raise HTTPException(status_code=404, detail="Цитаты не найдены в базе данных")
    return quote

@app.get("/quotes/{quote_id}", response_model=schemas.Quote, summary="Получить цитату по ID", tags=["Quotes"])
def read_quote(quote_id: int, db: Session = Depends(get_db)):
    """
    Возвращает цитату по ее уникальному идентификатору.
    """
    db_quote = crud.get_quote(db, quote_id=quote_id)
    if db_quote is None:
        raise HTTPException(status_code=404, detail="Цитата не найдена")
    return db_quote

@app.put("/quotes/{quote_id}", response_model=schemas.Quote, summary="Обновить цитату по ID", tags=["Quotes"])
def update_existing_quote(quote_id: int, quote_update: schemas.QuoteUpdate, db: Session = Depends(get_db)):
    """
    Обновляет существующую цитату по ее ID.
    Можно обновить текст или автора.
    """
    db_quote = crud.update_quote(db, quote_id=quote_id, quote_update=quote_update)
    if db_quote is None:
        raise HTTPException(status_code=404, detail="Цитата не найдена для обновления")
    return db_quote

@app.delete("/quotes/{quote_id}", summary="Удалить цитату по ID", tags=["Quotes"])
def delete_existing_quote(quote_id: int, db: Session = Depends(get_db)):
    """
    Удаляет цитату по ее ID.
    """
    db_quote = crud.delete_quote(db, quote_id=quote_id)
    if db_quote is None:
        raise HTTPException(status_code=404, detail="Цитата не найдена для удаления")
    return {"message": "Цитата успешно удалена", "id": quote_id} # Возвращаем сообщение об успехе

@app.get("/quotes/search/", response_model=List[schemas.Quote], summary="Поиск цитат в БД", tags=["Quotes"])
def search_quotes_in_db(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """
    Ищет цитаты в собственной базе данных по тексту или автору.
    """
    quotes = crud.search_quotes(db, query=query)
    if not quotes:
        raise HTTPException(status_code=404, detail="Цитаты по вашему запросу не найдены в базе данных.")
    return quotes