// prisma/seed.ts
// Run with: npm run db:seed

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ============================================
  // 1. Create Categories
  // ============================================
  console.log('📁 Creating categories...')

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'lips' },
      update: {},
      create: {
        name: 'Lips',
        slug: 'lips',
        description: 'Lipsticks, lip glosses, lip liners, and lip care products',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'eyes' },
      update: {},
      create: {
        name: 'Eyes',
        slug: 'eyes',
        description: 'Eyeshadows, mascaras, eyeliners, and eye makeup',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'face' },
      update: {},
      create: {
        name: 'Face',
        slug: 'face',
        description: 'Foundations, concealers, blushes, and face makeup',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'skincare' },
      update: {},
      create: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Cleansers, moisturizers, serums, and skincare essentials',
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nails' },
      update: {},
      create: {
        name: 'Nails',
        slug: 'nails',
        description: 'Nail polishes, nail art, and nail care',
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'combos' },
      update: {},
      create: {
        name: 'Combos & Kits',
        slug: 'combos',
        description: 'Value sets, gift boxes, and makeup kits',
        sortOrder: 6,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // ============================================
  // 2. Create Sub-Categories
  // ============================================
  console.log('📁 Creating sub-categories...')

  const lipsCategory = categories.find(c => c.slug === 'lips')!
  const eyesCategory = categories.find(c => c.slug === 'eyes')!
  const faceCategory = categories.find(c => c.slug === 'face')!

  const subCategories = await Promise.all([
    // Lips sub-categories
    prisma.category.upsert({
      where: { slug: 'lipsticks' },
      update: {},
      create: {
        name: 'Lipsticks',
        slug: 'lipsticks',
        parentId: lipsCategory.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lip-glosses' },
      update: {},
      create: {
        name: 'Lip Glosses',
        slug: 'lip-glosses',
        parentId: lipsCategory.id,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lip-liners' },
      update: {},
      create: {
        name: 'Lip Liners',
        slug: 'lip-liners',
        parentId: lipsCategory.id,
        sortOrder: 3,
      },
    }),
    // Eyes sub-categories
    prisma.category.upsert({
      where: { slug: 'eyeshadows' },
      update: {},
      create: {
        name: 'Eyeshadows',
        slug: 'eyeshadows',
        parentId: eyesCategory.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mascaras' },
      update: {},
      create: {
        name: 'Mascaras',
        slug: 'mascaras',
        parentId: eyesCategory.id,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'eyeliners' },
      update: {},
      create: {
        name: 'Eyeliners',
        slug: 'eyeliners',
        parentId: eyesCategory.id,
        sortOrder: 3,
      },
    }),
    // Face sub-categories
    prisma.category.upsert({
      where: { slug: 'foundations' },
      update: {},
      create: {
        name: 'Foundations',
        slug: 'foundations',
        parentId: faceCategory.id,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'blushes' },
      update: {},
      create: {
        name: 'Blushes',
        slug: 'blushes',
        parentId: faceCategory.id,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'highlighters' },
      update: {},
      create: {
        name: 'Highlighters',
        slug: 'highlighters',
        parentId: faceCategory.id,
        sortOrder: 3,
      },
    }),
  ])

  console.log(`✅ Created ${subCategories.length} sub-categories`)

  // ============================================
  // 3. Create Admin User
  // ============================================
  console.log('👤 Creating admin user...')

  const adminPassword = await hash('Admin@123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@graphh.com' },
    update: {},
    create: {
      email: 'admin@graphh.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  })

  console.log(`✅ Created admin user: ${adminUser.email}`)

  // ============================================
  // 4. Create Sample Employee Users
  // ============================================
  console.log('👥 Creating employee users...')

  const employeePassword = await hash('Staff@123', 12)

  const employees = await Promise.all([
    prisma.user.upsert({
      where: { email: 'orders@graphh.com' },
      update: {},
      create: {
        email: 'orders@graphh.com',
        name: 'Order Manager',
        passwordHash: employeePassword,
        role: 'ORDER_MANAGER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'products@graphh.com' },
      update: {},
      create: {
        email: 'products@graphh.com',
        name: 'Product Manager',
        passwordHash: employeePassword,
        role: 'PRODUCT_MANAGER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'support@graphh.com' },
      update: {},
      create: {
        email: 'support@graphh.com',
        name: 'Support Agent',
        passwordHash: employeePassword,
        role: 'SUPPORT_AGENT',
        isVerified: true,
      },
    }),
  ])

  console.log(`✅ Created ${employees.length} employee users`)

  // ============================================
  // 5. Create Sample Products
  // ============================================
  console.log('📦 Creating sample products...')

  const lipstickCategory = subCategories.find(c => c.slug === 'lipsticks')!

  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'matte-lipstick-ruby-red' },
      update: {},
      create: {
        name: 'Matte Lipstick - Ruby Red',
        slug: 'matte-lipstick-ruby-red',
        shortDesc: 'Long-lasting matte finish lipstick with intense color payoff',
        description: `<p>Our bestselling Matte Lipstick delivers rich, full-coverage color that lasts all day.</p>
        <p>Formulated with hydrating ingredients to keep your lips comfortable while providing a stunning matte finish.</p>`,
        price: 599,
        comparePrice: 799,
        costPrice: 200,
        categoryId: lipstickCategory.id,
        images: [
          'https://res.cloudinary.com/graphh/image/upload/v1/products/lipstick-ruby-1.jpg',
          'https://res.cloudinary.com/graphh/image/upload/v1/products/lipstick-ruby-2.jpg',
        ],
        tags: ['matte', 'long-lasting', 'bestseller', 'cruelty-free'],
        sku: 'LIP-MAT-RUBY-001',
        inventory: 150,
        lowStockAlert: 20,
        hasVariants: true,
        ingredients: 'Isododecane, Dimethicone, Trimethylsiloxysilicate, Nylon-611/Dimethicone Copolymer, C20-24 Alkyl Dimethicone, Disteardimonium Hectorite, Lauroyl Lysine, Propylene Carbonate, Alumina, Silica, Tocopheryl Acetate (Vitamin E), Ethylhexyl Palmitate.',
        howToUse: 'Apply directly to lips starting from the center and working outwards. For precise application, use a lip brush. For a bolder look, apply a second coat.',
        benefits: ['12-hour long wear', 'Transfer-proof formula', 'Enriched with Vitamin E', 'Cruelty-free & Vegan'],
        metaTitle: 'Ruby Red Matte Lipstick | Long-Lasting | Graphh Cosmetics',
        metaDesc: 'Shop our bestselling Ruby Red Matte Lipstick. 12-hour wear, transfer-proof, and enriched with Vitamin E. Free shipping on orders over ₹499.',
        isActive: true,
        isFeatured: true,
        isBestseller: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'matte-lipstick-nude-pink' },
      update: {},
      create: {
        name: 'Matte Lipstick - Nude Pink',
        slug: 'matte-lipstick-nude-pink',
        shortDesc: 'Perfect everyday nude shade with creamy matte finish',
        description: '<p>A universally flattering nude pink that suits all skin tones.</p>',
        price: 599,
        comparePrice: 799,
        categoryId: lipstickCategory.id,
        images: [
          'https://res.cloudinary.com/graphh/image/upload/v1/products/lipstick-nude-1.jpg',
        ],
        tags: ['matte', 'nude', 'everyday', 'cruelty-free'],
        sku: 'LIP-MAT-NUDE-001',
        inventory: 200,
        hasVariants: false,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'velvet-lip-gloss-berry' },
      update: {},
      create: {
        name: 'Velvet Lip Gloss - Berry Bliss',
        slug: 'velvet-lip-gloss-berry',
        shortDesc: 'High-shine gloss with plumping effect',
        description: '<p>Get the perfect glossy pout with our Velvet Lip Gloss.</p>',
        price: 449,
        comparePrice: 599,
        categoryId: subCategories.find(c => c.slug === 'lip-glosses')!.id,
        images: [
          'https://res.cloudinary.com/graphh/image/upload/v1/products/gloss-berry-1.jpg',
        ],
        tags: ['gloss', 'plumping', 'shine'],
        sku: 'LIP-GLS-BERRY-001',
        inventory: 100,
        hasVariants: false,
        isActive: true,
        isNewArrival: true,
      },
    }),
  ])

  console.log(`✅ Created ${products.length} products`)

  // ============================================
  // 6. Create Product Variants
  // ============================================
  console.log('🎨 Creating product variants...')

  const rubyLipstick = products.find(p => p.slug === 'matte-lipstick-ruby-red')!

  const variants = await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: 'LIP-MAT-RUBY-001' },
      update: {},
      create: {
        productId: rubyLipstick.id,
        name: 'Ruby Red',
        sku: 'LIP-MAT-RUBY-001',
        price: 599,
        inventory: 50,
        attributes: { color: '#CC0000', colorName: 'Ruby Red' },
        sortOrder: 1,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: 'LIP-MAT-BERRY-001' },
      update: {},
      create: {
        productId: rubyLipstick.id,
        name: 'Berry Pink',
        sku: 'LIP-MAT-BERRY-001',
        price: 599,
        inventory: 50,
        attributes: { color: '#E91E63', colorName: 'Berry Pink' },
        sortOrder: 2,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: 'LIP-MAT-CORAL-001' },
      update: {},
      create: {
        productId: rubyLipstick.id,
        name: 'Coral Crush',
        sku: 'LIP-MAT-CORAL-001',
        price: 599,
        inventory: 50,
        attributes: { color: '#FF6B6B', colorName: 'Coral Crush' },
        sortOrder: 3,
      },
    }),
  ])

  console.log(`✅ Created ${variants.length} variants`)

  // ============================================
  // 7. Create Sample Banners
  // ============================================
  console.log('🖼️ Creating banners...')

  const banners = await Promise.all([
    prisma.banner.upsert({
      where: { id: 'banner-hero-1' },
      update: {},
      create: {
        id: 'banner-hero-1',
        title: 'New Collection',
        subtitle: 'Discover our latest matte lipsticks',
        image: 'https://res.cloudinary.com/graphh/image/upload/v1/banners/hero-1.jpg',
        mobileImage: 'https://res.cloudinary.com/graphh/image/upload/v1/banners/hero-1-mobile.jpg',
        link: '/collection/new-arrivals',
        buttonText: 'Shop Now',
        position: 'hero',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-hero-2' },
      update: {},
      create: {
        id: 'banner-hero-2',
        title: 'Flat 30% Off',
        subtitle: 'On all skincare products',
        image: 'https://res.cloudinary.com/graphh/image/upload/v1/banners/hero-2.jpg',
        link: '/category/skincare',
        buttonText: 'Shop Skincare',
        position: 'hero',
        sortOrder: 2,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${banners.length} banners`)

  // ============================================
  // 8. Create Default Settings
  // ============================================
  console.log('⚙️ Creating default settings...')

  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'general' },
      update: {},
      create: {
        key: 'general',
        value: {
          siteName: 'Graphh Cosmetics',
          tagline: 'Beauty Redefined',
          contactEmail: 'support@graphh.com',
          contactPhone: '+91 98765 43210',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      },
    }),
    prisma.setting.upsert({
      where: { key: 'shipping' },
      update: {},
      create: {
        key: 'shipping',
        value: {
          freeShippingThreshold: 499,
          defaultShippingRate: 49,
          codCharges: 29,
          codAvailable: true,
          estimatedDelivery: {
            metros: '2-3 days',
            tier1: '3-5 days',
            tier2: '5-7 days',
            remote: '7-10 days',
          },
        },
      },
    }),
    prisma.setting.upsert({
      where: { key: 'tax' },
      update: {},
      create: {
        key: 'tax',
        value: {
          gstEnabled: true,
          gstRate: 18,
          gstNumber: 'XXXXXXXXXXXX',
        },
      },
    }),
  ])

  console.log(`✅ Created ${settings.length} settings`)

  // ============================================
  // 9. Create Sample Coupon
  // ============================================
  console.log('🎟️ Creating sample coupons...')

  const coupons = await Promise.all([
    prisma.coupon.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minPurchase: 499,
        maxDiscount: 200,
        usageLimit: 1000,
        perUserLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
      },
    }),
    prisma.coupon.upsert({
      where: { code: 'FLAT100' },
      update: {},
      create: {
        code: 'FLAT100',
        type: 'FIXED',
        value: 100,
        minPurchase: 999,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${coupons.length} coupons`)

  console.log('')
  console.log('✨ Database seed completed successfully!')
  console.log('')
  console.log('📋 Login Credentials:')
  console.log('─────────────────────────────────────')
  console.log('Admin:         admin@graphh.com / Admin@123')
  console.log('Order Manager: orders@graphh.com / Staff@123')
  console.log('Product Mgr:   products@graphh.com / Staff@123')
  console.log('Support Agent: support@graphh.com / Staff@123')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
