from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.expense import ExpenseIn, ExpenseOut
from app.services.expense_service import (
    create_expense,
    get_expenses,
    get_expense,
    update_expense,
    delete_expense,
)

router = APIRouter()


@router.post("/expenses", response_model=ExpenseOut)
def create_expense_info(expense: ExpenseIn, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        return create_expense(
            db,
            category_id=expense.category_id,
            amount=expense.amount,
            description=expense.description,
            date=expense.date,
            user_id=current_user.id,
        )
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")


@router.get("/expenses", response_model=list[ExpenseOut])
def get_expenses_info(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_expenses(db, user_id=current_user.id)


@router.get("/expenses/{id}", response_model=ExpenseOut)
def get_expense_info(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        return get_expense(db, expense_id=id, user_id=current_user.id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")


@router.put("/expenses/{id}", response_model=ExpenseOut)
def update_expense_info(id: int, expense: ExpenseIn, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        return update_expense(
            db,
            expense_id=id,
            category_id=expense.category_id,
            amount=expense.amount,
            description=expense.description,
            date=expense.date,
            user_id=current_user.id,
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.args[0])


@router.delete("/expenses/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_info(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        delete_expense(db, expense_id=id, user_id=current_user.id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")