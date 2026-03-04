import { auth, signOut } from '@/lib/auth/index';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Accueil</h1>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <Button variant="ghost" size="sm" type="submit">
            Deconnexion
          </Button>
        </form>
      </div>
      <p className="text-muted-foreground">
        Bonjour {session?.user?.id === 'chris' ? 'Chris' : 'Alex'} — Dashboard a venir.
      </p>
    </main>
  );
}
