import Link from 'next/link'
import { ArrowLeft, Truck, Clock, MapPin, Package, CreditCard } from 'lucide-react'

export default function ShippingPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          {/* Shipping Highlights */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <Truck className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <h3 className="font-semibold text-pink-800">Free Shipping</h3>
              <p className="text-sm text-pink-700">Orders above ₹499</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">2-7 Days</h3>
              <p className="text-sm text-blue-700">Delivery time</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Pan India</h3>
              <p className="text-sm text-green-700">Delivery coverage</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">COD Available</h3>
              <p className="text-sm text-purple-700">Pay on delivery</p>
            </div>
          </div>

          <div className="prose prose-pink max-w-none">
            <h2>Shipping Charges</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Order Value</th>
                  <th className="text-left">Shipping Charge</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Below ₹499</td>
                  <td>₹49</td>
                </tr>
                <tr>
                  <td>₹499 and above</td>
                  <td><span className="text-green-600 font-semibold">FREE</span></td>
                </tr>
              </tbody>
            </table>

            <p className="text-sm text-gray-600 mt-2">
              * COD orders have an additional charge of ₹29 for cash handling
            </p>

            <h2>Delivery Timelines</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Location</th>
                  <th className="text-left">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Metro Cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad)</td>
                  <td>2-3 business days</td>
                </tr>
                <tr>
                  <td>Tier-1 Cities (Pune, Ahmedabad, Jaipur, Lucknow, etc.)</td>
                  <td>3-5 business days</td>
                </tr>
                <tr>
                  <td>Tier-2 & Tier-3 Cities</td>
                  <td>5-7 business days</td>
                </tr>
                <tr>
                  <td>Remote Areas (Northeast, J&K, etc.)</td>
                  <td>7-10 business days</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
              <h3 className="text-blue-800 font-semibold mb-2">📦 Order Processing</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Orders placed before 2 PM are dispatched the same day (Mon-Sat)</li>
                <li>• Orders placed after 2 PM are dispatched the next business day</li>
                <li>• Sunday and public holidays are non-working days</li>
              </ul>
            </div>

            <h2>Shipping Partners</h2>
            <p>We partner with leading logistics providers to ensure safe and timely delivery:</p>
            <ul>
              <li>Delhivery</li>
              <li>BlueDart</li>
              <li>DTDC</li>
              <li>Ecom Express</li>
              <li>India Post (for remote areas)</li>
            </ul>
            <p>
              Our shipping partner Shiprocket automatically selects the best carrier based on your pincode for optimal delivery speed.
            </p>

            <h2>Order Tracking</h2>
            <p>Once your order is shipped, you will receive:</p>
            <ul>
              <li>Email notification with tracking number and link</li>
              <li>SMS updates on shipment status</li>
              <li>WhatsApp updates (if opted in)</li>
            </ul>
            <p>
              You can also track your order anytime by logging into your account and visiting the "My Orders" section.
            </p>

            <h2>Cash on Delivery (COD)</h2>
            <ul>
              <li>COD is available for orders up to ₹5,000</li>
              <li>COD handling fee: ₹29 per order</li>
              <li>Please keep exact change ready for the delivery person</li>
              <li>COD is not available for some remote pincodes</li>
            </ul>

            <h2>Delivery Attempts</h2>
            <ul>
              <li>Our delivery partners will make up to 3 delivery attempts</li>
              <li>You will be contacted before each delivery attempt</li>
              <li>If all attempts fail, the order will be returned to us</li>
              <li>Refund will be processed after deducting shipping charges (both ways)</li>
            </ul>

            <h2>Undeliverable Shipments</h2>
            <p>Orders may be returned to us if:</p>
            <ul>
              <li>Incorrect or incomplete address provided</li>
              <li>Recipient unavailable after 3 attempts</li>
              <li>Delivery refused by recipient</li>
              <li>Pincode not serviceable</li>
            </ul>

            <h2>Check Serviceability</h2>
            <p>
              Enter your pincode on the product page or cart to check if delivery is available in your area and the estimated delivery time.
            </p>

            <h2>Contact Us</h2>
            <p>For shipping-related queries:</p>
            <ul>
              <li>Email: shipping@graphh.com</li>
              <li>Phone: +91 98765 43210 (Mon-Sat, 10 AM - 6 PM)</li>
              <li>WhatsApp: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
