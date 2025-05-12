import { useEffect } from 'react';

import { useRouter } from 'next/router';

// This is a simple redirect component that will redirect to the app router's not-found page
export default function Custom404() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/not-found');
  }, [router]);
  
  return null;
}
