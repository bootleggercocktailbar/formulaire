# Griffe v3 — nouveautés et déploiement

## Ce qui a été ajouté dans cette version

1. **Modifier un formulaire existant** — dans l'onglet Créateur, tu vois maintenant tes formulaires avec un bouton "Modifier". Le lien existant reste le même après modification.
2. **Accueil neutre + connexion visible** — Créateur montre maintenant tes formulaires (ou un écran de connexion) au lieu de sauter direct sur "glisser un PDF".
3. **Design plus neutre** — fond blanc/gris clair au lieu de beige.
4. **Recherche améliorée** — listes de formulaires avec recherche par titre partout (Créateur, Aperçu destinataire, Tableau de bord).
5. **Anti double-soumission** — le bouton "Envoyer" se désactive immédiatement et affiche un état de chargement.
6. **Courriel de notification** — configurable par formulaire (champ dans la barre latérale du Créateur). Utilise Resend (voir `.env.example`).
7. **Lien de réponse sécurisé** — le lien envoyé par courriel (`#response=...`) exige une connexion admin ; sinon redirection vers la connexion.

**Bonus ajoutés au passage :** sauvegarde automatique (toutes les 8 secondes, indicateur "Enregistré ✓"), dupliquer un formulaire, marquer en favori (⭐), logo Crowd Divertissement.

**Pas encore fait** (discutons-en dans un prochain message si tu veux les ajouter) : historique des versions, glisser-déposer pour réordonner les champs, champs conditionnels, export Excel/PDF, statuts "en cours/complété" avec reprise plus tard, logo personnalisable par organisation, statistiques et export CSV détaillés.

## Déploiement — ce qui change par rapport à la version précédente

### 1. Nouveau SQL à exécuter
Supabase → SQL Editor → colle le contenu de `supabase-schema.sql` (ce fichier ajoute des colonnes à la table `forms` existante — ne supprime rien) → Run.

### 2. Nouvelle variable optionnelle (courriels)
Si tu veux les notifications par courriel : crée un compte sur resend.com (gratuit), récupère une clé API, ajoute sur Vercel :
| Nom | Valeur |
|---|---|
| `RESEND_API_KEY` | ta clé Resend |
| `RESEND_FROM_EMAIL` | `notifications@resend.dev` (fonctionne sans configuration) |

Sans ces variables, tout le reste du site fonctionne normalement — simplement aucun courriel n'est envoyé.

### 3. Remplacer les fichiers
Comme la dernière fois : remplace `index.html`, remplace tout le dossier `api/` (plusieurs fichiers ont changé, un nouveau `toggle-favorite.js` et `get-submission.js` ont été ajoutés), commit, push. Vercel redéploie automatiquement.

### 4. Tester
- Onglet Créateur → tu devrais voir tes formulaires existants avec "Modifier"/"Dupliquer"/"Réponses"
- Modifie un formulaire déjà envoyé à un participant → enregistre → vérifie que l'ancien lien fonctionne toujours et affiche la version modifiée
- Remplis un formulaire deux fois rapidement → confirme qu'une seule réponse apparaît au tableau de bord
