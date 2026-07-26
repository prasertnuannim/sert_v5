import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(320, 'อีเมลต้องไม่เกิน 320 ตัวอักษร'),
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .max(128, 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
