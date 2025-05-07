import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

// Lấy danh sách template
export const getNotificationTemplates = createAsyncThunk('notificationTemplate/getAll', async (_, { rejectWithValue }) => {
  try {
    // Gọi API thực tế hoặc trả về dữ liệu mẫu
    return [
      { id: 1, name: 'Welcome', content: 'Welcome to the system!' },
      { id: 2, name: 'Bid', content: 'You have a new bid.' },
    ];
  } catch (err) {
    return rejectWithValue('Failed to fetch templates');
  }
});

// Tạo template mới
export const createTemplate = createAsyncThunk('notificationTemplate/create', async (template, { rejectWithValue }) => {
  try {
    // Gọi API thực tế hoặc trả về dữ liệu mẫu
    return { ...template, id: Date.now() };
  } catch (err) {
    return rejectWithValue('Failed to create template');
  }
});

// Cập nhật template
export const updateTemplate = createAsyncThunk('notificationTemplate/update', async (template, { rejectWithValue }) => {
  try {
    // Gọi API thực tế hoặc trả về dữ liệu mẫu
    return template;
  } catch (err) {
    return rejectWithValue('Failed to update template');
  }
});

// Xóa template
export const deleteTemplate = createAsyncThunk('notificationTemplate/delete', async (id, { rejectWithValue }) => {
  try {
    // Gọi API thực tế hoặc trả về dữ liệu mẫu
    return id;
  } catch (err) {
    return rejectWithValue('Failed to delete template');
  }
});

const notificationTemplateSlice = createSlice({
  name: 'notificationTemplate',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotificationTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotificationTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(getNotificationTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.templates.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.templates[idx] = action.payload;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default notificationTemplateSlice.reducer;
