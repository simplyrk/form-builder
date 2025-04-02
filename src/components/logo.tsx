import { FileText } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <FileText className="h-6 w-6 text-primary" />
      <span className="font-semibold text-lg">Form Builder</span>
    </Link>
  );
} 