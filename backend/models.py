# backend/models.py
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    text = Column(Text, nullable=False)
    author = Column(String(255), nullable=False, index=True) # index=True для автора для ускорения поиска
    created_at = Column(TIMESTAMP, server_default=func.now())