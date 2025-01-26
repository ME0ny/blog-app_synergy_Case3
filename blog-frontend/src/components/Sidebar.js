import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Avatar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EditPostDialog from "./EditPostDialog";
import UserProfileDialog from "./UserProfileDialog";
import LoginDialog from "./LoginDialog";

const Sidebar = ({
  tags,
  selectedTags,
  onTagClick,
  isAndOperator,
  onToggleOperator,
  postCount,
  authors,
  selectedAuthors,
  onAuthorClick,
  showSubscriptions,
  onToggleSubscriptions,
  showMyPosts,
  onToggleMyPosts,
  onCreatePost,
  onAddTag,
  subscriptions,
  currentUser,
  onLogout,
  setCurrentUser,
  isAuthenticated, // Получаем isAuthenticated из пропсов
  setIsAuthenticated, 
  onLogin,// Получаем setIsAuthenticated из пропсов
}) => {
  const [openTags, setOpenTags] = useState(false);
  const [openAuthors, setOpenAuthors] = useState(false);
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Функция requireAuth, определенная внутри компонента
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true); // Открываем окно авторизации, если пользователь не авторизован
    } else {
      action(); // Выполняем действие, если пользователь авторизован
    }
  };

  const handleShowAllTags = () => {
    setOpenTags(true);
  };

  const handleShowAllAuthors = () => {
    setOpenAuthors(true);
  };

  const handleCloseTags = () => {
    setOpenTags(false);
  };

  const handleCloseAuthors = () => {
    setOpenAuthors(false);
  };

  const handleLogout = () => {
    setCurrentUser(null); // Очищаем данные пользователя
    setIsAuthenticated(false); // Устанавливаем isAuthenticated в false
    onLogout(); // Вызываем функцию onLogout, если она передана из родительского компонента
  };

  return (
    <Box sx={{ width: 250, padding: 2 }}>
      {/* Блок с информацией о пользователе */}
      {currentUser ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginBottom: 2,
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
          onClick={() => setUserProfileDialogOpen(true)}
        >
          <Avatar sx={{ width: 40, height: 40, fontSize: 20 }}>
          {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : ""}
          </Avatar>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {currentUser.username}
          </Typography>
        </Box>
      ) : (
        <Button
          variant="contained"
          fullWidth
          sx={{ borderRadius: 20, marginBottom: 2 }}
          onClick={() => setLoginDialogOpen(true)}
        >
          Войти
        </Button>
      )}

      {/* Кнопка для создания поста */}
      <Button
        variant="contained"
        fullWidth
        sx={{ borderRadius: 20, marginBottom: 2 }}
        onClick={() => {
          requireAuth(() => setCreatePostDialogOpen(true));
        }}
      >
        Создать пост
      </Button>

      {/* Переключатель И/ИЛИ */}
      <FormControlLabel
        control={
          <Switch
            checked={isAndOperator}
            onChange={onToggleOperator}
            color="primary"
          />
        }
        label={isAndOperator ? "Все фильтры" : "Хотя бы 1 фильтр"}
        sx={{ marginBottom: 2 }}
      />

      {/* Фильтр "Мои посты" */}
      <Box sx={{ marginBottom: 2 }}>
        <Chip
          label={`Мои посты (${postCount.myPosts})`}
          onClick={() => requireAuth(() => onToggleMyPosts())}
          sx={{
            borderRadius: 20,
            backgroundColor: showMyPosts ? "#1976d2" : "#e0e0e0",
            color: showMyPosts ? "#ffffff" : "#616161",
          }}
        />
      </Box>

      {/* Фильтрация по тегам */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Популярные теги
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: 2 }}>
        {tags.slice(0, 10).map((tag) => (
          <Chip
            key={tag}
            label={`${tag} (${postCount.tags[tag] || 0})`}
            onClick={() => onTagClick(tag)}
            sx={{
              borderRadius: 20,
              backgroundColor: selectedTags.includes(tag) ? "#1976d2" : "#e0e0e0",
              color: selectedTags.includes(tag) ? "#ffffff" : "#616161",
            }}
          />
        ))}
      </Box>
      <Button
        variant="outlined"
        fullWidth
        sx={{ borderRadius: 20, marginBottom: 2 }}
        onClick={handleShowAllTags}
      >
        Другие теги
      </Button>

      {/* Фильтрация по авторам */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Фильтры по авторам
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={showSubscriptions}
            onChange={() => requireAuth(() => onToggleSubscriptions())}
            color="primary"
          />
        }
        label={`Мои подписки (${postCount.subscriptions})`}
      />

      <AnimatePresence>
        {showSubscriptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ marginBottom: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {subscriptions.map((author) => (
                  <Chip
                    key={author}
                    label={`${author} (${postCount.authors[author] || 0})`}
                    onClick={() => onAuthorClick(author)}
                    sx={{
                      borderRadius: 20,
                      backgroundColor: selectedAuthors.includes(author)
                        ? "#1976d2"
                        : "#e0e0e0",
                      color: selectedAuthors.includes(author)
                        ? "#ffffff"
                        : "#616161",
                    }}
                  />
                ))}
              </Box>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 20, marginTop: 2 }}
                onClick={handleShowAllAuthors}
              >
                Другие авторы
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Диалог для выбора всех тегов */}
      <Dialog open={openTags} onClose={handleCloseTags}>
        <DialogTitle>Выберите теги</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={`${tag} (${postCount.tags[tag] || 0})`}
                onClick={() => onTagClick(tag)}
                sx={{
                  borderRadius: 20,
                  backgroundColor: selectedTags.includes(tag)
                    ? "#1976d2"
                    : "#e0e0e0",
                  color: selectedTags.includes(tag) ? "#ffffff" : "#616161",
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTags}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог для выбора всех авторов */}
      <Dialog open={openAuthors} onClose={handleCloseAuthors}>
        <DialogTitle>Выберите авторов</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {authors.map((author) => (
              <Chip
                key={author}
                label={`${author} (${postCount.authors[author] || 0})`}
                onClick={() => onAuthorClick(author)}
                sx={{
                      borderRadius: 20,
                      backgroundColor: selectedAuthors.includes(author)
                        ? "#1976d2"
                        : "#e0e0e0",
                      color: selectedAuthors.includes(author)
                        ? "#ffffff"
                        : "#616161",
                    }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAuthors}>Закрыть</Button>
            </DialogActions>
          </Dialog>

          {/* Диалог для создания поста */}
          <EditPostDialog
            open={createPostDialogOpen}
            onClose={() => setCreatePostDialogOpen(false)}
            post={{ title: "", content: "", tags: [], isPublic: true }}
            onSave={onCreatePost}
            allTags={tags}
            isCreateMode
            onAddTag={onAddTag}
          />

          {/* Диалог профиля пользователя */}
          <UserProfileDialog
            open={userProfileDialogOpen}
            onClose={() => setUserProfileDialogOpen(false)}
            user={currentUser}
            onLogout={handleLogout}
          />

          {/* Окно авторизации */}
          <LoginDialog
            open={loginDialogOpen}
            onClose={() => setLoginDialogOpen(false)}
            onLogin={onLogin} // Используем переданную функцию
          />
        </Box>
      );
    };

    export default Sidebar;