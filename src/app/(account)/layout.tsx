'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Footer } from '@/components/layout'

const accountLinks = [
  { href: '/account', label: 'Profile', icon: User, description: 'Manage your personal information' },
  { href: '/account/orders', label: 'Orders', icon: Package, description: 'Track and manage your orders' },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin, description: 'Manage delivery addresses' },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart, description: 'Your saved items' },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const userName = session?.user?.name || 'Welcome back!'
  const userEmail = session?.user?.email || ''
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 sticky top-24 shadow-sm">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-4 border-b mb-4">
                  {status === 'loading' ? (
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {initials || <User className="w-6 h-6" />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {status === 'loading' ? 'Loading...' : userName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {accountLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                          isActive 
                            ? 'bg-pink-50 text-pink-600' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-pink-500'
                        }`}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="flex-grow">{link.label}</span>
                        <ChevronRight className={`w-4 h-4 transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`} />
                      </Link>
                    )
                  })}
                  
                  <hr className="my-2" />
                  
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-500 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
