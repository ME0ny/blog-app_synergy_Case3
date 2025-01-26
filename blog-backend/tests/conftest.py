import pytest
from fastapi.testclient import TestClient
from main import app
import os

# Отладочный вывод
print("Загружены переменные окружения:")
print("DATABASE_USERS_FILE:", os.getenv("DATABASE_USERS_FILE"))
print("DATABASE_POSTS_FILE:", os.getenv("DATABASE_POSTS_FILE"))

@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

# Фикстура для очистки тестовой базы данных перед каждым тестом
@pytest.fixture(autouse=True)
def clean_database():
    # Получаем пути к файлам базы данных из переменных окружения
    users_file = os.getenv("DATABASE_USERS_FILE")
    posts_file = os.getenv("DATABASE_POSTS_FILE")
    
    # Очищаем тестовые файлы базы данных
    if users_file and os.path.exists(users_file):
        with open(users_file, "w") as file:
            file.write("")
    if posts_file and os.path.exists(posts_file):
        with open(posts_file, "w") as file:
            file.write("")
    yield