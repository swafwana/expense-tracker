from sqlalchemy.orm import Session
from datetime import date
from app.models.budget import Budget
from app.models.expense import Expense
from app.services.category_service import get_category  # ownership check reused
from decimal import Decimal

def get_budget_comparison(db: Session, category_id: int, month: date, user_id: int) -> dict:
    # confirm the category is actually theirs - same reuse pattern as create_expense
    get_category(db, category_id, user_id)

    # normalize month down to the 1st, regardless of what day was passed in
    start_of_month = date(month.year, month.month, 1)
    next_month = (month.month % 12) + 1
    next_year = month.year + 1 if month.month == 12 else month.year
    start_of_next_month = date(next_year, next_month, 1)

    # sum expenses in that range
    expenses = db.query(Expense).filter(
        Expense.category_id == category_id,
        Expense.user_id == user_id,
        Expense.date >= start_of_month,
        Expense.date < start_of_next_month
    ).all()
    spent_amount = sum((e.amount for e in expenses), start=Decimal("0"))

    # look up the matching budget - may not exist, and that's fine
    budget = db.query(Budget).filter(
        Budget.category_id == category_id,
        Budget.user_id == user_id,
        Budget.month == start_of_month
    ).first()

    budgeted_amount = budget.amount if budget else None
    remaining = (budgeted_amount - spent_amount) if budgeted_amount is not None else None

    return {
        "category_id": category_id,
        "month": start_of_month,
        "budgeted_amount": budgeted_amount,
        "spent_amount": spent_amount,
        "remaining": remaining,
    }