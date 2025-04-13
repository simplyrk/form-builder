declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    DATABASE_URL: string;
  }
}

interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
} 