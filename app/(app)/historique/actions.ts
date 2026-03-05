'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getMoisByAnneeEtMois, insertMois, deleteMois } from '@/lib/db/queries/mois';
import { insertDepense } from '@/lib/db/queries/depenses';
import { insertAjustement } from '@/lib/db/queries/ajustements';

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
});

const FixtureAjustementSchema = z.object({
  mois_id: z.number().int(), // fixture-internal id — ignored for DB insertion
  de: z.enum(['chris', 'alex']),
  vers: z.enum(['chris', 'alex']),
  montant: z.number().positive(),
  label: z.string().min(1),
  date_ajustement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  if (existing) {
    const pad = String(fixtureMois.mois).padStart(2, '0');
    return {
      error: `Ce mois existe déjà (${fixtureMois.annee}-${pad}). Supprimez-le d'abord si vous souhaitez le remplacer.`,
    };
  }

  // Insert mois — use balance_reportee from fixture as-is (IMPORT-03)
  const inserted = await insertMois({
    annee: fixtureMois.annee,
    moisNum: fixtureMois.mois,
    balance_reportee: fixtureMois.balance_reportee,
  });

  // Insert depenses — ignore fixture mois_id, use real DB id (IMPORT-05)
  for (const d of fixture.depenses) {
    await insertDepense({
      mois_id: inserted.id,
      categorie: d.categorie,
      sous_categorie: d.sous_categorie,
      paye_par: d.paye_par,
      montant: d.montant,
      label: d.label ?? undefined,
      date_depense: new Date(d.date_depense),
    });
  }

  // Insert ajustements — ignore fixture mois_id, use real DB id (IMPORT-05)
  for (const a of fixture.ajustements) {
    await insertAjustement({
      mois_id: inserted.id,
      de: a.de,
      vers: a.vers,
      montant: a.montant,
      label: a.label,
      date_ajustement: new Date(a.date_ajustement),
    });
  }

  revalidatePath('/historique');
}

// ── actionDeleteMois ─────────────────────────────────────────────────────────

export async function actionDeleteMois(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  await deleteMois(id);

  revalidatePath('/historique');
}
