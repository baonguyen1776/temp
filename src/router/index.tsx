import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { AuthGuard, AuthLayout } from '@/components/auth/AuthGuard'

// Pages
import HomePage from '@/pages/HomePage'
import SearchPage from '@/pages/SearchPage'
import MemoryDetailPage from '@/pages/MemoryDetailPage'
import CreateMemoryPage from '@/pages/CreateMemoryPage'
import ProfilePage from '@/pages/ProfilePage'
import DashboardPage from '@/pages/DashboardPage'
import CreatePlanPage from '@/pages/CreatePlanPage'
import PlanDetailPage from '@/pages/PlanDetailPage'
import FocusSessionPage from '@/pages/FocusSessionPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import InterviewConfigPage from '@/pages/InterviewConfigPage'
import InterviewSessionPage from '@/pages/InterviewSessionPage'
import InterviewResultPage from '@/pages/InterviewResultPage'

import PlansPage from '@/pages/PlansPage'
import FocusPage from '@/pages/FocusPage'
import HistoryPage from '@/pages/HistoryPage'

import LandingPage from '@/pages/LandingPage'

const router = createBrowserRouter([
  // ─── Public routes ───────────────────────────────────
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },

  // ─── Full-screen routes (no sidebar) ─────────────────
  {
    path: '/focus/:id',
    element: (
      <AuthGuard>
        <FocusSessionPage />
      </AuthGuard>
    ),
  },
  {
    path: '/interview/:id',
    element: (
      <AuthGuard>
        <InterviewSessionPage />
      </AuthGuard>
    ),
  },

  // ─── Root route ───────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },

  // ─── App layout routes (with sidebar + header) ───────
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'create',
        element: <CreateMemoryPage />,
      },
      {
        path: 'memory/:id',
        element: <MemoryDetailPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'plans',
        element: <PlansPage />,
      },
      {
        path: 'plans/new',
        element: <CreatePlanPage />,
      },
      {
        path: 'plans/:id',
        element: <PlanDetailPage />,
      },
      {
        path: 'focus',
        element: <FocusPage />,
      },
      {
        path: 'interview/config',
        element: <InterviewConfigPage />,
      },
      {
        path: 'interview/:id/result',
        element: <InterviewResultPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
