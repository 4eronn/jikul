import { SignJWT } from 'jose';
import { serialize } from 'cookie';

const ALLOWED_USERS = [
  (process.env.ALLOWED_USER || 'jikul@jc.co.id').toLowerCase().trim(),
  (process.env.ALLOWED_EMAIL || '').toLowerCase().trim(),
  'jikul@jc.co.id',
  'jikul',
  'jculinary',
  'jculinary@gmail.com',
  'jculinary06@gmail.com'
].filter(Boolean);

const ALLOWED_PASS = process.env.ALLOWED_PASS || 'japaneseculinary';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_super_secret_circle_japanese_culinary_key_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }
    const { username, password } = body || {};

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username dan password wajib diisi.' 
      });
    }

    const inputUser = String(username).toLowerCase().trim();
    const inputPass = String(password);

    // Verifikasi username dan password
    const isUserValid = ALLOWED_USERS.includes(inputUser);
    const isPassValid = (inputPass === ALLOWED_PASS);

    if (!isUserValid || !isPassValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    // Buat Session Token JWT
    const secretKey = new TextEncoder().encode(SESSION_SECRET);
    const sessionToken = await new SignJWT({
      email: inputUser,
      name: 'Member Circle',
      picture: 'mascot-cutout.png',
      role: 'circle_member'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey);

    // Buat HttpOnly Cookie
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const cookieSerialized = serialize('session_token', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 hari
    });

    res.setHeader('Set-Cookie', cookieSerialized);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      user: {
        email: ALLOWED_USER,
        name: 'Member Circle',
        picture: 'mascot-cutout.png'
      }
    });

  } catch (error) {
    console.error('Login Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses login.'
    });
  }
}
