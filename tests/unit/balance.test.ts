import { describe, it, expect } from 'vitest';
import { calculerBalance } from '@/lib/balance';
import type { Depense, Ajustement } from '@/types';

// Helper to create minimal Depense fixture
function makeDepense(paye_par: 'chris' | 'alex', montant: number): Depense {
  return {
    id: 1,
    mois_id: 1,
    categorie: 'alimentation',
    sous_categorie: 'intermarche',
    paye_par,
    montant,
    label: null,
    date_depense: new Date('2026-03-01'),
    cree_le: new Date('2026-03-01'),
    recurrent: 0,
  };
}

// Helper to create minimal Ajustement fixture
function makeAjustement(de: 'chris' | 'alex', vers: 'chris' | 'alex', montant: number): Ajustement {
  return {
    id: 1,
    mois_id: 1,
    de,
    vers,
    montant,
    label: 'test',
    date_ajustement: new Date('2026-03-01'),
    cree_le: new Date('2026-03-01'),
    recurrent: 0,
  };
}

describe('calculerBalance', () => {
  it('retourne zéro pour des entrées vides', () => {
    const result = calculerBalance([], [], 0);
    expect(result).toEqual({
      total_chris: 0,
      total_alex: 0,
      balance_mensuelle: 0,
      balance_reportee: 0,
      total_chris_vers_alex: 0,
      total_alex_vers_chris: 0,
      balance_finale: 0,
    });
  });

  it('calcule correctement quand Chris a dépensé 100€ seul', () => {
    const result = calculerBalance([makeDepense('chris', 100)], [], 0);
    // total_chris=100, total_alex=0 → bm=(0-100)/2=-50
    // total_cv = -50 + 0 + 0 = -50, total_vc=0
    // balance_finale = -50 - 0 = -50 (Alex doit à Chris)
    expect(result.total_chris).toBe(100);
    expect(result.total_alex).toBe(0);
    expect(result.balance_mensuelle).toBe(-50);
    expect(result.balance_finale).toBe(-50);
  });

  it('calcule correctement quand Alex a dépensé 200€ seule', () => {
    const result = calculerBalance([makeDepense('alex', 200)], [], 0);
    // total_chris=0, total_alex=200 → bm=(200-0)/2=100
    // balance_finale = 100 (Chris doit à Alex)
    expect(result.total_chris).toBe(0);
    expect(result.total_alex).toBe(200);
    expect(result.balance_mensuelle).toBe(100);
    expect(result.balance_finale).toBe(100);
  });

  it('vérifie le scénario mars 2026 des fixtures (balance_finale = -518.5)', () => {
    // Données mars 2026 (fixtures_e2e.json mois_id=5)
    // chris=33, alex=146, bm=56.5, br=-290, adj_cv=115(appart), adj_vc=400(virement)
    const depensesMars: Depense[] = [
      makeDepense('chris', 33),
      makeDepense('alex', 146),
    ];
    const ajustementsMars: Ajustement[] = [
      { ...makeAjustement('chris', 'alex', 115), label: 'appart' },
      { ...makeAjustement('alex', 'chris', 400), label: 'virement' },
    ];
    const balance_reportee = -290;

    const result = calculerBalance(depensesMars, ajustementsMars, balance_reportee);

    expect(result.total_chris).toBe(33);
    expect(result.total_alex).toBe(146);
    expect(result.balance_mensuelle).toBe(56.5);
    expect(result.balance_reportee).toBe(-290);
    // total_cv = 56.5 + (-290) + 115 = -118.5
    expect(result.total_chris_vers_alex).toBe(-118.5);
    // total_vc = 400
    expect(result.total_alex_vers_chris).toBe(400);
    // balance_finale = -118.5 - 400 = -518.5
    expect(result.balance_finale).toBe(-518.5);
  });

  it('intègre balance_reportee dans le calcul', () => {
    // Avec une balance reportée positive
    const result = calculerBalance([], [], 100);
    // bm=0, cv = 0 + 100 + 0 = 100, vc=0 → finale=100
    expect(result.balance_reportee).toBe(100);
    expect(result.total_chris_vers_alex).toBe(100);
    expect(result.balance_finale).toBe(100);
  });
});
