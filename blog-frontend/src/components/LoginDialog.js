import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { register, login } from "../services/api";

const LoginDialog = ({ open, onClose, onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await login(username, password);
      onLogin(response.access_token, response.refresh_token, username); // Передаем токен и имя пользователя
      onClose();
    } catch (error) {
      setError("Неверный логин или пароль");
    }
  };

  const handleRegister = async () => {
    try {
      await register({ username, email, password });
      const loginResponse = await login(username, password);
      onLogin(loginResponse.access_token, username); // Передаем токен и имя пользователя
      onClose();
    } catch (error) {
      if (error.response) {
        setError(error.response.data.detail || "Ошибка при регистрации");
      } else {
        setError("Ошибка при регистрации. Проверьте введенные данные.");
      }
    }
  };

  const handleToggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setError("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isRegisterMode ? "Регистрация" : "Авторизация"}</DialogTitle>
      <DialogContent>
        {isRegisterMode && (
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: 2, marginTop: 2 }}
          />
        )}
        <TextField
          fullWidth
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <Button onClick={handleToggleMode} sx={{ textTransform: "none" }}>
            {isRegisterMode
              ? "Уже есть аккаунт? Войти"
              : "Нет аккаунта? Зарегистрироваться"}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#616161" }}>
          Отмена
        </Button>
        <Button
          onClick={isRegisterMode ? handleRegister : handleLogin}
          variant="contained"
          sx={{ borderRadius: 20 }}
        >
          {isRegisterMode ? "Зарегистрироваться" : "Войти"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;