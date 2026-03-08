# Design : Affichage 2 colonnes Chris / Alex

**Date** : 2026-03-08

## Contexte

Les listes de dépenses et d'ajustements s'affichent actuellement en une seule colonne verticale. On veut passer à un affichage 2 colonnes (Chris | Alex) pour une lecture plus rapide.

## Pages concernées

- `/depenses` — dépenses du mois courant, avec suppression
- `/ajustements` — ajustements du mois courant, avec suppression
- `/historique/[id]` — lecture seule, sans suppression
- **Exclus** : `/historique/[id]/detail`

## Layout

Deux colonnes côte à côte (~50% chacune), même sur mobile (390px → ~180px par colonne).

### En-têtes de colonnes

Chaque colonne affiche le prénom + le total de la colonne.

```
┌─────────────────┬─────────────────┐
│  Chris — 450 €  │  Alex — 320 €   │
├─────────────────┼─────────────────┤
```

### Dépenses

Filtrage par `paye_par`. Chaque item :
- Ligne 1 : label ou sous-catégorie (tronqué) + bouton supprimer (pages actives uniquement)
- Ligne 2 : montant formaté

```
┌─────────────────┬─────────────────┐
│  Chris — 450 €  │  Alex — 320 €   │
├─────────────────┼─────────────────┤
│ Intermarché  🗑 │ Marché pain  🗑 │
│ 45,00 €         │ 12,50 €         │
│─────────────────│─────────────────│
│ Viande       🗑 │ Amazon       🗑 │
│ 32,00 €         │ 89,00 €         │
└─────────────────┴─────────────────┘
```

Total en-tête = somme des dépenses payées par la personne.

### Ajustements

Un même ajustement apparaît dans les deux colonnes :
- Côté donneur (`de`) : label + "donne X €" + bouton supprimer (pages actives)
- Côté receveur (`vers`) : label + "reçoit X €" (pas de bouton supprimer)

```
┌─────────────────┬─────────────────┐
│  Chris — 200 €  │  Alex — 115 €   │
├─────────────────┼─────────────────┤
│ Loyer        🗑 │ Loyer           │
│ donne 115 €     │ reçoit 115 €    │
└─────────────────┴─────────────────┘
```

Total en-tête = somme des montants donnés par la personne.

## Contraintes mobile-first

- Touch targets minimum 48px
- Police minimum 16px
- Labels tronqués avec ellipsis si trop longs
