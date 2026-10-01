import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api'

// GET /api/v1/products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            comparePrice: true,
            inventory: true,
            attributes: true,
            images: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            images: true,
            isVerified: true,
            helpful: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                
              },
            },
          },
        },
      },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    // Transform for frontend
    const transformedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDesc: product.shortDescription,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      category: product.category,
      rating: product.avgRating,
      reviewCount: product.reviewCount,
      inStock: product.inventory > 0,
      inventory: product.inventory,
      sku: product.sku,
      hasVariants: product.variants.length > 0,
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        price: v.price,
        comparePrice: v.comparePrice,
        inventory: v.inventory,
        attributes: v.attributes,
        images: v.images,
      })),
      ingredients: product.ingredients,
      howToUse: product.howToUse,
      benefits: product.benefits,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestseller: product.isFeatured,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images,
        isVerified: r.isVerified,
        helpful: r.helpful,
        createdAt: r.createdAt.toISOString(),
        user: {
          name: `${r.user.name} ${r.?.charAt(0) || ''}.`,
        },
      })),
    }

    return successResponse(transformedProduct)
  } catch (error) {
    return serverErrorResponse(error)
  }
}
