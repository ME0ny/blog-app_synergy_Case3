import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Avatar,
  Box,
} from "@mui/material";
import AccessRequestsTable from "./AccessRequestsTable";
import { getAccessRequestsForMyPosts, rejectAccessRequest, grantAccessRequest } from "../services/api";

const UserProfileDialog = ({ open, onClose, user, onLogout }) => {
  const [accessRequests, setAccessRequests] = useState([]);

  // Загрузка запросов на доступ при открытии диалога
  useEffect(() => {
    if (open) {
      const fetchAccessRequests = async () => {
        try {
          const requests = await getAccessRequestsForMyPosts();
          setAccessRequests(requests);
        } catch (error) {
          console.error("Ошибка при загрузке запросов на доступ:", error);
        }
      };

      fetchAccessRequests();
    }
  }, [open]);

  // Обработчик для одобрения запроса
  const handleApproveRequest = async (requestId) => {
    try {
      await grantAccessRequest(requestId); // Отправляем запрос на сервер
      const updatedRequests = await getAccessRequestsForMyPosts(); // Обновляем список запросов
      setAccessRequests(updatedRequests);
    } catch (error) {
      console.error("Ошибка при одобрении запроса:", error);
    }
  };

  // Обработчик для отклонения запроса
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectAccessRequest(requestId); // Отправляем запрос на сервер
      const updatedRequests = await getAccessRequestsForMyPosts(); // Обновляем список запросов
      setAccessRequests(updatedRequests);
    } catch (error) {
      console.error("Ошибка при отклонении запроса:", error);
    }
  };

  const activeRequests = accessRequests.filter(
    (request) => request.status === "pending"
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Профиль пользователя</DialogTitle>
      <DialogContent>
        {user ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <Avatar sx={{ width: 80, height: 80, fontSize: 40 }}>
                {user.username ? user.username.charAt(0).toUpperCase() : ""}
              </Avatar>
              <Typography variant="h6">{user.username}</Typography>
            </Box>

            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Запросы на доступ к приватным постам
            </Typography>
            <AccessRequestsTable
              requests={activeRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            Данные пользователя недоступны.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#616161" }}>
          Закрыть
        </Button>
        <Button
          onClick={() => {
            onLogout();
            onClose();
          }}
          sx={{ color: "#ff4444" }}
        >
          Выйти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;