from pydantic import BaseModel
from decimal import Decimal
from datetime import date


class BudgetComparisonOut(BaseModel):
    category_id: int
    month: date
    budgeted_amount: Decimal | None
    spent_amount: Decimal
    remaining: Decimal | None