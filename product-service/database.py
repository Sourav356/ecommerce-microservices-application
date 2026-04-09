from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "Sourav%4026")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ecommerce")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Using product_schema to isolate DB tables for this microservice
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"options": "-csearch_path=product_schema"}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
