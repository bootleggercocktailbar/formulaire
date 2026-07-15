// api/get-form.js
// PUBLIC — aucune connexion requise. Un participant qui a le lien d'un
// formulaire (#fill=ID) a besoin de pouvoir le charger. Utilise la clé
// service_role côté serveur uniquement : le navigateur n'a jamais un accès
// direct à la table "forms".

module.exports = async function handler(req, res) {
  const id = (req.query && req.query.id) || '';
  if (!id) {
    res.status(400).json({ error: { message: 'Paramètre "id" requis.' } });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    res.status(500).json({ error: { message: 'Configuration serveur incomplète (SUPABASE_SERVICE_ROLE_KEY manquante).' } });
    return;
  }

  try {
    const r = await fetch(
      SUPABASE_URL + '/rest/v1/forms?id=eq.' + encodeURIComponent(id) + '&select=id,title,data',
      { headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY } }
    );
    const rows = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(rows));
    if (!rows.length) {
      res.status(404).json({ error: { message: 'Formulaire introuvable.' } });
      return;
    }
    res.status(200).json({ form: rows[0] });
  } catch (err) {
    console.error('get-form error:', err);
    res.status(500).json({ error: { message: String(err) } });
  }
};
