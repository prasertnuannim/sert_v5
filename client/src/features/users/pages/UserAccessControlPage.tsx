import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import {
  Eye,
  KeyRound,
  Mail,
  Pencil,
  Search,
  Settings2,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { UserDataTable } from '../components/UserDataTable'
import {
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  updateUser,
  updateUserRole,
} from '../store/usersSlice'
import type { User, UserRole } from '../../user/types/user.types'

type RoleFilter = 'all' | UserRole

const fallbackRoleDefinitions: Array<{
  role: UserRole
  title: string
  description: string
  icon: typeof Eye
  color: string
}> = [
  {
    role: 'viewer',
    title: 'Viewer',
    description: 'ดูข้อมูลอุปกรณ์และสถานะระบบ',
    icon: Eye,
    color: 'text-sky-300 bg-sky-400/10',
  },
  {
    role: 'operator',
    title: 'Operator',
    description: 'ควบคุมอุปกรณ์และการทำงานประจำวัน',
    icon: Settings2,
    color: 'text-amber-300 bg-amber-400/10',
  },
  {
    role: 'engineer',
    title: 'Engineer',
    description: 'ตั้งค่าอุปกรณ์และ Automation workflow',
    icon: Wrench,
    color: 'text-cyan-300 bg-cyan-400/10',
  },
  {
    role: 'admin',
    title: 'Administrator',
    description: 'จัดการบัญชี บทบาท และสิทธิ์ทั้งหมด',
    icon: ShieldCheck,
    color: 'text-violet-300 bg-violet-400/10',
  },
]

const emptyAccount = {
  displayName: '',
  email: '',
  password: '',
  role: 'viewer' as UserRole,
}

export function UserAccessControlPage() {
  const dispatch = useAppDispatch()
  const {
    items: users,
    roles,
    status,
    rolesStatus,
    mutationStatus,
    error: usersError,
  } = useAppSelector((state) => state.users)
  const isSaving = mutationStatus === 'loading'
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [account, setAccount] = useState(emptyAccount)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchUsers())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (rolesStatus === 'idle') {
      void dispatch(fetchRoles())
    }
  }, [dispatch, rolesStatus])

  const roleDefinitions = useMemo(() => {
    if (roles.length === 0) return fallbackRoleDefinitions

    return roles.map((roleItem) => {
      const presentation = fallbackRoleDefinitions.find(
        (item) => item.role === roleItem.name,
      )

      return {
        role: roleItem.name,
        title: roleItem.displayName,
        description: roleItem.description,
        icon: presentation?.icon ?? ShieldCheck,
        color:
          presentation?.color ??
          'text-slate-300 bg-slate-400/10',
      }
    })
  }, [roles])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.displayName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery)
      const matchesRole = role === 'all' || user.role === role

      return matchesQuery && matchesRole
    })
  }, [query, role, users])

  const resetAccountForm = () => {
    setAccount(emptyAccount)
    setEditingUserId(null)
  }

  const handleAccountDialogChange = (open: boolean) => {
    setIsAccountDialogOpen(open)
    if (!open) resetAccountForm()
  }

  const handleCreate = () => {
    resetAccountForm()
    setError(null)
    setSuccess(null)
    setIsAccountDialogOpen(true)
  }

  const handleSaveAccount = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (
      !account.displayName.trim() ||
      !account.email.trim() ||
      (!editingUserId && account.password.length < 8)
    ) {
      setError(
        editingUserId
          ? 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน'
          : 'กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 8 ตัวอักษร',
      )
      return
    }

    try {
      if (editingUserId) {
        const updatedUser = await dispatch(
          updateUser({
            userId: editingUserId,
            payload: {
              displayName: account.displayName.trim(),
              email: account.email.trim(),
              role: account.role,
            },
          }),
        ).unwrap()
        setSuccess(`อัปเดตบัญชี ${updatedUser.email} เรียบร้อยแล้ว`)
      } else {
        const createdUser = await dispatch(
          createUser({
            ...account,
            displayName: account.displayName.trim(),
            email: account.email.trim(),
          }),
        ).unwrap()
        setSuccess(`สร้างบัญชี ${createdUser.email} เรียบร้อยแล้ว`)
      }

      resetAccountForm()
      setIsAccountDialogOpen(false)
    } catch (requestError) {
      setError(
        typeof requestError === 'string'
          ? requestError
          : 'ไม่สามารถบันทึกข้อมูลได้',
      )
    }
  }

  const handleEdit = (user: User) => {
    setError(null)
    setSuccess(null)
    setEditingUserId(user.id)
    setAccount({
      displayName: user.displayName,
      email: user.email,
      password: '',
      role: user.role,
    })
    setIsAccountDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!pendingDelete) return

    setError(null)
    setSuccess(null)

    try {
      await dispatch(deleteUser(pendingDelete.id)).unwrap()
      setSuccess(`ลบบัญชี ${pendingDelete.email} เรียบร้อยแล้ว`)
      setPendingDelete(null)
    } catch (requestError) {
      setError(
        typeof requestError === 'string'
          ? requestError
          : 'ไม่สามารถลบบัญชีได้',
      )
    }
  }

  const handleRoleChange = async (userId: string, nextRole: UserRole) => {
    setError(null)
    setSuccess(null)

    try {
      const updatedUser = await dispatch(
        updateUserRole({ userId, role: nextRole }),
      ).unwrap()
      setSuccess(
        `เปลี่ยนบทบาทของ ${updatedUser.email} เป็น ${nextRole} แล้ว`,
      )
    } catch (requestError) {
      setError(
        typeof requestError === 'string'
          ? requestError
          : 'ไม่สามารถเปลี่ยนบทบาทได้',
      )
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-cyan-300 uppercase">
            Identity & access management
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            บัญชีและสิทธิ์การเข้าถึง
          </h1>
          <p className="mt-2 text-slate-400">
            สร้างบัญชี กำหนดบทบาท และควบคุมการเข้าถึงระบบ IoT Automation
          </p>
        </div>
        <Button
          className="bg-cyan-400 text-[#021018] hover:bg-cyan-300"
          onClick={handleCreate}
        >
          <UserPlus />
          สร้างบัญชีใหม่
        </Button>
      </div>

      <Dialog
        open={isAccountDialogOpen}
        onOpenChange={handleAccountDialogChange}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              {editingUserId ? (
                <Pencil className="size-5" />
              ) : (
                <UserPlus className="size-5" />
              )}
            </div>
            <DialogTitle>
              {editingUserId ? 'แก้ไขบัญชี' : 'สร้างบัญชีใหม่'}
            </DialogTitle>
            <DialogDescription>
              {editingUserId
                ? 'แก้ไขชื่อ อีเมล และบทบาทของผู้ใช้'
                : 'กรอกข้อมูลและกำหนดบทบาทเริ่มต้นสำหรับบัญชีใหม่'}
            </DialogDescription>
          </DialogHeader>

          {(error || usersError) && (
            <div className="rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-300">
              {error ?? usersError}
            </div>
          )}

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSaveAccount}
          >
            <div className="grid gap-2">
              <Label htmlFor="account-name">ชื่อที่แสดง</Label>
              <div className="relative">
                <UserCog className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="border-white/10 bg-black/20 pl-9"
                  id="account-name"
                  placeholder="เช่น Automation Engineer"
                  value={account.displayName}
                  onChange={(event) =>
                    setAccount((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account-email">อีเมล</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="border-white/10 bg-black/20 pl-9"
                  id="account-email"
                  type="email"
                  placeholder="name@company.local"
                  value={account.email}
                  onChange={(event) =>
                    setAccount((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {!editingUserId && (
              <div className="grid gap-2">
                <Label htmlFor="account-password">รหัสผ่านเริ่มต้น</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    className="border-white/10 bg-black/20 pl-9"
                    id="account-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    value={account.password}
                    onChange={(event) =>
                      setAccount((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>บทบาท{editingUserId ? '' : 'เริ่มต้น'}</Label>
              <Select
                value={account.role}
                onValueChange={(value) =>
                  setAccount((current) => ({
                    ...current,
                    role: value as UserRole,
                  }))
                }
              >
                <SelectTrigger className="w-full border-white/10 bg-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleDefinitions.map(({ role: value, title }) => (
                    <SelectItem key={value} value={value}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-3 sm:col-span-2">
              <Button
                className="border-white/10 text-slate-300"
                type="button"
                variant="outline"
                onClick={() => handleAccountDialogChange(false)}
              >
                <X />
                ยกเลิก
              </Button>
              <Button
                className="bg-cyan-400 text-[#021018] hover:bg-cyan-300"
                disabled={isSaving}
                type="submit"
              >
                {editingUserId ? <Pencil /> : <UserPlus />}
                {isSaving
                  ? 'กำลังบันทึก...'
                  : editingUserId
                    ? 'บันทึกการแก้ไข'
                    : 'สร้างบัญชี'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roleDefinitions.map(
          ({ role: roleName, title, description, icon: Icon, color }) => (
            <Card
              className="border-cyan-300/10 bg-[#071321]/80 py-0 shadow-xl"
              key={roleName}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className={`grid size-10 place-items-center rounded-xl ${color}`}>
                    <Icon className="size-4.5" />
                  </span>
                  <span className="text-2xl font-semibold text-white">
                    {users.filter((user) => user.role === roleName).length}
                  </span>
                </div>
                <h2 className="mt-4 text-sm font-semibold text-slate-200">
                  {title}
                </h2>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  {description}
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <Card className="mb-6 border-cyan-300/10 bg-[#071321]/80 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <ShieldCheck className="size-5 text-cyan-300" />
            หลักการกำหนดสิทธิ์
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AccessRule icon={Eye} text="Viewer ดูข้อมูลได้อย่างเดียว" />
          <AccessRule
            icon={Settings2}
            text="Operator ควบคุมอุปกรณ์ได้"
          />
          <AccessRule
            icon={Wrench}
            text="Engineer จัดการ Automation ได้"
          />
          <AccessRule
            icon={ShieldCheck}
            text="Administrator จัดการบัญชีและสิทธิ์"
          />
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden border-cyan-300/10 bg-[#071321]/80 py-0 shadow-xl">
        {(error || usersError || success) && (
          <div
            className={`border-b px-5 py-3 text-sm ${
              error || usersError
                ? 'border-red-400/15 bg-red-400/8 text-red-300'
                : 'border-emerald-400/15 bg-emerald-400/8 text-emerald-300'
            }`}
          >
            {error ?? usersError ?? success}
          </div>
        )}
        <div className="flex flex-col gap-3 border-b border-cyan-300/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
            <Input
              className="h-9 border-white/10 bg-black/20 pl-9 text-slate-200"
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
              <Users className="size-3.5" />
              {filteredUsers.length} บัญชี
            </span>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RoleFilter)}
            >
              <SelectTrigger className="h-9 w-full border-white/10 bg-black/20 sm:w-44">
                <SelectValue placeholder="ทุกบทบาท" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">ทุกบทบาท</SelectItem>
                {roleDefinitions.map(({ role: value, title }) => (
                  <SelectItem key={value} value={value}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {pendingDelete && (
          <div className="flex flex-col gap-3 border-b border-red-400/15 bg-red-400/6 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-300">
                ยืนยันการลบบัญชี
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {pendingDelete.displayName} · {pendingDelete.email}
                {' — '}ข้อมูลและ session ทั้งหมดจะถูกลบ
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingDelete(null)}
              >
                ยกเลิก
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-400"
                size="sm"
                onClick={() => void handleDelete()}
              >
                ลบบัญชี
              </Button>
            </div>
          </div>
        )}

        <UserDataTable
          isLoading={status === 'loading'}
          users={filteredUsers}
          onDelete={setPendingDelete}
          onEdit={handleEdit}
          onRoleChange={handleRoleChange}
        />
      </Card>
    </section>
  )
}

interface AccessRuleProps {
  icon: typeof Eye
  text: string
}

function AccessRule({ icon: Icon, text }: AccessRuleProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
      <Icon className="size-4 text-cyan-300" />
      <span className="text-xs text-slate-300">{text}</span>
    </div>
  )
}
