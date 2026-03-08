---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - components/ajustements/AjustementItem.tsx
  - components/historique/HistoriqueAjustementItem.tsx
  - components/ajustements/AjustementForm.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Un ajustement de=chris vers=alex affiche 'Alex donne à Chris'"
    - "Un ajustement de=alex vers=chris affiche 'Chris donne à Alex'"
    - "Le formulaire d'ajustement affiche le meme format inverse"
  artifacts:
    - path: "components/ajustements/AjustementItem.tsx"
      provides: "Affichage inverse avec 'donne a' dans la liste ajustements"
    - path: "components/historique/HistoriqueAjustementItem.tsx"
      provides: "Affichage inverse avec 'donne a' dans l'historique"
    - path: "components/ajustements/AjustementForm.tsx"
      provides: "Label du formulaire avec format inverse"
  key_links: []
---

<objective>
Inverser l'affichage de la direction des ajustements : remplacer "chris vers alex" par "Alex donne a Chris" et "alex vers chris" par "Chris donne a Alex".

Purpose: Rendre le libelle plus naturel et comprehensible pour les utilisateurs.
Output: Les 3 composants qui affichent la direction des ajustements utilisent le nouveau format.
</objective>

<execution_context>
@/home/ledahu/.claude/get-shit-done/workflows/execute-plan.md
@/home/ledahu/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@components/ajustements/AjustementItem.tsx
@components/ajustements/AjustementForm.tsx
@components/historique/HistoriqueAjustementItem.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Inverser l'affichage direction dans les 3 composants ajustement</name>
  <files>components/ajustements/AjustementItem.tsx, components/historique/HistoriqueAjustementItem.tsx, components/ajustements/AjustementForm.tsx</files>
  <action>
Create a helper function to capitalize a name (first letter uppercase): `capitalize(name: string) => string`.

In each file, replace the display of `de → vers` with the inverted "X donne a Y" format:

1. **AjustementItem.tsx** (line 24): Replace `{ajustement.de} → {ajustement.vers}` with `{capitalize(ajustement.vers)} donne à {capitalize(ajustement.de)}`. Keep the rest of the line (` — {montantFormate}`) unchanged.

2. **HistoriqueAjustementItem.tsx** (line 17): Replace `{ajustement.de} → {ajustement.vers}` with `{capitalize(ajustement.vers)} donne à {capitalize(ajustement.de)}`.

3. **AjustementForm.tsx** (line 82): Replace the Label content `De ({de} vers {vers})` with `{capitalize(vers)} donne à {capitalize(de)}` — so when de=chris (vers=alex), it shows "Alex donne à Chris".

The capitalize helper can be defined inline in each file (it is a one-liner: `const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);`) or extracted to a shared util if preferred. Inline is fine for 3 files.

Important: Do NOT change the hidden form field values or any logic — only change the display text.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>
    - AjustementItem shows "Alex donne à Chris" when de=chris, vers=alex
    - AjustementItem shows "Chris donne à Alex" when de=alex, vers=chris
    - HistoriqueAjustementItem shows same inverted format
    - AjustementForm label shows inverted format
    - No logic or data changes, only display text
  </done>
</task>

</tasks>

<verification>
- `npm run build` succeeds with no errors
- Visual check: ajustements page shows "X donne a Y" format instead of "x → y"
</verification>

<success_criteria>
All 3 components display the inverted direction with "donne a" phrasing and capitalized names. Build passes. No functional changes to form submission or data storage.
</success_criteria>

<output>
After completion, create `.planning/quick/1-dans-les-ajustements-remplacer-chris-ver/1-SUMMARY.md`
</output>
