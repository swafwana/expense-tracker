from sqlalchemy.orm import Session
from app.models.category import Category 
from sqlalchemy.exc import IntegrityError


def create_category(db: Session, name: str, user_id: int) -> Category:
    category = Category(name=name,user_id=user_id)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Category with this name already exists")
        
    db.refresh(category)
    return category