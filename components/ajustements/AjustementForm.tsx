'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { actionCreateAjustement } from '@/app/(app)/ajustements/actions';

async function handleCreateAjustement(formData: FormData): Promise<void> {
  await actionCreateAjustement(formData);
}

const today = new Date().toISOString().slice(0, 10);

export default function AjustementForm() {
  const [de, setDe] = useState<'chris' | 'alex'>('chris');
  const vers = de === 'chris' ? 'alex' : 'chris';

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Nouvel ajustement</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleCreateAjustement} data-testid="ajustement-form" className="space-y-4">
          {/* Hidden inputs for de/vers */}
          <input type="hidden" name="de" value={de} />
          <input type="hidden" name="vers" value={vers} />

          {/* Direction — segmented buttons for "De" */}
          <div>
            <Label className="text-base mb-2 block">
              De ({de} → {vers})
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={de === 'chris' ? 'default' : 'outline'}
                className="flex-1 min-h-[48px] text-base"
                onClick={() => setDe('chris')}
              >
                Chris
              </Button>
              <Button
                type="button"
                variant={de === 'alex' ? 'default' : 'outline'}
                className="flex-1 min-h-[48px] text-base"
                onClick={() => setDe('alex')}
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

          {/* Libellé obligatoire */}
          <div>
            <Label htmlFor="label" className="text-base mb-2 block">
              Libellé
            </Label>
            <Input
              id="label"
              name="label"
              type="text"
              placeholder="Libellé obligatoire"
              className="min-h-[48px] text-base"
              required
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date_ajustement" className="text-base mb-2 block">
              Date
            </Label>
            <Input
              id="date_ajustement"
              name="date_ajustement"
              type="date"
              defaultValue={today}
              className="min-h-[48px] text-base"
              required
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
