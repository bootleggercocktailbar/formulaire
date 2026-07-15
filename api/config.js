// api/_lib/verifyAdmin.js
// Vérifie le jeton d'authentification Supabase envoyé par le navigateur.
// Retourne l'utilisateur si le jeton est valide, sinon null.
// Utilisé par toutes les fonctions réservées à l'admin (jamais par les
// fonctions publiques utilisées par les participants).

async function verifyAdmin(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: {
        Authorization: 'Bearer ' + token,
        apikey: SUPABASE_ANON_KEY
      }
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user && user.id ? user : null;
  } catch (err) {
    console.error('verifyAdmin error:', err);
    return null;
  }
}

module.exports = { verifyAdmin };
