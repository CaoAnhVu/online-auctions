import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import PaymentInfo from '../components/PaymentInfo';
import { getPaymentByOrderCode } from '../redux/slices/paymentSlice';

function PaymentPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const { payment, loading } = useSelector((state) => state.payment);

  useEffect(() => {
    if (orderCode) {
      dispatch(getPaymentByOrderCode(orderCode))
        .unwrap()
        .catch((err) => {
          setError(err.message || 'Failed to load payment information');
        });
    }
  }, [dispatch, orderCode]);

  useEffect(() => {
    if (payment?.status === 'PAID') {
      // Redirect to success page after 3 seconds
      const timer = setTimeout(() => {
        navigate('/payment/success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [payment, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please complete your payment to finalize the auction
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {payment?.status === 'PAID' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Payment has been completed successfully. Redirecting...
        </Alert>
      )}

      {payment?.status === 'EXPIRED' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This payment has expired. Please contact support for assistance.
        </Alert>
      )}

      <PaymentInfo payment={payment} loading={loading} />
    </Container>
  );
}

export default PaymentPage;
