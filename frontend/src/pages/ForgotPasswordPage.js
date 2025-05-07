import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { forgotPassword } from '../redux/slices/authSlice';

function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await dispatch(forgotPassword(email));
      setSuccess('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Forgot Password
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
          </Button>

          <Button variant="text" fullWidth onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPasswordPage;
