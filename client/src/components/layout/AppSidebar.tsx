import {
  ChevronsLeft,
  ChevronsRight,
  Cpu,
  LayoutDashboard,
  LogOut,
  UsersRound,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import {
  hasPermission,
  type Permission,
} from '../../features/auth/access/permissions'
import type { UserRole } from '../../features/user/types/user.types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  {
    to: '/user',
    label: 'แดชบอร์ด',
    description: 'ภาพรวมระบบและโปรไฟล์',
    icon: LayoutDashboard,
    end: true,
    permission: 'devices:read' as Permission,
  },
  {
    to: '/users',
    label: 'บัญชีและสิทธิ์',
    description: 'จัดการผู้ใช้งานในระบบ',
    icon: UsersRound,
    end: false,
    permission: 'users:manage' as Permission,
  },
]

const roleLabels: Record<UserRole, string> = {
  viewer: 'Viewer',
  operator: 'Operator',
  engineer: 'Engineer',
  admin: 'Administrator',
}

interface AppSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onMobileClose: () => void
  onLogout: () => void
}

function SidebarContent({
  onClose,
  onLogout,
  collapsed = false,
  onCollapsedChange,
}: {
  onClose?: () => void
  onLogout: () => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}) {
  const user = useAppSelector((state) => state.auth.user)
  const initial = user?.displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-20 items-center border-b border-cyan-300/10 px-5',
          collapsed && 'justify-center px-3',
        )}
      >
        <NavLink
          className={cn(
            'flex min-w-0 items-center gap-3',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'ไปยังแดชบอร์ด' : undefined}
          to="/user"
          onClick={onClose}
        >
          <span className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
            <Cpu className="size-5" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#050d18] bg-emerald-400" />
          </span>
          <div className={cn('min-w-0', collapsed && 'hidden')}>
            <p className="truncate text-sm font-bold leading-none text-white">
              Phran<span className="text-cyan-400">.dev</span>
            </p>
            <p className="mt-1.5 truncate text-[8px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
              IoT Automation Platform
            </p>
          </div>
        </NavLink>

        {onClose && (
          <Button
            className="ml-auto text-slate-500 hover:bg-cyan-300/10 hover:text-cyan-300"
            aria-label="ปิดเมนู"
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X />
          </Button>
        )}
        {onCollapsedChange && (
          <Button
            className="absolute top-6 -right-4 z-10 size-8 rounded-full border-2 border-slate-600/70 bg-[#081321] text-slate-400 shadow-[0_4px_16px_rgba(0,0,0,0.45),0_0_0_3px_rgba(3,9,20,0.9)] transition-all duration-200 hover:scale-105 hover:border-cyan-300/50 hover:bg-[#0b1d2c] hover:text-cyan-300 focus-visible:border-cyan-300 focus-visible:ring-cyan-300/25"
            aria-controls="app-sidebar"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'}
            size="icon"
            title={collapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'}
            variant="ghost"
            onClick={() => onCollapsedChange(!collapsed)}
          >
            {collapsed ? (
              <ChevronsRight className="size-4" strokeWidth={2} />
            ) : (
              <ChevronsLeft className="size-4" strokeWidth={2} />
            )}
          </Button>
        )}
      </div>

      <nav
        aria-label="เมนูหลัก"
        className={cn(
          'flex-1 overflow-y-auto px-3 py-6',
          collapsed && 'px-2',
        )}
      >
        <p
          className={cn(
            'mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-600 uppercase',
            collapsed && 'sr-only',
          )}
        >
          Main menu
        </p>
        <div className="space-y-1.5">
          {navigation
            .filter(({ permission }) =>
              hasPermission(user?.role, permission),
            )
            .map(({ to, label, description, icon: Icon, end }) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-slate-400 transition-all hover:bg-cyan-300/[0.06] hover:text-slate-100',
                    collapsed && 'justify-center px-2',
                    isActive &&
                      'bg-cyan-300/10 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.08)] before:absolute before:top-3 before:bottom-3 before:left-0 before:w-0.5 before:rounded-full before:bg-cyan-300',
                  )
                }
                aria-label={collapsed ? label : undefined}
                end={end}
                key={to}
                title={collapsed ? label : undefined}
                to={to}
                onClick={onClose}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.035] transition-colors group-hover:bg-cyan-300/10">
                  <Icon className="size-4.5" strokeWidth={1.8} />
                </span>
                <span className={cn('min-w-0', collapsed && 'hidden')}>
                  <span className="block truncate text-sm font-medium">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-slate-600">
                    {description}
                  </span>
                </span>
              </NavLink>
            ))}
        </div>
      </nav>

      <div className="border-t border-cyan-300/10 p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-white/[0.025] p-3',
            collapsed && 'flex-col px-1',
          )}
        >
          <Avatar className="size-10 shrink-0 rounded-xl border border-cyan-300/15">
            <AvatarFallback className="rounded-xl bg-cyan-300/10 font-semibold text-cyan-300">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 flex-1', collapsed && 'hidden')}>
            <p className="truncate text-sm font-medium text-slate-200">
              {user?.displayName}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {user?.role ? roleLabels[user.role] : ''}
            </p>
          </div>
          <Button
            className="shrink-0 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"
            aria-label="ออกจากระบบ"
            size="icon"
            variant="ghost"
            onClick={onLogout}
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  onCollapsedChange,
  onMobileClose,
  onLogout,
}: AppSidebarProps) {
  return (
    <>
      <aside
        id="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-cyan-300/10 bg-[#050d18]/95 backdrop-blur-xl transition-[width] duration-300 lg:block',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          onLogout={onLogout}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="ปิดเมนู"
            type="button"
            onClick={onMobileClose}
          />
          <aside className="relative h-full w-[min(18rem,88vw)] border-r border-cyan-300/10 bg-[#050d18] shadow-2xl">
            <SidebarContent
              onClose={onMobileClose}
              onLogout={onLogout}
            />
          </aside>
        </div>
      )}
    </>
  )
}
