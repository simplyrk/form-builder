'use client';

/* eslint-disable import/order */
import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, ChevronRight } from 'lucide-react';

import { TEXT } from '@/lib/text-constants';
import { cn } from '@/lib/utils';

import type { Form } from '@/types/form';
/* eslint-enable import/order */

interface FormsLayoutProps {
  children: React.ReactNode;
}

export function FormsLayout({ children }: FormsLayoutProps) {
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    // Extract form id from url if exists
    const match = pathname.match(/\/forms\/([a-zA-Z0-9-_]+)/);
    if (match) {
      setCurrentFormId(match[1]);
    } else {
      setCurrentFormId(null);
    }
  }, [pathname]);
  
  // Initialize expanded groups
  useEffect(() => {
    if (availableForms.length > 0) {
      const groups: {[key: string]: boolean} = {};
      availableForms.forEach(form => {
        if (form.formGroup && !groups[form.formGroup]) {
          // Set all groups expanded by default
          groups[form.formGroup] = true;
        }
      });
      setExpandedGroups(groups);
    }
  }, [availableForms]);

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
  }, [pathname]);

  const handleFormClick = (formId: string) => {
    router.push(`/forms/${formId}/responses`);
  };
  
  const toggleGroupExpanded = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{TEXT.AVAILABLE_FORMS}</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : availableForms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No forms available</p>
          ) : (
            <div className="space-y-4">
              {/* Group forms by formGroup */}
              {(() => {
                // Create a map of form groups
                const formGroups: { [key: string]: Form[] } = {};
                const ungroupedForms: Form[] = [];
                
                // Organize forms into groups
                availableForms.forEach(form => {
                  if (form.formGroup) {
                    if (!formGroups[form.formGroup]) {
                      formGroups[form.formGroup] = [];
                    }
                    formGroups[form.formGroup].push(form);
                  } else {
                    ungroupedForms.push(form);
                  }
                });
                
                return (
                  <>
                    {/* Render grouped forms */}
                    {Object.entries(formGroups).map(([groupName, forms]) => (
                      <div key={groupName} className="space-y-1">
                        <button 
                          onClick={() => toggleGroupExpanded(groupName)}
                          className="flex items-center justify-between w-full text-sm font-medium px-2 py-1 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
                        >
                          <span>{groupName}</span>
                          <span className="text-muted-foreground">
                            {expandedGroups[groupName] ? 
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg> : 
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                            }
                          </span>
                        </button>
                        {expandedGroups[groupName] && (
                          <ul className="space-y-1 pl-2">
                            {forms.map((form) => (
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
                    ))}
                    
                    {/* Render ungrouped forms */}
                    {ungroupedForms.length > 0 && (
                      <div className="space-y-1">
                        {Object.keys(formGroups).length > 0 && (
                          <h3 className="text-sm font-medium px-2 py-1 bg-muted/30 rounded">
                            Ungrouped
                          </h3>
                        )}
                        <ul className={cn("space-y-1", Object.keys(formGroups).length > 0 ? "pl-2" : "")}>
                          {ungroupedForms.map((form) => (
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
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
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