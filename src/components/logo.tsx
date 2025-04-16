import Link from 'next/link';

import { ClipboardList } from 'lucide-react';
import { TEXT } from '@/lib/text-constants';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="bg-primary rounded-lg p-1.5 transform group-hover:rotate-3 transition-transform">
        <ClipboardList className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">{TEXT.APP_NAME}</span>
    </Link>
  );
} 