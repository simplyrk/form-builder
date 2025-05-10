import { redirect } from 'next/navigation';

// Redirect from /signin/[anything] to /sign-in for backward compatibility
export default function SigninCatchAllRedirectPage() {
  redirect('/sign-in');
} 