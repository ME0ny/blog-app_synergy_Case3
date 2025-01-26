from fastapi import APIRouter, Depends, HTTPException
from models.user import Subscription
from services.user_service import follow_user, get_followed_users_posts
from controllers.auth_controller import get_current_user
from models.user import UserInDB
from typing import List
from models.post import Post

router = APIRouter(tags=["user"])

# Подписаться на пользователя
@router.post("/users/follow/{following_username}", response_model=Subscription)
async def follow_user_endpoint(
    following_username: str,
    current_user: UserInDB = Depends(get_current_user)
):
    return follow_user(current_user.username, following_username)

# Получить посты пользователей, на которых подписан текущий пользователь
@router.get("/users/followed/posts", response_model=List[Post])
async def get_followed_users_posts_endpoint(
    current_user: UserInDB = Depends(get_current_user)
):
    return get_followed_users_posts(current_user.username)