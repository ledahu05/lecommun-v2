'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { mois as moisTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getMoisByAnneeEtMois, insertMois, deleteMois } from '@/lib/db/queries/mois';
import { getDepensesByMois, insertDepense } from '@/lib/db/queries/depenses';
import { getAjustementsByMois, insertAjustement } from '@/lib/db/queries/ajustements';

// ── Zod schemas for fixture validation ──────────────────────────────────────

const FixtureMoisSchema = z.object({
  annee: z.number().int().min(2000),
  mois: z.number().int().min(1).max(12),
  balance_reportee: z.number(),
});

const FixtureDepenseSchema = z.object({
  mois_id: z.number().int(), // fixture-internal id — ignored for DB insertion
  categorie: z.enum(['alimentation', 'habitation', 'loisirs', 'vie_quotidienne']),
  sous_categorie: z.string().min(1),
  paye_par: z.enum(['chris', 'alex']),
  montant: z.number().positive(),
  label: z.string().optional().nullable(),
  date_depense: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurrent: z.boolean().optional().default(false),
});

const FixtureAjustementSchema = z.object({
  mois_id: z.number().int(), // fixture-internal id — ignored for DB insertion
  de: z.enum(['chris', 'alex']),
  vers: z.enum(['chris', 'alex']),
  montant: z.number().positive(),
  label: z.string().min(1),
  date_ajustement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurrent: z.boolean().optional().default(false),
});

const FixtureSchema = z.object({
  mois: z.array(FixtureMoisSchema).min(1),
  depenses: z.array(FixtureDepenseSchema),
  ajustements: z.array(FixtureAjustementSchema),
});

// ── actionImportMois ─────────────────────────────────────────────────────────

export async function actionImportMois(
  formData: FormData
): Promise<{ error: string } | void> {
  const jsonStr = formData.get('json') as string;

  // Parse JSON
  let raw: unknown;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    return { error: 'Fichier JSON invalide — impossible de le lire.' };
  }

  // Validate structure
  const parsed = FixtureSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `Structure invalide : ${issue?.message ?? 'champs requis manquants'}` };
  }

  const fixture = parsed.data;
  const fixtureMois = fixture.mois[0]; // single-month per file

  // Check for duplicate
  const existing = await getMoisByAnneeEtMois(fixtureMois.annee, fixtureMois.mois);
  let moisId: number;

  if (existing) {
    // If existing month is empty (auto-created by dashboard), reuse it
    const existingDeps = await getDepensesByMois(existing.id);
    const existingAdjs = await getAjustementsByMois(existing.id);
    if (existingDeps.length > 0 || existingAdjs.length > 0) {
      const pad = String(fixtureMois.mois).padStart(2, '0');
      return {
        error: `Ce mois existe déjà (${fixtureMois.annee}-${pad}). Supprimez-le d'abord si vous souhaitez le remplacer.`,
      };
    }
    // Update balance_reportee from fixture
    await db
      .update(moisTable)
      .set({ balance_reportee: fixtureMois.balance_reportee })
      .where(eq(moisTable.id, existing.id));
    moisId = existing.id;
  } else {
    // Insert mois — use balance_reportee from fixture as-is (IMPORT-03)
    const inserted = await insertMois({
      annee: fixtureMois.annee,
      moisNum: fixtureMois.mois,
      balance_reportee: fixtureMois.balance_reportee,
    });
    moisId = inserted.id;
  }

  // Insert depenses — ignore fixture mois_id, use real DB id (IMPORT-05)
  for (const d of fixture.depenses) {
    await insertDepense({
      mois_id: moisId,
      categorie: d.categorie,
      sous_categorie: d.sous_categorie,
      paye_par: d.paye_par,
      montant: d.montant,
      label: d.label ?? undefined,
      date_depense: new Date(d.date_depense),
      recurrent: d.recurrent,
    });
  }

  // Insert ajustements — ignore fixture mois_id, use real DB id (IMPORT-05)
  for (const a of fixture.ajustements) {
    await insertAjustement({
      mois_id: moisId,
      de: a.de,
      vers: a.vers,
      montant: a.montant,
      label: a.label,
      date_ajustement: new Date(a.date_ajustement),
      recurrent: a.recurrent,
    });
  }

  revalidatePath('/historique');
  revalidatePath('/');
}

// ── actionDeleteMois ─────────────────────────────────────────────────────────

export async function actionDeleteMois(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  await deleteMois(id);

  revalidatePath('/historique');
}

// ── actionExportMois ─────────────────────────────────────────────────────────

export async function actionExportMois(
  moisId: number
): Promise<{ error: string } | { json: string; filename: string }> {
  // Fetch mois
  const rows = await db
    .select()
    .from(moisTable)
    .where(eq(moisTable.id, moisId))
    .limit(1);

  const m = rows[0];
  if (!m) {
    return { error: 'Mois introuvable.' };
  }

  // Fetch depenses and ajustements
  const deps = await getDepensesByMois(moisId);
  const adjs = await getAjustementsByMois(moisId);

  // Format dates as YYYY-MM-DD strings (DB stores as timestamp)
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Assemble round-trip compatible JSON (same structure as import)
  const exportData = {
    mois: [{
      annee: m.annee,
      mois: m.mois,
      balance_reportee: m.balance_reportee,
    }],
    depenses: deps.map((d) => ({
      mois_id: 1,
      categorie: d.categorie,
      sous_categorie: d.sous_categorie,
      paye_par: d.paye_par,
      montant: d.montant,
      label: d.label ?? null,
      date_depense: formatDate(d.date_depense),
      recurrent: !!d.recurrent,
    })),
    ajustements: adjs.map((a) => ({
      mois_id: 1,
      de: a.de,
      vers: a.vers,
      montant: a.montant,
      label: a.label,
      date_ajustement: formatDate(a.date_ajustement),
      recurrent: !!a.recurrent,
    })),
  };

  const pad = String(m.mois).padStart(2, '0');
  const filename = `lecommun-${m.annee}-${pad}.json`;

  return { json: JSON.stringify(exportData, null, 2), filename };
}
