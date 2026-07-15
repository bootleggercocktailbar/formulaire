// api/submit.js
// PUBLIC — aucune connexion requise. C'est ici qu'un participant envoie ses
// réponses. Utilise la clé service_role côté serveur uniquement.
// Envoie aussi un courriel de notification à l'admin si le formulaire en a un
// de configuré (via Resend).

function findParticipantName(fields, values) {
  if (!Array.isArray(fields)) return null;
  const candidates = fields.filter(f => f.type === 'text' && /nom|name/i.test(f.label || ''));
  const parts = [];
  // Essaie de trouver Prénom + Nom séparément, sinon un seul champ "Nom".
  const prenom = candidates.find(f => /pr[ée]nom|first/i.test(f.label || ''));
  const nom = candidates.find(f => !/pr[ée]nom|first/i.test(f.label || ''));
  if (prenom && values[prenom.id]) parts.push(values[prenom.id]);
  if (nom && values[nom.id]) parts.push(values[nom.id]);
  if (parts.length) return parts.join(' ');
  for (const f of candidates) {
    if (values[f.id]) return String(values[f.id]);
  }
  return null;
}

async function sendNotificationEmail({ toEmail, participantName, formTitle, submissionId, siteUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !toEmail) return;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@resend.dev';
  const link = siteUrl + '/#response=' + submissionId;
  const displayName = participantName || 'Un participant';

  const html =
    '<p><strong>' + escapeHtml(displayName) + '</strong> vient de remplir le formulaire ' +
    '<strong>' + escapeHtml(formTitle) + '</strong>.</p>' +
    '<p><a href="' + link + '">Voir la réponse dans Griffe</a></p>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: 'Nouvelle réponse — ' + formTitle,
        html
      })
    });
  } catch (err) {
    console.error('Échec envoi courriel de notification:', err);
    // On ne bloque jamais la soumission du participant si le courriel échoue.
  }
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

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

    // Notification par courriel — après avoir répondu au participant, pour
    // ne jamais ralentir son envoi si le courriel prend du temps.
    try {
      const formRes = await fetch(
        SUPABASE_URL + '/rest/v1/forms?id=eq.' + encodeURIComponent(formId) + '&select=title,data,notify_email',
        { headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY } }
      );
      const formRows = await formRes.json();
      if (formRes.ok && formRows.length && formRows[0].notify_email) {
        const form = formRows[0];
        const participantName = findParticipantName((form.data || {}).fields, values);
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const siteUrl = proto + '://' + host;
        await sendNotificationEmail({
          toEmail: form.notify_email,
          participantName,
          formTitle: form.title,
          submissionId: id,
          siteUrl
        });
      }
    } catch (notifyErr) {
      console.error('Erreur lors de la notification:', notifyErr);
    }
  } catch (err) {
    console.error('submit error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: String(err) } });
    }
  }
};
