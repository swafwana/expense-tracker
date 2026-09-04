from fastapi import FastAPI

from app.database import Base, engine
from app.models.user import User
from app.models.category import Category
from app.routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)