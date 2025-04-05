'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserResponsesTable } from '@/components/user-responses-table';
import { deleteResponses } from '@/app/actions/forms';
import { Toaster } from '@/components/ui/toaster';
import { ArrowRight, FileText, Calendar, CheckCircle } from 'lucide-react';
import type { Form, Response } from '@/types/form';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [userResponses, setUserResponses] = useState<Array<Response & { form: Form }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
      return;
    }
    fetchData();
  }, [userId, router]);

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
      return { success: false, error: 'Failed to delete responses' };
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
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Available Forms</CardTitle>
            </div>
            <CardDescription className="text-base">Forms you can fill out</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading available forms...</span>
              </div>
            ) : availableForms.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No forms available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableForms.map((form, index) => (
                  <div 
                    key={form.id} 
                    className={cn(
                      "flex items-center justify-between p-5 rounded-lg transition-all duration-200 hover:shadow-md",
                      "border border-primary/20",
                      index % 3 === 0 ? "bg-blue-50 dark:bg-blue-950/20" : 
                      index % 3 === 1 ? "bg-green-50 dark:bg-green-950/20" : 
                      "bg-purple-50 dark:bg-purple-950/20"
                    )}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{form.title}</h3>
                      {form.description && (
                        <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{form.fields.length} fields</span>
                      </div>
                    </div>
                    <Button asChild className="ml-4 bg-primary hover:bg-primary/90">
                      <a href={`/forms/${form.id}`} className="flex items-center">
                        Fill Form
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
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
