// api/toggle-favorite.js
// ADMIN SEULEMENT — nécessite une session Supabase valide.

const { verifyAdmin } = require('./_lib/verifyAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Méthode non autorisée. Utilise POST.' } });
    return;
  }

  const user = await verifyAdmin(req);
  if (!user) {
    res.status(401).json({ error: { message: 'Non autorisé. Connecte-toi comme admin.' } });
    return;
  }

  const { id, isFavorite } = req.body || {};
  if (!id || typeof isFavorite !== 'boolean') {
    res.status(400).json({ error: { message: 'id et isFavorite (booléen) sont requis.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/forms?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ is_favorite: isFavorite })
    });
    if (!r.ok) { const t = await r.text(); throw new Error(t); }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('toggle-favorite error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
