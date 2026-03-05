'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionImportMois } from '@/app/(app)/historique/actions';

export function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Use a native event listener — Playwright's setInputFiles triggers the native
  // `change` event which is more reliable than React's synthetic onChange.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    function handleNativeChange() {
      const file = input!.files?.[0];
      if (!file) return;
      setError(null);

      startTransition(async () => {
        const text = await file.text();
        const formData = new FormData();
        formData.append('json', text);

        const result = await actionImportMois(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          router.refresh();
        }
        if (input) input.value = '';
      });
    }

    input.addEventListener('change', handleNativeChange);
    input.dataset.ready = 'true'; // signals that event listener is attached
    return () => {
      input.removeEventListener('change', handleNativeChange);
      delete input.dataset.ready;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Button
        data-testid="import-button"
        variant="outline"
        size="sm"
        className="min-h-[48px] gap-2"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <Upload className="w-4 h-4" />
        {isPending ? 'Import…' : 'Importer JSON'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      {error && (
        <p data-testid="import-error" className="text-destructive text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
