// api/submit.js
// PUBLIC — aucune connexion requise. C'est ici qu'un participant envoie ses
// réponses. Utilise la clé service_role côté serveur uniquement.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Méthode non autorisée. Utilise POST.' } });
    return;
  }

  const { formId, values } = req.body || {};
  if (!formId || typeof values !== 'object') {
    res.status(400).json({ error: { message: 'formId et values sont requis.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    res.status(500).json({ error: { message: 'Configuration serveur incomplète (SUPABASE_SERVICE_ROLE_KEY manquante).' } });
    return;
  }

  const id = 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);

  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/submissions', {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify([{ id, form_id: formId, values }])
    });
    const result = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(result));
    res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('submit error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
