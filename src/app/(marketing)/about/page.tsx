import Image from 'next/image'
import Link from 'next/link'
import { Heart, Leaf, Award, Users, Star, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Story</h1>
            <p className="text-xl md:text-2xl text-pink-100 max-w-2xl mx-auto">
              Crafting beauty that celebrates you
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Beauty Without <span className="text-pink-600">Compromise</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Graphh Cosmetics was born from a simple belief: everyone deserves access to 
                high-quality, cruelty-free cosmetics that actually work. Founded in 2023, 
                we've set out to redefine the Indian beauty industry.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                Our name "Graphh" represents the perfect curve of confidence that comes 
                when you look in the mirror and love what you see. We're here to help 
                you draw your own beautiful story.
              </p>
              <p className="text-gray-600 text-lg">
                From our state-of-the-art lab in Mumbai, we create formulations that 
                are specifically designed for Indian skin tones and the Indian climate. 
                Every product is tested, perfected, and made with love.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="/images/about-mission.jpg"
                alt="Our Mission"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Cruelty-Free</h3>
              <p className="text-gray-600">
                We never test on animals. Our products are 100% cruelty-free and 
                we're proud to be PETA certified.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Made with Love</h3>
              <p className="text-gray-600">
                Every product is crafted with care, using premium ingredients 
                that nourish your skin while making you look fabulous.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Quality First</h3>
              <p className="text-gray-600">
                We source the finest ingredients and follow stringent quality 
                controls to ensure you get the best every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                50K+
              </div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                200+
              </div>
              <p className="text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                4.8
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                500+
              </div>
              <p className="text-gray-600">Cities Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A passionate group of beauty enthusiasts, chemists, and dreamers 
              working together to bring you the best.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', role: 'Founder & CEO', image: '/images/team-1.jpg' },
              { name: 'Ananya Iyer', role: 'Head of R&D', image: '/images/team-2.jpg' },
              { name: 'Rahul Verma', role: 'Creative Director', image: '/images/team-3.jpg' },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4 bg-pink-100">
                  <Users className="w-24 h-24 text-pink-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Graphh?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'Premium Quality', desc: 'Only the finest ingredients' },
              { icon: Heart, title: 'Made in India', desc: 'Designed for Indian skin' },
              { icon: Star, title: 'Derma Tested', desc: 'Safe for sensitive skin' },
              { icon: Award, title: 'Award Winning', desc: 'Recognized for excellence' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl border hover:border-pink-300 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Graphh Family
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Experience the difference of cosmetics made with love and science.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-3 bg-white text-pink-600 rounded-full font-semibold hover:bg-pink-50 transition"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
