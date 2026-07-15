// api/config.js
// PUBLIC — fournit au frontend l'URL et la clé publique ("anon") de Supabase,
// utilisées UNIQUEMENT pour l'authentification (connexion admin). Le
// navigateur n'utilise plus cette clé pour lire/écrire des données — tout ça
// passe maintenant par les fonctions /api/* qui utilisent la clé secrète
// service_role, jamais exposée ici.

module.exports = function handler(req, res) {
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
};
