import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } } },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) return notFoundResponse('Product')

    // Calculate avg rating
    const ratings = product.reviews.map((r) => r.rating)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    return successResponse({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      shortDesc: product.shortDesc,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      images: product.images,
      category: product.category,
      ingredients: product.ingredients,
      howToUse: product.howToUse,
      benefits: product.benefits,
      tags: product.tags,
      rating: avgRating,
      reviewCount: product.reviews.length,
      inventory: product.inventory,
      hasVariants: product.hasVariants,
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price ? Number(v.price) : null,
        inventory: v.inventory,
        attributes: v.attributes,
        image: v.image,
      })),
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestseller: product.isBestseller,
      metaTitle: product.metaTitle,
      metaDesc: product.metaDesc,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images,
        isVerified: r.isVerified,
        helpful: r.helpful,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name || 'Anonymous' },
      })),
    })
  } catch (error) {
    console.error('Get product error:', error)
    return errorResponse('Failed to fetch product', 500)
  }
}
