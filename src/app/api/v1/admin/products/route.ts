import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api/response'
import { getPaginationParams, createPagination } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER'].includes(session.user.role)) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { 
          category: { select: { id: true, name: true } },
          variants: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return successResponse({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        costPrice: p.costPrice ? Number(p.costPrice) : null,
        images: p.images,
        inventory: p.inventory,
        category: p.category,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
        hasVariants: p.hasVariants,
        variants: p.variants,
        createdAt: p.createdAt,
      })),
    }, createPagination(page, limit, total))
  } catch (error) {
    console.error('Error fetching products:', error)
    return errorResponse('Failed to fetch products', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'PRODUCT_MANAGER'].includes(session.user.role)) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const {
      name,
      slug,
      shortDesc,
      description,
      price,
      comparePrice,
      costPrice,
      images,
      categoryId,
      tags,
      sku,
      barcode,
      inventory,
      lowStockAlert,
      hasVariants,
      variants,
      ingredients,
      howToUse,
      benefits,
      metaTitle,
      metaDesc,
      isActive,
      isFeatured,
      isNewArrival,
    } = body

    // Validation
    if (!name || !price || !categoryId) {
      return errorResponse('Name, price, and category are required', 400)
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productSlug },
    })
    if (existingProduct) {
      return errorResponse('A product with this slug already exists', 400)
    }

    // Check if SKU already exists (if provided)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      })
      if (existingSku) {
        return errorResponse('A product with this SKU already exists', 400)
      }
    }

    // Create product with variants in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug: productSlug,
          shortDesc: shortDesc || null,
          description: description || null,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          images: images || [],
          categoryId,
          tags: tags || [],
          sku: sku || null,
          barcode: barcode || null,
          inventory: parseInt(inventory) || 0,
          lowStockAlert: parseInt(lowStockAlert) || 10,
          hasVariants: hasVariants || false,
          ingredients: ingredients || null,
          howToUse: howToUse || null,
          benefits: benefits || [],
          metaTitle: metaTitle || null,
          metaDesc: metaDesc || null,
          isActive: isActive !== false,
          isFeatured: isFeatured || false,
          isNewArrival: isNewArrival || false,
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      })

      // Create variants if any
      if (hasVariants && variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v: any, index: number) => ({
            productId: newProduct.id,
            name: v.name,
            sku: v.sku || `${sku || productSlug}-${index + 1}`,
            price: parseFloat(v.price) || parseFloat(price),
            comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : null,
            inventory: parseInt(v.inventory) || 0,
            attributes: v.attributes || {},
            sortOrder: index,
          })),
        })
      }

      return newProduct
    })

    // Fetch the complete product with variants
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: { select: { id: true, name: true } },
        variants: true,
      },
    })

    return successResponse({ 
      product: completeProduct, 
      message: 'Product created successfully' 
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return errorResponse('Failed to create product', 500)
  }
}
