import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const getAdminStats = createAsyncThunk('admin/getStats', async (timeRange, { rejectWithValue }) => {
  console.log('Calling /admin/stats');
  try {
    const response = await api.get(`/admin/stats?range=${timeRange}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const getUsers = createAsyncThunk('admin/getUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateUser = createAsyncThunk('admin/updateUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/users/${userData.id}`, userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const blockUser = createAsyncThunk('admin/blockUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/admin/users/${userId}/block`);
    return { ...response.data, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to block user');
  }
});

export const unblockUser = createAsyncThunk('admin/unblockUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    return { ...response.data, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to unblock user');
  }
});

// Auctions
export const getAuctions = createAsyncThunk('admin/getAuctions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/auctions');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch auctions');
  }
});

export const updateAuction = createAsyncThunk('admin/updateAuction', async (auctionData, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/auctions/${auctionData.id}`, auctionData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update auction');
  }
});

export const deleteAuction = createAsyncThunk('admin/deleteAuction', async (auctionId, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/auctions/${auctionId}`);
    return auctionId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete auction');
  }
});

export const updateAuctionStatus = createAsyncThunk('admin/updateAuctionStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/auctions/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update auction status');
  }
});

// Payments
export const getPayments = createAsyncThunk('admin/getPayments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/payments');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
  }
});

export const verifyPayment = createAsyncThunk('admin/verifyPayment', async (paymentId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/admin/payments/${paymentId}/verify`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
  }
});

const initialState = {
  stats: null,
  users: [],
  auctions: [],
  payments: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.stats = null;
      state.users = [];
      state.auctions = [];
      state.payments = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAdminStats
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getUsers
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // blockUser
      .addCase(blockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index].blocked = true;
        }
      })
      // unblockUser
      .addCase(unblockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index].blocked = false;
        }
      })
      // getAuctions
      .addCase(getAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
      })
      .addCase(getAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateAuction
      .addCase(updateAuction.fulfilled, (state, action) => {
        const index = state.auctions.findIndex((auction) => auction.id === action.payload.id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
      })
      // updateAuctionStatus
      .addCase(updateAuctionStatus.fulfilled, (state, action) => {
        const index = state.auctions.findIndex((auction) => auction.id === action.payload.id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
      })
      // deleteAuction
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.auctions = state.auctions.filter((auction) => auction.id !== action.payload);
      })
      // getPayments
      .addCase(getPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // verifyPayment
      .addCase(verifyPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((payment) => payment.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
