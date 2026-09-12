from fastapi import FastAPI

from app.database import Base, engine
from app.models.user import User
from app.models.category import Category
from app.models.budget import Budget
from app.models.expense import Expense

from app.routers import auth,category,budget,expense

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(category.router)
app.include_router(budget.router)
app.include_router(expense.router)