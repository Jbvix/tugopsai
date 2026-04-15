import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TugLife Ops - AI Supervisor',
  description: 'Gestão de rebocadores com inteligência xAI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}