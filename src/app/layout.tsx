import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Graphh Cosmetics | Beauty Redefined',
    template: '%s | Graphh Cosmetics',
  },
  description:
    'Discover premium cosmetics and skincare products. Shop lipsticks, eyeshadows, foundations, and more. Free shipping on orders over ₹499.',
  keywords: [
    'cosmetics',
    'makeup',
    'lipstick',
    'skincare',
    'beauty',
    'india',
    'graphh',
  ],
  authors: [{ name: 'Graphh Cosmetics' }],
  creator: 'Graphh Cosmetics',
  publisher: 'Graphh Cosmetics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Graphh Cosmetics',
    title: 'Graphh Cosmetics | Beauty Redefined',
    description:
      'Discover premium cosmetics and skincare products. Shop lipsticks, eyeshadows, foundations, and more.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Graphh Cosmetics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Graphh Cosmetics | Beauty Redefined',
    description:
      'Discover premium cosmetics and skincare products.',
    images: ['/og-image.jpg'],
    creator: '@graphhcosmetics',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
