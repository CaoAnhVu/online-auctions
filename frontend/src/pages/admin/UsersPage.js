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
} from '@mui/material';
import { Block as BlockIcon, LockOpen as UnblockIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { getUsers, updateUser, blockUser, unblockUser } from '../../redux/slices/adminSlice';

function UsersPage() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditDialog(true);
  };

  const handleEditClose = () => {
    setEditDialog(false);
    setSelectedUser(null);
  };

  const handleEditSave = () => {
    dispatch(updateUser(selectedUser));
    handleEditClose();
  };

  const handleBlockUser = (userId) => {
    if (window.confirm('Are you sure you want to block this user?')) {
      dispatch(blockUser(userId));
    }
  };

  const handleUnblockUser = (userId) => {
    if (window.confirm('Are you sure you want to unblock this user?')) {
      dispatch(unblockUser(userId));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>
                  <Chip label={user.isBlocked ? 'Blocked' : 'Active'} color={user.isBlocked ? 'error' : 'success'} size="small" />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                  {user.isBlocked ? (
                    <IconButton size="small" color="success" onClick={() => handleUnblockUser(user.id)}>
                      <UnblockIcon />
                    </IconButton>
                  ) : (
                    <IconButton size="small" color="error" onClick={() => handleBlockUser(user.id)}>
                      <BlockIcon />
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
          count={users?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={editDialog} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Username" value={selectedUser?.username || ''} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <TextField
              fullWidth
              label="Email"
              value={selectedUser?.email || ''}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  email: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Full Name"
              value={selectedUser?.fullName || ''}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  fullName: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={selectedUser?.phoneNumber || ''}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  phoneNumber: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UsersPage;
