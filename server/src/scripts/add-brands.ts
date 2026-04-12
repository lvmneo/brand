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
  const categories = await prisma.category.findMany()

  const categoryMap = Object.fromEntries(
    categories.map((category) => [category.slug, category])
  )

  const requiredCategories = ['clothes', 'shoes', 'electronics', 'cosmetics', 'accessories']

  for (const slug of requiredCategories) {
    if (!categoryMap[slug]) {
      throw new Error(`Не найдена категория: ${slug}`)
    }
  }

  const brandsToAdd = [
    { name: 'Calvin Klein', categorySlug: 'clothes' },
    { name: 'Tommy Hilfiger', categorySlug: 'clothes' },
    { name: 'Levi’s', categorySlug: 'clothes' },
    { name: 'Guess', categorySlug: 'clothes' },
    { name: 'Diesel', categorySlug: 'clothes' },
    { name: 'Under Armour', categorySlug: 'clothes' },
    { name: 'Columbia', categorySlug: 'clothes' },
    { name: 'The North Face', categorySlug: 'clothes' },
    { name: 'Massimo Dutti', categorySlug: 'clothes' },
    { name: 'Stradivarius', categorySlug: 'clothes' },
    { name: 'Reserved', categorySlug: 'clothes' },
    { name: 'Ostin', categorySlug: 'clothes' },
    { name: 'Sela', categorySlug: 'clothes' },
    { name: 'Gloria Jeans', categorySlug: 'clothes' },
    { name: 'Mango', categorySlug: 'clothes' },

    { name: 'Vans', categorySlug: 'shoes' },
    { name: 'Converse', categorySlug: 'shoes' },
    { name: 'Dr. Martens', categorySlug: 'shoes' },
    { name: 'ASICS', categorySlug: 'shoes' },
    { name: 'Skechers', categorySlug: 'shoes' },
    { name: 'Timberland', categorySlug: 'shoes' },
    { name: 'Crocs', categorySlug: 'shoes' },
    { name: 'Saucony', categorySlug: 'shoes' },
    { name: 'Salomon', categorySlug: 'shoes' },
    { name: 'Mizuno', categorySlug: 'shoes' },

    { name: 'Dell', categorySlug: 'electronics' },
    { name: 'HP', categorySlug: 'electronics' },
    { name: 'Lenovo', categorySlug: 'electronics' },
    { name: 'Asus', categorySlug: 'electronics' },
    { name: 'Acer', categorySlug: 'electronics' },
    { name: 'MSI', categorySlug: 'electronics' },
    { name: 'Logitech', categorySlug: 'electronics' },
    { name: 'JBL', categorySlug: 'electronics' },
    { name: 'Marshall', categorySlug: 'electronics' },
    { name: 'Bose', categorySlug: 'electronics' },
    { name: 'Philips', categorySlug: 'electronics' },
    { name: 'Dyson', categorySlug: 'electronics' },
    { name: 'Canon', categorySlug: 'electronics' },
    { name: 'Nikon', categorySlug: 'electronics' },
    { name: 'GoPro', categorySlug: 'electronics' },

    { name: 'La Roche-Posay', categorySlug: 'cosmetics' },
    { name: 'Vichy', categorySlug: 'cosmetics' },
    { name: 'Bioderma', categorySlug: 'cosmetics' },
    { name: 'Eucerin', categorySlug: 'cosmetics' },
    { name: 'Cerave', categorySlug: 'cosmetics' },
    { name: 'Avene', categorySlug: 'cosmetics' },
    { name: 'Kiehl’s', categorySlug: 'cosmetics' },
    { name: 'Lancôme', categorySlug: 'cosmetics' },
    { name: 'Yves Saint Laurent', categorySlug: 'cosmetics' },
    { name: 'Givenchy', categorySlug: 'cosmetics' },

    { name: 'Samsonite', categorySlug: 'accessories' },
    { name: 'Casio', categorySlug: 'accessories' },
    { name: 'Fossil', categorySlug: 'accessories' },
    { name: 'Michael Kors', categorySlug: 'accessories' },
    { name: 'Ray-Ban', categorySlug: 'accessories' },
  ]

  let createdBrands = 0
  let createdProducts = 0

  for (const entry of brandsToAdd) {
    const brandSlug = slugify(entry.name)

    const existingBrand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    })

    const brand =
      existingBrand ??
      (await prisma.brand.create({
        data: {
          name: entry.name,
          slug: brandSlug,
          description: `Официальный бренд ${entry.name}`,
          isVerified: true,
          logoUrl: `https://placehold.co/200x200?text=${encodeURIComponent(entry.name)}`,
        },
      }))

    if (!existingBrand) {
      createdBrands += 1
    }

    const category = categoryMap[entry.categorySlug]

    const demoProducts = [
      {
        title: `${entry.name} Item 1`,
        slug: `${brandSlug}-item-1`,
        description: `Популярный товар бренда ${entry.name}`,
        price: Math.floor(Math.random() * 12000) + 1500,
        stock: Math.floor(Math.random() * 25) + 1,
        imageUrl: `https://placehold.co/600x600?text=${encodeURIComponent(entry.name + ' 1')}`,
        brandId: brand.id,
        categoryId: category.id,
      },
      {
        title: `${entry.name} Item 2`,
        slug: `${brandSlug}-item-2`,
        description: `Ещё один товар бренда ${entry.name}`,
        price: Math.floor(Math.random() * 12000) + 1500,
        stock: Math.floor(Math.random() * 25) + 1,
        imageUrl: `https://placehold.co/600x600?text=${encodeURIComponent(entry.name + ' 2')}`,
        brandId: brand.id,
        categoryId: category.id,
      },
    ]

    for (const product of demoProducts) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug },
      })

      if (!existingProduct) {
        await prisma.product.create({ data: product })
        createdProducts += 1
      }
    }
  }

  console.log('✅ Additional brands added')
  console.log({
    createdBrands,
    createdProducts,
    totalBrands: await prisma.brand.count(),
    totalProducts: await prisma.product.count(),
  })
}

main()
  .catch((error) => {
    console.error('Add brands error:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })