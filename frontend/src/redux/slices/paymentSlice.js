import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const getPaymentByOrderCode = createAsyncThunk('payment/getByOrderCode', async (orderCode, { rejectWithValue }) => {
  try {
    const response = await api.get(`/payment/status/${orderCode}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment');
  }
});

export const createPayment = createAsyncThunk('payment/create', async (paymentData, { rejectWithValue }) => {
  try {
    const response = await api.post('/payment/create', paymentData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
  }
});

export const getUserPayments = createAsyncThunk('payment/getUserPayments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/payment/list');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
  }
});

// Initial state
const initialState = {
  payment: null,
  payments: [],
  loading: false,
  error: null,
};

// Slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.payment = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPaymentByOrderCode
      .addCase(getPaymentByOrderCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentByOrderCode.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
      })
      .addCase(getPaymentByOrderCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createPayment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getUserPayments
      .addCase(getUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
