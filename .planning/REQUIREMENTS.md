# Requirements: Le Commun

**Defined:** 2026-03-04
**Core Value:** La balance nette entre Chris et Alex est toujours visible et juste — report automatique, zéro saisie manuelle, zéro erreur de copie.

## v1 Requirements

### Authentification

- [x] **AUTH-01**: L'utilisateur peut se connecter avec son nom (chris/alex) et mot de passe
- [x] **AUTH-02**: La session persiste 30 jours sans reconnexion
- [x] **AUTH-03**: Toutes les routes sauf /login sont protégées

### Dashboard & Balance

- [ ] **DASH-01**: L'utilisateur voit la balance du mois courant dès la connexion (qui doit combien à qui)
- [ ] **DASH-02**: La balance affiche le détail : total Chris, total Alex, balance mensuelle, report du mois précédent
- [ ] **DASH-03**: La ventilation par catégorie est visible (montant par personne pour alimentation, habitation, loisirs, vie quotidienne)
- [ ] **DASH-04**: La balance se recalcule en temps réel à chaque affichage depuis les données brutes

### Dépenses

- [ ] **DEP-01**: L'utilisateur peut saisir une dépense avec catégorie, sous-catégorie, montant, payeur (chris/alex), date et libellé optionnel
- [ ] **DEP-02**: L'utilisateur voit la liste des dépenses du mois courant
- [ ] **DEP-03**: L'utilisateur peut supprimer une dépense
- [ ] **DEP-04**: Une dépense avec montant ≤ 0 est rejetée (validation serveur + client)
- [ ] **DEP-05**: Les catégories et sous-catégories sont fixes (alimentation, habitation, loisirs, vie quotidienne + leurs sous-catégories)

### Ajustements

- [ ] **AJU-01**: L'utilisateur peut saisir un ajustement (virement, avance ponctuelle) avec direction (chris→alex ou alex→chris), montant, libellé obligatoire et date
- [ ] **AJU-02**: L'utilisateur voit la liste des ajustements du mois courant
- [ ] **AJU-03**: L'utilisateur peut supprimer un ajustement
- [ ] **AJU-04**: Les ajustements sont intégrés dans le calcul de la balance finale

### Report automatique de la balance

- [ ] **RPT-01**: Quand un nouveau mois est créé, la balance_reportee est automatiquement fixée à la balance_finale du mois précédent
- [ ] **RPT-02**: La balance_reportee n'est jamais saisie manuellement

### Historique

- [ ] **HIS-01**: L'utilisateur peut consulter la liste des mois archivés
- [ ] **HIS-02**: L'utilisateur peut consulter le détail d'un mois archivé (dépenses, ajustements, balance)

### Infrastructure

- [x] **INF-01**: L'application est déployée sur Vercel (CD automatique sur push main)
- [x] **INF-02**: La DB Turso est provisionnée et le schéma (mois, depenses, ajustements) est appliqué
- [x] **INF-03**: Les variables d'environnement sont configurées (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, CHRIS_PASSWORD, ALEX_PASSWORD)

## v2 Requirements

### Ergonomie avancée

- **ERG-01**: Saisie multi-lignes d'une dépense (agréger plusieurs tickets avec libellés détaillés)
- **ERG-02**: Notifications push si le solde dépasse un seuil configurable

### Charges fixes

- **FIX-01**: Charges fixes récurrentes auto-injectées chaque mois (Appart 115€, etc.)

### Export & Analyse

- **EXP-01**: Export mensuel PDF
- **EXP-02**: Graphiques d'évolution de la balance sur plusieurs mois

### Offline

- **OFF-01**: Mode offline avec Service Worker + sync

## Out of Scope

| Feature | Reason |
|---------|--------|
| Module immobilier (crédit, amortissement) | Hors périmètre v1 — complexité élevée |
| Import historique Google Sheets (55 mois) | Post-launch si besoin, pas bloquant pour l'usage courant |
| Gestion de N utilisateurs | 2 users uniquement, pas d'inscription |
| OAuth / SSO | Credentials en env vars suffisants pour usage privé |
| Contrôle d'accès différencié | Les deux users voient tout — volontaire |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INF-01 | Phase 1 | Complete |
| INF-02 | Phase 1 | Complete |
| INF-03 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| DASH-04 | Phase 2 | Pending |
| RPT-01 | Phase 2 | Pending |
| RPT-02 | Phase 2 | Pending |
| DEP-01 | Phase 3 | Pending |
| DEP-02 | Phase 3 | Pending |
| DEP-03 | Phase 3 | Pending |
| DEP-04 | Phase 3 | Pending |
| DEP-05 | Phase 3 | Pending |
| AJU-01 | Phase 3 | Pending |
| AJU-02 | Phase 3 | Pending |
| AJU-03 | Phase 3 | Pending |
| AJU-04 | Phase 3 | Pending |
| HIS-01 | Phase 4 | Pending |
| HIS-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
