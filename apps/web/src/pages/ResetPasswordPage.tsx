import { AuthLayout } from '@/components/layout/AuthLayout'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account."
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
