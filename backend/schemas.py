# backend/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Базовая схема для цитаты
class QuoteBase(BaseModel):
    text: str
    author: str

# Схема для создания новой цитаты (данные из запроса)
class QuoteCreate(QuoteBase):
    pass

# Схема для обновления цитаты (все поля опциональны)
class QuoteUpdate(BaseModel):
    text: Optional[str] = None
    author: Optional[str] = None

# Схема для отображения цитаты (данные из БД, включая id и created_at)
class Quote(QuoteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # Раньше было orm_mode = True