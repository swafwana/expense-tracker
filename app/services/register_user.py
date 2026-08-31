from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password


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