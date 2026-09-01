from app.database import SessionLocal   # ← change to `from database import SessionLocal` if that's where it actually lives
from app.services.user_service import register_user, login_user

db = SessionLocal()

test_email = "testuser@example.com"
test_password = "correcthorsebattery"

try:
    # Step 1: make sure a test user exists (skip if you already registered one manually)
    try:
        user = register_user(db, test_email, test_password)
        print("Registered new user:", user.id, user.email)
    except ValueError as e:
        print("Register skipped (probably already exists):", e)

    # Step 2: correct password
    print("\n--- Correct password ---")
    result = login_user(db, test_email, test_password)
    print(result)

    # Step 3: wrong password
    print("\n--- Wrong password ---")
    try:
        login_user(db, test_email, "wrongpassword")
    except ValueError as e:
        print("Correctly rejected:", e)

    # Step 4: nonexistent email
    print("\n--- Nonexistent email ---")
    try:
        login_user(db, "doesnotexist@example.com", "whatever")
    except ValueError as e:
        print("Correctly rejected:", e)

finally:
    db.close()