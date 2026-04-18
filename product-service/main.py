from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from database import engine, Base, SessionLocal
import models
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

app = FastAPI()

# Pydantic schemas for request validation
class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

@app.on_event("startup")
def startup_event():
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS product_schema"))
        conn.commit()

    Base.metadata.create_all(bind=engine)
    # 💥 Dummy seeding removed for Production Real World mode
    print("✅ Product Service DB Schema initialized. Ready for Admin inputs.")

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

# --- ADMIN ENDPOINTS ---

@app.post("/api/products", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = models.Product(
        title=product.title,
        description=product.description,
        price=product.price,
        category=product.category,
        image_url=product.image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/api/products/{product_id}")
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return None