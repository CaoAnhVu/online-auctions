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
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, History as HistoryIcon } from '@mui/icons-material';
import { getAuctions, updateAuction, deleteAuction, updateAuctionStatus } from '../../redux/slices/adminSlice';
import api from '../../services/api';

function AuctionsPage() {
  const dispatch = useDispatch();
  const { auctions, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const AUCTION_STATUSES = ['PENDING', 'ACTIVE', 'ENDED', 'CANCELED'];
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [historyDialog, setHistoryDialog] = useState({ open: false, history: [], loading: false });

  useEffect(() => {
    dispatch(getAuctions());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (auction) => {
    console.log('Auction to edit:', auction);
    setSelectedAuction(auction);
    setEditDialog(true);
  };

  const handleEditClose = () => {
    setEditDialog(false);
    setSelectedAuction(null);
  };

  const handleEditSave = async () => {
    try {
      const resultAction = await dispatch(updateAuctionStatus({ id: selectedAuction.id, status: selectedAuction.status }));
      if (updateAuctionStatus.fulfilled.match(resultAction)) {
        setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công!', severity: 'success' });
      } else {
        throw new Error(resultAction.payload || 'Cập nhật trạng thái thất bại!');
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Cập nhật trạng thái thất bại!', severity: 'error' });
    }
    handleEditClose();
  };

  const handleDeleteAuction = (auctionId) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      dispatch(deleteAuction(auctionId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ENDED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date.slice(0, 16);
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0] = date;
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    if (date instanceof Date) {
      return date.toISOString().slice(0, 16);
    }
    return '';
  };

  // Xác định trạng thái hợp lệ tiếp theo dựa trên trạng thái hiện tại
  const getAllowedStatusTransitions = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return ['PENDING', 'ACTIVE', 'CANCELLED'];
      case 'ACTIVE':
        return ['ACTIVE', 'ENDED', 'CANCELLED'];
      case 'ENDED':
        return ['ENDED'];
      case 'CANCELLED':
        return ['CANCELLED'];
      default:
        return [currentStatus];
    }
  };

  const handleShowHistory = async (auctionId) => {
    setHistoryDialog({ open: true, history: [], loading: true });
    try {
      const res = await api.get(`/admin/auctions/${auctionId}/status-history`);
      setHistoryDialog({ open: true, history: res.data, loading: false });
    } catch (err) {
      setHistoryDialog({ open: true, history: [], loading: false });
      setSnackbar({ open: true, message: 'Không thể tải lịch sử trạng thái!', severity: 'error' });
    }
  };

  const parseDate = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = date;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Auctions Management</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Current Price</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auctions?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>{auction.id}</TableCell>
                <TableCell>{auction.title}</TableCell>
                <TableCell>{auction.currentPrice != null ? auction.currentPrice.toLocaleString() + ' VND' : 'N/A'}</TableCell>
                <TableCell>{auction.startTime ? parseDate(auction.startTime)?.toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{auction.endTime ? parseDate(auction.endTime)?.toLocaleString() : 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={auction.status} color={getStatusColor(auction.status)} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditClick(auction)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteAuction(auction.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="small" color="primary" href={`/auctions/${auction.id}`} target="_blank">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" color="info" onClick={() => handleShowHistory(auction.id)}>
                    <HistoryIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={auctions?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={editDialog} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Auction</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Title" value={selectedAuction?.title || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Description" multiline rows={4} value={selectedAuction?.description || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Starting Price" type="number" value={selectedAuction?.startingPrice || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField fullWidth label="End Time" type="datetime-local" value={formatDateTimeLocal(selectedAuction?.endTime)} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField select fullWidth label="Status" value={selectedAuction?.status || ''} onChange={(e) => setSelectedAuction({ ...selectedAuction, status: e.target.value })} sx={{ mb: 2 }}>
              {AUCTION_STATUSES.map((status) => (
                <MenuItem key={status} value={status} disabled={!getAllowedStatusTransitions(selectedAuction?.status).includes(status)}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyDialog.open} onClose={() => setHistoryDialog({ ...historyDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Lịch sử trạng thái</DialogTitle>
        <DialogContent>
          {historyDialog.loading ? (
            <Typography>Đang tải...</Typography>
          ) : historyDialog.history.length === 0 ? (
            <Typography>Chưa có lịch sử thay đổi trạng thái.</Typography>
          ) : (
            <Box>
              {historyDialog.history.map((h, idx) => (
                <Box key={h.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2">
                    Từ <b>{h.oldStatus}</b> → <b>{h.newStatus}</b>
                  </Typography>
                  <Typography variant="caption">
                    Bởi: {h.changedBy || 'N/A'} | Lúc: {new Date(h.changedAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog({ ...historyDialog, open: false })}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AuctionsPage;
