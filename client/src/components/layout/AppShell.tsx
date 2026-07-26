import { Cpu, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { logoutUser } from '../../features/auth/store/authSlice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AppSidebar } from './AppSidebar'

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed'

export function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true',
  )

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_KEY,
      String(sidebarCollapsed),
    )
  }, [sidebarCollapsed])

  const handleLogout = async () => {
    setMobileSidebarOpen(false)
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  return (
    <div className="dark relative min-h-svh overflow-hidden bg-[#030914] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.08),transparent_28%),linear-gradient(rgba(34,211,238,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.025)_1px,transparent_1px)] bg-[size:auto,40px_40px,40px_40px]" />

      <AppSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapsedChange={setSidebarCollapsed}
        onLogout={handleLogout}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <header className="sticky top-0 z-30 border-b border-cyan-300/10 bg-[#030914]/85 backdrop-blur-xl lg:hidden">
        <div className="relative flex h-16 items-center px-4 sm:px-6">
          <Button
            className="mr-3 text-slate-400 hover:bg-cyan-300/10 hover:text-cyan-300"
            aria-expanded={mobileSidebarOpen}
            aria-label="เปิดเมนู"
            size="icon"
            variant="ghost"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu />
          </Button>
          <NavLink className="flex items-center gap-2.5" to="/user">
            <span className="relative grid size-8 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
              <Cpu className="size-4.5" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border-2 border-[#030914] bg-emerald-400" />
            </span>
            <p className="text-sm font-bold leading-none text-white">
              Phran<span className="text-cyan-400">.dev</span>
            </p>
          </NavLink>
        </div>
      </header>

      <main
        className={cn(
          'relative px-4 py-8 transition-[margin] duration-300 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-14',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72',
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}
