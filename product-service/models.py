from sqlalchemy import Column, Integer, String, Float
from database import Base

class Product(Base):
    __tablename__ = "products"
    __table_args__ = {'schema': 'product_schema'}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String, index=True)
