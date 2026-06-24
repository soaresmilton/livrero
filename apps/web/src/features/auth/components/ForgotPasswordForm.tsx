import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useForgotPassword } from '../hooks/useForgotPassword'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => forgotPassword.mutate(data)

  if (forgotPassword.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary-container)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-on-primary-container)' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.86 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <p style={{ color: 'var(--color-on-surface)' }} className="text-sm leading-relaxed">
          Check your inbox (and spam folder). If this email is registered, you'll receive instructions shortly.
        </p>
        <Link
          to="/login"
          className="text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" fullWidth isLoading={forgotPassword.isPending}>
        Send reset link
      </Button>

      <Link
        to="/login"
        className="text-center text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        ← Back to sign in
      </Link>
    </form>
  )
}
