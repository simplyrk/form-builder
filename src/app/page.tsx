'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserResponsesTable } from '@/components/user-responses-table';
import { deleteResponses } from '@/app/actions/forms';
import { Toaster } from '@/components/ui/toaster';
import type { Form, Response } from '@/types/form';

export default function HomePage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [userResponses, setUserResponses] = useState<Array<Response & { form: Form }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
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
  };

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
      const result = await deleteResponses(responseIds);
      if (result.success) {
        await fetchUserResponses();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error deleting responses:', error);
      return { success: false, error: 'Failed to delete responses' };
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Form Builder</CardTitle>
            <CardDescription>Please sign in to access your forms and responses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Forms</CardTitle>
            <CardDescription>Forms you can fill out</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading available forms...</p>
            ) : availableForms.length === 0 ? (
              <p className="text-muted-foreground">No forms available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {availableForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{form.title}</h3>
                      {form.description && (
                        <p className="text-sm text-muted-foreground">{form.description}</p>
                      )}
                    </div>
                    <Button asChild>
                      <a href={`/forms/${form.id}`}>Fill Form</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Responses</CardTitle>
            <CardDescription>Forms you have submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading your responses...</p>
            ) : userResponses.length === 0 ? (
              <p className="text-muted-foreground">You haven't submitted any forms yet.</p>
            ) : (
              <UserResponsesTable responses={userResponses} onDelete={handleDelete} />
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
