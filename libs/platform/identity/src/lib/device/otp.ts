import { createHash, randomInt } from 'node:crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRATION_MS = 10 * 60 * 1000;

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, '0');
}

export function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

export function getOtpExpiration(): Date {
  return new Date(Date.now() + OTP_EXPIRATION_MS);
}
