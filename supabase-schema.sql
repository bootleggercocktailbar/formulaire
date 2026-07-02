-- ============================================================
-- Griffe — nouveau schéma sécurisé (v2)
-- À exécuter dans Supabase : Project → SQL Editor → New query → coller → Run
-- ============================================================

-- Optionnel : si tu veux nettoyer l'ancienne table de la version précédente
-- (rien de grave si tu la laisses, elle ne sert simplement plus à rien) :
-- drop table if exists kv_store;

-- ------------------------------------------------------------
-- Table des formulaires
-- ------------------------------------------------------------
create table if not exists forms (
  id text primary key,
  title text not null,
  created_at timestamptz not null default now(),
  data jsonb not null,              -- {pages: [...], fields: [...]}
  owner_id uuid references auth.users(id)
);

-- ------------------------------------------------------------
-- Table des réponses reçues
-- ------------------------------------------------------------
create table if not exists submissions (
  id text primary key,
  form_id text not null references forms(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  values jsonb not null
);

create index if not exists submissions_form_id_idx on submissions (form_id);

-- ------------------------------------------------------------
-- Sécurité : Row Level Security activée, AUCUNE politique permissive.
-- Ça veut dire : personne — ni un visiteur anonyme, ni même un compte
-- connecté ordinaire — ne peut lire ou écrire directement dans ces tables
-- via l'API publique de Supabase. Seules les fonctions serveur de Griffe
-- (/api/get-form, /api/submit, /api/save-form, /api/list-forms,
-- /api/get-submissions), qui utilisent la clé secrète "service_role",
-- peuvent y accéder — cette clé n'est jamais envoyée au navigateur.
-- ------------------------------------------------------------
alter table forms enable row level security;
alter table submissions enable row level security;

-- (Aucune politique "create policy" ci-dessous — c'est intentionnel :
-- RLS activé + zéro politique = accès refusé à tout le monde sauf service_role.)
