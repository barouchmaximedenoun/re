'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/auth/auth-context';

export default function DashboardPage() {
  const router = useRouter();

  const {
    status,
    user,
    logout,
  } = useAuth();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    router.replace('/login');

    return <p>Redirecting...</p>;
  }

  async function handleLogout(): Promise<void> {
    await logout();
    router.replace('/login');
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>
        Welcome{' '}
        {user?.name ?? user?.email}
      </p>

      <p>{user?.email}</p>

      <button
        type="button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </main>
  );
}