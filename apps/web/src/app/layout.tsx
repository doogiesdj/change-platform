import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Change - 청원 플랫폼',
    template: '%s | Change',
  },
  description: '당신의 목소리로 변화를 만드세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
