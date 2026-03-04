export const CATEGORIES = {
  alimentation: {
    label: 'Alimentation',
    emoji: '🛒',
    sous_categories: ['marche_pain', 'intermarche', 'viande', 'miel'],
  },
  habitation: {
    label: 'Habitation',
    emoji: '🏠',
    sous_categories: ['loyer', 'energie', 'internet', 'eau', 'assurance', 'amazon', 'netflix'],
  },
  loisirs: {
    label: 'Loisirs',
    emoji: '🎿',
    sous_categories: ['restaurant', 'vacances', 'sport', 'livres'],
  },
  vie_quotidienne: {
    label: 'Vie quotidienne',
    emoji: '💊',
    sous_categories: ['pharmacie', 'animaux', 'cadeaux', 'appartement'],
  },
} as const;

export type Categorie = keyof typeof CATEGORIES;
export type PayePar = 'chris' | 'alex';
