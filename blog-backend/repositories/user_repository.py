import os
from dotenv import load_dotenv
from models.user import UserInDB, Subscription
from typing import List, Optional
import uuid
from datetime import datetime

# Загружаем переменные окружения
load_dotenv()

# Получаем путь к файлу базы данных
DATABASE_USERS_FILE = os.getenv("DATABASE_USERS_FILE")
DATABASE_SUBSCRIPTIONS_FILE = os.getenv("DATABASE_SUBSCRIPTIONS_FILE", "database/subscriptions.txt")

def get_user(username: str) -> Optional[UserInDB]:
    if not DATABASE_USERS_FILE:
        raise ValueError("Не задана переменная окружения DATABASE_USERS_FILE")
    if not os.path.exists(DATABASE_USERS_FILE):
        return None
    with open(DATABASE_USERS_FILE, "r") as file:
        for line in file:
            user_data = line.strip().split(":")
            if user_data[0] == username:
                # Возвращаем объект UserInDB с refresh_token
                return UserInDB(
                    username=user_data[0],
                    email=user_data[1],
                    hashed_password=user_data[2],
                    refresh_token=user_data[3] if len(user_data) > 3 else None
                )
    return None

def save_user(user: UserInDB):
    if not DATABASE_USERS_FILE:
        raise ValueError("Не задана переменная окружения DATABASE_USERS_FILE")
    # Читаем все строки из файла
    users = []
    with open(DATABASE_USERS_FILE, "r") as file:
        for line in file:
            user_data = line.strip().split(":")
            users.append(user_data)
    # Ищем пользователя для обновления
    user_found = False
    for i, user_data in enumerate(users):
        if user_data[0] == user.username:
            # Обновляем данные пользователя
            users[i] = [
                user.username,
                user.email,
                user.hashed_password,
                user.refresh_token if user.refresh_token else ""
            ]
            user_found = True
            break
    # Если пользователь не найден, добавляем нового
    if not user_found:
        users.append([
            user.username,
            user.email,
            user.hashed_password,
            user.refresh_token if user.refresh_token else ""
        ])
    # Перезаписываем файл с обновленными данными
    with open(DATABASE_USERS_FILE, "w") as file:
        for user_data in users:
            file.write(":".join(user_data) + "\n")

def save_subscription(subscription: Subscription):
    with open(DATABASE_SUBSCRIPTIONS_FILE, "a") as file:
        file.write(f"{subscription.id}|{subscription.follower_username}|{subscription.following_username}|{subscription.created_at}\n")

def get_subscriptions_by_follower(follower_username: str) -> List[Subscription]:
    subscriptions = []
    with open(DATABASE_SUBSCRIPTIONS_FILE, "r") as file:
        for line in file:
            subscription_data = line.strip().split("|")
            if subscription_data[1] == follower_username:
                subscriptions.append(Subscription(
                    id=subscription_data[0],
                    follower_username=subscription_data[1],
                    following_username=subscription_data[2],
                    created_at=subscription_data[3]
                ))
    return subscriptions

def is_user_subscribed(follower_username: str, following_username: str) -> bool:
    """
    Проверяет, подписан ли пользователь на автора поста.
    """
    with open(DATABASE_SUBSCRIPTIONS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            parts = line.strip().split("|")
            if len(parts) == 4:
                follower, following = parts[1], parts[2]
                if follower == follower_username and following == following_username:
                    return True
    return False