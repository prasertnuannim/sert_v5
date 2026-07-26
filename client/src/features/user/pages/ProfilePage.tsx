import {
  Activity,
  Cpu,
  Radio,
  Workflow,
} from 'lucide-react'
import { useAppSelector } from '../../../app/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { UserProfileCard } from '../components/UserProfileCard'

const systemOverview = [
  {
    icon: Cpu,
    value: '24',
    label: 'อุปกรณ์ที่เชื่อมต่อ',
    detail: '22 online',
    color: 'text-cyan-300',
  },
  {
    icon: Radio,
    value: '8',
    label: 'Gateway',
    detail: 'All operational',
    color: 'text-emerald-300',
  },
  {
    icon: Workflow,
    value: '12',
    label: 'Automation workflows',
    detail: '4 running',
    color: 'text-violet-300',
  },
  {
    icon: Activity,
    value: '99.9%',
    label: 'System uptime',
    detail: 'Last 30 days',
    color: 'text-sky-300',
  },
]

export function ProfilePage() {
  const user = useAppSelector((state) => state.user.profile)

  if (!user) return null

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          System overview
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          IoT Control Center
        </h1>
        <p className="mt-2 text-slate-400">
          ภาพรวมอุปกรณ์ Gateway และระบบ Automation แบบเรียลไทม์
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {systemOverview.map(
          ({ icon: Icon, value, label, detail, color }) => (
            <Card
              className="border-cyan-300/10 bg-[#071321]/80 py-0 shadow-xl"
              key={label}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Icon className={`size-5 ${color}`} strokeWidth={1.7} />
                  <span className="text-2xl font-semibold text-white">
                    {value}
                  </span>
                </div>
                <p className="mt-5 text-sm text-slate-300">{label}</p>
                <p className="mt-1 text-[10px] tracking-wide text-slate-600 uppercase">
                  {detail}
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <UserProfileCard user={user} />
    </section>
  )
}
