import { CalendarDays, Fingerprint, Mail } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { User } from '../types/user.types'

interface UserProfileCardProps {
  user: User
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const initial = user.displayName.trim().charAt(0).toUpperCase() || 'U'
  const createdAt = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'long',
  }).format(new Date(user.createdAt))

  return (
    <Card className="overflow-hidden border-cyan-300/10 bg-[#071321]/80 shadow-xl">
      <CardHeader className="border-b border-cyan-300/10 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 rounded-2xl">
            <AvatarFallback className="rounded-2xl bg-cyan-300/10 text-3xl font-semibold text-cyan-300">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
              Operator profile
            </p>
            <CardTitle className="text-3xl tracking-tight text-white sm:text-4xl">
              {user.displayName}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid divide-y divide-cyan-300/10 p-0">
        <ProfileRow icon={Mail} label="อีเมล" value={user.email} />
        <ProfileRow
          icon={CalendarDays}
          label="สมาชิกตั้งแต่"
          value={createdAt}
        />
        <ProfileRow
          icon={Fingerprint}
          label="User ID"
          value={user.id}
          mono
        />
      </CardContent>
    </Card>
  )
}

interface ProfileRowProps {
  icon: typeof Mail
  label: string
  value: string
  mono?: boolean
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: ProfileRowProps) {
  return (
    <div className="grid gap-3 px-6 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-8">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd
        className={`text-slate-200 ${
          mono
            ? 'font-mono text-sm font-medium [overflow-wrap:anywhere]'
            : 'font-medium'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
