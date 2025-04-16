'use client';

import { ReactNode } from 'react';

import { FormsLayout } from '@/components/forms-layout';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <FormsLayout>
      {children}
    </FormsLayout>
  );
} 