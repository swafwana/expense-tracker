from app.database import Base, engine
from app.models.user import User   # import registers User onto Base.metadata

Base.metadata.create_all(bind=engine)

print("Tables created (or already existed).")