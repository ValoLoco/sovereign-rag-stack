import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'flipadonga | Sovereign RAG Stack',
  description: 'Private AI assistant with full data sovereignty',
  icons: {
    icon: '/Flipadonga_favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="flipadonga-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
