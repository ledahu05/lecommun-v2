'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { insertDepense, deleteDepense } from '@/lib/db/queries/depenses';
import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';
import { CATEGORIES } from '@/lib/categories';

const DepenseSchema = z
  .object({
    categorie: z.enum(['alimentation', 'habitation', 'loisirs', 'vie_quotidienne']),
    sous_categorie: z.string().min(1),
    paye_par: z.enum(['chris', 'alex']),
    montant: z.coerce.number().positive(),
    date_depense: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    label: z.string().optional(),
  })
  .refine(
    (data) =>
      (CATEGORIES[data.categorie].sous_categories as readonly string[]).includes(data.sous_categorie),
    {
      message: 'Sous-catégorie invalide pour cette catégorie',
      path: ['sous_categorie'],
    }
  );

export async function actionCreateDepense(
  formData: FormData
): Promise<{ error: string } | void> {
  const raw = {
    categorie: formData.get('categorie'),
    sous_categorie: formData.get('sous_categorie'),
    paye_par: formData.get('paye_par'),
    montant: formData.get('montant'),
    date_depense: formData.get('date_depense'),
    label: formData.get('label') || undefined,
  };

  const parsed = DepenseSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return { error: issues[0]?.message ?? 'Données invalides' };
  }

  const moisCourant = await getOrCreateCurrentMois();

  await insertDepense({
    mois_id: moisCourant.id,
    categorie: parsed.data.categorie,
    sous_categorie: parsed.data.sous_categorie,
    paye_par: parsed.data.paye_par,
    montant: parsed.data.montant,
    label: parsed.data.label || undefined,
    date_depense: new Date(parsed.data.date_depense),
  });

  revalidatePath('/depenses');
  revalidatePath('/ajustements');
  revalidatePath('/');
}

export async function actionDeleteDepense(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  await deleteDepense(id);

  revalidatePath('/depenses');
  revalidatePath('/');
}
