import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // категории
  const clothes = await prisma.category.create({
    data: { name: 'Одежда', slug: 'clothes' },
  })

  const electronics = await prisma.category.create({
    data: { name: 'Электроника', slug: 'electronics' },
  })

  const cosmetics = await prisma.category.create({
    data: { name: 'Косметика', slug: 'cosmetics' },
  })

  // бренды одежды
  const clothingBrands = [
    'Nike', 'Adidas', 'Puma', 'Zara', 'H&M',
    'Uniqlo', 'Pull&Bear', 'Bershka', 'Reebok', 'New Balance'
  ]

  // бренды электроники
  const electronicsBrands = [
    'Apple', 'Samsung', 'Sony', 'Xiaomi', 'Huawei',
    'LG', 'Dell', 'HP', 'Lenovo', 'Asus'
  ]

  // бренды косметики
  const cosmeticBrands = [
    'L’Oreal', 'Maybelline', 'MAC', 'Dior', 'Chanel',
    'NYX', 'Clinique', 'Estee Lauder', 'Nivea', 'Garnier'
  ]

  const allBrands: { id: string; name: string; slug: string; categoryId: string }[] = []

  // создаем бренды одежды
  for (const name of clothingBrands) {
    const brand = await prisma.brand.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        isVerified: true,
      },
    })

    allBrands.push({ ...brand, categoryId: clothes.id })
  }

  // электроника
  for (const name of electronicsBrands) {
    const brand = await prisma.brand.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        isVerified: true,
      },
    })

    allBrands.push({ ...brand, categoryId: electronics.id })
  }

  // косметика
  for (const name of cosmeticBrands) {
    const brand = await prisma.brand.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        isVerified: true,
      },
    })

    allBrands.push({ ...brand, categoryId: cosmetics.id })
  }

  // создаем товары
  const products = []

  for (const brand of allBrands) {
    for (let i = 1; i <= 6; i++) {
      products.push({
        title: `${brand.name} Product ${i}`,
        slug: `${brand.slug}-product-${i}`,
        description: `Качественный товар ${i} от бренда ${brand.name}`,
        price: Math.floor(Math.random() * 15000) + 1000,
        stock: Math.floor(Math.random() * 30) + 1,
        imageUrl: 'https://placehold.co/400x400',
        brandId: brand.id,
        categoryId: brand.categoryId,
      })
    }
  }

  await prisma.product.createMany({
    data: products,
  })

  console.log('🔥 Big seed done')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())