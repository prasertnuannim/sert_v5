import {
  Check,
  Copy,
  LoaderCircle,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { User, UserRole } from '../../user/types/user.types'

interface UserDataTableProps {
  users: User[]
  isLoading?: boolean
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onRoleChange?: (userId: string, role: UserRole) => void
}

const roleLabels: Record<UserRole, string> = {
  viewer: 'Viewer',
  operator: 'Operator',
  engineer: 'Engineer',
  admin: 'Administrator',
}

const roleStyles: Record<UserRole, string> = {
  viewer: 'border-sky-400/15 bg-sky-400/10 text-sky-300',
  operator: 'border-amber-400/15 bg-amber-400/10 text-amber-300',
  engineer: 'border-cyan-400/15 bg-cyan-400/10 text-cyan-300',
  admin: 'border-violet-400/15 bg-violet-400/10 text-violet-300',
}

export function UserDataTable({
  users,
  isLoading = false,
  onEdit,
  onDelete,
  onRoleChange,
}: UserDataTableProps) {
  if (isLoading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <LoaderCircle className="size-4 animate-spin text-cyan-300" />
          กำลังโหลดข้อมูลผู้ใช้...
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center px-6 text-center">
        <div>
          <span className="bg-muted mx-auto mb-4 grid size-12 place-items-center rounded-2xl">
            <UserRound className="text-muted-foreground size-5" />
          </span>
          <h3 className="font-semibold text-slate-200">ไม่พบสมาชิก</h3>
          <p className="mt-1 text-sm text-slate-500">
            ลองเปลี่ยนคำค้นหาหรือตัวกรองอีกครั้ง
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-cyan-300/10 bg-cyan-300/3 hover:bg-cyan-300/3">
            <TableHead className="min-w-64 pl-6">สมาชิก</TableHead>
            <TableHead>บทบาท</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="hidden lg:table-cell">วันที่สร้าง</TableHead>
            <TableHead className="w-16 pr-6 text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const role = user.role
            const isActive = (user.status ?? 'active') === 'active'
            const initial =
              user.displayName.trim().charAt(0).toUpperCase() || 'U'

            return (
              <TableRow
                className="border-cyan-300/8 hover:bg-cyan-300/3"
                key={user.id}
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-xl">
                      <AvatarFallback className="rounded-xl bg-cyan-300/10 font-semibold text-cyan-300">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-200">
                        {user.displayName}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                        <Mail className="size-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={roleStyles[role]}
                    variant="outline"
                  >
                    {roleLabels[role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <span
                      className={`size-2 rounded-full ${
                        isActive ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    {isActive ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {new Intl.DateTimeFormat('th-TH', {
                    dateStyle: 'medium',
                  }).format(new Date(user.createdAt))}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`จัดการ ${user.displayName}`}
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>ข้อมูลผู้ใช้งาน</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onEdit && (
                        <DropdownMenuItem onSelect={() => onEdit(user)}>
                          <Pencil />
                          แก้ไขบัญชี
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onSelect={() => {
                          void navigator.clipboard.writeText(user.email)
                        }}
                      >
                        <Copy />
                        คัดลอกอีเมล
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          void navigator.clipboard.writeText(user.id)
                        }}
                      >
                        <Check />
                        คัดลอก User ID
                      </DropdownMenuItem>
                      {onRoleChange && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>กำหนดบทบาท</DropdownMenuLabel>
                          {(Object.keys(roleLabels) as UserRole[]).map(
                            (nextRole) => (
                              <DropdownMenuItem
                                disabled={nextRole === role}
                                key={nextRole}
                                onSelect={() => {
                                  onRoleChange(user.id, nextRole)
                                }}
                              >
                                {roleLabels[nextRole]}
                              </DropdownMenuItem>
                            ),
                          )}
                        </>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-400 focus:bg-red-400/10 focus:text-red-300"
                            onSelect={() => onDelete(user)}
                          >
                            <Trash2 />
                            ลบบัญชี
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
