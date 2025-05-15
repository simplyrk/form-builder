'use client';

import Link from 'next/link';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { User, Home, Settings, LogOut } from 'lucide-react';

import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function Navbar() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo and app name */}
          <div className="flex items-center">
            <Logo />
          </div>
          
          {/* Right side: Navigation links, user info, theme toggle, and logout */}
          <div className="flex items-center gap-4">
            {/* Navigation links */}
            <nav className="hidden md:flex gap-1 mr-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            </nav>
            
            {/* User info */}
            <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.firstName || user.username}</span>
            </div>
            
            {/* Theme toggle */}
            <ThemeToggle />
            
            {/* Logout button */}
            <SignOutButton>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </SignOutButton>
          </div>
        </div>
      </Container>
    </header>
  );
}