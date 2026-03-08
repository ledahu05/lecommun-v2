---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - components/depenses/DepenseForm.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Les champs date et libelle sont masques par defaut a l'ouverture de la modale"
    - "Un bouton/lien discret permet de deplier les champs date et libelle"
    - "La date par defaut reste aujourd'hui meme quand les champs sont replies"
    - "Le formulaire soumet correctement avec les champs replies (date=aujourd'hui, label vide)"
  artifacts:
    - path: "components/depenses/DepenseForm.tsx"
      provides: "Formulaire depense avec champs date/libelle repliables"
  key_links: []
---

<objective>
Replier par defaut les champs date et libelle dans la modale d'ajout de depense, avec un lien discret pour les deplier.

Purpose: Simplifier l'interface mobile — ces champs sont rarement saisis. La date par defaut (aujourd'hui) convient dans la majorite des cas.
Output: DepenseForm.tsx modifie avec section repliable.
</objective>

<execution_context>
@/home/ledahu/.claude/get-shit-done/workflows/execute-plan.md
@/home/ledahu/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@components/depenses/DepenseForm.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replier date et libelle par defaut avec toggle discret</name>
  <files>components/depenses/DepenseForm.tsx</files>
  <action>
Dans DepenseForm.tsx :

1. Ajouter un state `const [showOptional, setShowOptional] = useState(false);`

2. Remplacer les sections date (lignes 165-178) et libelle (lignes 180-192) par un bloc conditionnel :

   - Quand `showOptional === false` : afficher un bouton discret style lien texte gris/muted :
     ```
     <button type="button" onClick={() => setShowOptional(true)}
       className="text-sm text-muted-foreground underline underline-offset-4">
       Modifier la date ou ajouter un libelle
     </button>
     ```
   - Quand `showOptional === true` : afficher les deux champs date et libelle exactement comme actuellement (conserver les memes name, id, defaultValue, required, className)

3. IMPORTANT : le champ date doit TOUJOURS etre present dans le DOM pour la soumission du formulaire. Quand replies, ajouter un `<input type="hidden" name="date_depense" value={today} />` pour que la date par defaut soit toujours envoyee.

4. Le libelle n'a pas besoin de hidden input car il est deja optionnel (pas de `required`).

5. Quand la modale se ferme et se reouvre, `showOptional` revient a `false` (c'est deja le cas car le state se reinitialise avec useState).

6. Importer ChevronDown de lucide-react et l'ajouter avant le texte du bouton toggle (taille h-4 w-4) pour indiquer visuellement qu'il y a du contenu depliable.
  </action>
  <verify>
    <automated>cd /home/ledahu/workspace/lecommun && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Les champs date et libelle sont masques par defaut. Un lien discret les affiche au clic. La date par defaut (aujourd'hui) est toujours soumise meme en mode replie. Le build passe sans erreur.</done>
</task>

</tasks>

<verification>
- `npm run build` reussit
- Ouvrir la modale : seuls categorie, sous-categorie, payeur, montant sont visibles
- Le lien "Modifier la date ou ajouter un libelle" est visible sous le montant
- Cliquer le lien : les champs date et libelle apparaissent
- Soumettre sans deplier : la depense est creee avec la date du jour
</verification>

<success_criteria>
La modale d'ajout de depense est plus compacte par defaut, les champs rarement utilises sont a un clic.
</success_criteria>

<output>
After completion, create `.planning/quick/2-dans-la-modale-d-ajout-de-d-pense-les-ch/2-SUMMARY.md`
</output>
