'use client'

import Link from 'next/link'
import { ArrowRight, Truck, RotateCcw, Shield, Sparkles, Star } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="container relative">
            <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px] py-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  New Collection 2024
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Discover Your
                  <span className="block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Perfect Beauty
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  Premium cosmetics crafted with love. From stunning lipsticks to radiant skincare, 
                  find your perfect beauty essentials.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-full px-8 shadow-lg shadow-pink-500/25" asChild>
                    <Link href="/category/all">
                      Shop Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                    <Link href="/category/new-arrivals">
                      New Arrivals
                    </Link>
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-green-600" />
                    </div>
                    Free Shipping
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                    </div>
                    Easy Returns
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    100% Authentic
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full blur-3xl opacity-50" />
                <div className="relative bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
                  <span className="text-[200px]">💄</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
              <p className="text-gray-600">Find the perfect products for your beauty routine</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center hover:shadow-lg hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {category.emoji}
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-pink-500 transition-colors">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bestsellers</h2>
                <p className="text-gray-600">Most loved by our customers</p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/category/bestsellers">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="py-16 bg-gradient-to-r from-pink-500 to-rose-500">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Get 10% Off Your First Order
                </h2>
                <p className="text-pink-100 mb-6 text-lg">
                  Subscribe to our newsletter and receive exclusive offers, beauty tips, 
                  and early access to new products.
                </p>
                <form className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 rounded-lg">
                    Subscribe
                  </Button>
                </form>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                  <span className="text-[120px]">🎁</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
                <p className="text-gray-600">Fresh additions to our collection</p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/category/new-arrivals">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
              <p className="text-gray-600">Join thousands of happy customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-medium">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.name}</p>
                      <p className="text-sm text-gray-500">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const categories = [
  { name: 'Lips', slug: 'lips', emoji: '💄' },
  { name: 'Eyes', slug: 'eyes', emoji: '👁️' },
  { name: 'Face', slug: 'face', emoji: '✨' },
  { name: 'Skincare', slug: 'skincare', emoji: '🧴' },
  { name: 'Nails', slug: 'nails', emoji: '💅' },
  { name: 'Combos', slug: 'combos', emoji: '🎁' },
]

const featuredProducts = [
  { 
    id: '1',
    name: 'Matte Lipstick - Ruby Red', 
    slug: 'matte-lipstick-ruby-red', 
    price: 599, 
    comparePrice: 799, 
    images: [],
    rating: 4.5,
    reviewCount: 234,
    inStock: true,
    isBestseller: true,
  },
  { 
    id: '11',
    name: 'Volume Max Mascara', 
    slug: 'mascara-volume-max', 
    price: 449, 
    comparePrice: 599, 
    images: [],
    rating: 4.5,
    reviewCount: 456,
    inStock: true,
    isBestseller: true,
  },
  { 
    id: '20',
    name: 'Foundation - Natural Beige', 
    slug: 'foundation-natural-beige', 
    price: 999, 
    comparePrice: 1299, 
    images: [],
    rating: 4.5,
    reviewCount: 412,
    inStock: true,
    isBestseller: true,
  },
  { 
    id: '30',
    name: 'Vitamin C Brightening Serum', 
    slug: 'vitamin-c-serum', 
    price: 899, 
    comparePrice: 1199, 
    images: [],
    rating: 4.8,
    reviewCount: 567,
    inStock: true,
    isBestseller: true,
  },
]

const newArrivals = [
  { 
    id: '2',
    name: 'Matte Lipstick - Nude Pink', 
    slug: 'matte-lipstick-nude-pink', 
    price: 599, 
    comparePrice: 799, 
    images: [],
    rating: 4.3,
    reviewCount: 156,
    inStock: true,
    isNew: true,
  },
  { 
    id: '13',
    name: 'Eyeshadow Palette - Smoky Nights', 
    slug: 'eyeshadow-palette-smoky', 
    price: 1499, 
    comparePrice: 1899, 
    images: [],
    rating: 4.6,
    reviewCount: 267,
    inStock: true,
    isNew: true,
  },
  { 
    id: '22',
    name: 'Powder Blush - Coral Pink', 
    slug: 'blush-coral-pink', 
    price: 599, 
    images: [],
    rating: 4.6,
    reviewCount: 198,
    inStock: true,
    isNew: true,
  },
  { 
    id: '34',
    name: 'Niacinamide 10% Serum', 
    slug: 'niacinamide-serum', 
    price: 799, 
    comparePrice: 999, 
    images: [],
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    isNew: true,
  },
]

const features = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    description: 'On orders above ₹499',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    description: '7-day return policy',
  },
  {
    icon: '💯',
    title: '100% Authentic',
    description: 'Genuine products only',
  },
  {
    icon: '🐰',
    title: 'Cruelty-Free',
    description: 'Not tested on animals',
  },
]

const reviews = [
  {
    name: 'Priya S.',
    comment: 'Amazing quality products! The lipstick stays all day without drying out my lips. Absolutely love it!',
  },
  {
    name: 'Ananya M.',
    comment: 'Fast delivery and the packaging was so pretty. The foundation matches my skin tone perfectly.',
  },
  {
    name: 'Riya K.',
    comment: 'Best skincare products I\'ve ever used. My skin feels so smooth and hydrated. Highly recommend!',
  },
]
