import {
  Cpu,
  LayoutDashboard,
  LogOut,
  UsersRound,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  hasPermission,
  type Permission,
} from '../../features/auth/access/permissions'
import { logoutUser } from '../../features/auth/store/authSlice'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  {
    to: '/user',
    label: 'โปรไฟล์',
    icon: LayoutDashboard,
    end: true,
    permission: 'devices:read' as Permission,
  },
  {
    to: '/users',
    label: 'บัญชีและสิทธิ์',
    icon: UsersRound,
    end: false,
    permission: 'users:manage' as Permission,
  },
]

export function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const initial = user?.displayName.trim().charAt(0).toUpperCase() || 'U'

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  return (
    <div className="dark relative min-h-svh overflow-hidden bg-[#030914] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.08),transparent_28%),linear-gradient(rgba(34,211,238,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.025)_1px,transparent_1px)] bg-[size:auto,40px_40px,40px_40px]" />

      <header className="sticky top-0 z-40 border-b border-cyan-300/10 bg-[#030914]/85 backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-18 max-w-[1500px] items-center px-4 sm:px-8 lg:px-12">
          <NavLink className="mr-6 flex items-center gap-2.5" to="/user">
            <span className="relative grid size-9 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
              <Cpu className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border-2 border-[#030914] bg-emerald-400" />
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none text-white">
                Phran<span className="text-cyan-400">.dev</span>
              </p>
              <p className="mt-1 text-[8px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                IoT Automation Platform
              </p>
            </div>
          </NavLink>

          <nav className="flex h-18 items-center gap-1">
            {navigation
              .filter(({ permission }) =>
                hasPermission(user?.role, permission),
              )
              .map(({ to, label, icon: Icon, end }) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'relative flex h-full items-center gap-2 px-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-200 sm:px-4',
                    isActive &&
                      'text-cyan-300 after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-full after:bg-cyan-400',
                  )
                }
                end={end}
                key={to}
                to={to}
              >
                <Icon className="size-4" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
              ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium text-slate-200">
                {user?.displayName}
              </p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Avatar className="size-9 rounded-xl border border-cyan-300/15">
              <AvatarFallback className="rounded-xl bg-cyan-300/10 font-semibold text-cyan-300">
                {initial}
              </AvatarFallback>
            </Avatar>
            <Button
              className="text-slate-500 hover:bg-cyan-300/10 hover:text-cyan-300"
              aria-label="ออกจากระบบ"
              size="icon"
              variant="ghost"
              onClick={handleLogout}
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <Outlet />
      </main>
    </div>
  )
}
