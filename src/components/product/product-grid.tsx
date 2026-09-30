import { ProductCard } from './product-card'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  comparePrice?: number | null
  images: string[]
  rating?: number
  reviewCount?: number
  inStock?: boolean
  isNew?: boolean
  isBestseller?: boolean
  variants?: {
    id: string
    name: string
    attributes: { color?: string }
  }[]
}

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
