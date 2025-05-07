import React from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';

function PaymentInfo({ payment, loading }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <PaymentIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Payment Information</Typography>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Order Code
        </Typography>
        <Typography variant="body1">{payment.orderCode}</Typography>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Amount
        </Typography>
        <Typography variant="body1">{payment.amount.toLocaleString()} VND</Typography>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Payment Method
        </Typography>
        <Typography variant="body1">{payment.paymentMethod}</Typography>
      </Box>

      {payment.paymentMethod === 'BANK_TRANSFER' && (
        <>
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Bank Information
            </Typography>
            <Typography variant="body1">{payment.bankInfo}</Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Transfer Content
            </Typography>
            <Typography variant="body1">{payment.transferContent}</Typography>
          </Box>

          {payment.qrCodeUrl && (
            <Box mb={2} textAlign="center">
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Scan QR Code to Pay
              </Typography>
              <img src={payment.qrCodeUrl} alt="Payment QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
          )}
        </>
      )}

      {payment.paymentMethod === 'VNPAY' && payment.paymentUrl && (
        <Box mt={3}>
          <Button variant="contained" color="primary" fullWidth href={payment.paymentUrl} target="_blank">
            Pay with VNPay
          </Button>
        </Box>
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Expires at: {new Date(payment.expiresAt).toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PaymentInfo;
