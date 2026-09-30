import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response'

// POST /api/v1/admin/products/[id]/images - Upload product images
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    const body = await request.json()
    const { images } = body // Array of { url, alt, isPrimary }

    if (!images || !Array.isArray(images)) {
      return errorResponse('Images array is required', 400)
    }

    // In production, upload to Cloudinary and get URLs
    // For now, accept URLs directly
    const currentImages = (product.images as any[]) || []
    
    const newImages = images.map((img: any, index: number) => ({
      id: `img_${Date.now()}_${index}`,
      url: img.url,
      alt: img.alt || product.name,
      isPrimary: img.isPrimary || false,
    }))

    // If a new image is marked as primary, unmark others
    if (newImages.some((img) => img.isPrimary)) {
      currentImages.forEach((img) => (img.isPrimary = false))
    }

    const updatedImages = [...currentImages, ...newImages]

    await prisma.product.update({
      where: { id: params.id },
      data: { images: updatedImages },
    })

    return successResponse({
      message: `${newImages.length} images added`,
      images: updatedImages,
    })
  } catch (error) {
    console.error('Add product images error:', error)
    return errorResponse('Failed to add images', 500)
  }
}

// DELETE /api/v1/admin/products/[id]/images - Remove product image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return errorResponse('Image ID is required', 400)
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    const currentImages = (product.images as any[]) || []
    const updatedImages = currentImages.filter((img) => img.id !== imageId)

    // In production, also delete from Cloudinary

    await prisma.product.update({
      where: { id: params.id },
      data: { images: updatedImages },
    })

    return successResponse({
      message: 'Image removed',
      images: updatedImages,
    })
  } catch (error) {
    console.error('Remove product image error:', error)
    return errorResponse('Failed to remove image', 500)
  }
}
