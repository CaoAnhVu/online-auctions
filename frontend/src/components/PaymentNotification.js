import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { getUserPayments } from '../redux/slices/paymentSlice';

function PaymentNotification() {
  const dispatch = useDispatch();
  const { payments } = useSelector((state) => state.payment);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    dispatch(getUserPayments());
    // Poll for new payments every 30 seconds
    const interval = setInterval(() => {
      dispatch(getUserPayments());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (payments) {
      const unread = payments.filter((payment) => payment.status === 'PENDING' && !payment.notified).length;
      setUnreadCount(unread);
    }
  }, [payments]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'success.main';
      case 'PENDING':
        return 'warning.main';
      case 'EXPIRED':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} sx={{ position: 'relative' }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Payment Notifications</Typography>
        </Box>

        {payments?.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No payment notifications
            </Typography>
          </MenuItem>
        ) : (
          payments?.map((payment) => (
            <MenuItem key={payment.orderCode} onClick={handleClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ color: getStatusColor(payment.status) }}>
                  {payment.status}
                </Typography>
                <Typography variant="body2">
                  Order {payment.orderCode} - {payment.amount.toLocaleString()} VND
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(payment.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}

export default PaymentNotification;
