# PRD — Compta Commune Chris & Alex
**Version 1.0 — Mars 2026**

| Champ | Valeur |
|---|---|
| Version | 1.0 |
| Date | Mars 2026 |
| Statut | Analyse de l'existant |
| Périmètre | Juillet 2021 → Mars 2026 (55 mois) |
| Utilisateurs | Chris, Alex |

---

## 1. Contexte & Objectifs

### 1.1 Description du système existant

Chris et Alex partagent un logement et leurs dépenses quotidiennes depuis juillet 2021. Pour gérer la répartition équitable de ces dépenses, ils ont mis en place un tableur Google Sheets unique contenant un onglet par mois (55 onglets au total, de juillet 2021 à mars 2026, plus des onglets immobiliers).

Le principe central est le suivant : chaque mois, chacun enregistre ce qu'il a dépensé dans les catégories communes, un algorithme calcule qui doit quoi à qui, et le solde est reporté au mois suivant. Ce mécanisme de **balance glissante** permet de savoir en temps réel la dette nette entre les deux parties, sans avoir à solder chaque mois.

### 1.2 Objectifs du PRD

- Documenter précisément le modèle de données, les règles de gestion et les formules du système actuel
- Identifier les frictions et limitations du Google Sheets pour guider une éventuelle migration vers une application dédiée
- Servir de référence technique pour tout développement futur

---

## 2. Modèle de Données

### 2.1 Vue d'ensemble

Chaque onglet mensuel suit une structure en deux zones principales : la zone de saisie des dépenses (partie haute) et la zone de calcul de la balance (partie basse).

### 2.2 Entités principales

#### 2.2.1 Dépense

| Champ | Type | Description |
|---|---|---|
| catégorie | String | Alimentation, Habitation, Loisirs, Vie quotidienne |
| sous-catégorie | String | Ligne de dépense spécifique (marché, intermarché, EDF...) |
| montant_chris | Number | Montant payé par Chris (colonne C). Peut être une formule `=5+12+...` pour agréger plusieurs tickets |
| montant_alex | Number | Montant payé par Alex (colonne D) |
| mois | String | Identifié par le nom de l'onglet (ex. `janvier 2026`) |

#### 2.2.2 Catégories de dépenses

Le système distingue 4 catégories principales, stables sur toute la durée du suivi :

| Catégorie | Sous-catégories observées |
|---|---|
| Alimentation | Marché/pain, Miel, Viande, Intermarché, Café |
| Habitation | Loyer, Assurance, Impôt, Eau, Direct Énergie, Internet, Taxe habitation, Ramonage, Netflix, Amazon abonnement annuel |
| Loisirs | Restaurant, Week-end/vacances, Livres, Ekosport |
| Vie quotidienne | Pharmacie, Berlioz/rats (animaux), Sport, Cadeaux, Appartement (travaux/charges), Immo |

#### 2.2.3 Élément de dette ("Dettes")

La section basse de chaque onglet liste des lignes de dette nommées qui complètent la balance mensuelle :

| Ligne | Direction | Description |
|---|---|---|
| Balance courante | Chris → Alex | Solde du mois courant calculé automatiquement (`=D34`) |
| Balance précédente | Chris → Alex | Report manuel du solde du mois précédent (saisie manuelle) |
| Appart | Chris → Alex | Contribution fixe mensuelle de 115 € (participation loyer/crédit) |
| Lignes diverses | Chris → Alex | Achats ponctuels avancés par Chris pour Alex (pharmacie, cadeaux...) |
| Virement | Alex → Chris | Remboursements effectués par Alex par virement bancaire |
| Lignes diverses | Alex → Chris | Achats ponctuels avancés par Alex pour Chris |

---

## 3. Règles de Gestion & Algorithme

### 3.1 Calcul de la balance mensuelle

La balance mensuelle représente l'écart de dépenses entre Alex et Chris, normalisé pour une répartition 50/50 :

| Étape | Formule / Logique |
|---|---|
| Total Chris | `=SUM` de toutes les dépenses payées par Chris sur le mois |
| Total Alex | `=SUM` de toutes les dépenses payées par Alex sur le mois |
| **Balance mensuelle** | **`= (Total Alex - Total Chris) / 2`** |
| Interprétation | Si positif → Chris doit rééquilibrer. Si négatif → Alex doit rééquilibrer. |

### 3.2 Calcul de la balance finale (balance glissante)

La **Balance finale (Chris→Alex)** est le solde net de toutes les dettes entre les deux parties sur le mois courant :

```
Total Chris→Alex
  = Balance courante (auto)
  + Balance précédente (report manuel)
  + Appart (fixe 115€)
  + Divers (avances de Chris)

Total Alex→Chris
  = Virements reçus
  + Divers (avances d'Alex)

Balance finale = Total Chris→Alex − Total Alex→Chris
  > 0 → Chris doit de l'argent à Alex
  < 0 → Alex doit de l'argent à Chris
```

### 3.3 Report de la balance

Le report de la balance d'un mois à l'autre est une opération **MANUELLE** : la "Balance précédente" du mois N+1 est saisie à la main, en reprenant la valeur de la "Balance finale" du mois N. C'est un point de friction identifié (risque d'erreur de copie).

### 3.4 Synthèse mensuelle

Chaque onglet contient une section "Synthèse" qui décompose les dépenses communes par catégorie, rapportées à la part de chaque personne :

| Métrique | Formule |
|---|---|
| Total habitation / personne | `= Total habitation Alex / 2` |
| Total alimentation / personne | `= Total alimentation Alex / 2` |
| Total loisirs / personne | `= Total loisirs Alex / 2` |
| Total vie quotidienne / personne | `= Total vie quotidienne Alex / 2` |
| **Total commun / personne** | **= Somme des 4 lignes précédentes** |

> Note : la synthèse utilise les totaux d'Alex comme référence commune car Alex est celui qui paye la majorité des charges fixes (loyer, énergie, internet...).

---

## 4. Anatomie d'un Onglet Mensuel

### 4.1 Zones fonctionnelles

| Zone | Lignes (approx.) | Contenu |
|---|---|---|
| En-tête | L1 | Labels "Chris" (col C) et "Alex" (col D) |
| Alimentation | L2–L9 | Sous-catégories + totaux par personne |
| Habitation | L10–L18 | Sous-catégories + totaux par personne |
| Loisirs | L19–L23 | Sous-catégories + totaux par personne |
| Vie quotidienne | L24–L30 | Sous-catégories + totaux par personne |
| Totaux globaux | L31–L34 | Total Chris, Total Alex, Balance mensuelle |
| Dettes | L36–L45 | Deux colonnes : Chris→Alex et Alex→Chris, avec Balance finale |
| Synthèse | L39–L45 | Ventilation par catégorie / personne |

### 4.2 Colonnes utilisées

| Colonne | Rôle |
|---|---|
| A | Catégorie principale (Alimentation, Habitation, Loisirs, Vie quotidienne) |
| B | Sous-catégorie / libellé de dépense |
| C | Montant payé par Chris (parfois formule `=a+b+c` pour agréger des tickets) |
| D | Montant payé par Alex |
| E-F | Section Alex→Chris (dettes en sens inverse) |
| H-I | Synthèse par catégorie / personne |
| I (ou J) | Référence mensuelle : coûts fixes indicatifs par poste (depuis mi-2024) |

---

## 5. Évolution Historique du Système

### 5.1 Chronologie des changements

| Période | Évolutions notables |
|---|---|
| Juil 2021 – Déc 2023 | Structure de base : 4 catégories, colonnes C/D, balance glissante. Section "Appartement" avec suivi des travaux toiture (1 468 € Chris + 2 446 € Alex). Présence d'un onglet "café" avant consolidation dans Alimentation. |
| Jan 2024 – Juin 2024 | Stabilisation de la structure. Ajout de lignes spécifiques (énergie, eau, amazon). Apparition des calculs de partage Battista (immeuble) dans les colonnes J-K. |
| Juil 2024 – Déc 2024 | Ajout d'une colonne de référence (col I/J) avec les coûts fixes mensuels estimés par poste (loyer 49,96 €, énergie 160 €, internet 33 €...). Amazon Prime intégré comme charge fixe. |
| Jan 2025 – Juin 2025 | Ajout des en-têtes de colonnes "Catégorie" / "Sous catégorie" (A1/B1). Légère restructuration de la section Dettes (colonnes E-F au lieu de F-G). Colonne K avec corrections de soldes. |
| Juil 2025 – Mar 2026 | Structure stable. Suppression de la colonne référence fixe. Onglet "Lozere Chris" dans colonnes H-J pour frais de déplacement spécifiques. Charges fixes Alex ajustées (eau 115 €, énergie 137 €). |

### 5.2 Charges fixes récurrentes

Les postes suivants reviennent systématiquement dans la colonne Alex sur toute la période :

| Poste | Montant mensuel | Évolution |
|---|---|---|
| Direct Énergie / EDF | 190 € → 216 € → 160 € → 137 € | Fluctue selon saison et contrat |
| Internet | 30 € → 33 € → 43 € | Légère hausse progressive |
| Assurance | 24 € → 26 € → 29 € → 31 € | Hausse régulière |
| Eau | Ponctuelle → 115 €/trim → 115 € | Facture trimestrielle intégrée mensuellement |
| Amazon Prime | 70 €/an (depuis août 2024) | Annuel |
| Appart (Chris → Alex) | 115 €/mois fixe | Stable sur toute la période |

---

## 6. Limitations & Problèmes Identifiés

### 6.1 Problèmes structurels

**Report manuel de la balance**
La valeur "Balance précédente" est saisie à la main chaque mois. Il n'existe pas de lien de formule inter-onglets. Tout oubli ou erreur de copie crée une divergence silencieuse dans la comptabilité.

**Arithmétique inline dans les cellules**
Les dépenses sont parfois enregistrées sous forme de formules `=5+12+14+6+15` directement dans une cellule, sans détail du libellé de chaque sous-dépense. Cela empêche toute analyse rétrospective fine.

**Structure d'onglets non uniforme**
Les numéros de lignes des zones fonctionnelles varient d'un onglet à l'autre (ex. : la section Habitation commence ligne 6, 7 ou 8 selon les mois). Toute automatisation nécessite une logique de détection robuste plutôt que des références fixes.

### 6.2 Ergonomie

- Pas de validation des saisies : une valeur peut être saisie dans la mauvaise colonne sans alerte
- Pas d'historique des virements bancaires tracé avec date
- Typos récurrents dans les libellés ("Balence" au lieu de "Balance"...)
- Certains mois ont des calculs temporaires dans des colonnes éloignées (I, J, K, L) sans documentation
- Pas de vue consolidée sur plusieurs mois sans ouvrir chaque onglet

### 6.3 Risques

- Perte de données si le Google Sheets est accidentellement modifié sans historique de version actif
- Dépendance à la disponibilité de Google Drive
- Pas de contrôle d'accès concurrent (si les deux éditent simultanément)
- Aucun audit trail sur les modifications de montants

---

## 7. Spécifications pour une Application Cible

### 7.1 User Stories prioritaires

| ID | En tant que... | Priorité | Critère d'acceptation |
|---|---|---|---|
| US-01 | Utilisateur, je veux saisir une dépense avec catégorie, sous-catégorie, montant et payeur | MUST | Dépense enregistrée et visible dans le mois courant |
| US-02 | Utilisateur, je veux voir en temps réel qui doit combien à qui | MUST | Balance mise à jour instantanément après chaque saisie |
| US-03 | Utilisateur, je veux que la balance du mois précédent soit automatiquement reportée | MUST | Pas de saisie manuelle, report automatique |
| US-04 | Utilisateur, je veux ajouter un virement ou une dette ponctuelle librement nommée | MUST | Champ "libellé" + montant + direction |
| US-05 | Utilisateur, je veux voir l'historique des balances mois par mois | SHOULD | Graphique ou tableau récapitulatif |
| US-06 | Utilisateur, je veux ventiler une dépense en plusieurs sous-montants avec libellés | SHOULD | Champ multi-lignes ou saisie itérative |
| US-07 | Utilisateur, je veux consulter le tracker immobilier et ma part du crédit | COULD | Vue synthèse appart avec % de chacun |
| US-08 | Utilisateur, je veux recevoir une notification si le solde dépasse un seuil | COULD | Alerte configurable |

### 7.2 Modèle de données cible

| Entité | Champs clés | Notes |
|---|---|---|
| User | id, name | Chris, Alex (extensible à N utilisateurs) |
| Month | id, year, month, carried_balance | Le `carried_balance` est calculé, non saisi |
| Expense | id, month_id, category, subcategory, paid_by, amount, label, date | `label` permet de détailler (ex. "Intermarché 12/01") |
| Adjustment | id, month_id, from_user, to_user, amount, label, date | Remplace la section "Dettes" libres (virements, avances...) |
| Category | id, name, parent_id | Hiérarchie 2 niveaux |
| FixedCharge | id, label, amount, paid_by, active_from, active_to | Charges récurrentes auto-injectées chaque mois |

### 7.3 Règles de gestion à implémenter

```
balance_mensuelle = (total_alex - total_chris) / 2
  > 0 → Chris doit à Alex
  < 0 → Alex doit à Chris

balance_finale = sum(adjustments Chris→Alex) - sum(adjustments Alex→Chris)

carried_balance[mois N+1] = balance_finale[mois N]   // calculé automatiquement

FixedCharge mensuel : "Appart" = 115€, direction Chris → Alex
Charges fixes payées par Alex, partagées 50/50
```

---

## 8. Contraintes Techniques & Non-Fonctionnelles

### 8.1 Confidentialité

- Les données sont personnelles et financières : stockage chiffré obligatoire
- Accès restreint aux deux utilisateurs (Chris et Alex) uniquement
- Préférence pour un hébergement auto-géré ou en France/UE (souveraineté des données)

### 8.2 Performance

- Calcul de la balance en temps réel (< 200 ms après saisie)
- Historique de 5 ans minimum conservé et consultable

### 8.3 Accessibilité

- Interface mobile-first (saisie rapide lors des courses)
- Fonctionne sans connexion (mode offline avec sync)

### 8.4 Migration

- Import possible des données historiques du Google Sheets (55 mois)
- Conservation des montants et libellés originaux

---

## 9. Annexes

### 9.1 Statistiques du classeur

| Métrique | Valeur |
|---|---|
| Nombre total d'onglets | 55 onglets |
| Période couverte | Juillet 2021 → Mars 2026 (55 mois) |
| Onglets mensuels | 48 onglets actifs |
| Onglets immobiliers | 6 onglets (Appart, Amortissement, Synthèse...) |
| Onglets utilitaires | 1 (crypto) + 1 (Test App) |
| Contribution fixe appart | 115 €/mois (Chris → Alex) |
| Crédit immobilier | Sept 2017 → Août 2042 (~509 €/mois) |
| Catégories de dépenses | 4 principales, ~25 sous-catégories |

### 9.2 Glossaire

| Terme | Définition |
|---|---|
| Balance courante | Solde du mois en cours, calculé automatiquement : `(Total Alex - Total Chris) / 2` |
| Balance précédente | Solde reporté du mois précédent, saisi manuellement |
| Balance finale | Solde net après prise en compte de tous les ajustements (virements, avances, appart...) |
| Balance glissante | Mécanisme de report du solde d'un mois sur l'autre sans solder |
| Appart | Ligne fixe de 115 €/mois que Chris verse à Alex au titre du crédit immobilier |
| Virement | Remboursement effectué par Alex à Chris par virement bancaire |
| Berlioz | Animal de compagnie dont les frais sont partagés |
| Chris→Alex (positif) | Chris doit de l'argent à Alex |
| Chris→Alex (négatif) | Alex doit de l'argent à Chris |

---

*— Fin du document —*
