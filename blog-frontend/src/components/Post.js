import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  TextField,
  Collapse,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import CommentIcon from "@mui/icons-material/Comment";
import EditPostDialog from "./EditPostDialog";
import { getCommentsForPost, createComment, updatePost, deletePost, requestAccessToPost } from "../services/api";

const Post = ({
  post,
  isSubscribed,
  isAuthor,
  hasAccess,
  accessRequestStatus,
  onAddComment,
  onEditPost,
  onDeletePost,
  onSubscribe,
  onRequestAccess,
  allTags,
  isAuthenticated,
  setLoginDialogOpen,
}) => {
  const [commentsToShow, setCommentsToShow] = useState(1);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loadedComments, setLoadedComments] = useState([]);
 
  const showBlur = !post.is_public && !hasAccess && post.access_status !== "approved";
  const showContent = post.is_public || hasAccess || post.access_status === "approved";
  
  // Функция для загрузки комментариев
  const loadMoreComments = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true); // Открываем LoginDialog для неавторизованных пользователей
      return;
    }

    try {
      const comments = await getCommentsForPost(post.id); // Загружаем комментарии с сервера
      setLoadedComments(comments); // Обновляем состояние загруженных комментариев
      setCommentsToShow((prev) => prev + comments.length); // Показываем все загруженные комментарии
      setShowAllComments(true);
    } catch (error) {
      console.error("Ошибка при загрузке комментариев:", error);
    }
  };
  
  const allComments = [...(post.latest_comment==null ? [] : [post.latest_comment]), ...loadedComments];
  const safeAllComments = Array.isArray(allComments) ? allComments : [];
  
  const handleShowMoreComments = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true); // Открываем LoginDialog
      return;
    }
    setCommentsToShow((prev) => prev + 5);
    setShowAllComments(true);
  };

  const handleHideComments = () => {
    setCommentsToShow(1);
    setShowAllComments(false);
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true); // Открываем LoginDialog для неавторизованных пользователей
      return;
    }
    if (newComment.trim()) {
      try {
        // Отправляем комментарий на сервер
        const createdComment = await createComment(post.id, newComment);
  
        // Обновляем состояние комментариев
        setLoadedComments((prevComments) => [createdComment, ...prevComments]);
  
        // Очищаем поле ввода
        setNewComment("");
      } catch (error) {
        console.error("Ошибка при отправке комментария:", error);
      }
    }
  };

  const handleEditPost = async (updatedPost) => {
    try {
      // Отправляем обновленные данные на сервер
      const updatedPostResponse = await updatePost(post.id, updatedPost);
  
      // Обновляем состояние поста в ленте
      onEditPost(updatedPostResponse);
  
      // Закрываем диалог редактирования
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при обновлении поста:", error.response?.data);
      alert("Ошибка при обновлении поста. Попробуйте еще раз.");
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
  
    if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
      try {
        await deletePost(post.id); // Отправляем запрос на удаление поста
        onDeletePost(post.id); // Вызываем функцию onDeletePost для обновления состояния в родительском компоненте
      } catch (error) {
        console.error("Ошибка при удалении поста:", error);
        alert("Ошибка при удалении поста. Попробуйте еще раз.");
      }
    }
  };

  const handleRequestAccess = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true); // Открываем окно авторизации, если пользователь не авторизован
      return;
    }
    onRequestAccess(post.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          marginBottom: 2,
          borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Блюр для приватных постов */}
        {showBlur  && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Box textAlign="center">
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {post.title}
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: 2 }}>
                Автор: {post.author}
              </Typography>
              {post.access_status === "pending" ? (
                <Button variant="contained" disabled sx={{ borderRadius: 20 }}>
                  Запрос отправлен
                </Button>
              ) : post.access_status === "rejected" ? (
                <Typography variant="body2" sx={{ color: "#ff4444" }}>
                  Отклонено
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<BlurOnIcon />}
                  sx={{ borderRadius: 20 }}
                  onClick={handleRequestAccess}
                >
                  Запросить доступ
                </Button>
              )}
            </Box>
          </Box>
        )}

        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {post.title}
            </Typography>
            <Box>
              {!post.is_public && ( // Отображаем метку "Приватный" только для приватных постов
                <Chip
                  label="Приватный"
                  size="small"
                  sx={{ backgroundColor: "#e0e0e0", color: "#616161" }}
                />
              )}
              {isAuthor && (
                <IconButton size="small" sx={{ marginLeft: 1 }} onClick={() => setEditDialogOpen(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {hasAccess || post.isPublic || accessRequestStatus === "approved"
              ? post.content
              : "Это приватный пост."}
          </Typography>
          {/* Теги */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: 2 }}>
            {post.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Автор: {post.author}
            </Typography>
            {!isSubscribed && !isAuthor && (
              <Button
                size="small"
                sx={{ marginLeft: 1, color: "#616161", textTransform: "none" }}
                onClick={onSubscribe}
              >
                Подписаться
              </Button>
            )}
          </Box>
        </CardContent>

        {/* Комментарии */}
        <CardContent>
          <AnimatePresence>
            {safeAllComments.slice(0, commentsToShow).map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>{comment.author_username || comment.author}</strong>: {comment.text || comment.content}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
          <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
            {true && (
              <Button size="small" onClick={loadMoreComments}>
                Показать еще
              </Button>
            )}
            {showAllComments && commentsToShow > 1 && (
              <Button size="small" onClick={handleHideComments}>
                Скрыть комментарии
              </Button>
            )}
            <Button
              size="small"
              startIcon={<CommentIcon />}
              onClick={() => setShowCommentInput((prev) => !prev)}
            >
              {showCommentInput ? "Скрыть" : "Комментировать"}
            </Button>
          </Box>
        </CardContent>

        {/* Поле для комментария */}
        <Collapse in={showCommentInput}>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Напишите комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              size="small"
              multiline
              minRows={1}
              maxRows={4}
              sx={{
                marginBottom: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  borderColor: "#e0e0e0",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "8px 12px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "1px",
                },
              }}
            />
            <Button
              variant="text"
              onClick={handleAddComment}
              sx={{ color: "#616161", textTransform: "none" }}
            >
              Отправить
            </Button>
          </CardContent>
        </Collapse>
      </Card>

      {/* Диалог редактирования поста */}
      <EditPostDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        post={post}
        onSave={handleEditPost}
        onDelete={() => {
          handleDeletePost(post.id);
          setEditDialogOpen(false);
        }}
        handleDelete={handleDeletePost}
        allTags={allTags}
        updatePost={updatePost}
      />
    </motion.div>
  );
};

export default Post;