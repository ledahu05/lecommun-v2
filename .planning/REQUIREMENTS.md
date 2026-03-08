# Requirements: Le Commun

**Defined:** 2026-03-08
**Core Value:** La balance nette entre Chris et Alex est toujours visible et juste — report automatique, zero saisie manuelle, zero erreur de copie.

## v1.3 Requirements

Requirements pour le milestone v1.3 Modales d'ajout. Chaque requirement map vers une phase du roadmap.

### Modales

- [x] **MOD-01**: L'utilisateur peut ajouter une depense via une modale Dialog depuis la page depenses
- [x] **MOD-02**: L'utilisateur peut ajouter un ajustement via une modale Dialog depuis la page ajustements
- [x] **MOD-03**: La modale se ferme automatiquement apres soumission reussie et les donnees se rafraichissent
- [x] **MOD-04**: En cas d'erreur, la modale reste ouverte avec un message d'erreur inline

### Dashboard

- [ ] **DASH-01**: L'utilisateur peut ajouter une depense depuis le dashboard via le bouton quick-add
- [ ] **DASH-02**: L'utilisateur peut ajouter un ajustement depuis le dashboard via le bouton quick-add

### UX Formulaire

- [x] **UX-01**: Les sous-categories sont selectionnees via une grille de boutons (remplace le `<select>`)
- [x] **UX-02**: Les formulaires inline Card sont supprimes des pages liste

## Future Requirements

Aucun requirement reporte pour ce milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Modification de depense/ajustement via modale | Scope limite a l'ajout — l'edition est un milestone futur |
| Modale sur les pages historique | L'historique est en lecture seule |
| Animations de transition modale | Complexite non necessaire, shadcn Dialog suffit |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOD-01 | Phase 7 | Complete |
| MOD-02 | Phase 7 | Complete |
| MOD-03 | Phase 7 | Complete |
| MOD-04 | Phase 7 | Complete |
| DASH-01 | Phase 7 | Pending |
| DASH-02 | Phase 7 | Pending |
| UX-01 | Phase 7 | Complete |
| UX-02 | Phase 7 | Complete |

**Coverage:**
- v1.3 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after roadmap creation*
