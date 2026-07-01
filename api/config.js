// api/config.js
// Fournit au frontend l'URL et la clé publique ("anon") de Supabase.
// La clé "anon" est conçue pour être publique (la sécurité se fait via les
// politiques RLS définies dans supabase-schema.sql) — ce n'est PAS un secret,
// contrairement à ANTHROPIC_API_KEY qui elle ne doit jamais transiter ici.

module.exports = function handler(req, res) {
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
};
