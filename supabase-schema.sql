-- ============================================================
-- Griffe — migration v3 (édition, favoris, notifications par courriel)
-- À exécuter dans Supabase : Project → SQL Editor → New query → coller → Run
--
-- Si tu repars de zéro (nouveau projet Supabase), exécute d'abord l'ancien
-- fichier supabase-schema.sql (qui crée les tables forms/submissions), PUIS
-- ce fichier-ci. Si tu as déjà les tables, exécute seulement celui-ci.
-- ============================================================

alter table forms add column if not exists notify_email text;
alter table forms add column if not exists is_favorite boolean not null default false;
alter table forms add column if not exists updated_at timestamptz not null default now();

-- Optionnel mais recommandé : garder created_at rempli pour les lignes déjà
-- existantes qui n'auraient pas encore de updated_at cohérent.
update forms set updated_at = created_at where updated_at is null;

create index if not exists forms_is_favorite_idx on forms (is_favorite);
create index if not exists forms_updated_at_idx on forms (updated_at desc);

-- IMPORTANT : force l'API (PostgREST) à recharger immédiatement sa
-- connaissance des colonnes. Sans cette ligne, l'erreur suivante peut
-- apparaître pendant quelques minutes après une modification de table :
-- "Could not find the 'is_favorite' column of 'forms' in the schema cache"
notify pgrst, 'reload schema';
