from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class User(BaseModel):
    username: str
    email: str
    password: str

class UserInDB(BaseModel):
    username: str
    email: str
    hashed_password: str  # Заменяем password на hashed_password
    refresh_token: Optional[str] = None  # Добавляем поле для refresh token

class Subscription(BaseModel):
    id: str
    follower_username: str  # Тот, кто подписывается
    following_username: str  # Тот, на кого подписываются
    created_at: datetime