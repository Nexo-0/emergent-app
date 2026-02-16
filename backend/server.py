from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== DATA MODELS ====================

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    image_url: str
    display_order: int = 0
    active: bool = True


class CategoryCreate(BaseModel):
    name: str
    description: str
    image_url: str
    display_order: int = 0


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category_id: str
    image_url: str
    in_stock: bool = True
    active: bool = True


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: str
    image_url: str


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"ORD-{uuid.uuid4().hex[:8].upper()}")
    items: List[OrderItem]
    subtotal: float
    tax: float
    total: float
    payment_method: str
    status: str = "completed"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderCreate(BaseModel):
    items: List[OrderItem]
    subtotal: float
    tax: float
    total: float
    payment_method: str


# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Kiosk System API Ready"}


# Categories Endpoints
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all active categories ordered by display_order"""
    categories = await db.categories.find(
        {"active": True}, 
        {"_id": 0}
    ).sort("display_order", 1).to_list(100)
    return categories


@api_router.post("/categories", response_model=Category)
async def create_category(category_input: CategoryCreate):
    """Create a new category"""
    category = Category(**category_input.model_dump())
    doc = category.model_dump()
    await db.categories.insert_one(doc)
    return category


# Products Endpoints
@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None):
    """Get all products, optionally filtered by category"""
    query = {"active": True}
    if category_id:
        query["category_id"] = category_id
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@api_router.post("/products", response_model=Product)
async def create_product(product_input: ProductCreate):
    """Create a new product"""
    product = Product(**product_input.model_dump())
    doc = product.model_dump()
    await db.products.insert_one(doc)
    return product


# Orders Endpoints
@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    """Create a new order"""
    order = Order(**order_input.model_dump())
    doc = order.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get an order by ID"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Convert timestamp back to datetime if needed
    if isinstance(order['timestamp'], str):
        order['timestamp'] = datetime.fromisoformat(order['timestamp'])
    
    return order


@api_router.get("/orders", response_model=List[Order])
async def get_orders(limit: int = 50):
    """Get recent orders"""
    orders = await db.orders.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Convert timestamps
    for order in orders:
        if isinstance(order['timestamp'], str):
            order['timestamp'] = datetime.fromisoformat(order['timestamp'])
    
    return orders


# Seed Data Endpoint (for development)
@api_router.post("/seed-data")
async def seed_data():
    """Seed the database with sample categories and products"""
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.products.delete_many({})
    
    # Categories with images
    categories_data = [
        {
            "name": "Fast Food",
            "description": "Burgers, fries, and hot sandwiches",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxidXJnZXJ8ZW58MHx8fHwxNzcxMjM2MzQ3fDA&ixlib=rb-4.1.0&q=85",
            "display_order": 1
        },
        {
            "name": "Beverages",
            "description": "Coffee, soft drinks, and juices",
            "image_url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxjb2ZmZWV8ZW58MHx8fHwxNzcxMjM2MzUwfDA&ixlib=rb-4.1.0&q=85",
            "display_order": 2
        },
        {
            "name": "Snacks",
            "description": "Chips, candy, and quick bites",
            "image_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxjaGlwc3xlbnwwfHx8fDE3NzEyMzYzNTR8MA&ixlib=rb-4.1.0&q=85",
            "display_order": 3
        },
        {
            "name": "Electronics",
            "description": "Headphones, chargers, and accessories",
            "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxoZWFkcGhvbmVzfGVufDB8fHx8MTc3MTIzNjM1OHww&ixlib=rb-4.1.0&q=85",
            "display_order": 4
        },
        {
            "name": "Personal Care",
            "description": "Toiletries and hygiene products",
            "image_url": "https://images.unsplash.com/photo-1622866027662-14e3c5ee67e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwyfHx0b2lsZXRyaWVzfGVufDB8fHx8MTc3MTIzNjM2M3ww&ixlib=rb-4.1.0&q=85",
            "display_order": 5
        },
        {
            "name": "Breakfast",
            "description": "Pastries, bagels, and morning favorites",
            "image_url": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwzfHxwYXN0cnl8ZW58MHx8fHwxNzcxMjM2MzY3fDA&ixlib=rb-4.1.0&q=85",
            "display_order": 6
        }
    ]
    
    # Insert categories and store IDs
    category_ids = {}
    for cat_data in categories_data:
        category = Category(**cat_data)
        doc = category.model_dump()
        await db.categories.insert_one(doc)
        category_ids[cat_data["name"]] = category.id
    
    # Products with images
    products_data = [
        # Fast Food
        {"name": "Classic Burger", "description": "Beef patty with lettuce, tomato, and cheese", "price": 8.99, "category": "Fast Food", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxidXJnZXJ8ZW58MHx8fHwxNzcxMjM2MzQ3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Cheeseburger", "description": "Double cheese with special sauce", "price": 9.99, "category": "Fast Food", "image_url": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwzfHxidXJnZXJ8ZW58MHx8fHwxNzcxMjM2MzQ3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Veggie Burger", "description": "Plant-based patty with fresh vegetables", "price": 8.49, "category": "Fast Food", "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHw0fHxidXJnZXJ8ZW58MHx8fHwxNzcxMjM2MzQ3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Chicken Sandwich", "description": "Crispy chicken with mayo and pickles", "price": 7.99, "category": "Fast Food", "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHxidXJnZXJ8ZW58MHx8fHwxNzcxMjM2MzQ3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "French Fries", "description": "Crispy golden fries with sea salt", "price": 3.99, "category": "Fast Food", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxidXJnZXJ8ZW58MHx8fHwxNzcxMjM2MzQ3fDA&ixlib=rb-4.1.0&q=85"},
        
        # Beverages
        {"name": "Premium Coffee", "description": "Freshly brewed arabica coffee", "price": 3.49, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxjb2ZmZWV8ZW58MHx8fHwxNzcxMjM2MzUwfDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Latte", "description": "Espresso with steamed milk", "price": 4.49, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxjb2ZmZWV8ZW58MHx8fHwxNzcxMjM2MzUwfDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Cola", "description": "Classic carbonated soft drink", "price": 2.49, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1625740822008-e45abf4e01d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxzb2Z0JTIwZHJpbmtzfGVufDB8fHx8MTc3MTIzNjM3MXww&ixlib=rb-4.1.0&q=85"},
        {"name": "Orange Juice", "description": "Freshly squeezed orange juice", "price": 3.99, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwZHJpbmtzfGVufDB8fHx8MTc3MTIzNjM3MXww&ixlib=rb-4.1.0&q=85"},
        {"name": "Iced Tea", "description": "Refreshing lemon iced tea", "price": 2.99, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHxjb2ZmZWV8ZW58MHx8fHwxNzcxMjM2MzUwfDA&ixlib=rb-4.1.0&q=85"},
        
        # Snacks
        {"name": "Potato Chips", "description": "Classic salted potato chips", "price": 2.49, "category": "Snacks", "image_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxjaGlwc3xlbnwwfHx8fDE3NzEyMzYzNTR8MA&ixlib=rb-4.1.0&q=85"},
        {"name": "Tortilla Chips", "description": "Crispy corn tortilla chips", "price": 2.99, "category": "Snacks", "image_url": "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxjaGlwc3xlbnwwfHx8fDE3NzEyMzYzNTR8MA&ixlib=rb-4.1.0&q=85"},
        {"name": "Cheese Puffs", "description": "Cheesy flavored snack puffs", "price": 2.29, "category": "Snacks", "image_url": "https://images.unsplash.com/photo-1617102738820-bee2545405fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxjaGlwc3xlbnwwfHx8fDE3NzEyMzYzNTR8MA&ixlib=rb-4.1.0&q=85"},
        {"name": "Candy Bar", "description": "Chocolate and caramel candy bar", "price": 1.99, "category": "Snacks", "image_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxjaGlwc3xlbnwwfHx8fDE3NzEyMzYzNTR8MA&ixlib=rb-4.1.0&q=85"},
        
        # Electronics
        {"name": "Wireless Headphones", "description": "Bluetooth over-ear headphones", "price": 49.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxoZWFkcGhvbmVzfGVufDB8fHx8MTc3MTIzNjM1OHww&ixlib=rb-4.1.0&q=85"},
        {"name": "Earbuds", "description": "Compact wireless earbuds", "price": 29.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzfGVufDB8fHx8MTc3MTIzNjM1OHww&ixlib=rb-4.1.0&q=85"},
        {"name": "Phone Charger", "description": "Fast charging USB-C cable", "price": 14.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1725304382197-663ae3864750?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwzfHxwaG9uZSUyMGNoYXJnZXJ8ZW58MHx8fHwxNzcxMjM2Mzc1fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Portable Speaker", "description": "Bluetooth portable speaker", "price": 39.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxoZWFkcGhvbmVzfGVufDB8fHx8MTc3MTIzNjM1OHww&ixlib=rb-4.1.0&q=85"},
        
        # Personal Care
        {"name": "Hand Sanitizer", "description": "Antibacterial hand sanitizer gel", "price": 3.99, "category": "Personal Care", "image_url": "https://images.unsplash.com/photo-1622866027662-14e3c5ee67e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwyfHx0b2lsZXRyaWVzfGVufDB8fHx8MTc3MTIzNjM2M3ww&ixlib=rb-4.1.0&q=85"},
        {"name": "Toothbrush Kit", "description": "Travel toothbrush with toothpaste", "price": 5.99, "category": "Personal Care", "image_url": "https://images.unsplash.com/photo-1603990103103-baf3ada7af1c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHx0b2lsZXRyaWVzfGVufDB8fHx8MTc3MTIzNjM2M3ww&ixlib=rb-4.1.0&q=85"},
        {"name": "Face Wipes", "description": "Refreshing cleansing wipes", "price": 4.49, "category": "Personal Care", "image_url": "https://images.unsplash.com/photo-1622866027662-14e3c5ee67e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwyfHx0b2lsZXRyaWVzfGVufDB8fHx8MTc3MTIzNjM2M3ww&ixlib=rb-4.1.0&q=85"},
        {"name": "Deodorant", "description": "24-hour protection deodorant", "price": 6.99, "category": "Personal Care", "image_url": "https://images.unsplash.com/photo-1603990103103-baf3ada7af1c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHx0b2lsZXRyaWVzfGVufDB8fHx8MTc3MTIzNjM2M3ww&ixlib=rb-4.1.0&q=85"},
        
        # Breakfast
        {"name": "Croissant", "description": "Buttery flaky croissant", "price": 3.49, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwzfHxwYXN0cnl8ZW58MHx8fHwxNzcxMjM2MzY3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Blueberry Muffin", "description": "Fresh baked blueberry muffin", "price": 2.99, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1620980776848-84ac10194945?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHw0fHxwYXN0cnl8ZW58MHx8fHwxNzcxMjM2MzY3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Bagel", "description": "Plain bagel with cream cheese", "price": 3.99, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxwYXN0cnl8ZW58MHx8fHwxNzcxMjM2MzY3fDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Danish Pastry", "description": "Sweet fruit-filled danish", "price": 3.29, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwzfHxwYXN0cnl8ZW58MHx8fHwxNzcxMjM2MzY3fDA&ixlib=rb-4.1.0&q=85"},
    ]
    
    # Insert products
    for prod_data in products_data:
        category_name = prod_data.pop("category")
        prod_data["category_id"] = category_ids[category_name]
        product = Product(**prod_data)
        doc = product.model_dump()
        await db.products.insert_one(doc)
    
    return {
        "message": "Database seeded successfully",
        "categories": len(categories_data),
        "products": len(products_data)
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
