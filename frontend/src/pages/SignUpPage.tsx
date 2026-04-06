import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router';
import styles from './SignUpPage.module.css';

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
}

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!email) next.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = '올바른 이메일 형식이 아닙니다.';
    if (!password) next.password = '비밀번호를 입력해주세요.';
    else if (password.length < 8) next.password = '비밀번호는 8자 이상이어야 합니다.';
    if (password !== passwordConfirm) next.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!nickname) next.nickname = '닉네임을 입력해주세요.';
    else if (nickname.length < 2 || nickname.length > 20) next.nickname = '닉네임은 2~20자여야 합니다.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp({ email, password, nickname });
      navigate(ROUTES.LOGIN, { state: { signUpSuccess: true } });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '회원가입 중 오류가 발생했습니다.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="함께 떠나봐요 ✈️"
      subtitle="CO TRIP에 가입하고 여행 계획을 시작하세요."
      footer={
        <>
          이미 계정이 있으신가요?{' '}
          <button onClick={() => navigate(ROUTES.LOGIN)}>로그인</button>
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
          id="nickname"
          label="닉네임"
          type="text"
          placeholder="2~20자 닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={errors.nickname}
        />
        <FormInput
          id="password"
          label="비밀번호"
          type="password"
          placeholder="8자 이상 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          error={errors.passwordConfirm}
          autoComplete="new-password"
        />

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <Button
          label={loading ? '가입 중...' : '회원가입'}
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
        />
      </form>
    </AuthLayout>
  );
}

export default SignUpPage;
