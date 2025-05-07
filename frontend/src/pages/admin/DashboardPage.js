import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { getAdminStats } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);
  const [timeRange] = useState('week');

  useEffect(() => {
    console.log('DashboardPage mounted');
    dispatch(getAdminStats(timeRange));
  }, [dispatch, timeRange]);

  console.log('stats:', stats, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { totalUsers, newUsers, totalAuctions, activeAuctions, totalBids, totalRevenue, dailyStats, categoryStats } = stats || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, minWidth: 220, textAlign: 'center' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{totalUsers ?? 0}</Typography>
              <Typography color="textSecondary" variant="body2">
                +{newUsers ?? 0} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, minWidth: 220, textAlign: 'center' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Auctions
              </Typography>
              <Typography variant="h4">{activeAuctions ?? 0}</Typography>
              <Typography color="textSecondary" variant="body2">
                of {totalAuctions ?? 0} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, minWidth: 220, textAlign: 'center' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bids
              </Typography>
              <Typography variant="h4">{totalBids ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, minWidth: 220, textAlign: 'center' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">{((totalRevenue ?? 0) / 1000000).toFixed(1)}M VND</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
        {/* Daily Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, minHeight: 370 }}>
            <Typography variant="h6" gutterBottom>
              Daily Revenue
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M VND`} labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, minHeight: 370, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Auctions by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryStats || []} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                    {(categoryStats || []).map((entry, index) => (
                      <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* User Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, minHeight: 370 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')} />
                  <Legend />
                  <Bar dataKey="activeUsers" name="Active Users" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardPage;
