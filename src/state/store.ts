import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counter/counterSlice';
import totalPriceReducer from './totalPriceSlice/totalPriceSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage is localStorage for web
import { combineReducers } from 'redux';

// Combine reducers (if you have more slices, add them here)
const rootReducer = combineReducers({
  counter: counterReducer,
  totalPrice : totalPriceReducer,
  // Add other slices here as needed
});

// Persist configuration
const persistConfig = {
  key: 'root', // Key for localStorage
  storage, // Use localStorage
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
});

// Create a persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;