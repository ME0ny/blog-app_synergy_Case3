from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.auth_controller import router as auth_router
from controllers.post_controller import router as post_router
from controllers.user_controller import router as user_router
from controllers.comment_controller import router as comment_router
from dotenv import load_dotenv
import os

# Загружаем переменные окружения из .env
load_dotenv()

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost").split(","),  # Разделяем строку на список
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, OPTIONS и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)

app.include_router(auth_router)
app.include_router(post_router)
app.include_router(user_router)
app.include_router(comment_router)