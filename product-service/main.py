from fastapi import FastAPI, Depends
from database import engine, Base, SessionLocal
import models
from sqlalchemy.orm import Session
from sqlalchemy import text

# Create schema if it doesn't exist
with engine.connect() as conn:
    conn.execute(text("CREATE SCHEMA IF NOT EXISTS product_schema"))
    conn.commit()

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed Dummy Data
db: Session = SessionLocal()
try:
    if db.query(models.Product).count() == 0:
        products = [
            models.Product(title="Premium Headphones", description="Noise cancelling wireless headphones", price=299.99, category="Electronics"),
            models.Product(title="Mechanical Keyboard", description="RGB mechanical keyboard with cherry mx switches", price=149.99, category="Accessories"),
            models.Product(title="Ergonomic Mouse", description="Wireless ergonomic mouse", price=79.50, category="Accessories")
        ]
        db.add_all(products)
        db.commit()
        print("Seeded dummy products into product_schema")
except Exception as e:
    print(f"Skipping seed: {e}")
finally:
    db.close()

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "Product Service is healthy and connected to DB"}

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4003)
