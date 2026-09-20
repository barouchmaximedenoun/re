import { query } from '../db.js';

export interface UserDevice {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  browser_name: string | null;
  os_name: string | null;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

export async function findUserDevice(
  userId: string,
  ipAddress: string | null,
  browserName: string | null,
  osName: string | null,
): Promise<UserDevice | null> {
  const result = await query<UserDevice>(
    `
      SELECT
        id,
        user_id,
        ip_address,
        user_agent,
        browser_name,
        os_name,
        is_verified,
        last_login_at,
        created_at
      FROM auth_schema.user_devices
      WHERE user_id = $1
        AND ip_address IS NOT DISTINCT FROM $2
        AND browser_name IS NOT DISTINCT FROM $3
        AND os_name IS NOT DISTINCT FROM $4
      LIMIT 1
    `,
    [userId, ipAddress, browserName, osName],
  );

  return result.rows[0] ?? null;
}

export async function createUserDevice(data: {
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  browserName: string | null;
  osName: string | null;
}): Promise<UserDevice> {
  const result = await query<UserDevice>(
    `
      INSERT INTO auth_schema.user_devices (
        user_id,
        ip_address,
        user_agent,
        browser_name,
        os_name
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id,
        ip_address,
        user_agent,
        browser_name,
        os_name,
        is_verified,
        last_login_at,
        created_at
    `,
    [
      data.userId,
      data.ipAddress,
      data.userAgent,
      data.browserName,
      data.osName,
    ],
  );

  return result.rows[0];
}

export async function updateDeviceLastLogin(deviceId: string): Promise<void> {
  await query(
    `
      UPDATE auth_schema.user_devices
      SET last_login_at = now()
      WHERE id = $1
    `,
    [deviceId],
  );
}

export async function markDeviceVerified(deviceId: string): Promise<void> {
  await query(
    `
      UPDATE auth_schema.user_devices
      SET
        is_verified = TRUE,
        last_login_at = now()
      WHERE id = $1
    `,
    [deviceId],
  );
}
