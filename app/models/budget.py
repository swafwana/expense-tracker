from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey,Date,Numeric
from app.database import Base
from sqlalchemy import UniqueConstraint

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    month = Column(Date, nullable=False)  # always the 1st of the month, e.g. 2026-05-01

    __table_args__ = (
        UniqueConstraint(user_id, category_id,month, name="uix_user_category_month"),
    )