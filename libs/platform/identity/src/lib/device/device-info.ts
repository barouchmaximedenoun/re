export interface DeviceRequest {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

export function getDeviceInfo(request: DeviceRequest) {
  const forwardedFor = request.headers['x-forwarded-for'];

  let ipAddress = request.ip ?? null;

  if (typeof forwardedFor === 'string') {
    ipAddress = forwardedFor.split(',')[0]?.trim() || ipAddress;
  }

  const userAgent = getHeader(request.headers, 'user-agent');

  return {
    ipAddress,
    userAgent,
    browserName: null,
    osName: null,
  };
}

function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const value = headers[name];

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}
