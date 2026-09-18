export default function handler(req, res) {
  // Return public Google Client ID without exposing secret keys
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  res.status(200).json({
    clientId: clientId
  });
}
