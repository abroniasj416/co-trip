import { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router';
import styles from './LoginPage.module.css';

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = (location.state as { from?: string })?.from || ROUTES.PLANS;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!email) next.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = '올바른 이메일 형식이 아닙니다.';
    if (!password) next.password = '비밀번호를 입력해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });
      navigate(redirectTo);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '로그인 중 오류가 발생했습니다.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="다시 만나요 👋"
      subtitle="로그인하고 여행 계획을 이어가세요."
      footer={
        <>
          아직 계정이 없으신가요?{' '}
          <button onClick={() => navigate(ROUTES.SIGN_UP)}>회원가입</button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormInput
          id="email"
          label="이메일"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <FormInput
          id="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <Button
          label={loading ? '로그인 중...' : '로그인'}
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
        />
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
