'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

export function Navbar() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <nav>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost">Manage</Button>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-sm text-muted-foreground">
                {user.firstName || user.username}
              </span>
            </div>
            <SignOutButton>
              <Button variant="ghost">Sign Out</Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </nav>
  );
} 