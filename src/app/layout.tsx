import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'CursorCRM',
  description: 'Professional form management and customer database system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          // Light mode colors
          colorPrimary: "#2563eb",
          colorText: "#111827",
          colorTextSecondary: "#6b7280", 
          colorBackground: "#ffffff",
          colorDanger: "#dc2626",
          colorSuccess: "#059669",
          colorWarning: "#eab308",
          colorInputText: "#111827",
          colorInputBackground: "#f9fafb",
          
          // Border radius
          borderRadius: "0.375rem",
        },
        elements: {
          // Add styles for commonly used elements
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          card: "bg-white shadow-lg border border-gray-200",
          footerActionLink: "text-blue-600 hover:text-blue-700",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className="min-h-screen font-sans antialiased bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}