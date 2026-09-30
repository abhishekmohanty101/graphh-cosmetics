'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  icon: string
  faqs: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    title: 'Orders & Shipping',
    icon: '📦',
    faqs: [
      {
        question: 'How long does delivery take?',
        answer: 'Delivery typically takes 2-7 business days depending on your location. Metro cities receive orders in 2-3 days, while remote areas may take 7-10 days.',
      },
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free shipping on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 applies.',
      },
      {
        question: 'Can I track my order?',
        answer: 'Absolutely! Once your order is shipped, you\'ll receive an email and SMS with tracking details. You can also track your order in the "My Orders" section of your account.',
      },
      {
        question: 'Do you deliver to my pincode?',
        answer: 'We deliver to most pincodes across India. Enter your pincode on the product page or cart to check serviceability and estimated delivery time.',
      },
      {
        question: 'What if I\'m not available during delivery?',
        answer: 'Our delivery partners will attempt delivery up to 3 times. They will contact you before each attempt. If all attempts fail, the order will be returned to us.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: '🔄',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We offer 7-day returns from the date of delivery for unused, unopened products in their original packaging. Products must have all seals intact.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Log into your account, go to "My Orders", select the order, and click "Request Return". Our team will arrange a pickup within 2-3 business days.',
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned product. The amount will be credited to your original payment method.',
      },
      {
        question: 'Can I exchange a product?',
        answer: 'We currently don\'t offer direct exchanges. Please return the product for a refund and place a new order for the desired item.',
      },
      {
        question: 'What items cannot be returned?',
        answer: 'Opened/used cosmetics, products with broken seals, items bought on sale (50%+ off), gift cards, and free samples cannot be returned for hygiene reasons.',
      },
    ],
  },
  {
    title: 'Payment',
    icon: '💳',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept UPI, credit/debit cards, net banking, popular wallets (Paytm, PhonePe, etc.), and Cash on Delivery (COD).',
      },
      {
        question: 'Is Cash on Delivery available?',
        answer: 'Yes, COD is available for orders up to ₹5,000. A COD handling fee of ₹29 applies. COD may not be available for some remote pincodes.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely! All payments are processed through Razorpay, which is PCI-DSS compliant. We never store your card details on our servers.',
      },
      {
        question: 'My payment failed but money was deducted. What do I do?',
        answer: 'Don\'t worry! If the payment failed, the amount will be automatically refunded to your account within 5-7 business days. Contact support if you don\'t receive it.',
      },
    ],
  },
  {
    title: 'Products',
    icon: '💄',
    faqs: [
      {
        question: 'Are your products cruelty-free?',
        answer: 'Yes! All Graphh Cosmetics products are 100% cruelty-free. We never test on animals and are PETA certified.',
      },
      {
        question: 'Are your products suitable for sensitive skin?',
        answer: 'Most of our products are dermatologically tested and suitable for sensitive skin. Check individual product descriptions for specific information.',
      },
      {
        question: 'How do I find my shade?',
        answer: 'Use our Shade Finder tool on product pages, or refer to our shade guide. You can also contact our beauty advisors for personalized recommendations.',
      },
      {
        question: 'What is the shelf life of your products?',
        answer: 'Our products typically have a shelf life of 24-36 months. Once opened, we recommend using them within 6-12 months. Check the PAO symbol on packaging.',
      },
      {
        question: 'Do you have vegan products?',
        answer: 'Yes! Many of our products are vegan. Look for the vegan badge on product pages or filter by "Vegan" in our product listings.',
      },
    ],
  },
  {
    title: 'Account & Technical',
    icon: '👤',
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign Up" at the top of our website and enter your email, phone number, and create a password. You can also sign up using your Google account.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Login" and then "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password.',
      },
      {
        question: 'How do I update my account information?',
        answer: 'Log into your account, go to "Profile" in the account menu, and update your information. Click "Save Changes" when done.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can request account deletion by contacting our support team at privacy@graphh.com. Note that this action is irreversible.',
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredFAQs = searchQuery
    ? faqData.map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((category) => category.faqs.length > 0)
    : faqData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-pink-100 mb-8">
            Find quick answers to common questions
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find any FAQs matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-pink-600 hover:text-pink-700"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span>{category.icon}</span>
                    {category.title}
                  </h2>
                </div>
                <div className="divide-y">
                  {category.faqs.map((faq, faqIndex) => {
                    const key = `${categoryIndex}-${faqIndex}`
                    const isOpen = openItems[key]

                    return (
                      <div key={faqIndex}>
                        <button
                          onClick={() => toggleItem(categoryIndex, faqIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                        >
                          <span className="font-medium pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 text-gray-600">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-12 bg-pink-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition"
            >
              Contact Support
            </Link>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-pink-600 text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
