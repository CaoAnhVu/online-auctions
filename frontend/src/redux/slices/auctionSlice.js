import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Async Thunks
export const fetchAuctions = createAsyncThunk('auction/fetchAuctions', async (params, { rejectWithValue, getState }) => {
  try {
    const { token } = getState().auth;
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined));
    const response = await api.get(`/auctions`, {
      params: cleanParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchAuctionById = createAsyncThunk('auction/fetchAuctionById', async (id, { rejectWithValue, getState }) => {
  try {
    const { token } = getState().auth;
    const response = await api.get(`/auctions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createAuction = createAsyncThunk('auction/createAuction', async (auctionData, { rejectWithValue, getState }) => {
  try {
    const { token } = getState().auth;
    const response = await api.post(`/auctions`, auctionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateAuction = createAsyncThunk('auction/updateAuction', async ({ id, auctionData }, { rejectWithValue, getState }) => {
  try {
    const { token } = getState().auth;
    const response = await api.put(`/auctions/${id}`, auctionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteAuction = createAsyncThunk('auction/deleteAuction', async (id, { rejectWithValue, getState }) => {
  try {
    const { token } = getState().auth;
    await api.delete(`/auctions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const placeBid = createAsyncThunk('auction/placeBid', async (bidData, { rejectWithValue, getState }) => {
  try {
    const { token } = getState().auth;
    const response = await api.post(`/bids`, bidData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  auctions: [],
  currentAuction: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
};

const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Auctions
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch auctions';
        toast.error(state.error);
      })
      // Fetch Auction by ID
      .addCase(fetchAuctionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch auction';
        toast.error(state.error);
      })
      // Create Auction
      .addCase(createAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.loading = false;
        toast.success('Auction created successfully!');
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create auction';
        toast.error(state.error);
      })
      // Update Auction
      .addCase(updateAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAuction.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentAuction?.id === action.payload.id) {
          state.currentAuction = action.payload;
        }
        state.auctions = state.auctions.map((auction) => (auction.id === action.payload.id ? action.payload : auction));
        toast.success('Auction updated successfully!');
      })
      .addCase(updateAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update auction';
        toast.error(state.error);
      })
      // Delete Auction
      .addCase(deleteAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = state.auctions.filter((auction) => auction.id !== action.payload);
        if (state.currentAuction?.id === action.payload) {
          state.currentAuction = null;
        }
        toast.success('Auction deleted successfully!');
      })
      .addCase(deleteAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete auction';
        toast.error(state.error);
      })
      // Place Bid
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        // if (state.currentAuction) {
        //   if (!Array.isArray(state.currentAuction.bids)) {
        //     state.currentAuction.bids = [];
        //   }
        //   state.currentAuction.currentPrice = action.payload.amount;
        //   state.currentAuction.bids.push(action.payload);
        // }
        toast.success('Bid placed successfully!');
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to place bid';
        toast.error(state.error);
      });
  },
});

export const { clearCurrentAuction, clearError } = auctionSlice.actions;
export default auctionSlice.reducer;
