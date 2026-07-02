// api/list-forms.js
// ADMIN SEULEMENT — nécessite une session Supabase valide.

const { verifyAdmin } = require('./_lib/verifyAdmin');

module.exports = async function handler(req, res) {
  const user = await verifyAdmin(req);
  if (!user) {
    res.status(401).json({ error: { message: 'Non autorisé. Connecte-toi comme admin.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const r = await fetch(
      SUPABASE_URL + '/rest/v1/forms?select=id,title,created_at&order=created_at.desc',
      { headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY } }
    );
    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data));
    res.status(200).json({ forms: data });
  } catch (err) {
    console.error('list-forms error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
