import { createClient } from '@libsql/client';

// Client direct (pas Drizzle) pour les tests — évite les imports serveur Next.js
function getTestClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL manquant dans .env.local');
  return createClient({ url, authToken });
}

export interface SeedMois {
  annee: number;
  mois: number;
  balance_reportee: number;
}

export interface SeedDepense {
  annee: number;
  mois: number;
  categorie: string;
  sous_categorie: string;
  paye_par: 'chris' | 'alex';
  montant: number;
  label?: string;
  date_depense: string; // 'YYYY-MM-DD'
}

export interface SeedAjustement {
  annee: number;
  mois: number;
  de: 'chris' | 'alex';
  vers: 'chris' | 'alex';
  montant: number;
  label: string;
  date_ajustement: string; // 'YYYY-MM-DD'
}

export interface SeedData {
  mois: SeedMois[];
  depenses?: SeedDepense[];
  ajustements?: SeedAjustement[];
}

export async function seedDatabase(data: SeedData): Promise<void> {
  const client = getTestClient();

  // Vider dans l'ordre correct (FK: depenses/ajustements avant mois)
  await client.execute('DELETE FROM depenses');
  await client.execute('DELETE FROM ajustements');
  await client.execute('DELETE FROM mois');

  // Insérer les mois
  for (const m of data.mois) {
    await client.execute({
      sql: 'INSERT INTO mois (annee, mois, balance_reportee, cree_le) VALUES (?, ?, ?, ?)',
      args: [m.annee, m.mois, m.balance_reportee, Math.floor(Date.now() / 1000)],
    });
  }

  // Récupérer les IDs réels des mois insérés (SQLite AUTOINCREMENT ne recommence pas à 1 après DELETE)
  const moisRows = await client.execute(
    'SELECT id, annee, mois FROM mois ORDER BY id DESC LIMIT ?',
    [data.mois.length]
  );

  // Créer un Map: "${annee}-${mois}" -> id réel
  const moisIdMap = new Map<string, number>();
  for (const row of moisRows.rows) {
    moisIdMap.set(`${row.annee}-${row.mois}`, row.id as number);
  }

  // Insérer les dépenses en résolvant l'ID du mois par (annee, mois)
  for (const d of data.depenses ?? []) {
    const moisId = moisIdMap.get(`${d.annee}-${d.mois}`);
    if (!moisId) {
      throw new Error(`Mois introuvable dans la seed: annee=${d.annee}, mois=${d.mois}`);
    }
    const ts = Math.floor(new Date(d.date_depense).getTime() / 1000);
    await client.execute({
      sql: `INSERT INTO depenses (mois_id, categorie, sous_categorie, paye_par, montant, label, date_depense, cree_le)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [moisId, d.categorie, d.sous_categorie, d.paye_par, d.montant, d.label ?? null, ts, Math.floor(Date.now() / 1000)],
    });
  }

  // Insérer les ajustements en résolvant l'ID du mois par (annee, mois)
  for (const a of data.ajustements ?? []) {
    const moisId = moisIdMap.get(`${a.annee}-${a.mois}`);
    if (!moisId) {
      throw new Error(`Mois introuvable dans la seed: annee=${a.annee}, mois=${a.mois}`);
    }
    const ts = Math.floor(new Date(a.date_ajustement).getTime() / 1000);
    await client.execute({
      sql: `INSERT INTO ajustements (mois_id, de, vers, montant, label, date_ajustement, cree_le)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [moisId, a.de, a.vers, a.montant, a.label, ts, Math.floor(Date.now() / 1000)],
    });
  }

  await client.close();
}
