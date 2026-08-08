import {
  Eye,
  Settings2,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User, UserRole } from '../../user/types/user.types'

export interface RoleDefinition {
  role: UserRole
  title: string
  description: string
  icon: LucideIcon
  color: string
}

interface AccessOverviewProps {
  roles: RoleDefinition[]
  users: User[]
}

export function AccessOverview({ roles, users }: AccessOverviewProps) {
  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map(({ role, title, description, icon: Icon, color }) => (
          <Card
            className="border-cyan-300/10 bg-[#071321]/80 py-0 shadow-xl"
            key={role}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className={`grid size-10 place-items-center rounded-xl ${color}`}>
                  <Icon className="size-4.5" />
                </span>
                <span className="text-2xl font-semibold text-white">
                  {users.filter((user) => user.role === role).length}
                </span>
              </div>
              <h2 className="mt-4 text-sm font-semibold text-slate-200">{title}</h2>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
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
          <AccessRule icon={Settings2} text="Operator ควบคุมอุปกรณ์ได้" />
          <AccessRule icon={Wrench} text="Engineer จัดการ Automation ได้" />
          <AccessRule
            icon={ShieldCheck}
            text="Administrator จัดการบัญชีและสิทธิ์"
          />
        </CardContent>
      </Card>
    </>
  )
}

function AccessRule({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
      <Icon className="size-4 text-cyan-300" />
      <span className="text-xs text-slate-300">{text}</span>
    </div>
  )
}
