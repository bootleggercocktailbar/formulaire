// api/save-form.js
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

  const { id, title, data, notifyEmail } = req.body || {};
  if (!id || !title || !data) {
    res.status(400).json({ error: { message: 'id, title et data sont requis.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json'
  };

  try {
    // On préserve le statut "favori" existant (il se gère via /api/toggle-favorite,
    // pas ici) — on va donc le relire avant d'écraser la ligne.
    let existingFavorite = false;
    const existingRes = await fetch(
      SUPABASE_URL + '/rest/v1/forms?id=eq.' + encodeURIComponent(id) + '&select=is_favorite',
      { headers }
    );
    if (existingRes.ok) {
      const existingRows = await existingRes.json();
      if (existingRows.length) existingFavorite = !!existingRows[0].is_favorite;
    }

    const r = await fetch(SUPABASE_URL + '/rest/v1/forms?on_conflict=id', {
      method: 'POST',
      headers: Object.assign({}, headers, { Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify([{
        id, title, data,
        notify_email: notifyEmail || null,
        is_favorite: existingFavorite,
        owner_id: user.id,
        updated_at: new Date().toISOString()
      }])
    });
    const result = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(result));
    res.status(200).json({ ok: true, form: result[0] });
  } catch (err) {
    console.error('save-form error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
