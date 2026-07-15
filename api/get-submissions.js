// api/get-submission.js
// ADMIN SEULEMENT — nécessite une session Supabase valide. Utilisée pour le
// lien direct envoyé par courriel vers une réponse précise.

const { verifyAdmin } = require('./_lib/verifyAdmin');

module.exports = async function handler(req, res) {
  const user = await verifyAdmin(req);
  if (!user) {
    res.status(401).json({ error: { message: 'Non autorisé. Connecte-toi comme admin.' } });
    return;
  }

  const id = (req.query && req.query.id) || '';
  if (!id) {
    res.status(400).json({ error: { message: 'Paramètre "id" requis.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY };

  try {
    const subRes = await fetch(
      SUPABASE_URL + '/rest/v1/submissions?id=eq.' + encodeURIComponent(id) + '&select=id,form_id,submitted_at,values',
      { headers }
    );
    const subRows = await subRes.json();
    if (!subRes.ok) throw new Error(JSON.stringify(subRows));
    if (!subRows.length) { res.status(404).json({ error: { message: 'Réponse introuvable.' } }); return; }
    const submission = subRows[0];

    const formRes = await fetch(
      SUPABASE_URL + '/rest/v1/forms?id=eq.' + encodeURIComponent(submission.form_id) + '&select=id,title,data',
      { headers }
    );
    const formRows = await formRes.json();
    if (!formRes.ok) throw new Error(JSON.stringify(formRows));
    if (!formRows.length) { res.status(404).json({ error: { message: 'Formulaire associé introuvable.' } }); return; }

    res.status(200).json({ submission, form: formRows[0] });
  } catch (err) {
    console.error('get-submission error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
