'use client';

import { useState, useTransition } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionExportMois } from '@/app/(app)/historique/actions';

interface Props {
  moisId: number;
}

export function ExportButton({ moisId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await actionExportMois(moisId);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Trigger download via Blob
      const blob = new Blob([result.json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <>
      <Button
        data-testid="export-button"
        variant="ghost"
        size="icon"
        className="min-h-12 min-w-12"
        disabled={isPending}
        onClick={handleExport}
        type="button"
        aria-label="Exporter"
      >
        <Download className="w-4 h-4" />
      </Button>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </>
  );
}
