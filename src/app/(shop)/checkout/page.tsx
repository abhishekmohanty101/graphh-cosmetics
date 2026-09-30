'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, MapPin, CreditCard, Truck, Check, Loader2, ChevronDown, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

// Sample cart data (will come from Zustand store)
const cartItems = [
  {
    id: '1',
    name: 'Matte Lipstick - Ruby Red',
    variant: 'Ruby Red',
    price: 599,
    quantity: 2,
  },
  {
    id: '2',
    name: 'Velvet Lip Gloss - Berry Bliss',
    variant: null,
    price: 449,
    quantity: 1,
  },
]

const savedAddresses = [
  {
    id: '1',
    name: 'Priya Sharma',
    phone: '+91 9876543210',
    line1: '123, Rose Garden Apartments',
    line2: 'MG Road, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    isDefault: true,
  },
]

type Step = 'address' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>('address')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0]?.id || null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 499 ? 0 : 49
  const discount = 0
  const total = subtotal - discount + shipping

  const steps = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirm', icon: Check },
  ]

  const handleAddressSubmit = () => {
    if (!selectedAddress && !showNewAddressForm) {
      setShowNewAddressForm(true)
      return
    }
    setCurrentStep('payment')
  }

  const handlePayment = async () => {
    setIsLoading(true)
    
    if (paymentMethod === 'cod') {
      // Handle COD order
      setTimeout(() => {
        setCurrentStep('confirmation')
        setIsLoading(false)
      }, 1500)
      return
    }

    // Initialize Razorpay payment
    try {
      // Create order on backend
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          addressId: selectedAddress,
          paymentMethod,
        }),
      })

      const order = await response.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Graphh Cosmetics',
        description: 'Order Payment',
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment on backend
          await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          setCurrentStep('confirmation')
        },
        prefill: {
          name: savedAddresses[0]?.name,
          contact: savedAddresses[0]?.phone,
        },
        theme: {
          color: '#EC4899',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-pink-500">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/cart" className="hover:text-pink-500">Cart</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900">Checkout</span>
          </nav>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep === step.id 
                    ? 'text-pink-500' 
                    : steps.findIndex(s => s.id === currentStep) > index
                      ? 'text-green-500'
                      : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === step.id 
                      ? 'bg-pink-500 text-white' 
                      : steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {steps.findIndex(s => s.id === currentStep) > index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    steps.findIndex(s => s.id === currentStep) > index
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Address Step */}
            {currentStep === 'address' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Address</h2>
                
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="space-y-4 mb-6">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress === address.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                            className="mt-1 text-pink-500 focus:ring-pink-500"
                          />
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{address.name}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.line1}, {address.line2}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                    
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <Input
                          placeholder="Full name"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                          placeholder="+91 9876543210"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                      <Input
                        placeholder="House/Flat No., Building Name"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <Input
                        placeholder="Street, Area, Landmark"
                        value={newAddress.line2}
                        onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <Input
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <Input
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                        <Input
                          placeholder="560001"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-gray-500 hover:text-gray-600 text-sm"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                  </div>
                )}

                <Button onClick={handleAddressSubmit} className="w-full mt-6" size="lg">
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  {/* Razorpay */}
                  <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <div className="flex-grow">
                        <span className="font-medium text-gray-900">Pay Online</span>
                        <p className="text-sm text-gray-500">
                          UPI, Credit/Debit Card, Net Banking, Wallets
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-2xl">💳</span>
                        <span className="text-2xl">📱</span>
                      </div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <div className="flex-grow">
                        <span className="font-medium text-gray-900">Cash on Delivery</span>
                        <p className="text-sm text-gray-500">
                          Pay when your order arrives
                        </p>
                      </div>
                      <span className="text-2xl">💵</span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('address')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'cod' ? (
                      'Place Order'
                    ) : (
                      `Pay ${formatPrice(total)}`
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-500 mb-2">
                  Thank you for shopping with Graphh Cosmetics
                </p>
                <p className="text-gray-600 mb-6">
                  Order ID: <span className="font-mono font-medium">GRP-2024-001234</span>
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-gray-900 mb-2">What's next?</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      You'll receive an order confirmation email shortly
                    </li>
                    <li className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      Your order will be shipped within 2-3 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      Track your order in the "My Orders" section
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/account/orders">View Order</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-900">{item.name}</p>
                      {item.variant && (
                        <p className="text-gray-500 text-xs">{item.variant}</p>
                      )}
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
