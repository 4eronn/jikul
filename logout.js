import { serialize } from 'cookie';

export default function handler(req, res) {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const cookieSerialized = serialize('session_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });

  res.setHeader('Set-Cookie', cookieSerialized);
  return res.status(200).json({ success: true, message: 'Logout berhasil' });
}
