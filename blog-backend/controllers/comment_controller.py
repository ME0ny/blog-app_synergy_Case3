from fastapi import APIRouter, Depends, HTTPException
from models.post import Comment
from services.post_service import create_comment, get_comments_for_post
from controllers.auth_controller import get_current_user
from models.user import UserInDB
from typing import List

router = APIRouter(prefix="/posts/{post_id}/comments", tags=["comments"])

# Создать комментарий к посту
@router.post("/", response_model=Comment)
async def create_comment_endpoint(
    post_id: str,
    content: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        return create_comment(post_id, current_user.username, content)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

# Получить комментарии к посту
@router.get("/", response_model=List[Comment])
async def get_comments_for_post_endpoint(
    post_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        return get_comments_for_post(post_id, current_user.username)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))