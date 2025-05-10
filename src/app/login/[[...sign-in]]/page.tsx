import { redirect } from 'next/navigation';

// Redirect from /login/[anything] to /sign-in for backward compatibility
export default function LoginCatchAllRedirectPage() {
  redirect('/sign-in');
} 