from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password,verify_password, create_access_token


def register_user(db: Session, email: str, password: str) -> User:
    # Step 1: check if this email is already registered
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise ValueError("Email already registered")

    # Step 2: hash the raw password before it ever touches the DB
    hashed_password = hash_password(password)

    # Step 3: build the User object
    new_user = User(email=email, hashed_password=hashed_password)

    # Step 4: save it
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Step 5: return the full model — filtering to UserOut happens in the router later
    return new_user
def login_user(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()