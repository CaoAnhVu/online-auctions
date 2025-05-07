import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import auctionReducer from './slices/auctionSlice';
import bidReducer from './slices/bidSlice';
import paymentReducer from './slices/paymentSlice';
import adminReducer from './slices/adminSlice';
import notificationReducer from './slices/notificationSlice';
import notificationTemplateReducer from './slices/notificationTemplateSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  auction: auctionReducer,
  bid: bidReducer,
  payment: paymentReducer,
  admin: adminReducer,
  notification: notificationReducer,
  notificationTemplate: notificationTemplateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/FLUSH', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
