'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown } from 'lucide-react';
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
import { CATEGORIES } from '@/lib/categories';
import type { Categorie } from '@/lib/categories';
import { actionCreateDepense } from '@/app/(app)/depenses/actions';

const today = new Date().toISOString().slice(0, 10);

interface DepenseFormProps {
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline';
  triggerTestId?: string;
}

export default function DepenseForm({ triggerLabel, triggerVariant, triggerTestId }: DepenseFormProps = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categorie, setCategorie] = useState<Categorie>('alimentation');
  const [sousCategorie, setSousCategorie] = useState<string>(
    CATEGORIES.alimentation.sous_categories[0]
  );
  const [payePar, setPayePar] = useState<'chris' | 'alex'>('chris');
  const [showOptional, setShowOptional] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sousCats = CATEGORIES[categorie].sous_categories;

  function handleCategorieChange(cat: Categorie) {
    setCategorie(cat);
    setSousCategorie(CATEGORIES[cat].sous_categories[0]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await actionCreateDepense(formData);
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
        <Button
          variant={triggerVariant ?? 'default'}
          className="min-h-[48px] text-base gap-2"
          data-testid={triggerTestId}
        >
          <Plus className="h-5 w-5" />
          {triggerLabel ?? 'Ajouter'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle depense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} data-testid="depense-form" className="space-y-4">
          {/* Categorie — 4 boutons */}
          <div>
            <Label className="text-base mb-2 block">Categorie</Label>
            <input type="hidden" name="categorie" value={categorie} />
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORIES) as Categorie[]).map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={categorie === cat ? 'default' : 'outline'}
                  className="min-h-[48px] text-base"
                  onClick={() => handleCategorieChange(cat)}
                >
                  {CATEGORIES[cat].emoji} {CATEGORIES[cat].label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sous-categorie — grille de boutons */}
          <div>
            <Label className="text-base mb-2 block">Sous-categorie</Label>
            <input type="hidden" name="sous_categorie" value={sousCategorie} />
            <div className="grid grid-cols-3 gap-2">
              {sousCats.map((sc) => (
                <Button
                  key={sc}
                  type="button"
                  variant={sousCategorie === sc ? 'default' : 'outline'}
                  className="min-h-[44px] text-sm"
                  onClick={() => setSousCategorie(sc)}
                >
                  {sc}
                </Button>
              ))}
            </div>
          </div>

          {/* Payeur — segmented buttons */}
          <div>
            <Label className="text-base mb-2 block">Paye par</Label>
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

          {/* Date & Libelle — repliables */}
          {showOptional ? (
            <>
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
              <div>
                <Label htmlFor="label" className="text-base mb-2 block">
                  Libelle (optionnel)
                </Label>
                <Input
                  id="label"
                  name="label"
                  type="text"
                  placeholder="Libelle optionnel"
                  className="min-h-[48px] text-base"
                />
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="date_depense" value={today} />
              <button
                type="button"
                onClick={() => setShowOptional(true)}
                className="flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4"
              >
                <ChevronDown className="h-4 w-4" />
                Modifier la date ou ajouter un libelle
              </button>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive" data-testid="depense-error">
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
