import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowRight,
  Cpu,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  clearAuthError,
  loginUser,
} from '../store/authSlice'
import {
  loginSchema,
  type LoginFormValues,
} from '../schemas/login.schema'

const defaultEmail = import.meta.env.DEV
  ? (import.meta.env.VITE_DEFAULT_EMAIL ?? '')
  : ''
const defaultPassword = import.meta.env.DEV
  ? (import.meta.env.VITE_DEFAULT_PASSWORD ?? '')
  : ''

export function LoginForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: defaultPassword,
    },
    mode: 'onTouched',
  })

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      await dispatch(loginUser(values)).unwrap()
      navigate('/user', { replace: true })
    } catch {
      // The rejected thunk stores the API message in Redux.
    }
  }

  const resetError = () => {
    if (error) dispatch(clearAuthError())
  }

  return (
    <Card className="relative w-full min-w-0 max-w-full gap-0 overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-slate-950/58 via-[#061525]/38 to-cyan-950/20 py-0 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_32px_100px_rgba(0,0,0,0.42),0_0_70px_rgba(34,211,238,0.07)] ring-1 ring-cyan-300/10 backdrop-blur-[12px] sm:max-w-[420px]">
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
      <div
        className="pointer-events-none absolute top-0 right-0 size-36 rounded-full bg-cyan-300/8 blur-3xl"
        aria-hidden="true"
      />

      <CardHeader className="px-6 pt-7 pb-5 sm:px-8 sm:pt-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative grid size-11 place-items-center rounded-xl border border-cyan-200/35 bg-cyan-300/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_28px_rgba(34,211,238,0.14)]">
            <Cpu className="size-5.5" />
            <span className="absolute -right-1 -bottom-1 size-2.5 rounded-full border-2 border-[#03101e] bg-emerald-400" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[10px] font-semibold tracking-wide text-emerald-300 uppercase">
            <ShieldCheck className="size-3" />
            Secure access
          </span>
        </div>

        <CardTitle className="text-2xl tracking-[-0.025em] text-white sm:text-4xl">
          เข้าสู่ระบบ Phran.dev
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-6 text-slate-300/75">
          จัดการอุปกรณ์ IoT และระบบ Automation ของคุณ
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8">
        <form
          className="grid gap-4.5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {error && (
            <Alert
              className="border-red-400/25 bg-red-400/10 text-red-300"
              variant="destructive"
            >
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label
              className="text-xs font-semibold tracking-wide text-slate-200/85"
              htmlFor="email"
            >
              อีเมลผู้ดูแลระบบ
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="h-12 rounded-xl border-white/15 bg-black/20 pl-10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[4px] placeholder:text-slate-500 hover:border-cyan-300/35 hover:bg-black/25 focus-visible:border-cyan-300 focus-visible:bg-cyan-300/7 focus-visible:ring-cyan-400/10 aria-invalid:border-red-400/60 aria-invalid:ring-0! focus-visible:aria-invalid:border-red-400 focus-visible:aria-invalid:ring-3! focus-visible:aria-invalid:ring-red-500/10"
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email', {
                  onChange: resetError,
                })}
              />
            </div>
            {errors.email && (
              <p
                className="mt-0.5 text-xs font-medium text-red-400"
                id="email-error"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              className="text-xs font-semibold tracking-wide text-slate-200/85"
              htmlFor="password"
            >
              รหัสผ่าน
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="h-12 rounded-xl border-white/15 bg-black/20 pr-11 pl-10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[4px] placeholder:text-slate-500 hover:border-cyan-300/35 hover:bg-black/25 focus-visible:border-cyan-300 focus-visible:bg-cyan-300/7 focus-visible:ring-cyan-400/10 aria-invalid:border-red-400/60 aria-invalid:ring-0! focus-visible:aria-invalid:border-red-400 focus-visible:aria-invalid:ring-3! focus-visible:aria-invalid:ring-red-500/10"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password', {
                  onChange: resetError,
                })}
              />
              <Button
                className="absolute top-1/2 right-1.5 size-8 -translate-y-1/2 text-slate-500 hover:bg-cyan-300/10 hover:text-cyan-300"
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                }
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password && (
              <p
                className="mt-0.5 text-xs font-medium text-red-400"
                id="password-error"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            className="mt-2 h-12 w-full rounded-xl border border-cyan-200/45 bg-gradient-to-r from-cyan-400 to-sky-400 font-semibold text-[#021018] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_38px_rgba(34,211,238,0.2)] transition-all hover:-translate-y-0.5 hover:from-cyan-300 hover:to-sky-300 hover:shadow-[0_16px_44px_rgba(34,211,238,0.28)]"
            size="lg"
            type="submit"
            disabled={status === 'loading' || isSubmitting}
          >
            {status === 'loading' || isSubmitting ? (
              <>
                <Spinner />
                กำลังตรวจสอบข้อมูล
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-white/8 bg-black/10 px-6 py-4 text-center text-[11px] text-slate-400 backdrop-blur-[4px]">
        ต้องการความช่วยเหลือ กรุณาติดต่อ Phran.dev Support
      </CardFooter>
    </Card>
  )
}
