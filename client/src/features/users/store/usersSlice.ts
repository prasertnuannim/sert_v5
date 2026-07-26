import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import { getApiError } from '@/features/auth/api/authApi'
import {
  usersApi,
  type CreateAccountPayload,
  type UpdateAccountPayload,
} from '../api/usersApi'
import type {
  AccessRole,
  User,
  UserRole,
} from '../../user/types/user.types'

interface UsersState {
  items: User[]
  roles: AccessRole[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  rolesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  mutationStatus: 'idle' | 'loading'
  error: string | null
}

const initialState: UsersState = {
  items: [],
  roles: [],
  status: 'idle',
  rolesStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
}

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await usersApi.getUsers()
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const fetchRoles = createAsyncThunk<
  AccessRole[],
  void,
  { rejectValue: string }
>('users/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    return await usersApi.getRoles()
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const createUser = createAsyncThunk<
  User,
  CreateAccountPayload,
  { rejectValue: string }
>('users/create', async (payload, { rejectWithValue }) => {
  try {
    return await usersApi.createAccount(payload)
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const updateUser = createAsyncThunk<
  User,
  { userId: string; payload: UpdateAccountPayload },
  { rejectValue: string }
>('users/update', async ({ userId, payload }, { rejectWithValue }) => {
  try {
    return await usersApi.updateAccount(userId, payload)
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const updateUserRole = createAsyncThunk<
  User,
  { userId: string; role: UserRole },
  { rejectValue: string }
>('users/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    return await usersApi.updateRole(userId, role)
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/delete', async (userId, { rejectWithValue }) => {
  try {
    await usersApi.deleteAccount(userId)
    return userId
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

function replaceUser(state: UsersState, user: User) {
  const index = state.items.findIndex((item) => item.id === user.id)
  if (index !== -1) state.items[index] = user
}

function startMutation(state: UsersState) {
  state.mutationStatus = 'loading'
  state.error = null
}

function failMutation(
  state: UsersState,
  action: { payload?: string },
) {
  state.mutationStatus = 'idle'
  state.error = action.payload ?? 'ไม่สามารถบันทึกข้อมูลได้'
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null
    },
    resetUsers: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
      })
      .addCase(fetchRoles.pending, (state) => {
        state.rolesStatus = 'loading'
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesStatus = 'succeeded'
        state.roles = action.payload
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesStatus = 'failed'
        state.error = action.payload ?? 'ไม่สามารถโหลดข้อมูลบทบาทได้'
      })
      .addCase(createUser.pending, startMutation)
      .addCase(createUser.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        state.items.push(action.payload)
      })
      .addCase(createUser.rejected, failMutation)
      .addCase(updateUser.pending, startMutation)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        replaceUser(state, action.payload)
      })
      .addCase(updateUser.rejected, failMutation)
      .addCase(updateUserRole.pending, startMutation)
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        replaceUser(state, action.payload)
      })
      .addCase(updateUserRole.rejected, failMutation)
      .addCase(deleteUser.pending, startMutation)
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        state.items = state.items.filter(
          (user) => user.id !== action.payload,
        )
      })
      .addCase(deleteUser.rejected, failMutation)
  },
})

export const { clearUsersError, resetUsers } = usersSlice.actions
export default usersSlice.reducer
