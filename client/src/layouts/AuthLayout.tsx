import {
  Cpu,
  Network,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Outlet } from 'react-router-dom'
import iotRobotHero from '../assets/iot-robot-login-hero.jpg'

export function AuthLayout() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#010712] text-slate-100">
      <img
        className="absolute inset-0 size-full -scale-x-100 object-cover object-[32%_center] lg:object-center"
        src={iotRobotHero}
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(1,7,18,0.5)_0%,rgba(1,7,18,0.12)_42%,rgba(1,7,18,0.48)_100%)] lg:bg-[linear-gradient(90deg,rgba(1,7,18,0.08)_0%,transparent_48%,rgba(1,7,18,0.42)_76%,rgba(1,7,18,0.84)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,7,18,0.58)_0%,transparent_24%,transparent_72%,#010712_100%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-svh max-w-[1680px] flex-col px-5 sm:px-8 lg:px-14 xl:px-[4.5rem]">
        <header className="flex h-24 shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative grid size-10 place-items-center text-cyan-400">
              <span className="absolute inset-1 rotate-45 rounded-sm border border-cyan-400/50 bg-cyan-400/10" />
              <Cpu className="relative size-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                Phran<span className="text-cyan-400">.dev</span>
              </p>
              <p className="text-[8px] tracking-[0.24em] text-slate-500 uppercase">
                IoT · Automation · Software
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-[#03131a]/60 px-3 py-1.5 text-[9px] tracking-[0.1em] text-emerald-300 uppercase backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="hidden sm:inline">Platform online</span>
            <span className="sm:hidden">Online</span>
          </div>
        </header>

        <div className="grid min-w-0 flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-20">
          <div className="hidden min-h-[600px] min-w-0 lg:block" aria-hidden="true" />

          <aside className="relative z-20 flex min-w-0 items-center justify-center lg:justify-end lg:before:absolute lg:before:top-1/2 lg:before:-left-10 lg:before:h-[70%] lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-gradient-to-b lg:before:from-transparent lg:before:via-cyan-300/20 lg:before:to-transparent xl:before:-left-10">
            <div
              className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-cyan-500/6 blur-3xl"
              aria-hidden="true"
            />
            <Outlet />
          </aside>
        </div>

        <footer className="flex min-h-20 shrink-0 items-center justify-between border-t border-slate-800/70 text-[9px] tracking-[0.12em] text-slate-500 uppercase">
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline">© 2026 Phran.dev</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap className="size-3 text-cyan-400" />
              Edge computing
            </span>
            <span className="hidden items-center gap-1.5 text-slate-300 sm:flex">
              <Network className="size-3 text-cyan-400" />
              MQTT
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-cyan-400" />
            Secure gateway · TLS 1.3
          </span>
        </footer>
      </div>
    </main>
  )
}
