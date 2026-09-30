import Link from 'next/link'
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function ReturnPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Return & Refund Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          {/* Quick Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">7-Day Returns</h3>
              <p className="text-sm text-green-700">From delivery date</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <RotateCcw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">Free Returns</h3>
              <p className="text-sm text-blue-700">For eligible items</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">5-7 Day Refund</h3>
              <p className="text-sm text-purple-700">After pickup</p>
            </div>
          </div>

          <div className="prose prose-pink max-w-none">
            <h2>Return Eligibility</h2>
            <p>You can return products purchased from Graphh Cosmetics within <strong>7 days</strong> of delivery if:</p>
            <ul>
              <li>Product is unused, unopened, and in original packaging</li>
              <li>Product seals are intact</li>
              <li>All tags and labels are attached</li>
              <li>You have the original invoice/bill</li>
            </ul>

            <h2>Non-Returnable Items</h2>
            <p>The following items cannot be returned:</p>
            <div className="bg-red-50 rounded-lg p-4 my-4">
              <ul className="list-none p-0 m-0 space-y-2">
                <li className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Opened or used cosmetics (for hygiene reasons)</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Items purchased on sale or with promotional discounts above 50%</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Gift cards and e-vouchers</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Products with broken/removed seals</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Free samples and promotional items</span>
                </li>
              </ul>
            </div>

            <h2>How to Initiate a Return</h2>
            <ol>
              <li>
                <strong>Log into your account</strong> and go to "My Orders"
              </li>
              <li>
                <strong>Select the order</strong> containing the item(s) you want to return
              </li>
              <li>
                <strong>Click "Request Return"</strong> and select the reason for return
              </li>
              <li>
                <strong>Schedule a pickup</strong> - Our logistics partner will collect the item
              </li>
              <li>
                <strong>Pack the item</strong> securely in original packaging with all accessories
              </li>
            </ol>

            <h2>Refund Process</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Payment Method</th>
                  <th className="text-left">Refund Timeline</th>
                  <th className="text-left">Refund Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>UPI / Wallets</td>
                  <td>3-5 business days</td>
                  <td>Same source</td>
                </tr>
                <tr>
                  <td>Credit/Debit Card</td>
                  <td>5-7 business days</td>
                  <td>Same card</td>
                </tr>
                <tr>
                  <td>Net Banking</td>
                  <td>5-7 business days</td>
                  <td>Bank account</td>
                </tr>
                <tr>
                  <td>Cash on Delivery</td>
                  <td>7-10 business days</td>
                  <td>Bank transfer (NEFT)</td>
                </tr>
              </tbody>
            </table>

            <h2>Exchange Policy</h2>
            <p>
              Currently, we do not offer direct exchanges. If you'd like a different product or variant, please return the original item for a refund and place a new order.
            </p>

            <h2>Damaged or Defective Products</h2>
            <p>If you receive a damaged or defective product:</p>
            <ul>
              <li>Report within <strong>48 hours</strong> of delivery</li>
              <li>Share photos/videos of the damage via email or WhatsApp</li>
              <li>We will arrange a free pickup and full refund</li>
              <li>For manufacturing defects, we may send a replacement</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
              <h3 className="text-yellow-800 font-semibold mb-2">Important Notes</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Refund will be processed only after quality check of returned item</li>
                <li>• Shipping charges are non-refundable unless the return is due to our error</li>
                <li>• COD charges (if any) will be deducted from the refund amount</li>
                <li>• Bank holidays may delay the refund processing time</li>
              </ul>
            </div>

            <h2>Cancellation Policy</h2>
            <p>You can cancel your order:</p>
            <ul>
              <li><strong>Before shipment:</strong> Full refund within 24-48 hours</li>
              <li><strong>After shipment:</strong> Please refuse delivery or initiate return after receiving</li>
            </ul>

            <h2>Contact Us</h2>
            <p>For return-related queries:</p>
            <ul>
              <li>Email: returns@graphh.com</li>
              <li>Phone: +91 98765 43210 (Mon-Sat, 10 AM - 6 PM)</li>
              <li>WhatsApp: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
