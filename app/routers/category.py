from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.category import CategoryCreate, CategoryOut
from app.services.category_service import create_category,get_categories,get_category,update_category,delete_category
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
@router.get("/categories/{id}", response_model=CategoryOut)
def get_category_info(id: int ,current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        category=get_category(db,id,current_user.id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

@router.put("/categories/{id}", response_model=CategoryOut)
def update_category_info(id: int, category_data: CategoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        updated_category = update_category(db, id, category_data.name, current_user.id)
        return updated_category
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
@router.delete("/categories/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_info(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        delete_category(db, id, current_user.id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
