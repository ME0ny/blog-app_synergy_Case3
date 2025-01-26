import React, { useState, useMemo, useEffect } from "react";
import { Container, Box, Button } from "@mui/material"; // Добавил Button
import Post from "../components/Post";
import Sidebar from "../components/Sidebar";
import { mockPosts, mockComments  } from "../mockData";
import LoginDialog from "../components/LoginDialog";
import UserProfileDialog from "../components/UserProfileDialog";
import { createPost, getFeed, getPublicFeed, followUser, requestAccessToPost} from "../services/api";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAndOperator, setIsAndOperator] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [allTags, setAllTags] = useState([...new Set(mockPosts.flatMap((post) => post.tags))]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [accessRequests, setAccessRequests] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние авторизации
  const [loginDialogOpen, setLoginDialogOpen] = useState(false); // Состояние окна авторизации
  const [currentUser, setCurrentUser] = useState(null); // Данные текущего пользователя
  const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);
  const [token, setToken] = useState(null); // Добавляем состояние для токена
  
  // Функция для авторизации
  const handleLogin = (accessToken, refreshToken, username) => {
    setIsAuthenticated(true);
    setToken(accessToken); // Сохраняем токен
    setCurrentUser({ username }); // Сохраняем данные пользователя
    setLoginDialogOpen(false);

    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify({ username }));
  };

  // Загрузка постов при монтировании компонента
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let postsData;
        if (isAuthenticated) {
          // Если пользователь авторизован, загружаем полную ленту
          postsData = await getFeed();
        } else {
          // Если не авторизован, загружаем публичную ленту
          postsData = await getPublicFeed();
        }
        console.log("Посты с сервера:", postsData); // Логируем данные
        // Сортируем посты по дате создания (от новых к старым)
        const sortedPosts = postsData.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        // Добавляем случайные комментарии к каждому посту
        const postsWithComments = sortedPosts.map((post) => ({
          ...post,
          comments: post.comments || [], // Добавляем случайные комментарии
        }));

        setPosts(postsWithComments);
      } catch (error) {
        console.error("Ошибка при загрузке постов:", error);
      }
    };

    fetchPosts();
  }, [isAuthenticated]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('currentUser');

    if (token && refreshToken && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Функция для выхода
  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setCurrentUser(null);

    // Удаляем данные из LocalStorage при выходе
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  };

  // Функция для проверки авторизации
  const requireAuth = (action) => {
    console.log("isAuthenticated в requireAuth (Home.js):", isAuthenticated);
    if (!isAuthenticated) {
      setLoginDialogOpen(true); // Открываем окно авторизации
    } else {
      action(); // Выполняем действие, если пользователь авторизован
    }
  };

  // Функция для обработки запроса доступа
  const handleRequestAccess = async (postId) => {
    try {
      // Отправляем запрос на доступ к посту
      const accessRequest = await requestAccessToPost(postId);
  
      // Обновляем состояние поста
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, access_status: accessRequest.status } // Обновляем статус доступа
            : post
        )
      );
  
      console.log("Запрос на доступ отправлен:", accessRequest);
    } catch (error) {
      console.error("Ошибка при запросе доступа:", error);
    }
  };

  // Функция для создания поста
  const handleCreatePost = async (newPost) => {
    try {
      // Отправляем данные на сервер для создания поста
      const createdPost = await createPost(newPost);
  
      // Обновляем состояние ленты, добавляя новый пост в начало
      setPosts((prevPosts) => [createdPost, ...prevPosts]);
    } catch (error) {
      console.error("Ошибка при создании поста:", error.response?.data);
      alert("Ошибка при создании поста. Попробуйте еще раз.");
    }
  };

  // Функция для удаления поста
  const handleDeletePost = (postId) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    };

  // Функция для подписки на автора
  const handleSubscribe = async (authorUsername) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
  
    try {
      await followUser(authorUsername); // Отправляем запрос на подписку
  
      // Обновляем состояние подписок
      setSubscriptions((prevSubscriptions) => {
        if (prevSubscriptions.includes(authorUsername)) {
          return prevSubscriptions; // Если уже подписан, ничего не меняем
        }
        return [...prevSubscriptions, authorUsername]; // Добавляем нового автора в подписки
      });
  
      // Обновляем ленту
      const updatedPosts = await (isAuthenticated ? getFeed() : getPublicFeed());
      const safeUpdatedPosts = updatedPosts.map((post) => ({
        ...post,
        comments: Array.isArray(post.comments) ? post.comments : [],
        latest_comment: post.latest_comment || null,
      }));
      const sortedPosts = safeUpdatedPosts.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
  
      // Добавляем случайные комментарии к каждому посту
      const postsWithComments = sortedPosts.map((post) => ({
        ...post,
        comments: post.comments || [], // Добавляем случайные комментарии
      }));
      setPosts(postsWithComments);
    } catch (error) {
      console.error("Ошибка при подписке:", error);
    }
  };

  // Фильтрация постов
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTags =
        selectedTags.length === 0 ||
        (isAndOperator
          ? selectedTags.every((tag) => post.tags.includes(tag))
          : selectedTags.some((tag) => post.tags.includes(tag)));

      const matchesAuthors =
        selectedAuthors.length === 0 || selectedAuthors.includes(post.author);

      const matchesMyPosts = !showMyPosts || post.author === currentUser?.username;

      const matchesSubscriptions =
      !showSubscriptions || (post.is_subscribed && post.author !== currentUser?.username);

      return matchesTags && matchesAuthors && matchesMyPosts && matchesSubscriptions;
    });
  }, [posts, selectedTags, isAndOperator, selectedAuthors, showMyPosts, showSubscriptions, subscriptions, currentUser]);

  // Подсчет количества постов
  const postCount = useMemo(() => {
    const tagsCount = {};
    allTags.forEach((tag) => {
      tagsCount[tag] = filteredPosts.filter((post) => post.tags.includes(tag)).length;
    });

    const authorsCount = {};
    const allAuthors = [...new Set(posts.map((post) => post.author))];
    allAuthors.forEach((author) => {
      authorsCount[author] = filteredPosts.filter((post) => post.author === author).length;
    });

    const subscriptionsCount = filteredPosts.filter((post) =>
      post.is_subscribed && post.author !== currentUser?.username
    ).length;

    const myPostsCount = filteredPosts.filter(
      (post) => post.author === currentUser?.username
    ).length;

    return {
      tags: tagsCount,
      authors: authorsCount,
      subscriptions: subscriptionsCount,
      myPosts: myPostsCount,
    };
  }, [posts, filteredPosts, allTags, subscriptions, currentUser]);

  return (
    <Container maxWidth="lg" sx={{ display: "flex", paddingTop: 4, paddingBottom: 4 }}>

      {/* Окно авторизации */}
      <LoginDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLogin={handleLogin} // handleLogin передается сюда
      />

      <Sidebar
        tags={allTags}
        selectedTags={selectedTags}
        onTagClick={(tag) =>
          setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
          )
        }
        isAndOperator={isAndOperator}
        onToggleOperator={() => setIsAndOperator((prev) => !prev)}
        postCount={postCount}
        authors={[...new Set(posts.map((post) => post.author))]}
        selectedAuthors={selectedAuthors}
        onAuthorClick={(author) =>
          setSelectedAuthors((prev) =>
            prev.includes(author) ? prev.filter((a) => a !== author) : [...prev, author]
          )
        }
        showSubscriptions={showSubscriptions}
        onToggleSubscriptions={() => {
          requireAuth(() => setShowSubscriptions((prev) => !prev));
        }}
        showMyPosts={showMyPosts}
        onToggleMyPosts={() => {
          requireAuth(() => setShowMyPosts((prev) => !prev));
        }}
        onCreatePost={handleCreatePost}
        onAddTag={(newTag) => setAllTags((prev) => [...new Set([...prev, newTag])])}
        subscriptions={subscriptions}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        requireAuth={requireAuth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />

      <Box sx={{ flexGrow: 1, marginLeft: 4 }}>
        {filteredPosts.map((post) => (
          <Post
            key={post.id}
            post={post}
            isSubscribed={post.is_subscribed}
            isAuthor={post.author === currentUser?.username}
            hasAccess={isAuthenticated ? post.is_public || post.author === currentUser?.username : post.is_public}
            accessRequestStatus={accessRequests[post.id]}
            onAddComment={(postId, commentText) => {
              requireAuth(() => {
                setPosts((prevPosts) =>
                  prevPosts.map((post) =>
                    post.id === postId
                      ? {
                          ...post,
                          comments: [
                            ...post.comments,
                            {
                              id: String(post.comments.length + 1),
                              author: currentUser.username,
                              text: commentText,
                            },
                          ],
                        }
                      : post
                  )
                );
              });
            }}
            onEditPost={(updatedPost) => {
              requireAuth(() => {
                setPosts((prevPosts) =>
                  prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
                );
              });
            }}
            onDeletePost={() => handleDeletePost(post.id)}
            onSubscribe={() => handleSubscribe(post.author)}
            onRequestAccess={handleRequestAccess}
            allTags={allTags}
            isAuthenticated={isAuthenticated}
            loginDialogOpen={loginDialogOpen}
            setLoginDialogOpen={setLoginDialogOpen}
          />
        ))}
      </Box>

      {/* Окно профиля пользователя */}
      <UserProfileDialog
        open={userProfileDialogOpen}
        onClose={() => setUserProfileDialogOpen(false)}
        user={currentUser} // Передаем данные пользователя
        onLogout={handleLogout}
      />
    </Container>
  );
};

export default Home;