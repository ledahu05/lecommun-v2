'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { actionCreateAjustement } from '@/app/(app)/ajustements/actions';

const today = new Date().toISOString().slice(0, 10);

export default function AjustementForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [de, setDe] = useState<'chris' | 'alex'>('chris');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const vers = de === 'chris' ? 'alex' : 'chris';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await actionCreateAjustement(formData);
      if (result && 'error' in result) {
        setError(result.error);
      } else {
        setError(null);
        setOpen(false);
        router.refresh();
      }
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="min-h-[48px] text-base gap-2">
          <Plus className="h-5 w-5" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel ajustement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} data-testid="ajustement-form" className="space-y-4">
          {/* Hidden inputs for de/vers */}
          <input type="hidden" name="de" value={de} />
          <input type="hidden" name="vers" value={vers} />

          {/* Direction — segmented buttons for "De" */}
          <div>
            <Label className="text-base mb-2 block">
              De ({de} vers {vers})
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
              Montant (EUR)
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

          {/* Libelle obligatoire */}
          <div>
            <Label htmlFor="label" className="text-base mb-2 block">
              Libelle
            </Label>
            <Input
              id="label"
              name="label"
              type="text"
              placeholder="Libelle obligatoire"
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

          {error && (
            <p className="text-sm text-destructive" data-testid="ajustement-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full min-h-[48px] text-base"
            disabled={isPending}
          >
            {isPending ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
