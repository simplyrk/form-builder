'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserResponsesTable } from '@/components/user-responses-table';
import { deleteResponses } from '@/app/actions/forms';
import { Toaster } from '@/components/ui/toaster';
import { FileText, Calendar, CheckCircle } from 'lucide-react';
import type { Form, Response } from '@/types/form';
import { cn } from '@/lib/utils';
import { FormsLayout } from '@/components/forms-layout';

export default function HomePage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [userResponses, setUserResponses] = useState<Array<Response & { form: Form }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchAvailableForms(), fetchUserResponses()]);
    } catch (error) {
      setError('Failed to load data. Please try again later.');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
      return;
    }
    fetchData();
  }, [userId, router, fetchData]);

  const fetchAvailableForms = async () => {
    const response = await fetch('/api/forms/available');
    if (!response.ok) {
      throw new Error('Failed to fetch available forms');
    }
    const data = await response.json();
    setAvailableForms(data);
  };

  const fetchUserResponses = async () => {
    const response = await fetch('/api/responses/user');
    if (!response.ok) {
      throw new Error('Failed to fetch user responses');
    }
    const data = await response.json();
    setUserResponses(data);
  };

  const handleDelete = async (responseIds: string[]) => {
    try {
      // Get the form ID from the first response
      const response = userResponses.find(r => r.id === responseIds[0]);
      if (!response) {
        return { success: false, error: 'Response not found' };
      }

      console.log(`Deleting ${responseIds.length} responses for form ${response.form.id}`);
      const result = await deleteResponses(response.form.id, responseIds);
      if (result.success) {
        await fetchUserResponses();
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to delete responses' };
    } catch (error) {
      console.error('Error deleting responses:', error);
      return { success: false, error: 'Failed to delete responses' };
    }
  };

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
            <Button onClick={fetchData}>Try Again</Button>
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
              <CardTitle>Your Responses</CardTitle>
              <CardDescription>Forms you have submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading your responses...</p>
              ) : userResponses.length === 0 ? (
                <p className="text-muted-foreground">You haven&apos;t submitted any forms yet.</p>
              ) : (
                <UserResponsesTable responses={userResponses} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    </FormsLayout>
  );
}
