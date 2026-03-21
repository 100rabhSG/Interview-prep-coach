'use client';

import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function GuestBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <div className="bg-muted/50 border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <p className="text-sm text-muted-foreground">
          You&apos;re practicing as a guest. Sign in to save your progress.
        </p>
        <Button variant="ghost" size="sm" onClick={() => signIn('google')}>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </Button>
      </div>
    </div>
  );
}
