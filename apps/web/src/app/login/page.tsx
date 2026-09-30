'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/auth/auth-context';

export default function LoginPage() {
  const router = useRouter();

  const {
    login,
    verifyDevice,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otpChallengeId, setOtpChallengeId] =
    useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const [otpForTest, setOtpForTest] = useState<string | undefined>();

  const [error, setError] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await login(
        email,
        password,
      );

      if (result.requiresOtp) {
        setOtpChallengeId(
          result.otpChallengeId,
        );
        setOtpForTest(result.otp);
        return;
      }

      router.push('/');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!otpChallengeId) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyDevice(
        otpChallengeId,
        otp,
      );

      router.push('/');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'OTP verification failed',
      );
    } finally {
      setLoading(false);
    }
  }

  if (otpChallengeId) {
    return (
      <main>
        <h1>Verify your device</h1>

        <form onSubmit={handleVerifyOtp}>
          <div>
            <label htmlFor="otp">
              Verification code
            </label>
            {otpForTest && <label htmlFor="otp">
              {otpForTest}
            </label>
            }
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <p role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Verifying...'
              : 'Verify'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p>
        Don't have an account?{' '}
        <a href="/register">
          Register
        </a>
      </p>
    </main>
  );
}