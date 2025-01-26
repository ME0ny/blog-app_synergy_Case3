import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Box,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { createPost } from "../services/api"; // Импортируем функцию createPost

const EditPostDialog = ({
  open,
  onClose,
  post,
  onSave,
  allTags,
  isCreateMode,
  onDelete,
  onAddTag,
  handleDelete,
  updatePost // Функция для добавления нового тега
}) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [selectedTags, setSelectedTags] = useState(post.tags);
  const [isPublic, setIsPublic] = useState(post.isPublic || true);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setContent(post.content);
      setSelectedTags(post.tags);
      setIsPublic(post.isPublic || true);
    }
  }, [open, post]);

  const handleSave = async () => {
    const updatedPost = {
      title,
      content,
      is_public: isPublic,
      tags: selectedTags,
    };
  
    console.log("Данные для отправки:", updatedPost); // Логируем данные
  
    try {
      if (isCreateMode) {
        // Если это режим создания поста, вызываем createPost
        const createdPost = await createPost(updatedPost);
        onSave(createdPost); // Передаем созданный пост в родительский компонент
      } else {
        // Если это режим редактирования поста, вызываем updatePost
        const updatedPostResponse = await updatePost(post.id, updatedPost);
        onSave(updatedPostResponse); // Передаем обновленный пост в родительский компонент
      }
      onClose(); // Закрываем диалог
    } catch (error) {
      console.error("Ошибка при сохранении поста:", error); // Логируем всю ошибку
      console.error("Ответ сервера:", error.response?.data); // Логируем ответ сервера
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags((prev) => [...prev, newTag.trim()]); // Добавляем новый тег
      onAddTag(newTag.trim()); // Обновляем список всех тегов
      setNewTag(""); // Очищаем поле ввода
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddNewTag(); // Добавляем тег при нажатии Enter
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCreateMode ? "Создать пост" : "Редактировать пост"}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginBottom: 2, marginTop: 2 }}
        />
        <TextField
          fullWidth
          label="Текст"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          minRows={4}
          sx={{ marginBottom: 2 }}
        />
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            Выберите теги:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {allTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                sx={{
                  borderRadius: 20,
                  backgroundColor: selectedTags.includes(tag) ? "#1976d2" : "#e0e0e0",
                  color: selectedTags.includes(tag) ? "#ffffff" : "#616161",
                }}
              />
            ))}
          </Box>
          {/* Поле для добавления нового тега */}
          <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Добавить новый тег"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="contained"
              onClick={handleAddNewTag}
              disabled={!newTag.trim()}
            >
              Добавить
            </Button>
          </Box>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              color="primary"
            />
          }
          label={isPublic ? "Публичный пост" : "Приватный пост"}
        />
      </DialogContent>
      <DialogActions>
        {!isCreateMode && (
          <>
            <Button onClick={onClose} sx={{ color: "#616161" }}>
              Отмена
            </Button>
            <Button onClick={handleDelete} sx={{ color: "#ff4444" }}>
              Удалить
            </Button>
          </>
        )}
        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 20 }}>
          {isCreateMode ? "Создать" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;