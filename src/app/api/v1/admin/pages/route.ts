import { NextRequest } from 'next/server'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// GET /api/v1/admin/pages - Get all CMS pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const isPublished = searchParams.get('isPublished')

    // In production, fetch from database
    const pages = [
      {
        id: 'page_about',
        title: 'About Us',
        slug: 'about-us',
        metaTitle: 'About Us | Graphh Cosmetics',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'page_contact',
        title: 'Contact Us',
        slug: 'contact',
        metaTitle: 'Contact Us | Graphh Cosmetics',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'page_faq',
        title: 'FAQ',
        slug: 'faq',
        metaTitle: 'Frequently Asked Questions | Graphh Cosmetics',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T10:00:00Z',
      },
      {
        id: 'page_privacy',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        metaTitle: 'Privacy Policy | Graphh Cosmetics',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'page_terms',
        title: 'Terms of Service',
        slug: 'terms-of-service',
        metaTitle: 'Terms of Service | Graphh Cosmetics',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
    ]

    let filteredPages = pages
    if (isPublished !== null) {
      filteredPages = pages.filter((p) => p.isPublished === (isPublished === 'true'))
    }

    return successResponse({
      pages: filteredPages.slice(skip, skip + limit),
      pagination: createPagination(page, limit, filteredPages.length),
    })
  } catch (error) {
    console.error('Get pages error:', error)
    return errorResponse('Failed to fetch pages', 500)
  }
}

// POST /api/v1/admin/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, metaTitle, metaDescription, isPublished = false } = body

    if (!title || !slug) {
      return errorResponse('Title and slug are required', 400)
    }

    // Check for duplicate slug
    // In production, check database

    const page = {
      id: `page_${Date.now()}`,
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      content,
      metaTitle: metaTitle || title,
      metaDescription,
      isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return successResponse({ page, message: 'Page created successfully' })
  } catch (error) {
    console.error('Create page error:', error)
    return errorResponse('Failed to create page', 500)
  }
}
