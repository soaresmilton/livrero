import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogin } from '../hooks/useLogin'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => login.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {login.error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
          }}
          role="alert"
        >
          Invalid email or password. Please try again.
        </div>
      )}

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-1">
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Link
          to="/forgot-password"
          className="self-end text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth isLoading={login.isPending}>
        Sign in
      </Button>

      <p
        className="text-center text-sm"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
