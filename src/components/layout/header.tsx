'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, User, Menu, X, ChevronDown, MapPin, Headphones, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { MiniCart } from '@/components/cart/mini-cart'
import { SearchBar } from '@/components/search/search-bar'

const categories = [
  { name: 'Lips', slug: 'lips', icon: '💄' },
  { name: 'Eyes', slug: 'eyes', icon: '👁️' },
  { name: 'Face', slug: 'face', icon: '✨' },
  { name: 'Skincare', slug: 'skincare', icon: '🧴' },
  { name: 'Nails', slug: 'nails', icon: '💅' },
  { name: 'Combos', slug: 'combos', icon: '🎁' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { data: session, status } = useSession()
  const { openCart, getItemCount } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = mounted ? getItemCount() : 0
  const wishlistCount = mounted ? wishlistItems.length : 0
  const isLoggedIn = status === 'authenticated' && session?.user
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'
  const userRole = (session?.user as any)?.role

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white">
          <div className="container">
            <div className="flex items-center justify-between h-9 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  24/7 Support
                </span>
                <span className="hidden sm:block">Free Shipping above ₹499</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/track-order" className="hover:underline">Track Order</Link>
                <span className="hidden sm:block">|</span>
                <span className="hidden sm:block">Use code: WELCOME10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="border-b">
          <div className="container">
            <div className="flex items-center gap-4 lg:gap-8 h-16">
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  GRAPHH
                </span>
              </Link>

              {/* Search Bar - Desktop */}
              <div className="hidden lg:block flex-grow">
                <SearchBar />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                {/* Account */}
                {isLoggedIn ? (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-medium">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block text-left">
                        <span className="block text-[10px] text-gray-500">Hello, {userName.split(' ')[0]}</span>
                        <span className="block text-sm font-medium text-gray-900 -mt-0.5">Account</span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                          <div className="p-3 border-b">
                            <p className="font-medium text-gray-900">{userName}</p>
                            <p className="text-sm text-gray-500">{session?.user?.email}</p>
                          </div>
                          <div className="py-2">
                            <Link 
                              href="/account" 
                              onClick={() => setShowUserMenu(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              My Account
                            </Link>
                            <Link 
                              href="/account/orders" 
                              onClick={() => setShowUserMenu(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              My Orders
                            </Link>
                            <Link 
                              href="/account/addresses" 
                              onClick={() => setShowUserMenu(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Addresses
                            </Link>
                            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                              <Link 
                                href="/admin" 
                                onClick={() => setShowUserMenu(false)}
                                className="block px-4 py-2 text-sm text-pink-600 hover:bg-pink-50"
                              >
                                Admin Panel
                              </Link>
                            )}
                            {(userRole === 'EMPLOYEE' || userRole === 'ORDER_MANAGER' || userRole === 'PRODUCT_MANAGER' || userRole === 'SUPPORT_AGENT') && (
                              <Link 
                                href="/staff" 
                                onClick={() => setShowUserMenu(false)}
                                className="block px-4 py-2 text-sm text-cyan-600 hover:bg-cyan-50"
                              >
                                Staff Portal
                              </Link>
                            )}
                          </div>
                          <div className="border-t py-2">
                            <button 
                              onClick={() => {
                                setShowUserMenu(false)
                                signOut({ callbackUrl: '/' })
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="hidden md:block text-left">
                      <span className="block text-[10px] text-gray-500">Hello, Sign in</span>
                      <span className="block text-sm font-medium text-gray-900 -mt-0.5">Account</span>
                    </span>
                  </Link>
                )}

                {/* Wishlist */}
                <Link 
                  href="/account/wishlist" 
                  className="relative p-2 sm:px-3 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="relative">
                    <Heart className="w-5 h-5 text-gray-600" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden md:block text-sm font-medium text-gray-900">Wishlist</span>
                </Link>

                {/* Cart */}
                <button 
                  onClick={openCart}
                  className="relative p-2 sm:px-3 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="relative">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden md:block text-sm font-medium text-gray-900">Cart</span>
                </button>
              </div>
            </div>

            {/* Search Bar - Mobile */}
            <div className="lg:hidden pb-3">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        <nav className="hidden lg:block bg-gray-50 border-b">
          <div className="container">
            <div className="flex items-center gap-1 h-11">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-1.5 px-4 h-full text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-white transition-colors"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/category/new-arrivals"
                className="flex items-center gap-1.5 px-4 h-full text-sm font-medium text-pink-600 hover:bg-white transition-colors"
              >
                🔥 New Arrivals
              </Link>
              <Link
                href="/category/bestsellers"
                className="flex items-center gap-1.5 px-4 h-full text-sm font-medium text-amber-600 hover:bg-white transition-colors"
              >
                ⭐ Bestsellers
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[105px] bg-white z-50 overflow-y-auto">
            <nav className="container py-4">
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </Link>
                ))}
                <div className="border-t my-3" />
                <Link
                  href="/category/new-arrivals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-lg"
                >
                  <span className="text-xl">🔥</span>
                  <span className="font-medium">New Arrivals</span>
                </Link>
                <Link
                  href="/category/bestsellers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-lg"
                >
                  <span className="text-xl">⭐</span>
                  <span className="font-medium">Bestsellers</span>
                </Link>
                <div className="border-t my-3" />
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="font-medium text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-500">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">My Account</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-medium">My Orders</span>
                    </Link>
                    {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-lg"
                      >
                        <span className="font-medium">Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Login / Register</span>
                  </Link>
                )}
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Track Order</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mini Cart Drawer */}
      <MiniCart />
    </>
  )
}
