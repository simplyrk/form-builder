import Link from 'next/link';
import { TEXT } from '@/lib/text-constants';
import { getLucideIcon } from '@/lib/icon-map';

export function Logo() {
  // Get the app icon from environment variable or use ClipboardList as default
  const appIconName = process.env.NEXT_PUBLIC_APP_ICON || 'ClipboardList';
  const AppIcon = getLucideIcon(appIconName);
  
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="bg-primary rounded-lg p-2 transform group-hover:rotate-3 transition-transform">
        <AppIcon className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">{TEXT.APP_NAME}</span>
    </Link>
  );
} 