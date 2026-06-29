import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { LibraryPage } from '@/pages/LibraryPage'
import { SessionPage } from '@/pages/SessionPage'
import { SessionsIndexPage } from '@/pages/SessionsIndexPage'
import { NotesDashboardPage } from '@/pages/NotesDashboardPage'
import { BookNotesPage } from '@/pages/BookNotesPage'

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
          { path: '/sessions', element: <SessionsIndexPage /> },
          { path: '/sessions/:id', element: <SessionPage /> },
          { path: '/notes', element: <NotesDashboardPage /> },
          { path: '/library/:bookId/notes', element: <BookNotesPage /> },
          { path: '/', element: <DashboardPage /> },
        ]
      }
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
