import { Logo } from '@/components/logo';
import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata = {
  title: 'Form Builder',
  description: 'Create and manage forms easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-poppins">
        <Providers>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto py-4">
                <div className="flex items-center justify-between">
                  <Logo />
                  <Navbar />
                </div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
