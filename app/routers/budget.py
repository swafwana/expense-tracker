from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.budget import BudgetCreate,BudgetUpdate, BudgetOut
from app.services.budget_service import create_budget, get_budgets, get_budget, update_budget, delete_budget
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/budgets", response_model=BudgetOut)
def create_budget_info(budget_data: BudgetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        new_budget = create_budget(db, budget_data.category_id, budget_data.amount, budget_data.month, current_user.id)
        return new_budget
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Budget already exist for this month")
@router.get("/budgets", response_model=list[BudgetOut])
def get_budgets_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budgets=get_budgets(db,current_user.id)
    return budgets
@router.get("/budgets/{id}", response_model=BudgetOut)
def get_budget_info(id: int ,current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        budget=get_budget(db,id,current_user.id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return budget
@router.put("/budgets/{id}", response_model=BudgetOut)
def update_budget_info(id: int, budget_data: BudgetUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        updated_budget = update_budget(db, id, budget_data.amount,budget_data.month, current_user.id)
        return updated_budget
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
@router.delete("/budgets/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_info(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        delete_budget(db, id, current_user.id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
