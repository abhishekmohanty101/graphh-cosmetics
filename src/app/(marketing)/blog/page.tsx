import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Search, Tag } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  category: string
  author: { name: string; avatar: string }
  tags: string[]
  readTime: number
  publishedAt: string
}

async function getBlogPosts(): Promise<{ posts: BlogPost[]; categories: string[]; tags: string[] }> {
  // In production, fetch from API
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blog`, { cache: 'no-store' })
  
  return {
    posts: [
      {
        id: 'post_1',
        title: '10 Must-Have Lipstick Shades for Every Occasion',
        slug: '10-must-have-lipstick-shades',
        excerpt: 'Discover the perfect lipstick shades that will take you from day to night effortlessly.',
        image: '/images/blog/lipstick-guide.jpg',
        category: 'Makeup Tips',
        author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg' },
        tags: ['lipstick', 'makeup', 'beauty tips'],
        readTime: 5,
        publishedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'post_2',
        title: 'The Ultimate Skincare Routine for Indian Skin',
        slug: 'ultimate-skincare-routine-indian-skin',
        excerpt: 'A comprehensive guide to building a skincare routine perfect for Indian skin types.',
        image: '/images/blog/skincare-routine.jpg',
        category: 'Skincare',
        author: { name: 'Ananya Iyer', avatar: '/images/authors/ananya.jpg' },
        tags: ['skincare', 'routine', 'indian skin'],
        readTime: 8,
        publishedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'post_3',
        title: 'How to Choose the Right Foundation Shade',
        slug: 'choose-right-foundation-shade',
        excerpt: 'Stop guessing! Learn the foolproof way to find your perfect foundation match.',
        image: '/images/blog/foundation-guide.jpg',
        category: 'Makeup Tips',
        author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg' },
        tags: ['foundation', 'shade matching', 'tutorial'],
        readTime: 6,
        publishedAt: '2024-01-05T10:00:00Z',
      },
      {
        id: 'post_4',
        title: 'Monsoon Makeup Tips: Stay Fresh All Day',
        slug: 'monsoon-makeup-tips',
        excerpt: 'Beat the humidity with these essential monsoon makeup hacks.',
        image: '/images/blog/monsoon-makeup.jpg',
        category: 'Seasonal',
        author: { name: 'Kavitha N.', avatar: '/images/authors/kavitha.jpg' },
        tags: ['monsoon', 'waterproof makeup', 'tips'],
        readTime: 4,
        publishedAt: '2024-01-01T10:00:00Z',
      },
    ],
    categories: ['Makeup Tips', 'Skincare', 'Seasonal', 'Trends'],
    tags: ['lipstick', 'makeup', 'skincare', 'foundation', 'monsoon'],
  }
}

export default async function BlogPage() {
  const { posts, categories, tags } = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Beauty Blog</h1>
          <p className="text-lg text-pink-100 max-w-2xl mx-auto">
            Tips, tutorials, and trends to help you look and feel your best
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            {posts[0] && (
              <Link href={`/blog/${posts[0].slug}`} className="block mb-8">
                <article className="bg-white rounded-xl shadow-lg overflow-hidden group">
                  <div className="md:flex">
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600" />
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <span className="text-6xl">📝</span>
                      </div>
                    </div>
                    <div className="md:w-1/2 p-6 md:p-8">
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
                        {posts[0].category}
                      </span>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-pink-600 transition">
                        {posts[0].title}
                      </h2>
                      <p className="text-gray-600 mb-4">{posts[0].excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(posts[0].publishedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {posts[0].readTime} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {posts.slice(1).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-xl shadow overflow-hidden group h-full">
                    <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-medium mb-3">
                        {post.category}
                      </span>
                      <h3 className="font-bold mb-2 group-hover:text-pink-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-4">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/blog?category=${encodeURIComponent(category)}`}
                      className="text-gray-600 hover:text-pink-600 transition flex items-center justify-between"
                    >
                      <span>{category}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {posts.filter((p) => p.category === category).length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-pink-100 hover:text-pink-600 rounded-full text-sm transition"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow p-6 text-white">
              <h3 className="font-semibold mb-2">Subscribe to Newsletter</h3>
              <p className="text-sm text-pink-100 mb-4">
                Get the latest beauty tips delivered to your inbox
              </p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-lg text-gray-900 mb-3"
              />
              <button className="w-full bg-white text-pink-600 py-2 rounded-lg font-medium hover:bg-pink-50 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
