from pydantic import BaseModel
from datetime import datetime
class CategoryCreate(BaseModel):
    name: str
    

class CategoryOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    user_id: int
    class Config:
        from_attributes = True