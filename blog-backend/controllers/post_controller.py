from fastapi import APIRouter, Depends, HTTPException
from models.post import PostWithDetails, PostCreate, Post, PostAccessRequest, PostAccess, Comment
from services.post_service import (
    create_comment,
    get_comments_for_post,
    get_access_requests_for_my_posts_service,
    request_post_access,
    get_my_post_access_requests_service,
    grant_post_access,
    revoke_post_access,
    reject_post_access,
    create_post,
    get_user_posts,
    get_all_public_posts,
    update_user_post,
    delete_user_post,
    get_post,
    get_user_feed,
    get_all_posts_for_public_feed
)
from controllers.auth_controller import get_current_user
from models.user import UserInDB
from typing import List

# Основной роутер для постов
router = APIRouter(tags=["post"])

# Роутер для запросов на доступ к приватным постам
access_router = APIRouter(prefix="/posts/access", tags=["access"])

@router.post("/posts/", response_model=Post)
async def create_new_post(
    post: PostCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    return create_post(post, current_user.username)

@router.get("/posts/me", response_model=list[Post])
async def read_my_posts(current_user: UserInDB = Depends(get_current_user)):
    return get_user_posts(current_user.username)

@router.get("/posts/feed", response_model=List[PostWithDetails])
async def read_user_feed_endpoint(current_user: UserInDB = Depends(get_current_user)):
    return get_user_feed(current_user.username)

@router.get("/posts/public/feed", response_model=List[PostWithDetails])
async def read_public_feed():
    """
    Получить ленту постов для неавторизованных пользователей.
    Возвращает все посты, но для приватных постов скрывает содержимое.
    """
    return get_all_posts_for_public_feed()

@router.get("/posts/public", response_model=list[Post])
async def read_public_posts():
    return get_all_public_posts()

@router.put("/posts/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    updated_post: PostCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    # Получаем пост по ID
    post = get_post(post_id, current_user.username)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Проверяем, что текущий пользователь является автором поста
    if post.author != current_user.username:
        raise HTTPException(status_code=403, detail="You are not the author of this post")

    # Обновляем пост
    updated_post_data = Post(
        id=post_id,
        title=updated_post.title,
        content=updated_post.content,
        is_public=updated_post.is_public,
        tags=updated_post.tags,
        author=current_user.username,
        created_at=post.created_at
    )
    update_user_post(post_id, updated_post_data, current_user.username)
    return updated_post_data

@router.delete("/posts/{post_id}")
async def delete_existing_post(
    post_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        delete_user_post(post_id, current_user.username)
        return {"message": "Post deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/posts/{post_id}", response_model=Post)
async def read_post(
    post_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        post = get_post(post_id, current_user.username)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

# Эндпоинты для работы с запросами на доступ к приватным постам
@access_router.post("/request/{post_id}", response_model=PostAccessRequest)
async def request_access_to_post(
    post_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    return request_post_access(post_id, current_user.username)

@access_router.get("/my_requests", response_model=List[PostAccessRequest])
async def get_my_access_requests(
    current_user: UserInDB = Depends(get_current_user)
):
    return get_my_post_access_requests_service(current_user.username)

@access_router.get("/my_posts_requests", response_model=List[PostAccessRequest])
async def get_access_requests_for_my_posts(
    current_user: UserInDB = Depends(get_current_user)
):
    return get_access_requests_for_my_posts_service(current_user.username)

@access_router.post("/grant/{request_id}", response_model=PostAccess)
async def grant_access_to_post(
    request_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    return grant_post_access(request_id, current_user.username)

@access_router.delete("/revoke/{access_id}")
async def revoke_access_to_post(
    access_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    revoke_post_access(access_id)
    return {"message": "Доступ отозван"}

@access_router.post("/reject/{request_id}")
async def reject_access_to_post(
    request_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    reject_post_access(request_id)
    return {"message": "Запрос отклонен"}

# Подключаем роутер для запросов на доступ
router.include_router(access_router)

