import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  // Полная очистка тестовых данных
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()

  // Категории
  const clothes = await prisma.category.create({
    data: { name: 'Одежда', slug: 'clothes' },
  })

  const shoes = await prisma.category.create({
    data: { name: 'Обувь', slug: 'shoes' },
  })

  const electronics = await prisma.category.create({
    data: { name: 'Электроника', slug: 'electronics' },
  })

  const cosmetics = await prisma.category.create({
    data: { name: 'Косметика', slug: 'cosmetics' },
  })

  const accessories = await prisma.category.create({
    data: { name: 'Аксессуары', slug: 'accessories' },
  })

  const categoriesMap = {
    clothes,
    shoes,
    electronics,
    cosmetics,
    accessories,
  }

  const brandsData = [
    {
      name: 'Nike',
      isVerified: true,
      description: 'Спортивный бренд одежды, обуви и аксессуаров.',
      productGroups: [
        {
          categorySlug: 'shoes',
          products: [
            {
              title: 'Air Max 270',
              imageUrl: 'https://ir.ozone.ru/s3/multimedia-1-5/wc1000/7669897097.jpg',
            },
            {
              title: 'Revolution 7',
              imageUrl: 'https://ir.ozone.ru/s3/multimedia-1-i/wc2500/8991659898.jpg',
            },
            {
              title: 'Pegasus 40',
              imageUrl: 'https://ir.ozone.ru/s3/multimedia-1-8/wc2500/7722825416.jpg',
            },
          ],
        },
        {
          categorySlug: 'clothes',
          products: [
            {
              title: 'Sports Hoodie',
              imageUrl: 'https://ir.ozone.ru/s3/multimedia-1-x/wc1000/7396822761.jpg',
            },
            {
              title: 'Training T-Shirt',
              imageUrl: 'https://ir.ozone.ru/s3/multimedia-1-t/wc2500/9462554489.jpg',
            },
            {
              title: 'Joggers Club',
              imageUrl: 'https://ir.ozone.ru/s3/multimedia-1-2/wc1000/8709660506.jpg',
            },
          ],
        },
      ],
    },
    {
      name: 'Adidas',
      isVerified: true,
      description: 'Официальный бренд спортивной одежды и обуви.',
      productGroups: [
        {
          categorySlug: 'shoes',
          products: [
            {
              title: 'Ultraboost Light',
              imageUrl: 'https://placehold.co/600x600?text=Adidas+Ultraboost',
            },
            {
              title: 'Run Falcon 3',
              imageUrl: 'https://placehold.co/600x600?text=Adidas+Run+Falcon',
            },
            {
              title: 'Superstar Classic',
              imageUrl: 'https://placehold.co/600x600?text=Adidas+Superstar',
            },
          ],
        },
        {
          categorySlug: 'clothes',
          products: [
            {
              title: 'Originals Hoodie',
              imageUrl: 'https://placehold.co/600x600?text=Adidas+Hoodie',
            },
            {
              title: 'Essentials T-Shirt',
              imageUrl: 'https://placehold.co/600x600?text=Adidas+T-Shirt',
            },
            {
              title: 'Track Pants',
              imageUrl: 'https://placehold.co/600x600?text=Adidas+Track+Pants',
            },
          ],
        },
      ],
    },
    {
      name: 'Puma',
      isVerified: true,
      description: 'Бренд спортивного стиля и повседневной одежды.',
      productGroups: [
        {
          categorySlug: 'shoes',
          products: [
            {
              title: 'RS-X Core',
              imageUrl: 'https://placehold.co/600x600?text=Puma+RS-X',
            },
            {
              title: 'Smash v2',
              imageUrl: 'https://placehold.co/600x600?text=Puma+Smash',
            },
            {
              title: 'Velocity Nitro',
              imageUrl: 'https://placehold.co/600x600?text=Puma+Velocity',
            },
          ],
        },
        {
          categorySlug: 'clothes',
          products: [
            {
              title: 'Active Hoodie',
              imageUrl: 'https://placehold.co/600x600?text=Puma+Hoodie',
            },
            {
              title: 'Logo T-Shirt',
              imageUrl: 'https://placehold.co/600x600?text=Puma+T-Shirt',
            },
            {
              title: 'Sport Pants',
              imageUrl: 'https://placehold.co/600x600?text=Puma+Pants',
            },
          ],
        },
      ],
    },
    {
      name: 'Reebok',
      isVerified: true,
      description: 'Классическая спортивная обувь и одежда.',
      productGroups: [
        {
          categorySlug: 'shoes',
          products: [
            {
              title: 'Classic Leather',
              imageUrl: 'https://placehold.co/600x600?text=Reebok+Classic+Leather',
            },
            {
              title: 'Nano X3',
              imageUrl: 'https://placehold.co/600x600?text=Reebok+Nano',
            },
            {
              title: 'Runner 4.0',
              imageUrl: 'https://placehold.co/600x600?text=Reebok+Runner',
            },
          ],
        },
        {
          categorySlug: 'clothes',
          products: [
            {
              title: 'Training Hoodie',
              imageUrl: 'https://placehold.co/600x600?text=Reebok+Hoodie',
            },
            {
              title: 'Graphic Tee',
              imageUrl: 'https://placehold.co/600x600?text=Reebok+Tee',
            },
            {
              title: 'Workout Shorts',
              imageUrl: 'https://placehold.co/600x600?text=Reebok+Shorts',
            },
          ],
        },
      ],
    },
    {
      name: 'New Balance',
      isVerified: true,
      description: 'Одежда и кроссовки для спорта и lifestyle.',
      productGroups: [
        {
          categorySlug: 'shoes',
          products: [
            {
              title: '574 Legacy',
              imageUrl: 'https://placehold.co/600x600?text=New+Balance+574',
            },
            {
              title: '530 Classic',
              imageUrl: 'https://placehold.co/600x600?text=New+Balance+530',
            },
            {
              title: 'Fresh Foam X',
              imageUrl: 'https://placehold.co/600x600?text=New+Balance+Fresh+Foam',
            },
          ],
        },
        {
          categorySlug: 'clothes',
          products: [
            {
              title: 'Athletic Hoodie',
              imageUrl: 'https://placehold.co/600x600?text=NB+Hoodie',
            },
            {
              title: 'Running Tee',
              imageUrl: 'https://placehold.co/600x600?text=NB+Tee',
            },
            {
              title: 'Sport Joggers',
              imageUrl: 'https://placehold.co/600x600?text=NB+Joggers',
            },
          ],
        },
      ],
    },
    {
      name: 'Zara',
      isVerified: true,
      description: 'Fashion-бренд одежды и базового гардероба.',
      productGroups: [
        {
          categorySlug: 'clothes',
          products: [
            { title: 'Basic Shirt', imageUrl: 'https://placehold.co/600x600?text=Zara+Basic+Shirt' },
            { title: 'Oversized Blazer', imageUrl: 'https://placehold.co/600x600?text=Zara+Blazer' },
            { title: 'Wide Leg Pants', imageUrl: 'https://placehold.co/600x600?text=Zara+Pants' },
            { title: 'Knit Sweater', imageUrl: 'https://placehold.co/600x600?text=Zara+Sweater' },
            { title: 'Classic Jacket', imageUrl: 'https://placehold.co/600x600?text=Zara+Jacket' },
            { title: 'Cotton Dress', imageUrl: 'https://placehold.co/600x600?text=Zara+Dress' },
          ],
        },
      ],
    },
    {
      name: 'H&M',
      isVerified: true,
      description: 'Повседневная одежда и базовые коллекции.',
      productGroups: [
        {
          categorySlug: 'clothes',
          products: [
            { title: 'Casual Hoodie', imageUrl: 'https://placehold.co/600x600?text=HM+Hoodie' },
            { title: 'Relaxed T-Shirt', imageUrl: 'https://placehold.co/600x600?text=HM+T-Shirt' },
            { title: 'Straight Jeans', imageUrl: 'https://placehold.co/600x600?text=HM+Jeans' },
            { title: 'Denim Jacket', imageUrl: 'https://placehold.co/600x600?text=HM+Jacket' },
            { title: 'Cotton Shirt', imageUrl: 'https://placehold.co/600x600?text=HM+Shirt' },
            { title: 'Daily Sweatshirt', imageUrl: 'https://placehold.co/600x600?text=HM+Sweatshirt' },
          ],
        },
      ],
    },
    {
      name: 'Uniqlo',
      isVerified: true,
      description: 'Минималистичная одежда на каждый день.',
      productGroups: [
        {
          categorySlug: 'clothes',
          products: [
            { title: 'Heattech T-Shirt', imageUrl: 'https://placehold.co/600x600?text=Uniqlo+Heattech' },
            { title: 'Ultra Light Down', imageUrl: 'https://placehold.co/600x600?text=Uniqlo+Down' },
            { title: 'Cotton Hoodie', imageUrl: 'https://placehold.co/600x600?text=Uniqlo+Hoodie' },
            { title: 'Wide Pants', imageUrl: 'https://placehold.co/600x600?text=Uniqlo+Pants' },
            { title: 'Dry Polo', imageUrl: 'https://placehold.co/600x600?text=Uniqlo+Polo' },
            { title: 'Soft Knit', imageUrl: 'https://placehold.co/600x600?text=Uniqlo+Knit' },
          ],
        },
      ],
    },
    {
      name: 'Apple',
      isVerified: true,
      description: 'Электроника, гаджеты и аксессуары.',
      productGroups: [
        {
          categorySlug: 'electronics',
          products: [
            { title: 'iPhone 15', imageUrl: 'https://placehold.co/600x600?text=Apple+iPhone+15' },
            { title: 'MacBook Air', imageUrl: 'https://placehold.co/600x600?text=Apple+MacBook+Air' },
            { title: 'iPad Air', imageUrl: 'https://placehold.co/600x600?text=Apple+iPad+Air' },
            { title: 'AirPods Pro', imageUrl: 'https://placehold.co/600x600?text=Apple+AirPods+Pro' },
            { title: 'Apple Watch', imageUrl: 'https://placehold.co/600x600?text=Apple+Watch' },
            { title: 'HomePod mini', imageUrl: 'https://placehold.co/600x600?text=Apple+HomePod' },
          ],
        },
        {
          categorySlug: 'accessories',
          products: [
            { title: 'MagSafe Charger', imageUrl: 'https://placehold.co/600x600?text=Apple+MagSafe' },
            { title: 'Silicone Case', imageUrl: 'https://placehold.co/600x600?text=Apple+Case' },
            { title: 'Watch Band', imageUrl: 'https://placehold.co/600x600?text=Apple+Watch+Band' },
          ],
        },
      ],
    },
    {
      name: 'Samsung',
      isVerified: true,
      description: 'Смартфоны, планшеты, часы и техника.',
      productGroups: [
        {
          categorySlug: 'electronics',
          products: [
            { title: 'Galaxy S24', imageUrl: 'https://placehold.co/600x600?text=Samsung+Galaxy+S24' },
            { title: 'Galaxy Buds', imageUrl: 'https://placehold.co/600x600?text=Samsung+Galaxy+Buds' },
            { title: 'Galaxy Tab', imageUrl: 'https://placehold.co/600x600?text=Samsung+Galaxy+Tab' },
            { title: 'Smart Monitor', imageUrl: 'https://placehold.co/600x600?text=Samsung+Monitor' },
            { title: 'Galaxy Watch', imageUrl: 'https://placehold.co/600x600?text=Samsung+Watch' },
            { title: 'Galaxy Book', imageUrl: 'https://placehold.co/600x600?text=Samsung+Book' },
          ],
        },
      ],
    },
    {
      name: 'Sony',
      isVerified: true,
      description: 'Аудио, консоли, телевизоры и техника.',
      productGroups: [
        {
          categorySlug: 'electronics',
          products: [
            { title: 'WH-1000XM5', imageUrl: 'https://placehold.co/600x600?text=Sony+XM5' },
            { title: 'PlayStation 5', imageUrl: 'https://placehold.co/600x600?text=PlayStation+5' },
            { title: 'Bravia TV', imageUrl: 'https://placehold.co/600x600?text=Sony+Bravia' },
            { title: 'Alpha Camera', imageUrl: 'https://placehold.co/600x600?text=Sony+Alpha' },
            { title: 'Portable Speaker', imageUrl: 'https://placehold.co/600x600?text=Sony+Speaker' },
            { title: 'Soundbar', imageUrl: 'https://placehold.co/600x600?text=Sony+Soundbar' },
          ],
        },
      ],
    },
    {
      name: 'Nivea',
      isVerified: true,
      description: 'Уход за кожей и телом на каждый день.',
      productGroups: [
        {
          categorySlug: 'cosmetics',
          products: [
            { title: 'Soft Cream', imageUrl: 'https://placehold.co/600x600?text=Nivea+Soft+Cream' },
            { title: 'Body Lotion', imageUrl: 'https://placehold.co/600x600?text=Nivea+Body+Lotion' },
            { title: 'Face Wash', imageUrl: 'https://placehold.co/600x600?text=Nivea+Face+Wash' },
            { title: 'Lip Balm', imageUrl: 'https://placehold.co/600x600?text=Nivea+Lip+Balm' },
            { title: 'Shower Gel', imageUrl: 'https://placehold.co/600x600?text=Nivea+Shower+Gel' },
            { title: 'Men Cream', imageUrl: 'https://placehold.co/600x600?text=Nivea+Men+Cream' },
          ],
        },
      ],
    },
    {
      name: 'Garnier',
      isVerified: true,
      description: 'Уход за лицом, телом и волосами.',
      productGroups: [
        {
          categorySlug: 'cosmetics',
          products: [
            { title: 'Micellar Water', imageUrl: 'https://placehold.co/600x600?text=Garnier+Micellar+Water' },
            { title: 'Face Cream', imageUrl: 'https://placehold.co/600x600?text=Garnier+Face+Cream' },
            { title: 'Shampoo', imageUrl: 'https://placehold.co/600x600?text=Garnier+Shampoo' },
            { title: 'Hair Mask', imageUrl: 'https://placehold.co/600x600?text=Garnier+Hair+Mask' },
            { title: 'Body Lotion', imageUrl: 'https://placehold.co/600x600?text=Garnier+Body+Lotion' },
            { title: 'Vitamin C Serum', imageUrl: 'https://placehold.co/600x600?text=Garnier+Vitamin+C+Serum' },
          ],
        },
      ],
    },
  ]

  for (const brandData of brandsData) {
    const brandSlug = slugify(brandData.name)

    const brand = await prisma.brand.create({
      data: {
        name: brandData.name,
        slug: brandSlug,
        description: brandData.description,
        isVerified: brandData.isVerified,
      },
    })

    for (const group of brandData.productGroups) {
      const category =
        categoriesMap[group.categorySlug as keyof typeof categoriesMap]

      for (const product of group.products) {
        await prisma.product.create({
          data: {
            title: `${brand.name} ${product.title}`,
            slug: `${brand.slug}-${slugify(product.title)}`,
            description: `Качественный товар от бренда ${brand.name}: ${product.title}`,
            price: Math.floor(Math.random() * 15000) + 1000,
            stock: Math.floor(Math.random() * 30) + 1,
            imageUrl: product.imageUrl,
            brandId: brand.id,
            categoryId: category.id,
          },
        })
      }
    }
  }

  const categoriesCount = await prisma.category.count()
  const brandsCount = await prisma.brand.count()
  const productsCount = await prisma.product.count()

  console.log('✅ Seed completed')
  console.log({
    categoriesCount,
    brandsCount,
    productsCount,
  })
}

main()
  .catch((error) => {
    console.error('Seed error:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })