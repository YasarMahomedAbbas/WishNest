import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { FamilyProvider } from '@/contexts/FamilyContext'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'WishNest - Family Wishlist App',
  description: 'A self-hosted family wishlist application for coordinating gifts and managing family wishlists',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FamilyProvider>
            {children}
            <Toaster />
          </FamilyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
