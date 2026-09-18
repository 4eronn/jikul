import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_super_secret_circle_japanese_culinary_key_2026';

const ALLOWED_USERS = [
  (process.env.ALLOWED_USER || 'jikul@jc.co.id').toLowerCase().trim(),
  (process.env.ALLOWED_EMAIL || '').toLowerCase().trim(),
  'jikul@jc.co.id',
  'jikul',
  'jculinary',
  'jculinary@gmail.com',
  'jculinary06@gmail.com'
].filter(Boolean);

// Konfigurasi route/halaman mana saja yang wajib diproteksi
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard.html',
    '/admin/:path*',
    '/protected/:path*'
  ]
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const token = req.cookies.get('session_token')?.value;

  // Jika tidak ada cookie session_token, tolak dan redirect ke halaman login/beranda
  if (!token) {
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('auth', 'required');
    return Response.redirect(redirectUrl, 302);
  }

  try {
    const secretKey = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    // Pastikan username / email di session benar
    if (!payload.email || !ALLOWED_USERS.includes(payload.email.toLowerCase().trim())) {
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('auth', 'denied');
      return Response.redirect(redirectUrl, 302);
    }

    // Jika valid, izinkan request dilanjutkan ke halaman
    return;
  } catch (err) {
    console.error('Middleware JWT Verify failed:', err.message);
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('auth', 'invalid');
    return Response.redirect(redirectUrl, 302);
  }
}
