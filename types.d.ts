declare namespace NodeJS {
  interface ProcessEnv {
    // Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    
    // Database
    DATABASE_URL: string;
    
    // File Upload
    STORAGE_DIR: string;
    TEMP_DIR: string;
    MAX_FILE_SIZE: string;
    ALLOWED_FILE_TYPES: string;
    ENABLE_FILE_SCANNING: string;
    
    // UI Customization
    NEXT_PUBLIC_APP_NAME?: string;
    NEXT_PUBLIC_APP_ICON?: string;
    NEXT_PUBLIC_WELCOME_ICON?: string;
    
    // Debug
    DEBUG?: string;
  }
}

interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
} 