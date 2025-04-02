import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminPageClient from './admin-page-client';
import type { Form } from '@/types/form';

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