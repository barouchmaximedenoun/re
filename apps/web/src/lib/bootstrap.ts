'use client';

import { createAppContext } from './app-context';

export const appContext = createAppContext();

/* initialize fait dans AuthProvider dasn auth-context.ts 
  let bootstrapPromise:
  | Promise<void>
  | null = null;

export function bootstrapApp(): Promise<void> {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise =
    appContext.authSession
      .initialize()
      .then(() => undefined);

  return bootstrapPromise;
}
 */