// api/get-submissions.js
// ADMIN SEULEMENT — nécessite une session Supabase valide.

const { verifyAdmin } = require('./_lib/verifyAdmin');

module.exports = async function handler(req, res) {
  const user = await verifyAdmin(req);
  if (!user) {
    res.status(401).json({ error: { message: 'Non autorisé. Connecte-toi comme admin.' } });
    return;
  }

  const formId = (req.query && req.query.formId) || '';
  if (!formId) {
    res.status(400).json({ error: { message: 'Paramètre "formId" requis.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const r = await fetch(
      SUPABASE_URL + '/rest/v1/submissions?form_id=eq.' + encodeURIComponent(formId) + '&select=id,submitted_at,values&order=submitted_at.desc',
      { headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY } }
    );
    const rows = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(rows));
    res.status(200).json({ submissions: rows });
  } catch (err) {
    console.error('get-submissions error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
