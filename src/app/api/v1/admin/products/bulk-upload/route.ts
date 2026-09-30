import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/v1/admin/products/bulk-upload - Bulk upload products
export async function POST(request: NextRequest) {
  try {
    // In production, handle file upload (CSV/XLSX)
    // const formData = await request.formData()
    // const file = formData.get('file') as File
    // const updateExisting = formData.get('updateExisting') === 'true'

    // For now, accept JSON body
    const body = await request.json()
    const { products, updateExisting = false } = body

    if (!products || !Array.isArray(products)) {
      return errorResponse('Products array is required', 400)
    }

    const results = {
      total: products.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as { row: number; sku: string; error: string }[],
    }

    // Process in batches of 50
    const batchSize = 50
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (product: any, index: number) => {
          const row = i + index + 1

          try {
            if (!product.name || !product.sku || !product.price) {
              results.failed++
              results.errors.push({
                row,
                sku: product.sku || 'N/A',
                error: 'Name, SKU, and price are required',
              })
              return
            }

            const existing = await prisma.product.findUnique({
              where: { sku: product.sku },
            })

            if (existing && !updateExisting) {
              results.failed++
              results.errors.push({
                row,
                sku: product.sku,
                error: 'SKU already exists',
              })
              return
            }

            const slug =
              product.slug ||
              product.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            const data = {
              name: product.name,
              slug: existing ? existing.slug : slug,
              description: product.description || '',
              price: parseFloat(product.price),
              compareAtPrice: product.compareAtPrice
                ? parseFloat(product.compareAtPrice)
                : null,
              inventory: parseInt(product.inventory) || 0,
              isActive: product.isActive !== false,
              isFeatured: product.isFeatured === true,
              tags: product.tags || [],
            }

            if (existing) {
              await prisma.product.update({
                where: { sku: product.sku },
                data,
              })
              results.updated++
            } else {
              await prisma.product.create({
                data: {
                  ...data,
                  sku: product.sku,
                },
              })
              results.created++
            }
          } catch (err: any) {
            results.failed++
            results.errors.push({
              row,
              sku: product.sku || 'N/A',
              error: err.message || 'Unknown error',
            })
          }
        })
      )
    }

    return successResponse({
      message: 'Bulk upload completed',
      results,
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return errorResponse('Failed to process bulk upload', 500)
  }
}
