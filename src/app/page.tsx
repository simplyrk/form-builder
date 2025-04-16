'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@clerk/nextjs';
import { FileText } from 'lucide-react';

import { FormsLayout } from '@/components/forms-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Form } from '@/types/form';

export default function HomePage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableForms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/forms/available');
        if (!response.ok) {
          throw new Error('Failed to fetch available forms');
        }
        const data = await response.json();
        setAvailableForms(data);
      } catch (error) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userId) {
      router.push('/sign-in');
      return;
    }
    fetchAvailableForms();
  }, [userId, router]);

  if (!userId) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormsLayout>
      <div className="p-6">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Welcome to Form Builder
              </CardTitle>
              <CardDescription>
                Click on a form in the navbar to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading available forms...</p>
              ) : availableForms.length === 0 ? (
                <p className="text-muted-foreground">No forms are available at the moment.</p>
              ) : (
                <p className="text-muted-foreground">
                  There are {availableForms.length} form{availableForms.length === 1 ? '' : 's'} available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FormsLayout>
  );
}
