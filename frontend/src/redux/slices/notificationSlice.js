import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

// Async thunk: Lấy danh sách thông báo
export const getNotifications = createAsyncThunk('notification/getNotifications', async (_, { rejectWithValue }) => {
  try {
    const data = await notificationService.getNotifications();
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch notifications');
  }
});

// Async thunk: Xóa thông báo
export const deleteNotification = createAsyncThunk('notification/deleteNotification', async (id, { rejectWithValue }) => {
  try {
    await notificationService.deleteNotification(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete notification');
  }
});

// Async thunk: Cập nhật preference thông báo
export const updateNotificationPreference = createAsyncThunk('notification/updateNotificationPreference', async (preference, { rejectWithValue }) => {
  try {
    const data = await notificationService.updatePreference(preference);
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update notification preference');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.notifications = action.payload;
    },
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    markAsRead(state, action) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) notification.read = true;
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateNotificationPreference.fulfilled, (state, action) => {
        // Cập nhật preference nếu cần
      })
      .addCase(updateNotificationPreference.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setNotifications, addNotification, removeNotification, markAsRead, clearNotifications, setLoading, setError } = notificationSlice.actions;

export default notificationSlice.reducer;
