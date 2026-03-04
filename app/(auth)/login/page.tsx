'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<'chris' | 'alex' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      username: selectedUser,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Identifiants incorrects');
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Le Commun</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Qui es-tu ?</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={selectedUser === 'chris' ? 'default' : 'outline'}
                  className="h-12 text-base"
                  onClick={() => setSelectedUser('chris')}
                >
                  Chris
                </Button>
                <Button
                  type="button"
                  variant={selectedUser === 'alex' ? 'default' : 'outline'}
                  className="h-12 text-base"
                  onClick={() => setSelectedUser('alex')}
                >
                  Alex
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={!selectedUser || !password || loading}
            >
              {loading ? 'Connexion...' : 'Connexion'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
