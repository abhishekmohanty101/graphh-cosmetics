import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/admin/products/import - Import products from CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products, updateExisting = false } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse('Products array is required', 400)
    }

    const results = {
      total: products.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as { row: number; sku: string; error: string }[],
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const row = i + 1

      try {
        // Validate required fields
        if (!product.name || !product.sku) {
          results.failed++
          results.errors.push({ row, sku: product.sku || 'N/A', error: 'Name and SKU are required' })
          continue
        }

        if (!product.price || product.price <= 0) {
          results.failed++
          results.errors.push({ row, sku: product.sku, error: 'Valid price is required' })
          continue
        }

        // Check if product exists
        const existing = await prisma.product.findUnique({
          where: { sku: product.sku },
        })

        if (existing) {
          if (updateExisting) {
            await prisma.product.update({
              where: { sku: product.sku },
              data: {
                name: product.name,
                price: parseFloat(product.price),
                compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
                inventory: parseInt(product.inventory) || 0,
                description: product.description,
                isActive: product.isActive !== false,
              },
            })
            results.updated++
          } else {
            results.failed++
            results.errors.push({ row, sku: product.sku, error: 'SKU already exists' })
          }
        } else {
          // Create slug from name
          const baseSlug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

          // Ensure unique slug
          let slug = baseSlug
          let counter = 1
          while (await prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
          }

          // Find or create category
          let categoryId = null
          if (product.category) {
            const category = await prisma.category.findFirst({
              where: { name: { equals: product.category, mode: 'insensitive' } },
            })
            if (category) {
              categoryId = category.id
            }
          }

          await prisma.product.create({
            data: {
              name: product.name,
              slug,
              sku: product.sku,
              price: parseFloat(product.price),
              compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
              inventory: parseInt(product.inventory) || 0,
              description: product.description || '',
              categoryId,
              isActive: product.isActive !== false,
              isFeatured: product.isFeatured === true,
              tags: product.tags ? product.tags.split(',').map((t: string) => t.trim()) : [],
            },
          })
          results.created++
        }
      } catch (err: any) {
        results.failed++
        results.errors.push({ row, sku: product.sku, error: err.message || 'Unknown error' })
      }
    }

    return successResponse({
      message: 'Import completed',
      results,
    })
  } catch (error) {
    console.error('Import products error:', error)
    return errorResponse('Failed to import products', 500)
  }
}
