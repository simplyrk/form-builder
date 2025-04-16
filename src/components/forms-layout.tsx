'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import { FileText, ChevronRight } from 'lucide-react';


import { cn } from '@/lib/utils';
import type { Form } from '@/types/form';

interface FormsLayoutProps {
  children: React.ReactNode;
}

export function FormsLayout({ children }: FormsLayoutProps) {
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract form ID from pathname if we're on a form page
  const currentFormId = pathname.startsWith('/forms/') 
    ? pathname.split('/')[2] 
    : null;

  useEffect(() => {
    const fetchAvailableForms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/forms/available');
        if (!response.ok) {
          throw new Error('Failed to fetch available forms');
        }
        const data = await response.json();
        setAvailableForms(data);
      } catch (error) {
        console.error('Error fetching available forms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableForms();
  }, []);

  const handleFormClick = (formId: string) => {
    // If we're already on the form's responses page, navigate to the form page
    if (pathname === `/forms/${formId}/responses`) {
      router.push(`/forms/${formId}`);
    } else {
      // Otherwise, navigate to the form's responses page
      router.push(`/forms/${formId}/responses`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Available Forms</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : availableForms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No forms available</p>
          ) : (
            <ul className="space-y-1">
              {availableForms.map((form) => (
                <li key={form.id}>
                  <button 
                    onClick={() => handleFormClick(form.id)}
                    className={cn(
                      "flex items-center w-full p-2 rounded-md text-sm transition-colors",
                      "hover:bg-muted/50",
                      currentFormId === form.id 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground"
                    )}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="truncate">{form.title}</span>
                    {currentFormId === form.id && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 