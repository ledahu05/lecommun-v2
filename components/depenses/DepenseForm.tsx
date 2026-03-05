'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/categories';
import type { Categorie } from '@/lib/categories';
import { actionCreateDepense } from '@/app/(app)/depenses/actions';

async function handleCreateDepense(formData: FormData): Promise<void> {
  await actionCreateDepense(formData);
}

const today = new Date().toISOString().slice(0, 10);

export default function DepenseForm() {
  const [categorie, setCategorie] = useState<Categorie>('alimentation');
  const [payePar, setPayePar] = useState<'chris' | 'alex'>('chris');

  const sousCats = CATEGORIES[categorie].sous_categories;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Nouvelle dépense</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleCreateDepense} data-testid="depense-form" className="space-y-4">
          {/* Catégorie — 4 boutons */}
          <div>
            <Label className="text-base mb-2 block">Catégorie</Label>
            <input type="hidden" name="categorie" value={categorie} />
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORIES) as Categorie[]).map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={categorie === cat ? 'default' : 'outline'}
                  className="min-h-[48px] text-base"
                  onClick={() => setCategorie(cat)}
                >
                  {CATEGORIES[cat].emoji} {CATEGORIES[cat].label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sous-catégorie */}
          <div>
            <Label htmlFor="sous_categorie" className="text-base mb-2 block">
              Sous-catégorie
            </Label>
            <select
              key={categorie}
              id="sous_categorie"
              name="sous_categorie"
              className="w-full min-h-[48px] rounded-md border border-input bg-background px-3 py-2 text-base"
            >
              {sousCats.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Payeur — segmented buttons */}
          <div>
            <Label className="text-base mb-2 block">Payé par</Label>
            <input type="hidden" name="paye_par" value={payePar} />
            <div className="flex gap-2">
              <Button
                type="button"
                variant={payePar === 'chris' ? 'default' : 'outline'}
                className="flex-1 min-h-[48px] text-base"
                onClick={() => setPayePar('chris')}
              >
                Chris
              </Button>
              <Button
                type="button"
                variant={payePar === 'alex' ? 'default' : 'outline'}
                className="flex-1 min-h-[48px] text-base"
                onClick={() => setPayePar('alex')}
              >
                Alex
              </Button>
            </div>
          </div>

          {/* Montant */}
          <div>
            <Label htmlFor="montant" className="text-base mb-2 block">
              Montant (€)
            </Label>
            <Input
              id="montant"
              name="montant"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              className="min-h-[48px] text-base"
              required
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date_depense" className="text-base mb-2 block">
              Date
            </Label>
            <Input
              id="date_depense"
              name="date_depense"
              type="date"
              defaultValue={today}
              className="min-h-[48px] text-base"
              required
            />
          </div>

          {/* Libellé optionnel */}
          <div>
            <Label htmlFor="label" className="text-base mb-2 block">
              Libellé (optionnel)
            </Label>
            <Input
              id="label"
              name="label"
              type="text"
              placeholder="Libellé optionnel"
              className="min-h-[48px] text-base"
            />
          </div>

          <Button type="submit" className="w-full min-h-[48px] text-base">
            Ajouter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
