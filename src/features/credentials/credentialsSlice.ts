import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { parseCredentials, type Credential } from './types'

interface CredentialsState {
  items: Credential[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  lastUpdated: string | null
}

const initialState: CredentialsState = {
  items: [],
  status: 'idle',
  error: null,
  lastUpdated: null,
}

export const fetchCredentials = createAsyncThunk('credentials/fetch', async () => {
  const response = await fetch('/api/credentials')
  if (!response.ok) throw new Error('We could not load your credentials. Please try again.')
  return parseCredentials(await response.json())
})

const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredentials.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCredentials.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchCredentials.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Something went wrong.'
      })
  },
})

export default credentialsSlice.reducer
