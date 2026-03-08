# Design : Modales d'ajout dépense/ajustement

**Date :** 2026-03-08
**Statut :** Approuvé

## Objectif

Remplacer les formulaires Card inline (pages `/depenses` et `/ajustements`) par des modales Dialog (shadcn/ui) déclenchées par des boutons. Ajouter ces mêmes boutons sur le dashboard pour permettre la saisie rapide depuis l'accueil.

## Changements UX

### 1. Dashboard (`/`) — BalanceCard header

Deux boutons d'action en haut de la BalanceCard, à côté du label du mois courant :

```
┌─────────────────────────────────┐
│ Mars 2026        [+ 🛒] [+ ↔]  │
│                                 │
│     Chris doit 891,50 € à Alex  │
│     ...                         │
└─────────────────────────────────┘
```

- `[+ 🛒]` ouvre la modale dépense
- `[+ ↔]` ouvre la modale ajustement
- Boutons `ghost` ou `outline`, min 48px touch target

### 2. Pages `/depenses` et `/ajustements` — liste + bouton

```
┌─────────────────────────────────┐
│ Dépenses         [+ Dépense]   │
├─────────────────────────────────┤
│ Intermarché    chris — 45,20 € │
│ Boulangerie    alex  — 12,00 € │
│ ...                             │
└─────────────────────────────────┘
```

- Le formulaire Card inline **disparaît**
- Un bouton en haut de page (à droite du titre) ouvre la même modale
- La liste reste inchangée

### 3. Modale (Dialog shadcn/ui)

- Backdrop, fermeture via X / Escape / clic extérieur
- Contenu = formulaire existant adapté (sans Card wrapper)
- Soumission réussie → modale se ferme + `revalidatePath` rafraîchit les données
- Erreur → message inline dans la modale, elle reste ouverte

### 4. Sous-catégories : boutons au lieu de `<select>`

Le `<select>` natif pour les sous-catégories est remplacé par une **grille de boutons** (même pattern que les catégories et "payé par"). Adapté au nombre de sous-catégories par catégorie (4 à 7 items) :

- Alimentation : 4 boutons (2x2)
- Habitation : 7 boutons (grille flexible, wrap)
- Loisirs : 4 boutons (2x2)
- Vie quotidienne : 4 boutons (2x2)

Chaque bouton : label texte, min 48px, style `outline` avec `variant` actif quand sélectionné.

## Composants impactés

| Composant | Changement |
|-----------|-----------|
| `BalanceCard` | Ajout de 2 boutons d'action dans le header (nécessite devenir Client Component ou wrapper) |
| `DepenseForm` | Retirer Card wrapper, remplacer `<select>` par grille de boutons, accepter `onSuccess` callback pour fermer la modale |
| `AjustementForm` | Retirer Card wrapper, accepter `onSuccess` callback |
| `depenses/page.tsx` | Supprimer le form inline, layout titre + bouton |
| `ajustements/page.tsx` | Idem |
| **Nouveau** : `DepenseDialog` | Client Component : bouton trigger + Dialog + DepenseForm |
| **Nouveau** : `AjustementDialog` | Client Component : bouton trigger + Dialog + AjustementForm |

## Ce qui ne change pas

- Server Actions (`actionCreateDepense`, `actionCreateAjustement`)
- Validation Zod
- Listes et items de suppression
- BottomNav
- Historique (lecture seule, pas de formulaire)

## Contraintes mobile

- Touch targets ≥ 48px sur tous les boutons (catégories, sous-catégories, payé par, submit)
- Police ≥ 16px dans les inputs
- Dialog doit être scrollable si le contenu dépasse la hauteur viewport (cas habitation : 7 sous-catégories)
