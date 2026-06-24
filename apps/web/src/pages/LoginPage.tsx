import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your reading journey."
    >
      <LoginForm />
    </AuthLayout>
  )
}
