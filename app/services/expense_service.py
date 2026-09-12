# app/services/expense_service.py

from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.services.category_service import get_category


def create_expense(db: Session, category_id: int, amount, description, date, user_id: int) -> Expense:
    # Ownership check first, same pattern as create_budget.
    # Raises KeyError if the category doesn't exist or belongs to someone else.
    get_category(db, category_id, user_id)

    expense = Expense(
        user_id=user_id,
        category_id=category_id,
        amount=amount,
        description=description,
        date=date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def get_expenses(db: Session, user_id: int):
    return db.query(Expense).filter(Expense.user_id == user_id).all()


def get_expense(db: Session, expense_id: int, user_id: int) -> Expense:
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()
    if not expense:
        raise KeyError("Expense not found")
    return expense


def update_expense(db: Session, expense_id: int, category_id: int, amount, description, date, user_id: int) -> Expense:
    # Ownership check on the expense being updated.
    expense = get_expense(db, expense_id, user_id)

    # Ownership check on the (possibly new) category it's being pointed at.
    # Without this, a request could reassign the expense to someone else's category.
    get_category(db, category_id, user_id)

    expense.category_id = category_id
    expense.amount = amount
    expense.description = description
    expense.date = date

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense_id: int, user_id: int) -> None:
    expense = get_expense(db, expense_id, user_id)
    db.delete(expense)
    db.commit()