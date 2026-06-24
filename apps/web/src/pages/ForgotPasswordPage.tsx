import { AuthLayout } from '@/components/layout/AuthLayout'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries, we'll help you reset it."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
