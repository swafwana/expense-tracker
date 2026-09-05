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
def get_categories(db: Session,user_id: int) -> list[Category]:
    categories = db.query(Category).filter(Category.user_id == user_id).all()
    return  categories

def get_category(db: Session, category_id: int, user_id: int) -> Category:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == user_id
    ).first()

    if category is None:
        raise KeyError("Category not found")

    return category
def update_category(db: Session, category_id: int, new_name: str, user_id: int) -> Category:
    category = get_category(db,category_id,user_id)   

    category.name = new_name                      

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Category with this name already exists")
    db.refresh(category)
    return category
def delete_category(db: Session, category_id: int, user_id: int) -> None:
    category=get_category(db,category_id,user_id)   
    db.delete(category)
    db.commit()

    



    
