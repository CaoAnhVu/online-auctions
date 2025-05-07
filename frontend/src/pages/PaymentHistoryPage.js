import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import { getUserPayments } from '../redux/slices/paymentSlice';

function PaymentHistoryPage() {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(getUserPayments());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'EXPIRED':
        return 'error';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <PaymentIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4">Payment History</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Code</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment.orderCode}>
                <TableCell>{payment.orderCode}</TableCell>
                <TableCell>{payment.amount.toLocaleString()} VND</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Chip label={payment.status} color={getStatusColor(payment.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(payment.expiresAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PaymentHistoryPage;
