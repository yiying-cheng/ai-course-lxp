import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitPreview — Virtual Try-On',
  description:
    'Upload your photo and any garment image to preview how it might look on you before you buy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fbfbfd] font-sans text-[#1d1d1f] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
