from pydantic import BaseModel
from datetime import datetime, date
from decimal import Decimal


class BudgetCreate(BaseModel):
    category_id: int
    amount: Decimal
    month: date

class BudgetUpdate(BaseModel):
    amount: Decimal
    month: date

class BudgetOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    month: date
    created_at: datetime

    class Config:
        from_attributes = True