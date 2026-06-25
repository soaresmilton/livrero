import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { LibraryPage } from '@/pages/LibraryPage'

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/library', element: <LibraryPage /> },
          { path: '/', element: <DashboardPage /> },
        ]
      }
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
