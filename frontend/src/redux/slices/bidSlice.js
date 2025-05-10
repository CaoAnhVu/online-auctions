import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
export const getUserBids = createAsyncThunk('bid/getUserBids', async (_, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user?.id;
    const response = await api.get(`/bids/user/${userId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const placeBid = createAsyncThunk('bid/placeBid', async ({ auctionId, amount }, { rejectWithValue }) => {
  try {
    const response = await api.post('/bids', { auctionId, amount });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  bids: [],
  loading: false,
  error: null,
};

const bidSlice = createSlice({
  name: 'bid',
  initialState,
  reducers: {
    clearBids: (state) => {
      state.bids = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserBids
      .addCase(getUserBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBids.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = Array.isArray(action.payload) ? action.payload : action.payload?.content || [];
      })
      .addCase(getUserBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bids';
      })
      // placeBid
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = [...state.bids, action.payload];
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to place bid';
      });
  },
});

export const { clearBids } = bidSlice.actions;
export default bidSlice.reducer;
