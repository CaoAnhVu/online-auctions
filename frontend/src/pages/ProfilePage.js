import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography, TextField, Button, Grid, Divider, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import { updateUser, changePassword } from '../redux/slices/authSlice';
import { getUserBids } from '../redux/slices/bidSlice';
import { getUserPayments } from '../redux/slices/paymentSlice';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { bids, loading: bidsLoading } = useSelector((state) => state.bid);
  const { payments, loading: paymentsLoading } = useSelector((state) => state.payment);
  const [tabValue, setTabValue] = useState(0);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    dispatch(getUserBids());
    dispatch(getUserPayments());
  }, [dispatch]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUser(profileForm));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    dispatch(
      changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Profile Information" />
          <Tab label="Change Password" />
          <Tab label="Bidding History" />
          <Tab label="Payment History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone Number" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Change Password'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {bidsLoading ? (
            <CircularProgress />
          ) : (
            <Box>
              {bids?.map((bid) => (
                <Paper key={bid.id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6">{bid.auction.title}</Typography>
                  <Typography>Bid Amount: {bid.amount.toLocaleString()} VND</Typography>
                  <Typography>Time: {new Date(bid.createdAt).toLocaleString()}</Typography>
                  <Typography>Status: {bid.status}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {paymentsLoading ? (
            <CircularProgress />
          ) : (
            <Box>
              {payments?.map((payment) => (
                <Paper key={payment.id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6">Order #{payment.orderCode}</Typography>
                  <Typography>Amount: {payment.amount.toLocaleString()} VND</Typography>
                  <Typography>Method: {payment.paymentMethod}</Typography>
                  <Typography>Status: {payment.status}</Typography>
                  <Typography>Time: {new Date(payment.createdAt).toLocaleString()}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </TabPanel>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

export default ProfilePage;
