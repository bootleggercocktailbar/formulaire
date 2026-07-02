# Griffe v2 — guide de déploiement (avec connexion admin sécurisée)

Cette version ajoute une vraie protection : seul un administrateur connecté
peut créer des formulaires et voir les réponses. Les participants n'ont
jamais besoin de se connecter — ils accèdent uniquement au formulaire précis
dont ils ont reçu le lien.

## Ce qui a changé par rapport à la version précédente

- Le navigateur ne touche plus jamais directement la base de données. Toutes
  les opérations passent par des fonctions serveur (`/api/*.js`) qui utilisent
  une clé secrète Supabase (`service_role`), jamais visible dans le navigateur.
- Créateur et Tableau de bord exigent une connexion (Supabase Auth).
- Nouvelles tables (`forms`, `submissions`) avec une sécurité stricte au
  niveau de la base de données (RLS activé, aucun accès direct autorisé —
  seules les fonctions serveur peuvent lire/écrire).

## Étape 1 — Mettre à jour le schéma Supabase

1. Supabase → ton projet → **SQL Editor** → **New query**
2. Colle le contenu de `supabase-schema.sql` (nouveau fichier, remplace
   l'ancien) → **Run**

Ça crée les tables `forms` et `submissions`. L'ancienne table `kv_store` de
la version précédente n'est plus utilisée (tu peux la garder ou la supprimer,
ça ne gêne pas).

## Étape 2 — Créer ton compte admin

1. Supabase → ton projet → **Authentication** (menu de gauche) → **Users**
2. Clique **"Add user"** → **"Create new user"**
3. Email : `information@barbootlegger.com`
4. Password : `Boot3481`
5. Coche **"Auto Confirm User"** (pour ne pas avoir à confirmer par courriel)
6. Créer

C'est ce compte que tu utiliseras pour te connecter sur le site. **Change ce
mot de passe temporaire dès ta première connexion** — un bouton "Mot de
passe" apparaît en haut du site une fois connecté, à côté de "Se déconnecter".

## Étape 3 — Récupérer ta clé secrète service_role

1. Supabase → ton projet → **Project Settings** → **API Keys**
2. Trouve la clé nommée **"service_role"** (parfois appelée "secret key")
   — attention, ce n'est PAS la même que la clé publique/anon utilisée
   avant. Clique l'icône œil pour l'afficher, puis copie-la.
3. **Ne la partage jamais et ne la mets jamais dans le code HTML** — elle
   donne un accès complet à toute la base de données.

## Étape 4 — Variables d'environnement sur Vercel

Va dans ton projet Vercel → **Settings → Environment Variables**, et
assure-toi d'avoir ces 3 variables (les 2 premières existaient déjà) :

| Nom | Valeur |
|---|---|
| `SUPABASE_URL` | ton Project URL Supabase (déjà configuré) |
| `SUPABASE_ANON_KEY` | ta clé publique/anon (déjà configuré) |
| `SUPABASE_SERVICE_ROLE_KEY` | **nouvelle** — ta clé service_role de l'étape 3 |

Coche **Production** pour chacune. Ajoute aussi `ANTHROPIC_API_KEY` si tu
veux la détection automatique (optionnel, voir version précédente du guide).

## Étape 5 — Déployer le nouveau code

Remplace `index.html` (et ajoute le nouveau dossier `api/` en entier — il y a
maintenant plusieurs nouveaux fichiers dedans) dans ton dépôt GitHub, comme
d'habitude (GitHub Desktop → Commit → Push). Vercel redéploie automatiquement.

**Important** : le dossier `api/` contient maintenant un sous-dossier
`_lib/` avec un fichier `verifyAdmin.js` à l'intérieur — assure-toi qu'il est
bien inclus dans ton envoi (glisse tout le dossier `api` au complet plutôt
que fichier par fichier, ou utilise GitHub Desktop qui gère ça automatiquement
si tu remplaces le dossier local en entier).

## Étape 6 — Redéploie et teste

1. Une fois déployé, va sur ton site
2. Clique sur "Créateur" — tu devrais voir un écran de connexion
3. Connecte-toi avec `information@barbootlegger.com` / `Boot3481`
4. Change ton mot de passe (bouton "Mot de passe" en haut)
5. Crée et enregistre un formulaire, copie son lien
6. Ouvre ce lien dans une fenêtre de navigation privée (pour simuler un
   participant sans être connecté) — tu ne devrais voir QUE le formulaire,
   aucun onglet, aucune connexion demandée
7. Remplis-le, envoie
8. Reconnecte-toi comme admin, va dans Tableau de bord, choisis ton
   formulaire — la réponse devrait apparaître

## Limites qui restent à connaître

- **Un seul compte admin pour l'instant** — tout le monde qui se connecte
  avec ces identifiants voit tous les formulaires. Si tu veux plusieurs
  admins avec des accès séparés par organisation, c'est une étape
  supplémentaire (facile à ajouter plus tard).
- **Les réponses ne peuvent pas être supprimées ou modifiées** depuis le
  site pour l'instant (seulement consultées) — à ajouter si besoin.
