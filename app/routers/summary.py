from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.summary import BudgetComparisonOut
from app.services.summary_service import get_budget_comparison

router = APIRouter()

@router.get("/summary/comparison", response_model=BudgetComparisonOut)
def read_budget_comparison(
    category_id: int,
    month: date | None = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if month is None:
        month = date.today()  # router's job: fill in the default before calling the service
    try:
        result = get_budget_comparison(db, category_id, month, current_user.id)
        return result
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.args[0])