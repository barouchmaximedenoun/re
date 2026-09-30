'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuthSessionState,
  AuthSessionStatus,
} from './auth-session';

import { appContext } from '@/lib/bootstrap';

interface AuthContextValue {
  status: AuthSessionStatus;
  user: AuthSessionState['user'];

  login: (
    email: string,
    password: string,
  ) => ReturnType<
    typeof appContext.authSession.login
  >;

  verifyDevice: (
    otpChallengeId: string,
    otp: string,
  ) => ReturnType<
    typeof appContext.authSession.verifyDevice
  >;

  logout: () => Promise<void>;

  register: (
    email: string,
    password: string,
    name: string,
  ) => ReturnType<
    typeof appContext.authSession.register
  >;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] =
    useState<AuthSessionState>(
      appContext.authSession.getState(),
    );

  useEffect(() => {
    let mounted = true;

    appContext.authSession
      .initialize()
      .then((nextState) => {
        if (mounted) {
          setState(nextState);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function login(
    email: string,
    password: string,
  ) {
    const result =
      await appContext.authSession.login(
        email,
        password,
      );

    if (!result.requiresOtp) {
      setState(
        appContext.authSession.getState(),
      );
    }

    return result;
  }

  async function verifyDevice(
    otpChallengeId: string,
    otp: string,
  ) {
    const result =
      await appContext.authSession.verifyDevice(
        otpChallengeId,
        otp,
      );

    setState(
      appContext.authSession.getState(),
    );

    return result;
  }

  async function logout(): Promise<void> {
    await appContext.authSession.logout();

    setState(
      appContext.authSession.getState(),
    );
  }

  async function register(
    email: string,
    password: string,
    name: string,
  ) {
    return appContext.authSession.register(
      email,
      password,
      name,
    );
  }

  return (
    <AuthContext.Provider
      value={{
        status: state.status,
        user: state.user,
        login,
        verifyDevice,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}