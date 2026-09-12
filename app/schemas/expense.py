from pydantic import BaseModel
from decimal import Decimal
from datetime import date, datetime
from typing import Optional


class ExpenseIn(BaseModel):
    category_id: int
    amount: Decimal
    description: Optional[str] = None
    date: date


class ExpenseOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    description: Optional[str] = None
    date: date
    created_at: datetime

    class Config:
        from_attributes = True