# Backend TiFlow Pro — qualification et sourcing, sans investissement réel

API Python standard-library sur un VPS dédié, base SQLite privée, utilisateur système non privilégié.
Aucune collecte de fonds, paiement, quote-part, ordre de placement, outil de souscription ou API d'investissements.

## API
- GET /health : statut et indicateur contacts_enabled
- GET /api/v1/categories : catégories
- GET /api/v1/opportunities : opportunités approuvées avec provenance
- POST /api/v1/requests : demande de sourcing après consentement ; rejette les origines externes, taille, spam, catégorie invalide ; 6 demandes/IP/h.
- GET /api/v1/admin/requests : Bearer token admin requis ; maximum 100 demandes
- GET /api/v1/admin/opportunities : Bearer token admin requis
- PATCH /api/v1/admin/opportunities/{id} : {"status":"approved"} / "rejected" / "pending_review" ; admin seulement.

Les demandes sont effacées automatiquement au bout de 90 jours par cleanup.py.
Les profils prospects ne sont pas affichés publiquement.
Le service écoute uniquement sur 127.0.0.1:18762 ; pas d'accès Internet direct.

## Veille
Le bot lit exclusivement les flux RSS HTTPS renseignés dans /etc/tiflow/sources.json,
après validation des droits de consultation par l'exploitant.
Exemple (URL réelle officielle à compléter, ne pas activer avant contrôle):
[{"name":"Nom de la source officielle","url":"https://domaine-officiel.example/rss.xml","enabled":false}]
Le bot déduplique par URL+source et crée des entrées *pending_review*.
Aucune donnée aspirée ni publiée sans source approuvée ; aucun comparatif tarifaire non vérifié.

## Exploitation
- sudo systemctl status tiflow-api tiflow-bot.timer
- sudo journalctl -u tiflow-api --no-pager -n 30
- curl -s http://127.0.0.1:18762/health
- sudo systemctl start tiflow-bot.service
- Config serveur privée : /etc/tiflow/backend.env (ne jamais committer les tokens).
- Connexion HTTPS publique : À configurer seulement avec nom de domaine et certificat valides.
- Intégration éventuelle de 1Backend : service d'orchestration IA distinct ; pas utilisé pour stocker les demandes ni traiter des fonds.

## Contraintes réglementaires
Avant des investissements participatifs véritables : vérifier le montage juridique et les obligations
AMF/PSFP ou autres régimes applicables, lutte anti-blanchiment, KYC, protection des investisseurs et flux de fonds.
Ne jamais interpréter ces scénarios comme des offres financières.
