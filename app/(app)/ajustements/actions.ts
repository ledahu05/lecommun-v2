'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { insertAjustement, deleteAjustement } from '@/lib/db/queries/ajustements';
import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';

const AjustementSchema = z
  .object({
    de: z.enum(['chris', 'alex']),
    vers: z.enum(['chris', 'alex']),
    montant: z.coerce.number().positive(),
    label: z.string().min(1, 'Le libellé est obligatoire'),
    date_ajustement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((data) => data.de !== data.vers, {
    message: 'Débiteur et créditeur ne peuvent pas être la même personne',
    path: ['vers'],
  });

export async function actionCreateAjustement(
  formData: FormData
): Promise<{ error: string } | void> {
  const raw = {
    de: formData.get('de'),
    vers: formData.get('vers'),
    montant: formData.get('montant'),
    label: formData.get('label'),
    date_ajustement: formData.get('date_ajustement'),
  };

  const parsed = AjustementSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return { error: issues[0]?.message ?? 'Données invalides' };
  }

  const moisCourant = await getOrCreateCurrentMois();

  await insertAjustement({
    mois_id: moisCourant.id,
    de: parsed.data.de,
    vers: parsed.data.vers,
    montant: parsed.data.montant,
    label: parsed.data.label,
    date_ajustement: new Date(parsed.data.date_ajustement),
  });

  revalidatePath('/ajustements');
  revalidatePath('/');
}

export async function actionDeleteAjustement(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;

  await deleteAjustement(id);

  revalidatePath('/ajustements');
  revalidatePath('/');
}
