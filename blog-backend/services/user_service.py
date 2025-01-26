from repositories.user_repository import save_subscription, get_subscriptions_by_follower
from models.user import Subscription
from datetime import datetime
import uuid

def follow_user(follower_username: str, following_username: str) -> Subscription:
    subscription = Subscription(
        id=str(uuid.uuid4()),
        follower_username=follower_username,
        following_username=following_username,
        created_at=str(datetime.now())
    )
    save_subscription(subscription)
    return subscription

def get_followed_users_posts(follower_username: str):
    # Получаем список пользователей, на которых подписан текущий пользователь
    subscriptions = get_subscriptions_by_follower(follower_username)
    followed_usernames = [sub.following_username for sub in subscriptions]

    # Получаем посты от этих пользователей
    from repositories.post_repository import get_posts_by_authors
    return get_posts_by_authors(followed_usernames, follower_username)