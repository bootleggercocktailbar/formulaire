-- À exécuter une seule fois dans Supabase : Project → SQL Editor → New query → coller → Run

-- Table clé-valeur générique : stocke les formulaires ("form:{id}", "forms-index")
-- et les réponses ("submission:{formId}:{subId}") sous forme de JSON.
create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Index pour accélérer les recherches par préfixe (ex. "submission:abc123:")
create index if not exists kv_store_key_prefix_idx on kv_store (key text_pattern_ops);

-- Row Level Security : activé par défaut sur les nouveaux projets Supabase.
-- Ces politiques autorisent tout le monde (clé publique "anon") à lire/écrire —
-- c'est volontairement ouvert pour cette version de démarrage, exactement comme
-- le prototype. Avant d'avoir de vrais comptes utilisateurs séparés, considère
-- ça comme un espace partagé, pas privé.
alter table kv_store enable row level security;

create policy "Lecture publique" on kv_store
  for select using (true);

create policy "Écriture publique" on kv_store
  for insert with check (true);

create policy "Modification publique" on kv_store
  for update using (true);

create policy "Suppression publique" on kv_store
  for delete using (true);
