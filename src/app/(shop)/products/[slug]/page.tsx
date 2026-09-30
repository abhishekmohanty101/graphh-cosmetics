import { Metadata } from 'next'
import { ProductDetail } from '@/components/product/product-detail'

// Sample product data (will come from database later)
const getProduct = (slug: string) => ({
  id: slug,
  slug: slug,
  name: 'Matte Lipstick - Ruby Red',
  shortDesc: 'Long-lasting matte finish lipstick with intense color payoff',
  description: `<p>Our bestselling Matte Lipstick delivers rich, full-coverage color that lasts all day.</p>
  <p>Formulated with hydrating ingredients to keep your lips comfortable while providing a stunning matte finish.</p>
  <p>The creamy formula glides on smoothly and sets to a beautiful matte finish that won't feather or bleed.</p>`,
  price: 599,
  comparePrice: 799,
  images: [
    '/placeholder-product.jpg',
    '/placeholder-product.jpg',
    '/placeholder-product.jpg',
    '/placeholder-product.jpg',
  ],
  category: {
    name: 'Lips',
    slug: 'lips',
  },
  rating: 4.5,
  reviewCount: 234,
  inStock: true,
  inventory: 45,
  sku: 'LIP-MAT-RUBY-001',
  hasVariants: true,
  variants: [
    { id: 'v1', name: 'Ruby Red', sku: 'LIP-MAT-RUBY-001', price: 599, inventory: 45, attributes: { color: '#CC0000', colorName: 'Ruby Red' } },
    { id: 'v2', name: 'Berry Pink', sku: 'LIP-MAT-BERRY-001', price: 599, inventory: 32, attributes: { color: '#E91E63', colorName: 'Berry Pink' } },
    { id: 'v3', name: 'Coral Crush', sku: 'LIP-MAT-CORAL-001', price: 599, inventory: 0, attributes: { color: '#FF6B6B', colorName: 'Coral Crush' } },
    { id: 'v4', name: 'Nude Pink', sku: 'LIP-MAT-NUDE-001', price: 599, inventory: 58, attributes: { color: '#E8B4B8', colorName: 'Nude Pink' } },
  ],
  ingredients: 'Isododecane, Dimethicone, Trimethylsiloxysilicate, Nylon-611/Dimethicone Copolymer, C20-24 Alkyl Dimethicone, Disteardimonium Hectorite, Lauroyl Lysine, Propylene Carbonate, Alumina, Silica, Tocopheryl Acetate (Vitamin E), Ethylhexyl Palmitate.',
  howToUse: 'Apply directly to lips starting from the center and working outwards. For precise application, use a lip brush. For a bolder look, apply a second coat.',
  benefits: ['12-hour long wear', 'Transfer-proof formula', 'Enriched with Vitamin E', 'Cruelty-free & Vegan', 'Dermatologically tested'],
  isFeatured: true,
  isBestseller: true,
  isNew: false,
})

const sampleReviews = [
  {
    id: '1',
    user: { name: 'Priya S.', avatar: null },
    rating: 5,
    title: 'Best lipstick ever!',
    comment: 'Amazing color payoff and stays all day without drying out my lips. The shade Ruby Red is perfect for both day and night looks.',
    images: [],
    isVerified: true,
    helpful: 24,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    user: { name: 'Ananya M.', avatar: null },
    rating: 4,
    title: 'Love the formula',
    comment: 'Great matte finish that doesn\'t feel heavy. Only giving 4 stars because I wish there were more shade options.',
    images: [],
    isVerified: true,
    helpful: 12,
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    user: { name: 'Riya K.', avatar: null },
    rating: 5,
    title: 'My go-to lipstick',
    comment: 'I\'ve repurchased this 3 times now. The staying power is incredible and it doesn\'t transfer onto cups or clothes.',
    images: [],
    isVerified: true,
    helpful: 18,
    createdAt: '2024-01-05',
  },
]

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProduct(params.slug)
  return {
    title: `${product.name} | Graphh Cosmetics`,
    description: product.shortDesc,
  }
}

export default function ProductPage({ params }: PageProps) {
  const product = getProduct(params.slug)

  return <ProductDetail product={product} reviews={sampleReviews} />
}
