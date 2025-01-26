import React from 'react';
import { createRoot } from 'react-dom/client'; // Импортируем createRoot
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';

// Находим корневой элемент
const container = document.getElementById('root');
const root = createRoot(container); // Создаем корневой элемент

// Рендерим приложение
root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);