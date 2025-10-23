import crypto from 'crypto';

export function generateEmailConfirmationToken(): { token: string, expires: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // Token expires in 1 hour
  return { token, expires };
}