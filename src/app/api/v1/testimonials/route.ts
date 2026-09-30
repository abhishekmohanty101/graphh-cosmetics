import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/testimonials - Get customer testimonials
export async function GET(request: NextRequest) {
  try {
    // For now, return static testimonials
    // In production, these could come from a database or CMS
    const testimonials = [
      {
        id: '1',
        name: 'Priya S.',
        location: 'Mumbai',
        avatar: '/images/testimonials/priya.jpg',
        rating: 5,
        comment: 'Absolutely love the matte lipsticks! The color payoff is amazing and they stay on all day without drying my lips.',
        product: 'Matte Lipstick - Ruby Red',
        productSlug: 'matte-lipstick-ruby-red',
        date: '2024-01-15',
        verified: true,
      },
      {
        id: '2',
        name: 'Ananya M.',
        location: 'Bangalore',
        avatar: '/images/testimonials/ananya.jpg',
        rating: 5,
        comment: 'Finally found a foundation that matches my skin tone perfectly! The formula is lightweight and gives a natural glow.',
        product: 'Flawless Foundation - Warm Beige',
        productSlug: 'flawless-foundation-warm-beige',
        date: '2024-01-10',
        verified: true,
      },
      {
        id: '3',
        name: 'Sneha R.',
        location: 'Delhi',
        avatar: '/images/testimonials/sneha.jpg',
        rating: 5,
        comment: 'The kajal is so smooth and pigmented! Doesn\'t smudge even in humid weather. My new holy grail!',
        product: 'Waterproof Kajal - Intense Black',
        productSlug: 'waterproof-kajal-intense-black',
        date: '2024-01-08',
        verified: true,
      },
      {
        id: '4',
        name: 'Meera K.',
        location: 'Chennai',
        avatar: '/images/testimonials/meera.jpg',
        rating: 4,
        comment: 'Great quality products at affordable prices. The packaging is also beautiful. Will definitely order again!',
        product: 'Eyeshadow Palette - Sunset',
        productSlug: 'eyeshadow-palette-sunset',
        date: '2024-01-05',
        verified: true,
      },
      {
        id: '5',
        name: 'Riya P.',
        location: 'Pune',
        avatar: '/images/testimonials/riya.jpg',
        rating: 5,
        comment: 'The skincare range is incredible! My skin has never looked better. The vitamin C serum is a game changer.',
        product: 'Vitamin C Serum',
        productSlug: 'vitamin-c-serum',
        date: '2024-01-02',
        verified: true,
      },
      {
        id: '6',
        name: 'Kavitha N.',
        location: 'Hyderabad',
        avatar: '/images/testimonials/kavitha.jpg',
        rating: 5,
        comment: 'Fast delivery and excellent customer service. The blush is so pigmented - a little goes a long way!',
        product: 'Powder Blush - Rose Pink',
        productSlug: 'powder-blush-rose-pink',
        date: '2023-12-28',
        verified: true,
      },
    ]

    return successResponse({ testimonials })
  } catch (error) {
    console.error('Get testimonials error:', error)
    return errorResponse('Failed to fetch testimonials', 500)
  }
}
