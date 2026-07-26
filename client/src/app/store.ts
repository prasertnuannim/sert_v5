import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/store/authSlice'
import userReducer from '../features/user/store/userSlice'
import usersReducer from '../features/users/store/usersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
