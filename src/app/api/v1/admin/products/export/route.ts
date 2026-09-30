import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/products/export - Export products as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (isActive !== null) where.isActive = isActive === 'true'

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'ID',
        'Name',
        'Slug',
        'SKU',
        'Category',
        'Price',
        'Compare Price',
        'Inventory',
        'Active',
        'Featured',
        'Tags',
        'Created At',
      ]

      const rows = products.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.slug,
        p.sku,
        p.category?.name || '',
        p.price,
        p.compareAtPrice || '',
        p.inventory,
        p.isActive ? 'Yes' : 'No',
        p.isFeatured ? 'Yes' : 'No',
        `"${(p.tags || []).join(', ')}"`,
        p.createdAt.toISOString(),
      ])

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products-export-${Date.now()}.csv"`,
        },
      })
    }

    // JSON format
    return successResponse({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        category: p.category?.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        inventory: p.inventory,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        tags: p.tags,
        variants: p.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          inventory: v.inventory,
        })),
        createdAt: p.createdAt,
      })),
      total: products.length,
      exportedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Export products error:', error)
    return errorResponse('Failed to export products', 500)
  }
}
