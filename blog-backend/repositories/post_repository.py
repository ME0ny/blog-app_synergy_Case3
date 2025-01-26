import os
from dotenv import load_dotenv
from models.post import Post, PostAccessRequest, PostAccess, Comment
from typing import List, Optional

# Загружаем переменные окружения
load_dotenv()

# Получаем путь к файлу базы данных
DATABASE_POSTS_FILE = os.getenv("DATABASE_POSTS_FILE", "database/posts.txt")
DATABASE_ACCESS_REQUESTS_FILE = os.getenv("DATABASE_ACCESS_REQUESTS_FILE", "database/access_requests.txt")
DATABASE_ACCESS_FILE = os.getenv("DATABASE_ACCESS_FILE", "database/access.txt")
DATABASE_COMMENTS_FILE = os.getenv("DATABASE_COMMENTS_FILE", "database/comments.txt")

def get_posts_by_author(author: str) -> List[Post]:
    posts = []
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[4] == author:  # author is at index 4
                posts.append(Post(
                    id=post_data[0],
                    title=post_data[1],
                    content=post_data[2],
                    is_public=post_data[3] == "True",
                    tags=post_data[5].split(","),
                    author=post_data[4],
                    created_at=post_data[6]
                ))
    return posts

def get_public_posts() -> List[Post]:
    posts = []
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[3] == "True":  # is_public is at index 3
                posts.append(Post(
                    id=post_data[0],
                    title=post_data[1],
                    content=post_data[2],
                    is_public=True,
                    tags=post_data[5].split(","),
                    author=post_data[4],
                    created_at=post_data[6]
                ))
    return posts

def save_post(post: Post):
    with open(DATABASE_POSTS_FILE, "a", encoding="utf-8") as file:
        file.write(
            f"{post.id}|{post.title}|{post.content}|{post.is_public}|{post.author}|{','.join(post.tags)}|{post.created_at}\n"
        )

def update_post(post_id: str, updated_post: Post, current_username: str):
    posts = []
    updated = False
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[0] == post_id:
                # Проверяем, что текущий пользователь является автором поста
                if post_data[4] != current_username:
                    raise ValueError("Вы не можете редактировать этот пост")
                # Обновляем пост
                posts.append(
                    f"{post_id}|{updated_post.title}|{updated_post.content}|{updated_post.is_public}|{current_username}|{','.join(updated_post.tags)}|{post_data[6]}\n"
                )
                updated = True
            else:
                posts.append(line)
    
    if not updated:
        raise ValueError("Пост не найден")

    # Перезаписываем файл с обновленными данными
    with open(DATABASE_POSTS_FILE, "w", encoding="utf-8") as file:
        file.writelines(posts)

def delete_post(post_id: str, current_username: str):
    posts = []
    deleted = False
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[0] == post_id:
                # Проверяем, что текущий пользователь является автором поста
                if post_data[4] != current_username:
                    raise ValueError("Вы не можете удалить этот пост")
                deleted = True
            else:
                posts.append(line)
    
    if not deleted:
        raise ValueError("Пост не найден")

    # Перезаписываем файл без удаленного поста
    with open(DATABASE_POSTS_FILE, "w", encoding="utf-8") as file:
        file.writelines(posts)

def get_post_by_id(post_id: str, current_username: str = None):
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[0] == post_id:
                post = Post(
                    id=post_data[0],
                    title=post_data[1],
                    content=post_data[2],
                    is_public=post_data[3] == "True",
                    tags=post_data[5].split(","),
                    author=post_data[4],
                    created_at=post_data[6]
                )
                # Проверяем, что пост публичный или пользователь является автором
                if post.is_public or post.author == current_username:
                    return post
                # Проверяем, есть ли у пользователя доступ к посту
                accesses = get_access_by_post(post_id)
                if any(access.viewer_username == current_username for access in accesses):
                    return post
                else:
                    raise ValueError("У вас нет доступа к этому посту")
    return None

def get_latest_comment(post_id: str) -> Optional[Comment]:
    """
    Возвращает последний комментарий к посту.
    """
    comments = []
    with open(DATABASE_COMMENTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            parts = line.strip().split("|")
            if len(parts) == 5:
                comment = Comment(
                    id=parts[0],
                    post_id=parts[1],
                    author_username=parts[2],
                    content=parts[3],
                    created_at=parts[4]
                )
                if comment.post_id == post_id:
                    comments.append(comment)
    if comments:
        # Сортируем комментарии по дате создания (последний комментарий будет первым)
        comments.sort(key=lambda x: x.created_at, reverse=True)
        return comments[0]
    return None

# Методы для работы с запросами на доступ
def save_access_request(request: PostAccessRequest):
    with open(DATABASE_ACCESS_REQUESTS_FILE, "a") as file:
        file.write(f"{request.id}|{request.post_id}|{request.requester_username}|{request.status}|{request.created_at}\n")

def get_access_requests_by_post(post_id: str) -> List[PostAccessRequest]:
    requests = []
    with open(DATABASE_ACCESS_REQUESTS_FILE, "r") as file:
        for line in file:
            request_data = line.strip().split("|")
            if request_data[1] == post_id:
                requests.append(PostAccessRequest(
                    id=request_data[0],
                    post_id=request_data[1],
                    requester_username=request_data[2],
                    status=request_data[3],
                    created_at=request_data[4]
                ))
    return requests

def get_access_requests_by_requester(requester_username: str) -> List[PostAccessRequest]:
    requests = []
    with open(DATABASE_ACCESS_REQUESTS_FILE, "r") as file:
        for line in file:
            request_data = line.strip().split("|")
            if request_data[2] == requester_username:
                requests.append(PostAccessRequest(
                    id=request_data[0],
                    post_id=request_data[1],
                    requester_username=request_data[2],
                    status=request_data[3],
                    created_at=request_data[4]
                ))
    return requests

def update_access_request_status(request_id: str, status: str):
    requests = []
    updated = False
    with open(DATABASE_ACCESS_REQUESTS_FILE, "r") as file:
        for line in file:
            request_data = line.strip().split("|")
            if request_data[0] == request_id:
                requests.append(f"{request_data[0]}|{request_data[1]}|{request_data[2]}|{status}|{request_data[4]}\n")
                updated = True
            else:
                requests.append(line)
    if updated:
        with open(DATABASE_ACCESS_REQUESTS_FILE, "w") as file:
            file.writelines(requests)
    else:
        raise ValueError("Запрос не найден")

# Методы для работы с разрешениями на доступ
def save_access(access: PostAccess):
    with open(DATABASE_ACCESS_FILE, "a") as file:
        file.write(f"{access.id}|{access.post_id}|{access.viewer_username}|{access.granted_by}|{access.created_at}\n")

def get_access_by_post(post_id: str) -> List[PostAccess]:
    accesses = []
    with open(DATABASE_ACCESS_FILE, "r") as file:
        for line in file:
            access_data = line.strip().split("|")
            if access_data[1] == post_id:
                accesses.append(PostAccess(
                    id=access_data[0],
                    post_id=access_data[1],
                    viewer_username=access_data[2],
                    granted_by=access_data[3],
                    created_at=access_data[4]
                ))
    return accesses

def delete_access(access_id: str):
    accesses = []
    with open(DATABASE_ACCESS_FILE, "r") as file:
        for line in file:
            access_data = line.strip().split("|")
            if access_data[0] != access_id:
                accesses.append(line)
    with open(DATABASE_ACCESS_FILE, "w") as file:
        file.writelines(accesses)

def get_access_requests_for_my_posts(author_username: str) -> List[PostAccessRequest]:
    requests = []
    with open(DATABASE_ACCESS_REQUESTS_FILE, "r") as file:
        for line in file:
            request_data = line.strip().split("|")
            # Получаем пост по его ID
            post_id = request_data[1]
            # Проверяем, что пост принадлежит текущему пользователю
            with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as posts_file:
                for post_line in posts_file:
                    post_data = post_line.strip().split("|")
                    if post_data[0] == post_id and post_data[4] == author_username:
                        requests.append(PostAccessRequest(
                            id=request_data[0],
                            post_id=post_id,
                            requester_username=request_data[2],
                            status=request_data[3],
                            created_at=request_data[4]
                        ))
                        break  # Прерываем поиск поста, если нашли
    return requests

def get_my_post_access_requests(requester_username: str) -> List[PostAccessRequest]:
    requests = []
    with open(DATABASE_ACCESS_REQUESTS_FILE, "r") as file:
        for line in file:
            request_data = line.strip().split("|")
            if request_data[2] == requester_username:  # requester_username находится на индексе 2
                requests.append(PostAccessRequest(
                    id=request_data[0],
                    post_id=request_data[1],
                    requester_username=request_data[2],
                    status=request_data[3],
                    created_at=request_data[4]
                ))
    return requests

def get_posts_by_authors(authors: List[str], current_username: str) -> List[Post]:
    posts = []
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[4] in authors:  # author is at index 4
                is_public = post_data[3] == "True"
                if is_public:
                    # Если пост публичный, добавляем его
                    posts.append(Post(
                        id=post_data[0],
                        title=post_data[1],
                        content=post_data[2],
                        is_public=True,
                        tags=post_data[5].split(","),
                        author=post_data[4],
                        created_at=post_data[6]
                    ))
                else:
                    # Если пост скрытый, проверяем, есть ли разрешение на просмотр
                    with open(DATABASE_ACCESS_FILE, "r") as access_file:
                        for access_line in access_file:
                            access_data = access_line.strip().split("|")
                            if access_data[1] == post_data[0] and access_data[2] == current_username:
                                # Если есть разрешение, добавляем пост
                                posts.append(Post(
                                    id=post_data[0],
                                    title=post_data[1],
                                    content=post_data[2],
                                    is_public=False,
                                    tags=post_data[5].split(","),
                                    author=post_data[4],
                                    created_at=post_data[6]
                                ))
                                break
    return posts

def save_comment(comment: Comment):
    with open(DATABASE_COMMENTS_FILE, "a", encoding="utf-8") as file:
        file.write(f"{comment.id}|{comment.post_id}|{comment.author_username}|{comment.content}|{comment.created_at}\n")

def get_comments_by_post(post_id: str) -> List[Comment]:
    comments = []
    with open(DATABASE_COMMENTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            comment_data = line.strip().split("|")
            if comment_data[1] == post_id:
                comments.append(Comment(
                    id=comment_data[0],
                    post_id=comment_data[1],
                    author_username=comment_data[2],
                    content=comment_data[3],
                    created_at=comment_data[4]
                ))
    return comments

def get_accessible_private_posts(current_username: str) -> List[Post]:
    posts = []
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[4] != current_username and post_data[3] == "False":  # Приватные посты других пользователей
                # Проверяем, есть ли доступ у текущего пользователя
                with open(DATABASE_ACCESS_FILE, "r") as access_file:
                    for access_line in access_file:
                        access_data = access_line.strip().split("|")
                        if access_data[1] == post_data[0] and access_data[2] == current_username:
                            posts.append(Post(
                                id=post_data[0],
                                title=post_data[1],
                                content=post_data[2],
                                is_public=False,
                                tags=post_data[5].split(","),
                                author=post_data[4],
                                created_at=post_data[6]
                            ))
                            break
    return posts

def get_inaccessible_private_posts(current_username: str) -> List[Post]:
    posts = []
    with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
        for line in file:
            post_data = line.strip().split("|")
            if post_data[4] != current_username and post_data[3] == "False":  # Приватные посты других пользователей
                # Проверяем, есть ли доступ у текущего пользователя
                has_access = False
                with open(DATABASE_ACCESS_FILE, "r") as access_file:
                    for access_line in access_file:
                        access_data = access_line.strip().split("|")
                        if access_data[1] == post_data[0] and access_data[2] == current_username:
                            has_access = True
                            break
                # Если доступа нет, добавляем только заголовок и автора
                if not has_access:
                    posts.append(Post(
                        id=post_data[0],
                        title=post_data[1],
                        content="",  # Исключаем текст поста
                        is_public=False,
                        tags=[],  # Исключаем теги
                        author=post_data[4],
                        created_at=post_data[6]
                    ))
    return posts

def read_posts_from_file() -> List[Post]:
    """
    Чтение постов из файла posts.txt.
    Возвращает список объектов Post.
    """
    posts = []
    try:
        with open(DATABASE_POSTS_FILE, "r", encoding="utf-8") as file:
            for line in file:
                # Разделяем строку по символу "|"
                post_data = line.strip().split("|")

                # Проверяем, что строка содержит все необходимые поля
                if len(post_data) == 7:
                    # Преобразуем данные в объект Post
                    post = Post(
                        id=post_data[0],
                        title=post_data[1],
                        content=post_data[2],
                        is_public=post_data[3].lower() == "true",  # Преобразуем строку в boolean
                        tags=post_data[5].split(",") if post_data[5] else [],  # Разделяем теги по запятой
                        author=post_data[4],
                        created_at=post_data[6]
                    )
                    posts.append(post)
    except FileNotFoundError:
        print(f"Файл {DATABASE_POSTS_FILE} не найден.")
    except Exception as e:
        print(f"Ошибка при чтении файла {DATABASE_POSTS_FILE}: {e}")

    return posts