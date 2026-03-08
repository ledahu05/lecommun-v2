# Requirements: v1.2 Balance Initiale

**Defined:** 2026-03-08
**Core Value:** La balance nette entre Chris et Alex est toujours visible et juste — report automatique, zéro saisie manuelle, zéro erreur de copie.

## v1.2 Requirements

### Initialisation

- [ ] **INIT-01**: Quand le mois courant n'a pas de mois précédent en base, le dashboard affiche un champ pour saisir/modifier la balance reportée
- [ ] **INIT-02**: L'utilisateur peut saisir un montant (positif = Chris doit à Alex, négatif = Alex doit à Chris) et valider
- [ ] **INIT-03**: La valeur saisie met à jour `balance_reportee` du mois courant — la balance se recalcule immédiatement
- [ ] **INIT-04**: Le champ reste éditable tant qu'aucun mois précédent n'existe en base (permet de corriger une erreur)
- [ ] **INIT-05**: Quand un mois précédent existe en base, la balance reportée est calculée automatiquement et non éditable (comportement actuel préservé)

## Future Requirements (v2)

- Multi-month JSON import (one month per file currently)
- Import with recalculated balance_reportee from actual DB state

## Out of Scope

| Feature | Reason |
|---------|--------|
| Édition de balance_reportee sur les mois archivés (historique) | Risque de désynchronisation cascade — hors périmètre v1.2 |
| Recalcul automatique des mois suivants après modification | Complexité élevée, pas nécessaire pour le cas d'usage initial |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INIT-01 | — | Pending |
| INIT-02 | — | Pending |
| INIT-03 | — | Pending |
| INIT-04 | — | Pending |
| INIT-05 | — | Pending |

**Coverage:**
- v1.2 requirements: 5 total
- Mapped to phases: 0
- Unmapped: 5 ⚠️

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*
