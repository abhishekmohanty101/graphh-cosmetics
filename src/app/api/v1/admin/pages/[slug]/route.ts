import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// GET /api/v1/admin/pages/[slug] - Get page by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // In production, fetch from database
    // For now, return sample page structure
    const pages: Record<string, any> = {
      'about-us': {
        id: 'page_about',
        title: 'About Us',
        slug: 'about-us',
        content: '<h1>About Graphh Cosmetics</h1><p>Our story...</p>',
        metaTitle: 'About Us | Graphh Cosmetics',
        metaDescription: 'Learn about Graphh Cosmetics and our mission.',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      'contact': {
        id: 'page_contact',
        title: 'Contact Us',
        slug: 'contact',
        content: '<h1>Contact Us</h1><p>Get in touch...</p>',
        metaTitle: 'Contact Us | Graphh Cosmetics',
        metaDescription: 'Contact Graphh Cosmetics for support.',
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      },
    }

    const page = pages[params.slug]

    if (!page) {
      return notFoundResponse('Page')
    }

    return successResponse({ page })
  } catch (error) {
    console.error('Get page error:', error)
    return errorResponse('Failed to fetch page', 500)
  }
}

// PUT /api/v1/admin/pages/[slug] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { title, content, metaTitle, metaDescription, isPublished } = body

    // In production, update in database
    return successResponse({
      page: {
        slug: params.slug,
        title,
        content,
        metaTitle,
        metaDescription,
        isPublished,
        updatedAt: new Date().toISOString(),
      },
      message: 'Page updated successfully',
    })
  } catch (error) {
    console.error('Update page error:', error)
    return errorResponse('Failed to update page', 500)
  }
}

// DELETE /api/v1/admin/pages/[slug] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // In production, delete from database
    return successResponse({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Delete page error:', error)
    return errorResponse('Failed to delete page', 500)
  }
}
