import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import PlansPage from '../pages/PlansPage';
import PlanDetailPage from '../pages/PlanDetailPage';

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  SIGN_UP: '/signup',
  PLANS: '/plans',
  PLAN_DETAIL: (planId: string) => `/plans/${planId}`,
} as const;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
}

function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to={ROUTES.PLANS} replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <LandingPage />,
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestOnlyRoute>
        <LoginPage />
      </GuestOnlyRoute>
    ),
  },
  {
    path: ROUTES.SIGN_UP,
    element: (
      <GuestOnlyRoute>
        <SignUpPage />
      </GuestOnlyRoute>
    ),
  },
  {
    path: ROUTES.PLANS,
    element: (
      <ProtectedRoute>
        <PlansPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/plans/:planId',
    element: (
      <ProtectedRoute>
        <PlanDetailPage />
      </ProtectedRoute>
    ),
  },
]);
