import { query } from '../db.js';

export interface DeviceVerificationOtp {
  id: string;
  user_id: string;
  device_id: string;
  otp_code_hash: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}

export async function createDeviceVerificationOtp(data: {
  userId: string;
  deviceId: string;
  otpCodeHash: string;
  expiresAt: Date;
}): Promise<DeviceVerificationOtp> {
  const result = await query<DeviceVerificationOtp>(
    `
      INSERT INTO auth_schema.device_verification_otps (
        user_id,
        device_id,
        otp_code_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        user_id,
        device_id,
        otp_code_hash,
        expires_at,
        is_used,
        created_at
    `,
    [
      data.userId,
      data.deviceId,
      data.otpCodeHash,
      data.expiresAt,
    ],
  );

  return result.rows[0];
}

export async function findValidDeviceVerificationOtp(
  userId: string,
  deviceId: string,
): Promise<DeviceVerificationOtp | null> {
  const result = await query<DeviceVerificationOtp>(
    `
      SELECT
        id,
        user_id,
        device_id,
        otp_code_hash,
        expires_at,
        is_used,
        created_at
      FROM auth_schema.device_verification_otps
      WHERE user_id = $1
        AND device_id = $2
        AND is_used = FALSE
        AND expires_at > now()
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId, deviceId],
  );

  return result.rows[0] ?? null;
}

export async function markDeviceVerificationOtpUsed(
  otpId: string,
): Promise<void> {
  await query(
    `
      UPDATE auth_schema.device_verification_otps
      SET is_used = TRUE
      WHERE id = $1
    `,
    [otpId],
  );
}

export async function findValidDeviceVerificationOtpById(
  otpId: string,
): Promise<DeviceVerificationOtp | null> {
  const result = await query<DeviceVerificationOtp>(
    `
      SELECT
        id,
        user_id,
        device_id,
        otp_code_hash,
        expires_at,
        is_used,
        created_at
      FROM auth_schema.device_verification_otps
      WHERE id = $1
        AND is_used = FALSE
        AND expires_at > now()
      LIMIT 1
    `,
    [otpId],
  );

  return result.rows[0] ?? null;
}
