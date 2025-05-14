import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  lastUpdated: null,
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

// Async thunk: Đánh dấu thông báo đã đọc
export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue }) => {
  try {
    await notificationService.markAsRead(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to mark notification as read');
  }
});

// Async thunk: Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    await notificationService.markAllAsRead();
    return true;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to mark all notifications as read');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action) {
      // Giữ lại thông tin về thông báo mới
      const existingNotifications = state.notifications || [];
      const newNotifications = action.payload || [];

      // Tìm thông báo mới (không có trong danh sách cũ)
      const oldIds = new Set(existingNotifications.map((n) => n.id));

      // Đánh dấu thông báo mới
      state.notifications = newNotifications.map((notification) => {
        // Nếu ID không tồn tại trong danh sách cũ, đánh dấu là mới
        const isNew = !oldIds.has(notification.id);
        // Giữ lại trạng thái isNew nếu đã có
        const existingNotification = existingNotifications.find((n) => n.id === notification.id);

        return {
          ...notification,
          isNew: isNew || (existingNotification && existingNotification.isNew) || false,
        };
      });

      state.lastUpdated = new Date().toISOString();
    },
    addNotification(state, action) {
      // Đánh dấu tất cả thông báo hiện tại là không mới
      state.notifications = state.notifications.map((notif) => ({
        ...notif,
        isNew: false,
      }));

      // Kiểm tra xem thông báo đã tồn tại chưa
      const existingIndex = state.notifications.findIndex((n) => n.id === action.payload.id);

      if (existingIndex >= 0) {
        // Cập nhật thông báo hiện có
        state.notifications[existingIndex] = {
          ...action.payload,
          isNew: true,
        };
      } else {
        // Thêm thông báo mới
        state.notifications.unshift({
          ...action.payload,
          isNew: true,
        });
      }

      state.lastUpdated = new Date().toISOString();
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    clearNewStatus(state) {
      // Xóa trạng thái "mới" của tất cả thông báo
      state.notifications = state.notifications.map((notif) => ({
        ...notif,
        isNew: false,
      }));
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

        // Giữ lại thông tin về thông báo mới
        const existingNotifications = state.notifications || [];
        const newNotifications = Array.isArray(action.payload) ? action.payload : [];

        // Tìm thông báo mới (không có trong danh sách cũ)
        const oldIds = new Set(existingNotifications.map((n) => n.id));

        // Đánh dấu tất cả thông báo là không mới
        let foundNewNotification = false;

        // Đánh dấu thông báo mới
        state.notifications = newNotifications.map((notification, index) => {
          // Nếu ID không tồn tại trong danh sách cũ và chưa tìm thấy thông báo mới nào
          const isNew = !oldIds.has(notification.id) && !foundNewNotification && index === 0;

          // Nếu đây là thông báo mới, đánh dấu là đã tìm thấy
          if (isNew) {
            foundNewNotification = true;
          }

          return {
            ...notification,
            isNew: isNew,
          };
        });

        state.lastUpdated = new Date().toISOString();
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
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification) {
          notification.read = true;
          notification.isNew = false;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          read: true,
          isNew: false,
        }));
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setNotifications, addNotification, removeNotification, clearNotifications, clearNewStatus, setLoading, setError } = notificationSlice.actions;

export default notificationSlice.reducer;
