import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRegister } from '../hooks/useRegister'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const register_ = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => register_.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {register_.error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
          }}
          role="alert"
        >
          {(register_.error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
            'Something went wrong. Please try again.'}
        </div>
      )}

      <Input
        id="name"
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Milton Soares"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        hint="At least 8 characters"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" fullWidth isLoading={register_.isPending}>
        Create account
      </Button>

      <p
        className="text-center text-sm"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
