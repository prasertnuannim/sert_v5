import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { KeyRound, Mail, Pencil, UserCog, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '../../user/types/user.types'

export interface AccountFormState {
  displayName: string
  email: string
  password: string
  role: UserRole
}

interface AccountDialogProps {
  account: AccountFormState
  editing: boolean
  error: string | null
  isOpen: boolean
  isSaving: boolean
  roles: Array<{ role: UserRole; title: string }>
  onAccountChange: Dispatch<SetStateAction<AccountFormState>>
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function AccountDialog({
  account,
  editing,
  error,
  isOpen,
  isSaving,
  roles,
  onAccountChange,
  onOpenChange,
  onSubmit,
}: AccountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            {editing ? <Pencil className="size-5" /> : <UserPlus className="size-5" />}
          </div>
          <DialogTitle>{editing ? 'แก้ไขบัญชี' : 'สร้างบัญชีใหม่'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'แก้ไขชื่อ อีเมล และบทบาทของผู้ใช้'
              : 'กรอกข้อมูลและกำหนดบทบาทเริ่มต้นสำหรับบัญชีใหม่'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <AccountInput
            icon={UserCog}
            id="account-name"
            label="ชื่อที่แสดง"
            placeholder="เช่น Automation Engineer"
            value={account.displayName}
            onChange={(displayName) =>
              onAccountChange((current) => ({ ...current, displayName }))
            }
          />
          <AccountInput
            icon={Mail}
            id="account-email"
            label="อีเมล"
            placeholder="name@company.local"
            type="email"
            value={account.email}
            onChange={(email) =>
              onAccountChange((current) => ({ ...current, email }))
            }
          />

          {!editing && (
            <AccountInput
              autoComplete="new-password"
              icon={KeyRound}
              id="account-password"
              label="รหัสผ่านเริ่มต้น"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              type="password"
              value={account.password}
              onChange={(password) =>
                onAccountChange((current) => ({ ...current, password }))
              }
            />
          )}

          <div className="grid gap-2">
            <Label>บทบาท{editing ? '' : 'เริ่มต้น'}</Label>
            <Select
              value={account.role}
              onValueChange={(role) =>
                onAccountChange((current) => ({
                  ...current,
                  role: role as UserRole,
                }))
              }
            >
              <SelectTrigger className="w-full border-white/10 bg-black/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(({ role, title }) => (
                  <SelectItem key={role} value={role}>
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
              onClick={() => onOpenChange(false)}
            >
              <X />
              ยกเลิก
            </Button>
            <Button
              className="bg-cyan-400 text-[#021018] hover:bg-cyan-300"
              disabled={isSaving}
              type="submit"
            >
              {editing ? <Pencil /> : <UserPlus />}
              {isSaving
                ? 'กำลังบันทึก...'
                : editing
                  ? 'บันทึกการแก้ไข'
                  : 'สร้างบัญชี'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface AccountInputProps {
  autoComplete?: string
  icon: typeof Mail
  id: string
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: (value: string) => void
}

function AccountInput({
  autoComplete,
  icon: Icon,
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: AccountInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
        <Input
          autoComplete={autoComplete}
          className="border-white/10 bg-black/20 pl-9"
          id={id}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
