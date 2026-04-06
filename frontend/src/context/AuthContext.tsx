import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authApi, LoginRequest, SignUpRequest } from '../api/auth';

interface AuthUser {
  email: string;
  nickname: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  signUp: (request: SignUpRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromStorage(): AuthUser | null {
  const token = localStorage.getItem('accessToken');
  const email = localStorage.getItem('userEmail');
  const nickname = localStorage.getItem('userNickname');
  if (token && email && nickname) {
    return { email, nickname };
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUserFromStorage);

  const login = useCallback(async (request: LoginRequest) => {
    const { data } = await authApi.login(request);
    const { accessToken, email, nickname } = data.data;

    // 주의: localStorage는 XSS에 취약합니다.
    // 프로덕션 환경에서는 httpOnly 쿠키 사용을 권장합니다.
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userNickname', nickname);

    setUser({ email, nickname });
  }, []);

  const signUp = useCallback(async (request: SignUpRequest) => {
    await authApi.signUp(request);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userNickname');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
