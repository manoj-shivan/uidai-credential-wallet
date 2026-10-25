import { configureStore } from '@reduxjs/toolkit'
import credentialsReducer from '../features/credentials/credentialsSlice'

export const createAppStore = () =>
  configureStore({
    reducer: { credentials: credentialsReducer },
  })

export const store = createAppStore()
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
