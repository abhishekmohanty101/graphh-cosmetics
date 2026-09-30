import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  author: { name: string; avatar: string; bio: string }
  tags: string[]
  readTime: number
  publishedAt: string
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  // In production, fetch from API
  const posts: Record<string, BlogPost> = {
    '10-must-have-lipstick-shades': {
      id: 'post_1',
      title: '10 Must-Have Lipstick Shades for Every Occasion',
      slug: '10-must-have-lipstick-shades',
      excerpt: 'Discover the perfect lipstick shades that will take you from day to night effortlessly.',
      content: `
        <p class="lead">Finding the right lipstick shade can transform your entire look. Whether you're heading to a corporate meeting or a glamorous evening party, the right lip color makes all the difference.</p>
        
        <h2>1. Classic Red</h2>
        <p>No lipstick collection is complete without a classic red. This timeless shade works for every skin tone – you just need to find your undertone match. For warm undertones, look for reds with orange base. For cool undertones, go for blue-based reds.</p>
        
        <h2>2. Nude Pink</h2>
        <p>Perfect for everyday wear, a nude pink gives you that "my lips but better" look. It's professional, subtle, and flattering on everyone. This is the shade you'll reach for most often.</p>
        
        <h2>3. Berry</h2>
        <p>A rich berry shade is perfect for fall and winter, adding depth and sophistication to any look. It's bold enough to make a statement but wearable enough for daily use.</p>
        
        <h2>4. Coral</h2>
        <p>Brighten up your face with a vibrant coral, ideal for spring and summer days. This cheerful shade instantly makes you look more awake and adds warmth to your complexion.</p>
        
        <h2>5. Mauve</h2>
        <p>This versatile shade works beautifully on most Indian skin tones and transitions easily from day to night. It's the perfect balance between pink and brown.</p>
        
        <h2>6. Deep Plum</h2>
        <p>For those evenings when you want to make a dramatic entrance, deep plum is your go-to. It's sophisticated, mysterious, and incredibly elegant.</p>
        
        <h2>7. Terracotta</h2>
        <p>An earthy terracotta shade is surprisingly flattering and on-trend. It works well for both casual and dressy occasions.</p>
        
        <h2>8. Bright Pink</h2>
        <p>Sometimes you just need a pop of color! A bright pink lipstick is fun, youthful, and perfect for celebrations.</p>
        
        <h2>9. Brown Nude</h2>
        <p>The '90s are back, and so is the brown lip. A brown nude is edgy yet sophisticated – perfect for making a subtle statement.</p>
        
        <h2>10. Peach</h2>
        <p>Soft and romantic, peach lipstick is ideal for daytime events, brunches, and when you want a fresh, natural look.</p>
        
        <h2>Final Thoughts</h2>
        <p>Building a versatile lipstick collection doesn't have to be overwhelming. Start with these essential shades and expand from there based on your personal style and preferences. Remember, the best lipstick shade is one that makes you feel confident!</p>
        
        <p><strong>Pro tip:</strong> Always apply a lip balm before your lipstick for a smoother application and longer wear.</p>
      `,
      image: '/images/blog/lipstick-guide.jpg',
      category: 'Makeup Tips',
      author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg', bio: 'Beauty Editor at Graphh with 8 years of experience in the cosmetics industry.' },
      tags: ['lipstick', 'makeup', 'beauty tips', 'color guide'],
      readTime: 5,
      publishedAt: '2024-01-15T10:00:00Z',
    },
    'ultimate-skincare-routine-indian-skin': {
      id: 'post_2',
      title: 'The Ultimate Skincare Routine for Indian Skin',
      slug: 'ultimate-skincare-routine-indian-skin',
      excerpt: 'A comprehensive guide to building a skincare routine perfect for Indian skin types.',
      content: `
        <p class="lead">Indian skin has unique characteristics that require specific care. From dealing with hyperpigmentation to managing oiliness in humid conditions, your skincare routine needs to address these concerns effectively.</p>
        
        <h2>Understanding Indian Skin</h2>
        <p>Indian skin typically falls in the Fitzpatrick skin types III to V, which means we have more melanin than lighter skin tones. While this offers some natural sun protection, it also makes us more prone to hyperpigmentation, dark spots, and uneven skin tone.</p>
        
        <h2>Morning Routine</h2>
        
        <h3>Step 1: Gentle Cleanser</h3>
        <p>Start your day with a gentle, pH-balanced cleanser that removes overnight oil without stripping your skin. Look for ingredients like glycerin or hyaluronic acid for added hydration.</p>
        
        <h3>Step 2: Toner</h3>
        <p>Use an alcohol-free toner to balance your skin's pH and prep it for the following steps. Ingredients like niacinamide or green tea work wonderfully.</p>
        
        <h3>Step 3: Vitamin C Serum</h3>
        <p>This powerhouse ingredient helps with brightening and protecting against environmental damage. It's especially beneficial for addressing dark spots and uneven skin tone.</p>
        
        <h3>Step 4: Moisturizer</h3>
        <p>Even oily skin needs hydration. Choose a lightweight, non-comedogenic moisturizer that won't clog pores. Gel-based moisturizers work great in humid climates.</p>
        
        <h3>Step 5: Sunscreen</h3>
        <p>The most crucial step! Use SPF 30+ daily, regardless of whether you're going out. Indian skin is prone to tanning and pigmentation, making sun protection essential.</p>
        
        <h2>Evening Routine</h2>
        
        <h3>Step 1: Double Cleanse</h3>
        <p>Start with an oil-based cleanser to remove makeup and sunscreen, followed by your regular cleanser.</p>
        
        <h3>Step 2: Exfoliate (2-3 times a week)</h3>
        <p>Use a chemical exfoliant with AHA or BHA to remove dead skin cells and improve skin texture.</p>
        
        <h3>Step 3: Treatment Serum</h3>
        <p>This is where you address specific concerns. Retinol for anti-aging, niacinamide for pores, or alpha arbutin for pigmentation.</p>
        
        <h3>Step 4: Night Cream</h3>
        <p>A richer moisturizer helps your skin repair overnight. Look for ingredients like ceramides and peptides.</p>
        
        <h2>Key Ingredients for Indian Skin</h2>
        <ul>
          <li><strong>Niacinamide:</strong> Controls oil, minimizes pores, brightens</li>
          <li><strong>Vitamin C:</strong> Brightens, protects, evens skin tone</li>
          <li><strong>Alpha Arbutin:</strong> Targets pigmentation safely</li>
          <li><strong>Hyaluronic Acid:</strong> Hydrates without heaviness</li>
          <li><strong>Retinol:</strong> Anti-aging powerhouse</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Consistency is key when it comes to skincare. Give your routine at least 6-8 weeks before expecting significant results. And remember, what works for someone else may not work for you – listen to your skin!</p>
      `,
      image: '/images/blog/skincare-routine.jpg',
      category: 'Skincare',
      author: { name: 'Ananya Iyer', avatar: '/images/authors/ananya.jpg', bio: 'Certified dermatology consultant and skincare enthusiast.' },
      tags: ['skincare', 'routine', 'indian skin', 'beauty tips'],
      readTime: 8,
      publishedAt: '2024-01-10T10:00:00Z',
    },
  }

  return posts[slug] || null
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-pink-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {post.author.name.charAt(0)}
              </div>
              <span>{post.author.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <div
              className="prose prose-lg prose-pink max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-8 border-t">
              <h4 className="font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-pink-100 hover:text-pink-600 rounded-full text-sm transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 pt-8 border-t">
              <h4 className="font-semibold mb-3">Share this article</h4>
              <div className="flex gap-3">
                <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Author */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-4">About the Author</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{post.author.bio}</p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
              <h4 className="font-semibold mb-2">Shop Our Products</h4>
              <p className="text-sm text-pink-100 mb-4">
                Discover the products mentioned in this article
              </p>
              <Link
                href="/products"
                className="block w-full bg-white text-pink-600 py-2 rounded-lg font-medium text-center hover:bg-pink-50 transition"
              >
                Shop Now
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
