# TiFlow Pro — Bêta de démonstration (20 novembre 2026)

## Statut vérifiable
- **Site public** : https://cvlad97.github.io/tiflow-pro/
- **Frontend** : application React 18 / Vite, restauration du code historique et refonte bêta non transactionnelle.
- **Données de projets** : trois **scénarios fictifs** ; aucune offre financière.
- **Simulation** : répartition arithmétique d'un budget fictif, **aucun rendement**.
- **Contact** : préparation d'un email via `mailto:` ; aucun stockage ni envoi automatique.
- **Comptes / paiements / investissements** : volontairement indisponibles en démonstration.
- **Backend Edge** : code durci, **non déployé** (aucun projet Supabase TiFlow dédié lié à ce dépôt).
- **Migration `002_tiflow_leads_draft.sql`** : préparée uniquement, **non appliquée**.

## Démarrage local
```bash
cd frontend
npm ci
npm run build
npm run dev
```
Le site doit être servi sous la base `/tiflow-pro/` de GitHub Pages.

## Endpoints Edge documentés
- GET `?path=health` : santé de l'API
- GET `?path=projects` : liste de scénarios fictifs
- POST `?path=leads` : désactivé par défaut; nécessite une authentification utilisateur, une base dédiée, une migration RLS et `TIFLOW_LEADS_ENABLED=true`.
- Tout autre endpoint (notamment `investments`) : 404. Aucun flux d'argent.

## Sécurité / ouverture du backend
1. Créer **un projet Supabase propre à TiFlow** (ne pas utiliser les bases DELIKREOL, IKABAY ou ANBAYBOT).
2. Réviser et appliquer la migration SQL dans l'environnement TiFlow.
3. Tester RLS avec au moins deux identités, les autorisations d'insertion et de lecture.
4. Déployer `tiflow-api` avec des secrets gérés côté serveur et `TIFLOW_ALLOWED_ORIGIN=https://cvlad97.github.io`.
5. Garder `TIFLOW_LEADS_ENABLED=false` jusqu'aux vérifications d'authentification, quota anti-spam et confidentialité. Aucun secret service_role dans le navigateur.
6. Réaliser une revue juridique spécifique si le projet doit un jour offrir des opérations d'investissement. Le site public bêta n'en offre aucune.

## Contrôles de livraison
- `npm ci` puis `npm run build`
- Navigation: Accueil, Concept, Projets, Fiche, Simulation, Transparence, Communauté, FAQ.
- Saisie invalide du simulateur et validation native du formulaire.
- Vérifier que le code public ne propose aucun paiement ni inscription financière.
- Confirmer la publication Github Pages et les liens des assets avant d'annoncer un GO.
