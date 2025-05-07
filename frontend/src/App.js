import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AppRoutes from './routes/AppRoutes';
import { useSelector } from 'react-redux';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, token } = useSelector((state) => state.auth);

  if (token && !user) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
