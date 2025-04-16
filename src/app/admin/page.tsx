import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';
import type { Form } from '@/types/form';

import AdminPageClient from './admin-page-client';


export default async function AdminPage() {
  const { userId } = await auth();
   
  if (!userId) {
    redirect('/');
  }

  const forms = await prisma.form.findMany({
    where: { createdBy: userId },
    include: { fields: true },
    orderBy: { createdAt: 'desc' },
  }) as Form[];

  return <AdminPageClient forms={forms} />;
} 