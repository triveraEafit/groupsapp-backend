from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    
class GroupCreate(BaseModel):
    name: str
    description: str


class GroupResponse(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int

    class Config:
        from_attributes = True

class DirectMessageResponse(BaseModel):
    id: int
    content: str
    sender_id: int
    receiver_id: int
    created_at: datetime
    is_read: bool
    
    class Config:
        from_attributes = True