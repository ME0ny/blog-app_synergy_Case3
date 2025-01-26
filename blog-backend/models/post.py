from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PostBase(BaseModel):
    title: str
    content: str
    is_public: bool = True
    tags: List[str] = []

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: str
    author: str
    created_at: datetime
    access_status: Optional[str] = ""

class PostAccessRequest(BaseModel):
    id: str
    post_id: str
    requester_username: str
    status: str  # "pending", "approved", "rejected"
    created_at: datetime

class PostAccess(BaseModel):
    id: str
    post_id: str
    viewer_username: str
    granted_by: str  # Автор поста
    created_at: datetime

class Comment(BaseModel):
    id: str
    post_id: str  # ID поста, к которому относится комментарий
    author_username: str  # Автор комментария
    content: str  # Текст комментария
    created_at: datetime  # Время создания комментария

    def dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "author_username": self.author_username,
            "content": self.content,
            "created_at": self.created_at
        }

class PostWithDetails(Post):
    """
    Модель поста с дополнительными полями:
    - is_subscribed: подписан ли текущий пользователь на автора поста
    - latest_comment: последний комментарий к посту
    - access_status: статус доступа к приватному посту
    """
    is_subscribed: Optional[bool] = None
    latest_comment: Optional[Comment] = None
    # access_status: Optional[str] = None