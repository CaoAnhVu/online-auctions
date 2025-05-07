import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';
import { getPayments, updatePayment, verifyPayment } from '../../redux/slices/adminSlice';

function PaymentsPage() {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    dispatch(getPayments());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDetailClick = (payment) => {
    setSelectedPayment(payment);
    setDetailDialog(true);
  };

  const handleDetailClose = () => {
    setDetailDialog(false);
    setSelectedPayment(null);
  };

  const handleVerifyPayment = (paymentId) => {
    if (window.confirm('Are you sure you want to verify this payment?')) {
      dispatch(verifyPayment(paymentId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payments Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Code</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((payment) => (
              <TableRow key={payment.orderCode}>
                <TableCell>{payment.orderCode}</TableCell>
                <TableCell>{payment.user.username}</TableCell>
                <TableCell>{payment.amount.toLocaleString()} VND</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Chip label={payment.status} color={getStatusColor(payment.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleDetailClick(payment)}>
                    <VisibilityIcon />
                  </IconButton>
                  {payment.status === 'PENDING' && payment.paymentMethod === 'BANK_TRANSFER' && (
                    <IconButton size="small" color="success" onClick={() => handleVerifyPayment(payment.id)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={payments?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={detailDialog} onClose={handleDetailClose} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Order Code" value={selectedPayment?.orderCode || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="User" value={selectedPayment?.user?.username || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Amount" value={`${selectedPayment?.amount?.toLocaleString() || ''} VND`} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Payment Method" value={selectedPayment?.paymentMethod || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Status" value={selectedPayment?.status || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Created At" value={selectedPayment?.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            {selectedPayment?.paymentMethod === 'BANK_TRANSFER' && (
              <TextField fullWidth label="Bank Transfer Info" multiline rows={4} value={selectedPayment?.bankTransferInfo || ''} InputProps={{ readOnly: true }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>Close</Button>
          {selectedPayment?.status === 'PENDING' && selectedPayment?.paymentMethod === 'BANK_TRANSFER' && (
            <Button onClick={() => handleVerifyPayment(selectedPayment.id)} variant="contained" color="success">
              Verify Payment
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaymentsPage;
