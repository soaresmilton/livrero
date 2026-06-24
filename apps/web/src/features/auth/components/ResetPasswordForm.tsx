import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useResetPassword } from '../hooks/useResetPassword'

const schema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) =>
    resetPassword.mutate({ token, new_password: data.new_password })

  if (!token) {
    return (
      <p className="text-sm text-center" style={{ color: 'var(--color-error)' }}>
        Invalid or missing reset token. Please request a new password reset.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {resetPassword.error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
          }}
          role="alert"
        >
          This link has expired or already been used. Please request a new one.
        </div>
      )}

      <Input
        id="new_password"
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        hint="At least 8 characters"
        error={errors.new_password?.message}
        {...register('new_password')}
      />

      <Input
        id="confirm_password"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <Button type="submit" fullWidth isLoading={resetPassword.isPending}>
        Reset password
      </Button>
    </form>
  )
}
