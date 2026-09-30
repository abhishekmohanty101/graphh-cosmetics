import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-pink max-w-none">
            <p>
              At Graphh Cosmetics ("we", "us", or "our"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website graphh.com or graphh.in.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide to us, including but not limited to:</p>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Account credentials</li>
              <li>Order history and preferences</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain information:</p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Payment processors (Razorpay), shipping partners (Shiprocket), email service providers</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul>
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure payment processing through Razorpay (PCI-DSS compliant)</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
            <p>To exercise these rights, contact us at privacy@graphh.com</p>

            <h2>6. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience. You can control cookie preferences through your browser settings. Essential cookies are required for the website to function properly.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>

            <h2>9. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <ul>
              <li>Email: privacy@graphh.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123 Beauty Lane, Mumbai, Maharashtra 400001, India</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
