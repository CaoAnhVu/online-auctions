import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress, Link, InputAdornment, IconButton, Fade } from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { login } from '../redux/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  if (user && token) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validate = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const errors = validate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setTouched({ username: true, password: true });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const result = await dispatch(login(formData));
    if (result.payload) {
      navigate('/');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <Container maxWidth="xs">
      <Fade in timeout={600}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: shake ? 'shake 0.3s' : 'none',
            '@keyframes shake': {
              '10%, 90%': { transform: 'translateX(-2px)' },
              '20%, 80%': { transform: 'translateX(4px)' },
              '30%, 50%, 70%': { transform: 'translateX(-8px)' },
              '40%, 60%': { transform: 'translateX(8px)' },
            },
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              required
              autoFocus
              placeholder="Enter your username"
              error={Boolean(touched.username && errors.username)}
              helperText={touched.username && errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              required
              placeholder="Enter your password"
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
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
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, mb: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2, mb: 1 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link component="button" variant="body2" onClick={() => navigate('/register')}>
                Don&apos;t have an account? Register
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link component="button" variant="body2" onClick={() => navigate('/admin/login')}>
                Admin Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default LoginPage;
