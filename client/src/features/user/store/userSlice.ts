import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../types/user.types'

interface UserState {
  profile: User | null
}

const initialState: UserState = {
  profile: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.profile = action.payload
    },
    clearCurrentUser: (state) => {
      state.profile = null
    },
  },
})

export const { setCurrentUser, clearCurrentUser } = userSlice.actions
export default userSlice.reducer
