import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // или 'dark' для темной темы
    primary: {
      main: '#1976d2', // синий цвет, как в Twitter
    },
    secondary: {
      main: '#dc004e', // розовый цвет
    },
  },
});

export default theme;