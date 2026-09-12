from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
from datetime import date
from typing import List
from app.models.budget import Budget
from app.services.category_service import get_category

def create_budget(db: Session, category_id: int, amount: Decimal, month: date, user_id: int) -> Budget:
    get_category(db, category_id, user_id)

    new_budget = Budget(
        user_id=user_id,
        category_id=category_id,
        amount=amount,
        month=month
    )
    db.add(new_budget)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("A budget for this category and month already exists")

    db.refresh(new_budget)
    return new_budget

def get_budgets(db: Session, user_id: int) -> List[Budget]:
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    return budgets

def get_budget(db: Session, budget_id: int, user_id: int) -> Budget:
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        raise KeyError()
    return budget

def delete_budget(db: Session, budget_id: int, user_id: int) -> None:
    budget = get_budget(db, budget_id, user_id)  
    db.delete(budget)                        # remove the row from the session
    db.commit()                            # write the deletion to the database

def update_budget(db: Session, budget_id: int, new_amount: Decimal, new_month: date, user_id: int) -> Budget:
    budget = get_budget(db, budget_id, user_id)

    budget.amount = new_amount
    budget.month = new_month

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("A budget for this category and month already exists")

    db.refresh(budget)
    return budget