import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Paper, Typography, TextField, Button, Grid, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import { updateUser, changePassword, getCurrentUser } from '../redux/slices/authSlice';
import { getUserBids } from '../redux/slices/bidSlice';
import { getUserPayments } from '../redux/slices/paymentSlice';
import api from '../services/api';

function formatDateTime(date) {
  if (!date) return 'N/A';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { bids, loading: bidsLoading } = useSelector((state) => state.bid);
  const { payments, loading: paymentsLoading } = useSelector((state) => state.payment);
  const { token } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [auctions, setAuctions] = useState({});
  const [loadingAuctions, setLoadingAuctions] = useState(false);

  // Initialize form states
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user data when component mounts
  useEffect(() => {
    console.log('Fetching current user...');
    dispatch(getCurrentUser())
      .then((action) => {
        console.log('getCurrentUser response:', action);
        // TODO: Fetch additional profile info when API is ready
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }, [dispatch]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      console.log('Current user data:', user);
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '', // Will be populated when API is updated
        phoneNumber: user.phoneNumber || '', // Will be populated when API is updated
      });
    }
  }, [user]);

  // Load user bids and payments
  useEffect(() => {
    if (user) {
      dispatch(getUserBids());
      dispatch(getUserPayments());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (bids && bids.length > 0) {
      const uniqueAuctionIds = [...new Set(bids.map((bid) => bid.auctionId))];
      setLoadingAuctions(true);

      Promise.all(
        uniqueAuctionIds.map((auctionId) =>
          api
            .get(`/auctions/${auctionId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => ({ [auctionId]: response.data }))
            .catch((error) => {
              console.error(`Error fetching auction ${auctionId}:`, error);
              return { [auctionId]: null };
            })
        )
      ).then((results) => {
        const auctionData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setAuctions(auctionData);
        setLoadingAuctions(false);
      });
    }
  }, [bids, token]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting profile update:', profileForm);
    const updateData = {
      fullName: profileForm.fullName,
      phoneNumber: profileForm.phoneNumber,
      email: profileForm.email,
    };
    console.log('Sending update data:', updateData);
    dispatch(updateUser(updateData));
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
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    style: { backgroundColor: 'white' },
                  }}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    style: { backgroundColor: 'white' },
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    style: { backgroundColor: 'white' },
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    style: { backgroundColor: 'white' },
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
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
          {bidsLoading || loadingAuctions ? (
            <CircularProgress />
          ) : (
            <>
              {console.log('Bids data:', bids)}
              {console.log('Auctions data:', auctions)}
              <Box>
                {bids?.map((bid) => {
                  const auction = auctions[bid.auctionId];
                  const bidTime = bid.bidTime ? new Date(bid.bidTime) : null;
                  const formattedTime = bidTime
                    ? `${String(bidTime.getHours()).padStart(2, '0')}:${String(bidTime.getMinutes()).padStart(2, '0')}:${String(bidTime.getSeconds()).padStart(2, '0')} ${String(
                        bidTime.getDate()
                      ).padStart(2, '0')}/${String(bidTime.getMonth() + 1).padStart(2, '0')}/${bidTime.getFullYear()}`
                    : 'N/A';

                  return (
                    <Paper key={bid.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">{auction ? auction.title : `Auction #${bid.auctionId}`}</Typography>
                      <Typography>Bid Amount: {bid.amount?.toLocaleString()} VND</Typography>
                      <Typography>Time: {formattedTime}</Typography>
                      <Typography>Status: {bid.winning ? 'Winning' : 'Not winning'}</Typography>
                    </Paper>
                  );
                })}
              </Box>
            </>
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
                  <Typography>Amount: {payment.amount?.toLocaleString() || 0} VND</Typography>
                  <Typography>Method: {payment.paymentMethod || 'N/A'}</Typography>
                  <Typography>Status: {payment.status || 'N/A'}</Typography>
                  <Typography>Time: {formatDateTime(payment.createdAt)}</Typography>
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
