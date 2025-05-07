import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ color: 'success.main', mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 60 }} />
        </Box>

        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Thank you for your payment. Your transaction has been completed successfully.
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          You will be redirected to the home page in a few seconds...
        </Typography>

        <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go to Home Page
        </Button>
      </Paper>
    </Container>
  );
}

export default PaymentSuccessPage;
