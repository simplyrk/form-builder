'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { SignIn , useAuth } from '@clerk/nextjs';

export default function SignInPage() {
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      router.push('/');
    }
  }, [userId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background/50">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg border border-border/40 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your forms and responses</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors",
              footerActionLink: "text-primary hover:text-primary/90 transition-colors",
              card: "bg-transparent shadow-none border-none",
              header: "text-foreground",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-background border-border text-foreground",
            },
            variables: {
              colorBackground: "transparent",
              colorText: "#111827",
              colorTextSecondary: "#6b7280",
              colorPrimary: "#2563eb",
              borderRadius: "0.5rem",
            }
          }}
        />
      </div>
    </div>
  );
} 