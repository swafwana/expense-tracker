from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.category import CategoryCreate, CategoryOut
from app.services.category_service import create_category,get_categories
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/categories", response_model=CategoryOut)
def create_category_info(category_data: CategoryCreate,current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        new_category = create_category(db, category_data.name, current_user.id)
        return new_category
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
@router.get("/categories", response_model=list[CategoryOut])
def get_categories_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    categories=get_categories(db,current_user.id)
    return categories
