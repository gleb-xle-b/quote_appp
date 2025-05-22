# backend/crud.py
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func # для func.random() или func.rand()
import models, schemas

# Получить цитату по ID
def get_quote(db: Session, quote_id: int):
    return db.query(models.Quote).filter(models.Quote.id == quote_id).first()

# Получить список всех цитат с пагинацией
def get_quotes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Quote).offset(skip).limit(limit).all()

# Создать новую цитату
def create_quote(db: Session, quote: schemas.QuoteCreate):
    db_quote = models.Quote(text=quote.text, author=quote.author)
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote

# Обновить существующую цитату
def update_quote(db: Session, quote_id: int, quote_update: schemas.QuoteUpdate):
    db_quote = get_quote(db, quote_id)
    if db_quote:
        update_data = quote_update.model_dump(exclude_unset=True) # model_dump вместо dict
        for key, value in update_data.items():
            setattr(db_quote, key, value)
        db.commit()
        db.refresh(db_quote)
    return db_quote

# Удалить цитату
def delete_quote(db: Session, quote_id: int):
    db_quote = get_quote(db, quote_id)
    if db_quote:
        db.delete(db_quote)
        db.commit()
    return db_quote

# Получить случайную цитату
def get_random_quote(db: Session):
    # Используем func.rand() для MySQL, так как database.py настроен на MySQL
    return db.query(models.Quote).order_by(func.rand()).first()

# Поиск цитат по автору или тексту
def search_quotes(db: Session, query: str):
    search = f"%{query}%"
    return db.query(models.Quote).\
        filter(models.Quote.text.like(search) | models.Quote.author.like(search)).\
        all()