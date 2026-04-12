import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const productImages: Record<string, string> = {
  // Nike
  'nike-air-max-270':
    'https://ir.ozone.ru/s3/multimedia-1-5/wc1000/7669897097.jpg',
  'nike-revolution-7':
    'https://ir.ozone.ru/s3/multimedia-1-i/wc2500/8991659898.jpg',
  'nike-pegasus-40':
    'https://ir.ozone.ru/s3/multimedia-1-8/wc2500/7722825416.jpg',
  'nike-sports-hoodie':
    'https://ir.ozone.ru/s3/multimedia-1-x/wc1000/7396822761.jpg',
  'nike-training-t-shirt':
    'https://ir.ozone.ru/s3/multimedia-1-t/wc2500/9462554489.jpg',
  'nike-joggers-club':
    'https://ir.ozone.ru/s3/multimedia-1-2/wc1000/8709660506.jpg',

  // Adidas
  'adidas-ultraboost-light':
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  'adidas-run-falcon-3':
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
  'adidas-superstar-classic':
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',

  // Puma
  'puma-rs-x-core':
    'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=800&q=80',
  'puma-smash-v2':
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',

  // Apple
  'apple-iphone-15':
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
  'apple-macbook-air':
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  'apple-ipad-air':
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
  'apple-airpods-pro':
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=800&q=80',

  // Samsung
  'samsung-galaxy-s24':
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',

  // Nivea
  'nivea-soft-cream':
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'nivea-body-lotion':
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',

  // Garnier
  'garnier-micellar-water':
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
}

async function main() {
  const products = await prisma.product.findMany()

  let updatedCount = 0

  for (const product of products) {
    const nextImage = productImages[product.slug]

    if (!nextImage) continue

    await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrl: nextImage,
      },
    })

    updatedCount++
  }

  console.log('✅ Product images updated')
  console.log({
    updatedCount,
    totalProducts: products.length,
  })
}

main()
  .catch((error) => {
    console.error('Update product images error:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })