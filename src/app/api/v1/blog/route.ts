import { NextRequest } from 'next/server'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// Mock blog posts data - In production, use a CMS like Sanity or store in DB
const blogPosts = [
  {
    id: 'post_1',
    title: '10 Must-Have Lipstick Shades for Every Occasion',
    slug: '10-must-have-lipstick-shades',
    excerpt: 'Discover the perfect lipstick shades that will take you from day to night effortlessly.',
    content: '<p>Full content here...</p>',
    image: '/images/blog/lipstick-guide.jpg',
    category: 'Makeup Tips',
    author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg' },
    tags: ['lipstick', 'makeup', 'beauty tips'],
    readTime: 5,
    publishedAt: '2024-01-15T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'post_2',
    title: 'The Ultimate Skincare Routine for Indian Skin',
    slug: 'ultimate-skincare-routine-indian-skin',
    excerpt: 'A comprehensive guide to building a skincare routine perfect for Indian skin types.',
    content: '<p>Full content here...</p>',
    image: '/images/blog/skincare-routine.jpg',
    category: 'Skincare',
    author: { name: 'Ananya Iyer', avatar: '/images/authors/ananya.jpg' },
    tags: ['skincare', 'routine', 'indian skin'],
    readTime: 8,
    publishedAt: '2024-01-10T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'post_3',
    title: 'How to Choose the Right Foundation Shade',
    slug: 'choose-right-foundation-shade',
    excerpt: 'Stop guessing! Learn the foolproof way to find your perfect foundation match.',
    content: '<p>Full content here...</p>',
    image: '/images/blog/foundation-guide.jpg',
    category: 'Makeup Tips',
    author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg' },
    tags: ['foundation', 'shade matching', 'tutorial'],
    readTime: 6,
    publishedAt: '2024-01-05T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'post_4',
    title: 'Monsoon Makeup Tips: Stay Fresh All Day',
    slug: 'monsoon-makeup-tips',
    excerpt: 'Beat the humidity with these essential monsoon makeup hacks.',
    content: '<p>Full content here...</p>',
    image: '/images/blog/monsoon-makeup.jpg',
    category: 'Seasonal',
    author: { name: 'Kavitha N.', avatar: '/images/authors/kavitha.jpg' },
    tags: ['monsoon', 'waterproof makeup', 'tips'],
    readTime: 4,
    publishedAt: '2024-01-01T10:00:00Z',
    isPublished: true,
  },
]

// GET /api/v1/blog - Get blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    let filteredPosts = blogPosts.filter((p) => p.isPublished)

    if (category) {
      filteredPosts = filteredPosts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (tag) {
      filteredPosts = filteredPosts.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.excerpt.toLowerCase().includes(searchLower)
      )
    }

    const total = filteredPosts.length
    const paginatedPosts = filteredPosts.slice(skip, skip + limit)

    // Get categories and tags for filtering
    const categories = [...new Set(blogPosts.map((p) => p.category))]
    const allTags = [...new Set(blogPosts.flatMap((p) => p.tags))]

    return successResponse({
      posts: paginatedPosts.map(({ content, ...post }) => post),
      categories,
      tags: allTags,
      pagination: createPagination(page, limit, total),
    })
  } catch (error) {
    console.error('Get blog posts error:', error)
    return errorResponse('Failed to fetch blog posts', 500)
  }
}
