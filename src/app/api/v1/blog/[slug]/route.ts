import { NextRequest } from 'next/server'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// Mock blog posts data
const blogPosts: Record<string, any> = {
  '10-must-have-lipstick-shades': {
    id: 'post_1',
    title: '10 Must-Have Lipstick Shades for Every Occasion',
    slug: '10-must-have-lipstick-shades',
    excerpt: 'Discover the perfect lipstick shades that will take you from day to night effortlessly.',
    content: `
      <h2>Introduction</h2>
      <p>Finding the right lipstick shade can transform your entire look. Whether you're heading to a corporate meeting or a glamorous evening party, the right lip color makes all the difference.</p>
      
      <h2>1. Classic Red</h2>
      <p>No lipstick collection is complete without a classic red. This timeless shade works for every skin tone – you just need to find your undertone match.</p>
      
      <h2>2. Nude Pink</h2>
      <p>Perfect for everyday wear, a nude pink gives you that "my lips but better" look.</p>
      
      <h2>3. Berry</h2>
      <p>A rich berry shade is perfect for fall and winter, adding depth and sophistication to any look.</p>
      
      <h2>4. Coral</h2>
      <p>Brighten up your face with a vibrant coral, ideal for spring and summer days.</p>
      
      <h2>5. Mauve</h2>
      <p>This versatile shade works beautifully on most Indian skin tones and transitions easily from day to night.</p>
      
      <h2>Conclusion</h2>
      <p>Building a versatile lipstick collection doesn't have to be overwhelming. Start with these essential shades and expand from there based on your personal style.</p>
    `,
    image: '/images/blog/lipstick-guide.jpg',
    category: 'Makeup Tips',
    author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg', bio: 'Beauty Editor' },
    tags: ['lipstick', 'makeup', 'beauty tips'],
    readTime: 5,
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isPublished: true,
    seo: {
      metaTitle: '10 Must-Have Lipstick Shades | Graphh Beauty Blog',
      metaDescription: 'Discover the 10 essential lipstick shades every woman needs in her makeup collection.',
    },
  },
  'ultimate-skincare-routine-indian-skin': {
    id: 'post_2',
    title: 'The Ultimate Skincare Routine for Indian Skin',
    slug: 'ultimate-skincare-routine-indian-skin',
    excerpt: 'A comprehensive guide to building a skincare routine perfect for Indian skin types.',
    content: `
      <h2>Understanding Indian Skin</h2>
      <p>Indian skin has unique characteristics that require specific care. From dealing with hyperpigmentation to managing oiliness in humid conditions, your skincare routine needs to address these concerns.</p>
      
      <h2>Morning Routine</h2>
      <h3>Step 1: Gentle Cleanser</h3>
      <p>Start your day with a gentle, pH-balanced cleanser that removes overnight oil without stripping your skin.</p>
      
      <h3>Step 2: Toner</h3>
      <p>Use an alcohol-free toner to balance your skin's pH and prep it for the following steps.</p>
      
      <h3>Step 3: Vitamin C Serum</h3>
      <p>This powerhouse ingredient helps with brightening and protecting against environmental damage.</p>
      
      <h3>Step 4: Moisturizer</h3>
      <p>Even oily skin needs hydration. Choose a lightweight, non-comedogenic moisturizer.</p>
      
      <h3>Step 5: Sunscreen</h3>
      <p>The most crucial step! Use SPF 30+ daily, regardless of whether you're going out.</p>
      
      <h2>Evening Routine</h2>
      <p>Your evening routine focuses on repair and treatment...</p>
    `,
    image: '/images/blog/skincare-routine.jpg',
    category: 'Skincare',
    author: { name: 'Ananya Iyer', avatar: '/images/authors/ananya.jpg', bio: 'Skincare Specialist' },
    tags: ['skincare', 'routine', 'indian skin'],
    readTime: 8,
    publishedAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    isPublished: true,
    seo: {
      metaTitle: 'Ultimate Skincare Routine for Indian Skin | Graphh Beauty Blog',
      metaDescription: 'Learn how to build the perfect skincare routine designed specifically for Indian skin types.',
    },
  },
}

// GET /api/v1/blog/[slug] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = blogPosts[params.slug]

    if (!post || !post.isPublished) {
      return notFoundResponse('Blog post')
    }

    // Get related posts (same category, different post)
    const relatedPosts = Object.values(blogPosts)
      .filter((p: any) => p.category === post.category && p.slug !== post.slug && p.isPublished)
      .slice(0, 3)
      .map(({ content, ...p }: any) => p)

    return successResponse({
      post,
      relatedPosts,
    })
  } catch (error) {
    console.error('Get blog post error:', error)
    return errorResponse('Failed to fetch blog post', 500)
  }
}
