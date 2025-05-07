import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress, Link, InputAdornment, IconButton, Fade } from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock, Email, Phone, Badge } from '@mui/icons-material';
import { register } from '../redux/slices/authSlice';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return /^\d{9,15}$/.test(phone);
}
function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shake, setShake] = useState(false);

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
    if (!formData.fullName) errors.fullName = 'Full name is required';
    if (!formData.phoneNumber) errors.phoneNumber = 'Phone number is required';
    else if (!validatePhone(formData.phoneNumber)) errors.phoneNumber = 'Invalid phone number';
    if (!formData.email) errors.email = 'Email is required';
    else if (!validateEmail(formData.email)) errors.email = 'Invalid email';
    if (!formData.password) errors.password = 'Password is required';
    else if (!validatePassword(formData.password)) errors.password = 'Password must be at least 8 characters, include uppercase, number, special character';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const errors = validate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (Object.keys(errors).length > 0) {
      setTouched({ username: true, fullName: true, phoneNumber: true, email: true, password: true, confirmPassword: true });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const { confirmPassword, ...submitData } = formData;
    const result = await dispatch(register(submitData));
    if (result.payload) {
      navigate('/login');
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
            Register
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
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              required
              placeholder="Enter your full name"
              error={Boolean(touched.fullName && errors.fullName)}
              helperText={touched.fullName && errors.fullName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              required
              placeholder="Enter your phone number"
              error={Boolean(touched.phoneNumber && errors.phoneNumber)}
              helperText={touched.phoneNumber && errors.phoneNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              required
              placeholder="Enter your email"
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
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
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              required
              placeholder="Re-enter your password"
              error={Boolean(touched.confirmPassword && errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword((show) => !show)} edge="end" tabIndex={-1}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(e);
              }}
            />
            {(formError || error) && (
              <Typography color="error" variant="body2" sx={{ mt: 1, mb: 1, textAlign: 'center' }}>
                {formError || error}
              </Typography>
            )}
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2, mb: 1 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link component="button" variant="body2" onClick={() => navigate('/login')}>
                Already have an account? Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default RegisterPage;
