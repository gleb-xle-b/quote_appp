# test_db.py
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print("Connecting to:", url)

try:
    engine = create_engine(url)
    with engine.connect() as conn:
        print("✅ Успешно подключено к базе данных!")
except Exception as e:
    print("❌ Ошибка подключения:", e)
