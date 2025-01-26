import pytest
from fastapi import status

# Тест для успешной регистрации пользователя
def test_register_user_success(client):
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    response = client.post("/register", json=user_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "User registered successfully"}

# Тест для регистрации пользователя с уже существующим именем
def test_register_user_duplicate_username(client):
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    # Первая регистрация (успешная)
    client.post("/register", json=user_data)

    # Вторая регистрация с тем же именем пользователя
    response = client.post("/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Username already registered"

# Тест для успешной авторизации
def test_login_user_success(client):
    # Сначала регистрируем пользователя
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    client.post("/register", json=user_data)

    # Пытаемся авторизоваться
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

# Тест для авторизации с неверным паролем
def test_login_user_invalid_password(client):
    # Сначала регистрируем пользователя
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    client.post("/register", json=user_data)

    # Пытаемся авторизоваться с неверным паролем
    login_data = {
        "username": "testuser",
        "password": "wrongpassword"
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect username or password"

# Тест для авторизации с несуществующим пользователем
def test_login_user_not_found(client):
    login_data = {
        "username": "nonexistentuser",
        "password": "testpassword"
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect username or password"

# Тест для получения данных текущего пользователя
def test_get_current_user(client):
    # Регистрируем пользователя
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    client.post("/register", json=user_data)

    # Авторизуемся
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    login_response = client.post("/token", data=login_data)
    token = login_response.json()["access_token"]

    # Получаем данные пользователя
    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "username": "testuser",
        "email": "testuser@example.com"
    }

# Тест для получения данных пользователя без авторизации
def test_get_current_user_unauthorized(client):
    response = client.get("/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Not authenticated"}