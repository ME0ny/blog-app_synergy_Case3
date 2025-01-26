from repositories.post_repository import (
    save_comment, 
    get_comments_by_post,
    get_my_post_access_requests,
    get_access_requests_for_my_posts,
    get_posts_by_author,
    get_public_posts,
    save_post,
    update_post,
    delete_post,
    get_post_by_id,
    save_access_request,
    get_access_requests_by_post,
    get_access_requests_by_requester,
    update_access_request_status,
    save_access,
    get_access_by_post,
    delete_access,
    get_inaccessible_private_posts,
    get_accessible_private_posts,
    read_posts_from_file,
    get_latest_comment
)
from repositories.user_repository import is_user_subscribed
from models.post import PostWithDetails, Post, PostCreate, PostAccessRequest, PostAccess, Comment
from datetime import datetime
import uuid
from typing import List

def create_post(post: PostCreate, author: str) -> Post:
    post_data = Post(
        id=str(uuid.uuid4()),
        title=post.title,
        content=post.content,
        is_public=post.is_public,
        tags=post.tags,
        author=author,
        created_at=str(datetime.now())
    )
    save_post(post_data)
    return post_data

def get_user_posts(author: str) -> list[Post]:
    return get_posts_by_author(author)

def get_all_public_posts() -> list[Post]:
    return get_public_posts()

def update_user_post(post_id: str, updated_post: PostCreate, author: str) -> Post:
    # Получаем текущий пост
    current_post = get_post_by_id(post_id, author)
    if not current_post:
        raise ValueError("Пост не найден")

    # Создаем обновленный объект Post
    updated_post_data = Post(
        id=post_id,
        title=updated_post.title,
        content=updated_post.content,
        is_public=updated_post.is_public,
        tags=updated_post.tags,
        author=author,
        created_at=current_post.created_at
    )

    # Обновляем пост в репозитории
    update_post(post_id, updated_post_data, author)
    return updated_post_data

def delete_user_post(post_id: str, author: str):
    delete_post(post_id, author)

def get_post(post_id: str, author: str) -> Post:
    return get_post_by_id(post_id, author)

# Запрос на доступ к приватному посту
def request_post_access(post_id: str, requester_username: str) -> PostAccessRequest:
    request = PostAccessRequest(
        id=str(uuid.uuid4()),
        post_id=post_id,
        requester_username=requester_username,
        status="pending",
        created_at=str(datetime.now())
    )
    save_access_request(request)
    return request

# Получить запросы на доступ к моим постам
def get_my_post_access_requests_service(requester_username: str) -> List[PostAccessRequest]:
    return get_my_post_access_requests(requester_username)

# Разрешить доступ к посту
def grant_post_access(request_id: str, granted_by: str) -> PostAccess:
    # Обновляем статус запроса
    update_access_request_status(request_id, "approved")
    
    # Получаем запрос
    requests = get_access_requests_for_my_posts(granted_by)
    request = next((r for r in requests if r.id == request_id), None)
    if not request:
        raise ValueError("Запрос не найден")
    
    # Создаем разрешение
    access = PostAccess(
        id=str(uuid.uuid4()),
        post_id=request.post_id,
        viewer_username=request.requester_username,
        granted_by=granted_by,
        created_at=str(datetime.now())
    )
    save_access(access)
    return access

# Отозвать доступ к посту
def revoke_post_access(access_id: str):
    delete_access(access_id)

# Отклонить запрос на доступ
def reject_post_access(request_id: str):
    update_access_request_status(request_id, "rejected")

def get_access_requests_for_my_posts_service(author_username: str) -> List[PostAccessRequest]:
    return get_access_requests_for_my_posts(author_username)

def create_comment(post_id: str, author_username: str, content: str) -> Comment:
    # Проверяем доступ к посту
    post = get_post_by_id(post_id, author_username)
    if not post:
        raise ValueError("У вас нет доступа к этому посту")

    # Создаем комментарий
    comment = Comment(
        id=str(uuid.uuid4()),
        post_id=post_id,
        author_username=author_username,
        content=content,
        created_at=str(datetime.now())
    )
    save_comment(comment)
    return comment

def get_comments_for_post(post_id: str, current_username: str) -> List[Comment]:
    # Проверяем доступ к посту
    post = get_post_by_id(post_id, current_username)
    if not post:
        raise ValueError("У вас нет доступа к этому посту")

    # Получаем комментарии
    return get_comments_by_post(post_id)

def get_user_feed(current_username: str) -> List[PostWithDetails]:
    """
    Возвращает ленту постов для авторизованного пользователя.
    Для каждого поста добавляет информацию о подписке и последнем комментарии.
    """
    # Получаем все посты текущего пользователя
    user_posts = get_posts_by_author(current_username)
    # Получаем все публичные посты других пользователей
    public_posts = get_public_posts()
    other_public_posts = [post for post in public_posts if post.author != current_username]
    # Получаем приватные посты других пользователей, на которые есть доступ
    accessible_private_posts = get_accessible_private_posts(current_username)
    # Получаем заголовки и логины авторов приватных постов, на которые нет доступа
    inaccessible_private_posts = get_inaccessible_private_posts(current_username)
    # Добавляем статус доступа к каждому посту
    for post in user_posts:
        post.access_status = "approved"  # У автора всегда есть доступ к своим постам
    for post in other_public_posts:
        post.access_status = "approved"  # Публичные посты доступны всем
    for post in accessible_private_posts:
        post.access_status = "approved"  # Приватные посты с доступом
    for post in inaccessible_private_posts:
        # Проверяем, есть ли запрос на доступ
        access_requests = get_access_requests_by_requester(current_username)
        request = next((r for r in access_requests if r.post_id == post.id), None)
        if request:
            post.access_status = request.status  # "pending" или "rejected"
        else:
            post.access_status = ""  # Запрос не отправлялся            
    # Объединяем все посты в ленту
    feed = user_posts + other_public_posts + accessible_private_posts + inaccessible_private_posts
    # Убираем дубликаты (если есть)
    unique_feed = list({post.id: post for post in feed}.values())
    # Добавляем информацию о подписке и последнем комментарии
    feed_out = []
    for post in unique_feed:
        # Проверяем, подписан ли пользователь на автора поста
        is_subscribed = is_user_subscribed(current_username, post.author)
        # Получаем последний комментарий к посту
        latest_comment = get_latest_comment(post.id)
        latest_comment = latest_comment.dict() if latest_comment else None
        # Формируем объект поста с дополнительной информацией
        post_with_details = PostWithDetails(
            **post.dict(),
            is_subscribed=is_subscribed,
            latest_comment=latest_comment,
            # access_status=access_status
        )
        feed_out.append(post_with_details)
    return feed_out

def get_all_posts_for_public_feed() -> List[PostWithDetails]:
    """
    Получить все посты для ленты неавторизованных пользователей.
    Для приватных постов скрывает содержимое.
    """
    # Чтение постов из базы данных (файла)
    posts = read_posts_from_file()
    # Обработка постов
    processed_posts = []
    for post in posts:
        if not post.is_public:
            # Для приватных постов скрываем содержимое
            post.content = ""
            processed_posts.append(
                PostWithDetails(
                    **post.dict(),
                    latest_comment=None 
                )
            )
        else:
            # Публичные посты возвращаются как есть
            latest_comment = get_latest_comment(post.id)
            processed_posts.append(
                PostWithDetails(
                    **post.dict(),  # Копируем все поля из Post
                    latest_comment=latest_comment
                )
            )
    return processed_posts