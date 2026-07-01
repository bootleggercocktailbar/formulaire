# Griffe — guide de déploiement

Ce dossier contient tout ce qu'il faut pour mettre Griffe en ligne, sur une vraie
adresse web, gratuitement pour commencer.

## Ce dont tu as besoin (3 comptes gratuits)

1. **GitHub** (github.com) — pour héberger le code
2. **Vercel** (vercel.com) — pour publier le site (connecte-toi avec ton compte GitHub)
3. **Supabase** (supabase.com) — pour la base de données
4. **Anthropic** (console.anthropic.com) — pour la clé API qui fait fonctionner la détection automatique des champs (facturé à l'usage, quelques cents par formulaire analysé)

---

## Étape 1 — Mettre le code sur GitHub

1. Va sur github.com, crée un compte si besoin
2. Clique "New repository", nomme-le par exemple `griffe`
3. Sur ton ordinateur, dans ce dossier, ouvre un terminal et tape :
   ```
   git init
   git add .
   git commit -m "Premier envoi de Griffe"
   git branch -M main
   git remote add origin https://github.com/TON-NOM-UTILISATEUR/griffe.git
   git push -u origin main
   ```
   (Remplace `TON-NOM-UTILISATEUR` par ton vrai nom d'utilisateur GitHub — le lien exact est affiché sur la page GitHub après avoir créé le dépôt.)

   Si tu ne connais pas du tout `git`, GitHub Desktop (desktop.github.com) permet de faire la même chose avec une interface graphique, sans ligne de commande.

## Étape 2 — Créer le projet Supabase

1. Va sur supabase.com → New project
2. Donne-lui un nom (ex. "griffe"), choisis un mot de passe pour la base de données, choisis une région proche de toi (ex. Canada/Est des États-Unis)
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche) → **New query**
4. Ouvre le fichier `supabase-schema.sql` de ce dossier, copie tout son contenu, colle-le dans l'éditeur SQL de Supabase, clique **Run**
5. Va dans **Project Settings → API** — tu y trouveras :
   - **Project URL** (ressemble à `https://xxxxx.supabase.co`)
   - **anon public key** (une longue chaîne de caractères)
   - Garde ces deux valeurs, tu en auras besoin à l'étape 4

## Étape 3 — Obtenir une clé API Anthropic

1. Va sur console.anthropic.com, crée un compte
2. Ajoute un moyen de paiement (Settings → Billing) — la détection de champs coûte environ 1 à 3 cents par page analysée
3. Va dans **API Keys** → **Create Key**, donne-lui un nom, copie la clé (elle commence par `sk-ant-`) — tu ne pourras plus la revoir après avoir quitté la page, garde-la de côté

## Étape 4 — Déployer sur Vercel

1. Va sur vercel.com, connecte-toi avec ton compte GitHub
2. Clique **Add New → Project**, choisis le dépôt `griffe` que tu as créé à l'étape 1
3. Avant de cliquer "Deploy", ouvre la section **Environment Variables** et ajoute ces 3 variables (les valeurs viennent des étapes 2 et 3) :
   | Nom | Valeur |
   |---|---|
   | `ANTHROPIC_API_KEY` | ta clé qui commence par `sk-ant-` |
   | `SUPABASE_URL` | ton "Project URL" Supabase |
   | `SUPABASE_ANON_KEY` | ta clé "anon public" Supabase |
4. Clique **Deploy**. Après une minute environ, Vercel te donne une vraie adresse web, du genre `https://griffe-xyz.vercel.app`

## C'est en ligne !

Ouvre cette adresse — c'est maintenant un vrai site, accessible à n'importe qui avec le lien, plus besoin de passer par Claude.

- Créateur : `https://griffe-xyz.vercel.app/`
- Un lien de formulaire généré ressemblera à : `https://griffe-xyz.vercel.app/#fill=abc123` — ce lien-là fonctionne vraiment maintenant, tu peux l'envoyer à qui tu veux
- Tableau de bord : accessible via l'onglet en haut

## Limites importantes à connaître

- **Pas encore de comptes séparés** : tout le monde qui a le lien du site peut voir tous les formulaires créés (pas de connexion/mot de passe). Pour un usage interne à ta petite équipe, c'est probablement acceptable pour commencer — mais avant de le partager largement, il faudrait ajouter une authentification (Supabase le permet facilement, on peut en discuter).
- **Coût de l'IA** : chaque clic sur "Détecter les champs automatiquement" fait un appel payant à l'API Anthropic. Pour un usage modéré (quelques formulaires par mois), le coût reste minime (probablement quelques dollars par mois).
- **Images stockées en base64 dans la base de données** : fonctionne bien pour commencer, mais si tu as beaucoup de formulaires avec beaucoup de pages, il faudra éventuellement migrer vers un vrai stockage de fichiers (Supabase Storage) — pas urgent pour l'instant.

## Pour mettre à jour le site plus tard

Chaque fois que tu modifies `index.html` (ou que je t'envoie une nouvelle version), il suffit de remplacer le fichier dans ton dossier local, puis :
```
git add .
git commit -m "Mise à jour"
git push
```
Vercel republie automatiquement le site en quelques secondes.
