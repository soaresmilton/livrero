import { AuthLayout } from '@/components/layout/AuthLayout'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function RegisterPage() {
  return (
    <AuthLayout
      title="Start your journey"
      subtitle="Create your personal reading sanctuary."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
