import { auth, signOut } from '@/lib/auth/index';
import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
import { calculerBalance } from '@/lib/balance';
import { BalanceCard } from '@/components/balance/BalanceCard';
import { BalanceSynthese } from '@/components/balance/BalanceSynthese';
import { Button } from '@/components/ui/button';

// DASH-04: jamais de cache — la balance doit être fraîche à chaque requête
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  const moisCourant = await getOrCreateCurrentMois();
  const depenses = await getDepensesByMois(moisCourant.id);
  const ajustements = await getAjustementsByMois(moisCourant.id);
  const balance = calculerBalance(depenses, ajustements, moisCourant.balance_reportee);

  return (
    <main className="p-4 space-y-6 pb-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Le Commun</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {session?.user?.id === 'chris' ? 'Chris' : 'Alex'}
          </span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <Button variant="ghost" size="sm" type="submit" className="text-xs h-8 px-2">
              Déco
            </Button>
          </form>
        </div>
      </header>

      <BalanceCard balance={balance} mois={moisCourant} />

      <BalanceSynthese depenses={depenses} />
    </main>
  );
}
