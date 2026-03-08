'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateBalanceReportee } from '@/lib/db/queries/mois';

const BalanceReporteeSchema = z.object({
  mois_id: z.coerce.number().int().positive(),
  balance_reportee: z.coerce.number(),
});

export async function actionUpdateBalanceReportee(
  formData: FormData
): Promise<{ error: string } | void> {
  const raw = {
    mois_id: formData.get('mois_id'),
    balance_reportee: formData.get('balance_reportee'),
  };

  const parsed = BalanceReporteeSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return { error: issues[0]?.message ?? 'Donnees invalides' };
  }

  await updateBalanceReportee(parsed.data.mois_id, parsed.data.balance_reportee);

  revalidatePath('/');
}
