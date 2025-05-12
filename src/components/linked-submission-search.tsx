'use client';

import React, { useState, useEffect } from 'react';

import { Loader2, Search, X, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/use-debounce';

interface SubmissionField {
  id: string;
  fieldId: string;
  value: string;
}

interface Submission {
  id: string;
  createdAt: string;
  fields: SubmissionField[];
}

interface LinkedSubmissionSearchProps {
  formId: string;
  onSelect: (submission: Submission) => void;
  buttonLabel?: string;
  disabled?: boolean;
}

export function LinkedSubmissionSearch({
  formId,
  onSelect,
  buttonLabel = 'Search Submissions',
  disabled = false,
}: LinkedSubmissionSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Submission[]>([]);
  const [hasResponses, setHasResponses] = useState<boolean | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Check if form has any responses when dialog opens
  useEffect(() => {
    if (open && formId && hasResponses === null) {
      const checkForResponses = async () => {
        setInitialLoading(true);
        try {
          // Use the same endpoint with an empty query, but look at headers
          const response = await fetch(
            `/api/forms/${formId}/responses/search?query=`,
            {
              credentials: 'include', // Include auth cookies
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (!response.ok) {
            // Handle error cases
            let errorMessage = 'Error checking form submissions';
            try {
              const errorData = await response.json();
              if (errorData && errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (e) {
              errorMessage = `Failed: ${response.status} ${response.statusText}`;
            }
            
            setError(errorMessage);
            // Safely log error
            console.error('Search API response error:', errorMessage);
            return;
          }
          
          // Check the custom header we added to the API
          const hasResponsesHeader = response.headers.get('X-Form-Has-Responses');
          setHasResponses(hasResponsesHeader === 'true');
          
          // Process results if any
          const data = await response.json();
          if (data && data.length > 0) {
            setResults(data);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error checking for form responses:', errorMessage);
          setError('Failed to check if form has submissions');
        } finally {
          setInitialLoading(false);
        }
      };
      
      checkForResponses();
    }
  }, [open, formId, hasResponses]);

  // Fetch results when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || !open) {
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if formId is valid
        if (!formId) {
          setError('No form selected for search');
          console.error('Missing formId for linked submission search');
          return;
        }
        
        const response = await fetch(
          `/api/forms/${formId}/responses/search?query=${encodeURIComponent(debouncedQuery)}`,
          {
            credentials: 'include', // Include auth cookies
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          // Try to get detailed error message from response
          let errorMessage = 'Error searching submissions';
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // If parsing fails, use status text
            errorMessage = `Search failed: ${response.status} ${response.statusText}`;
          }
          
          setError(errorMessage);
          console.error('Search API error:', errorMessage);
          return;
        }
        
        // Check the header for has-responses
        const hasResponsesHeader = response.headers.get('X-Form-Has-Responses');
        if (hasResponsesHeader !== null) {
          setHasResponses(hasResponsesHeader === 'true');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching submission results:', errorMessage);
        setError('Failed to fetch results. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, formId, open]);

  // Clear results when dialog closes
  useEffect(() => {
    if (!open) {
      setResults([]);
      setQuery('');
      setError(null);
    }
  }, [open]);

  const handleSelect = (submission: Submission) => {
    onSelect(submission);
    setOpen(false);
  };

  // Format result item for display
  const formatResultDisplay = (result: Submission) => {
    // Create a readable display of submission fields
    const fieldValues = result.fields
      .map((field: SubmissionField) => field.value)
      .filter(Boolean)
      .slice(0, 3); // Show first 3 non-empty values
      
    if (fieldValues.length === 0) {
      return `Submission ${result.id.slice(0, 8)}...`;
    }
    
    return fieldValues.join(' | ');
  };

  const handleCreateSubmission = () => {
    setOpen(false);
    window.open(`/forms/${formId}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !formId}>
          <Search className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Submissions</DialogTitle>
        </DialogHeader>
        
        {initialLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Checking form submissions...</span>
          </div>
        ) : hasResponses === false ? (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800 flex flex-col items-center">
            <Info className="h-12 w-12 text-blue-500 mb-2" />
            <h3 className="text-lg font-medium mb-1">No Submissions Yet</h3>
            <p className="text-sm text-center mb-3">
              This form doesn't have any submissions that can be linked.
            </p>
            <Button 
              variant="outline" 
              onClick={handleCreateSubmission}
              className="bg-white"
            >
              Create a Submission
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by submission content..."
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-2.5"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{error}</p>
                  <p className="text-xs mt-1">
                    Make sure the linked form exists and has submissions
                  </p>
                  {error.includes("No results found") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-white border-red-200 text-red-700 hover:bg-red-50"
                      onClick={handleCreateSubmission}
                    >
                      Create a submission
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4 max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : results.length > 0 ? (
                <ul className="space-y-1">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(result)}
                        className="w-full rounded-md p-2 text-left text-sm hover:bg-secondary"
                      >
                        <p className="font-medium truncate">{formatResultDisplay(result)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : debouncedQuery.length >= 2 && !error ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    No results found. The linked form may have no submissions yet.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateSubmission}
                  >
                    Create a submission
                  </Button>
                </div>
              ) : !error ? (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  Enter at least 2 characters to search
                </p>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}