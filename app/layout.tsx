import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '日本就業サポートチャット',
  description:
    '佐世保エリアで働く外国人就業者のための、多言語Q&Aチャット（生活・仕事・手続きの質問にやさしく回答）。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
