import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/faq - Get FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // FAQs data - could come from database in production
    const faqData = {
      categories: [
        {
          slug: 'orders',
          title: 'Orders & Shipping',
          icon: '📦',
        },
        {
          slug: 'returns',
          title: 'Returns & Refunds',
          icon: '🔄',
        },
        {
          slug: 'payment',
          title: 'Payment',
          icon: '💳',
        },
        {
          slug: 'products',
          title: 'Products',
          icon: '💄',
        },
        {
          slug: 'account',
          title: 'Account',
          icon: '👤',
        },
      ],
      faqs: [
        {
          id: '1',
          category: 'orders',
          question: 'How long does delivery take?',
          answer: 'Delivery typically takes 2-7 business days depending on your location. Metro cities receive orders in 2-3 days, while remote areas may take 7-10 days.',
        },
        {
          id: '2',
          category: 'orders',
          question: 'Do you offer free shipping?',
          answer: 'Yes! We offer free shipping on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 applies.',
        },
        {
          id: '3',
          category: 'orders',
          question: 'Can I track my order?',
          answer: 'Absolutely! Once your order is shipped, you\'ll receive an email and SMS with tracking details. You can also track your order in the "My Orders" section.',
        },
        {
          id: '4',
          category: 'returns',
          question: 'What is your return policy?',
          answer: 'We offer 7-day returns from the date of delivery for unused, unopened products in their original packaging.',
        },
        {
          id: '5',
          category: 'returns',
          question: 'How do I initiate a return?',
          answer: 'Log into your account, go to "My Orders", select the order, and click "Request Return". Our team will arrange a pickup.',
        },
        {
          id: '6',
          category: 'returns',
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned product.',
        },
        {
          id: '7',
          category: 'payment',
          question: 'What payment methods do you accept?',
          answer: 'We accept UPI, credit/debit cards, net banking, popular wallets, and Cash on Delivery (COD).',
        },
        {
          id: '8',
          category: 'payment',
          question: 'Is Cash on Delivery available?',
          answer: 'Yes, COD is available for orders up to ₹5,000. A COD handling fee of ₹29 applies.',
        },
        {
          id: '9',
          category: 'payment',
          question: 'Is my payment information secure?',
          answer: 'All payments are processed through Razorpay, which is PCI-DSS compliant. We never store your card details.',
        },
        {
          id: '10',
          category: 'products',
          question: 'Are your products cruelty-free?',
          answer: 'Yes! All Graphh Cosmetics products are 100% cruelty-free and PETA certified.',
        },
        {
          id: '11',
          category: 'products',
          question: 'Are your products suitable for sensitive skin?',
          answer: 'Most products are dermatologically tested. Check individual product descriptions for specific information.',
        },
        {
          id: '12',
          category: 'account',
          question: 'How do I reset my password?',
          answer: 'Click "Login" and then "Forgot Password". Enter your email address, and we\'ll send you a reset link.',
        },
      ],
    }

    // Filter by category if specified
    let faqs = faqData.faqs
    if (category) {
      faqs = faqs.filter((faq) => faq.category === category)
    }

    return successResponse({
      categories: faqData.categories,
      faqs,
    })
  } catch (error) {
    console.error('Get FAQ error:', error)
    return errorResponse('Failed to fetch FAQs', 500)
  }
}
