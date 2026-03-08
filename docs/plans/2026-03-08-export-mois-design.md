# Design : Export JSON d'un mois

**Date:** 2026-03-08
**Scope:** Lecture seule — aucune donnee modifiee ou supprimee

## Fonctionnement

Un bouton "Exporter" sur chaque MoisCard dans /historique declenche le telechargement d'un fichier JSON au format identique a l'import. Le fichier est genere cote serveur via une Server Action, puis telecharge cote client via Blob + URL.createObjectURL.

## Format JSON (round-trip avec import)

```json
{
  "mois": [{
    "annee": 2026,
    "mois": 3,
    "balance_reportee": 1234.56
  }],
  "depenses": [
    { "mois_id": 1, "categorie": "alimentation", "sous_categorie": "intermarche",
      "paye_par": "chris", "montant": 45.20, "label": null, "date_depense": "2026-03-01" }
  ],
  "ajustements": [
    { "mois_id": 1, "de": "alex", "vers": "chris",
      "montant": 115.00, "label": "Appart", "date_ajustement": "2026-03-01" }
  ]
}
```

`mois_id` dans depenses/ajustements vaut toujours 1 (remappe a l'import, comme les fixtures existantes).

## Composants

- **Server Action `actionExportMois(moisId: number)`** dans `app/(app)/historique/actions.ts` — requete les 3 tables, assemble le JSON, retourne la string
- **Client component `ExportButton`** dans `components/historique/ExportButton.tsx` — bouton qui appelle l'action, cree un Blob et declenche le download
- **Integration** : ExportButton ajoute dans chaque MoisCard sur la page /historique

## Nom du fichier telecharge

`lecommun-YYYY-MM.json` (ex: `lecommun-2026-03.json`)

## Securite

Lecture seule — la Server Action fait uniquement des SELECT. Aucune mutation, aucune suppression.

## Contraintes

- Format identique au format d'import (reimportable tel quel)
- Touch target >= 48px pour le bouton export (mobile-first)
- Aucune modification de donnees dans le perimetre de cette feature
