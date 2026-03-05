import type { Depense, Ajustement } from '@/types';

export interface BalanceResult {
  total_chris: number;
  total_alex: number;
  balance_mensuelle: number;        // (total_alex - total_chris) / 2
  balance_reportee: number;         // reporté du mois précédent
  total_chris_vers_alex: number;    // balance_mensuelle + balance_reportee + adj(chris→alex)
  total_alex_vers_chris: number;    // adj(alex→chris)
  balance_finale: number;           // total_cv - total_vc
  // > 0: Chris doit à Alex  |  < 0: Alex doit à Chris  |  = 0: équilibre
}

export function calculerBalance(
  depenses: Depense[],
  ajustements: Ajustement[],
  balance_reportee: number,
): BalanceResult {
  const total_chris = depenses
    .filter((d) => d.paye_par === 'chris')
    .reduce((sum, d) => sum + d.montant, 0);

  const total_alex = depenses
    .filter((d) => d.paye_par === 'alex')
    .reduce((sum, d) => sum + d.montant, 0);

  // (total_alex - total_chris) / 2 : si Alex a plus dépensé, Chris doit compenser
  const balance_mensuelle = (total_alex - total_chris) / 2;

  // ALGORITHME CORRIGÉ (vérifié contre fixtures_e2e.json mars 2026)
  // NE PAS omettre balance_mensuelle — CLAUDE.md a une erreur de documentation
  const total_chris_vers_alex =
    balance_mensuelle +
    balance_reportee +
    ajustements
      .filter((a) => a.de === 'chris' && a.vers === 'alex')
      .reduce((sum, a) => sum + a.montant, 0);

  const total_alex_vers_chris = ajustements
    .filter((a) => a.de === 'alex' && a.vers === 'chris')
    .reduce((sum, a) => sum + a.montant, 0);

  const balance_finale = total_chris_vers_alex - total_alex_vers_chris;

  return {
    total_chris,
    total_alex,
    balance_mensuelle,
    balance_reportee,
    total_chris_vers_alex,
    total_alex_vers_chris,
    balance_finale,
  };
}
