from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
import os
import time

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS_RAW = os.getenv("DB_PASS", "Sourav@26")

# 🔥 Encode password (fix for @ issue)
DB_PASS = quote_plus(DB_PASS_RAW)

DB_HOST = os.getenv("DB_HOST", "postgres")  # default for Docker
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ecommerce")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"options": "-csearch_path=product_schema"}
)

# 🔥 Retry DB connection (important for Docker startup)
for i in range(5):
    try:
        conn = engine.connect()
        conn.close()
        print("✅ Connected to DB")
        break
    except Exception as e:
        print("⏳ DB not ready, retrying...", e)
        time.sleep(2)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()