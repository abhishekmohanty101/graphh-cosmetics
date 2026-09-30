import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/media/folders - Get media folders
export async function GET(request: NextRequest) {
  try {
    const folders = [
      { id: 'folder_products', name: 'products', count: 150, size: 45000000 },
      { id: 'folder_categories', name: 'categories', count: 12, size: 3500000 },
      { id: 'folder_banners', name: 'banners', count: 8, size: 15000000 },
      { id: 'folder_blog', name: 'blog', count: 25, size: 12000000 },
      { id: 'folder_testimonials', name: 'testimonials', count: 15, size: 5000000 },
      { id: 'folder_misc', name: 'misc', count: 10, size: 2500000 },
    ]

    return successResponse({ folders })
  } catch (error) {
    console.error('Get folders error:', error)
    return errorResponse('Failed to fetch folders', 500)
  }
}

// POST /api/v1/admin/media/folders - Create folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return errorResponse('Folder name is required', 400)
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    return successResponse({
      message: 'Folder created successfully',
      folder: {
        id: `folder_${Date.now()}`,
        name: slug,
        count: 0,
        size: 0,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Create folder error:', error)
    return errorResponse('Failed to create folder', 500)
  }
}
