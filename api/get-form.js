// api/detect.js
// ADMIN SEULEMENT — nécessite une session Supabase valide (évite que
// n'importe qui déclenche des appels IA payants sur ton compte Anthropic).
// Proxy sécurisé vers l'API Anthropic — garde ANTHROPIC_API_KEY côté serveur,
// jamais exposée au navigateur.

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: { message: "ANTHROPIC_API_KEY n'est pas configurée sur le serveur. Ajoute-la dans les variables d'environnement Vercel." }
    });
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Erreur proxy /api/detect:', err);
    res.status(500).json({ error: { message: 'Erreur serveur lors de l\u2019appel à l\u2019API Anthropic: ' + String(err) } });
  }
};
