import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import PlansPage from '../pages/PlansPage';

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  SIGN_UP: '/signup',
  PLANS: '/plans',
} as const;

/** 인증된 사용자만 접근 가능한 라우트 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
}

/** 이미 로그인한 사용자가 접근하면 플랜 페이지로 리다이렉트 */
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
]);
