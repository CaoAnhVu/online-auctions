import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Paper, Alert, Link, InputAdornment, IconButton, Fade, CircularProgress } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { login } from '../../redux/slices/authSlice';

function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validate = () => {
    const errors = {};
    if (!credentials.username) errors.username = 'Username is required';
    if (!credentials.password) errors.password = 'Password is required';
    return errors;
  };
  const errors = validate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setTouched({ username: true, password: true });
      return;
    }
    const result = await dispatch(login(credentials));
    if (result.payload && result.payload.token) {
      localStorage.setItem('token', result.payload.token);
      const { roles } = result.payload.user;
      if (roles && roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #90caf9 100%)',
      }}
    >
      <Fade in timeout={700}>
        <Container component="main" maxWidth="xs" disableGutters>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backdropFilter: 'blur(2px)',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 2,
                mb: 2,
                color: 'white',
                boxShadow: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockOutlined sx={{ fontSize: 40 }} />
            </Box>
            <Typography component="h1" variant="h5" gutterBottom fontWeight={700}>
              Admin Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={credentials.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.username && errors.username)}
                helperText={touched.username && errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((show) => !show)} edge="end" tabIndex={-1}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit(e);
                }}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, fontWeight: 600, py: 1.2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
            <Box sx={{ mt: 2, width: '100%' }}>
              <Button fullWidth variant="outlined" color="primary" startIcon={<ArrowBack />} onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
                Back to User Login
              </Button>
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}

export default AdminLoginPage;
