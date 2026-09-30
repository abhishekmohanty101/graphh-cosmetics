import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-pink max-w-none">
            <p>
              Welcome to Graphh Cosmetics. By accessing or using our website at graphh.com or graphh.in, you agree to be bound by these Terms of Service.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using our website, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our website.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              You must be at least 18 years old to make purchases on our website. By using our services, you represent and warrant that you meet this age requirement.
            </p>

            <h2>3. Account Registration</h2>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2>4. Products and Pricing</h2>
            <ul>
              <li>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise</li>
              <li>We reserve the right to modify prices at any time</li>
              <li>Product images are for illustration purposes; actual products may vary slightly</li>
              <li>We make every effort to display accurate product information</li>
            </ul>

            <h2>5. Orders and Payment</h2>
            <ul>
              <li>All orders are subject to availability and acceptance</li>
              <li>We reserve the right to refuse or cancel any order</li>
              <li>Payment must be made at the time of ordering (or on delivery for COD orders)</li>
              <li>We accept UPI, credit/debit cards, net banking, wallets, and Cash on Delivery</li>
            </ul>

            <h2>6. Shipping and Delivery</h2>
            <p>Please refer to our <Link href="/shipping-policy" className="text-pink-600">Shipping Policy</Link> for detailed information about:</p>
            <ul>
              <li>Delivery timelines</li>
              <li>Shipping charges</li>
              <li>Order tracking</li>
              <li>International shipping (if applicable)</li>
            </ul>

            <h2>7. Returns and Refunds</h2>
            <p>Please refer to our <Link href="/return-policy" className="text-pink-600">Return Policy</Link> for information about:</p>
            <ul>
              <li>Return eligibility</li>
              <li>Return process</li>
              <li>Refund timelines</li>
              <li>Non-returnable items</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Graphh Cosmetics and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our prior written consent.
            </p>

            <h2>9. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper working of the website</li>
              <li>Submit false or misleading information</li>
              <li>Engage in any activity that could damage our reputation</li>
            </ul>

            <h2>10. Reviews and User Content</h2>
            <ul>
              <li>Reviews must be honest and based on genuine experience</li>
              <li>We reserve the right to remove inappropriate content</li>
              <li>By submitting content, you grant us a non-exclusive license to use it</li>
            </ul>

            <h2>11. Disclaimer of Warranties</h2>
            <p>
              Our products are provided "as is" without any warranty. We do not guarantee that:
            </p>
            <ul>
              <li>Products will meet your specific expectations</li>
              <li>The website will be uninterrupted or error-free</li>
              <li>Any errors will be corrected</li>
            </ul>

            <h2>12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Graphh Cosmetics shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products.
            </p>

            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Graphh Cosmetics from any claims, damages, or expenses arising from your use of our website or violation of these terms.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.
            </p>

            <h2>15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of the modified terms.
            </p>

            <h2>16. Contact Us</h2>
            <p>For questions about these Terms of Service:</p>
            <ul>
              <li>Email: legal@graphh.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123 Beauty Lane, Mumbai, Maharashtra 400001, India</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
