import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  await prisma.review.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.color.deleteMany();
  await prisma.size.deleteMany();
  await prisma.banner.deleteMany();

  console.log('Creating categories...');
  const categories = [
    { name: 'Sandales', slug: 'sandales', description: 'Sandales élégantes et confortables pour femme' },
    { name: 'Mules', slug: 'mules', description: 'Mules chics et faciles à porter' },
    { name: 'Sabots', slug: 'sabots', description: 'Sabots traditionnels revisités' },
    { name: 'Mocassins', slug: 'mocassins', description: 'Mocassins en cuir souple pour un confort au quotidien' },
    { name: 'Slippers', slug: 'slippers', description: 'Slippers raffinés pour parfaire vos tenues' },
  ];

  const categoryMap: any = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  console.log('Creating colors...');
  const colors = [
    { name: 'Noir', hex: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Tabac', hex: '#8B5A2B' },
    { name: 'Grenat', hex: '#800020' },
    { name: 'Or', hex: '#D4AF37' },
    { name: 'Argent', hex: '#C0C0C0' },
    { name: 'Rose Gold', hex: '#B76E79' },
  ];

  const colorMap: any = {};
  for (const col of colors) {
    const created = await prisma.color.create({ data: col });
    colorMap[col.name] = created.id;
  }

  console.log('Creating sizes...');
  const sizes = ['36', '37', '38', '39', '40', '41'];
  const sizeMap: any = {};
  for (const sz of sizes) {
    const created = await prisma.size.create({ data: { value: sz } });
    sizeMap[sz] = created.id;
  }

  console.log('Creating banners...');
  await prisma.banner.create({
    data: {
      title: "SOLEY<br />L'Élégance à vos Pieds",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2500&auto=format&fit=crop",
      link: "/collections/nouveau",
      active: true,
      position: 0
    }
  });

  console.log('Creating products...');
  const products = [
    {
      reference: 'SOLEY-LUNA-OR',
      name: 'Sandales Luna Gold',
      slug: 'sandales-luna-gold',
      description: 'Découvrez la grâce de notre modèle Luna Gold. Des lanières délicates dorées qui épousent magnifiquement le pied, montées sur une semelle ultra-moelleuse en cuir italien.',
      price: 450,
      salePrice: 390,
      costPrice: 180,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      stock: 45,
      material: 'Cuir véritable',
      weight: 0.35,
      status: 'published',
      featured: true,
      isNew: true,
      isBestSeller: true,
      categoryId: categoryMap['sandales'],
      images: [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'
      ],
      colors: ['Or', 'Rose Gold', 'Argent'],
      sizes: ['37', '38', '39', '40']
    },
    {
      reference: 'SOLEY-LUNA-NOIR',
      name: 'Sandales Luna Noir',
      slug: 'sandales-luna-noir',
      description: 'Le chic intemporel de la sandale Luna en cuir noir profond. Un modèle parfait pour vos soirées estivales ou pour rehausser une tenue décontractée.',
      price: 430,
      salePrice: null,
      costPrice: 170,
      videoUrl: null,
      stock: 30,
      material: 'Cuir véritable',
      weight: 0.35,
      status: 'published',
      featured: true,
      isNew: true,
      isBestSeller: false,
      categoryId: categoryMap['sandales'],
      images: [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80'
      ],
      colors: ['Noir', 'Blanc'],
      sizes: ['37', '38', '39', '40', '41']
    },
    {
      reference: 'SOLEY-AMAL-TABAC',
      name: 'Mules Amal Tabac',
      slug: 'mules-amal-tabac',
      description: 'L\'incontournable de la saison. Les mules Amal sont conçues en cuir nubuck tabac avec une boucle métallique ajustable pour un maintien parfait et un style bohème-chic.',
      price: 380,
      salePrice: null,
      costPrice: 150,
      videoUrl: null,
      stock: 40,
      material: 'Cuir Nubuck',
      weight: 0.3,
      status: 'published',
      featured: true,
      isNew: false,
      isBestSeller: true,
      categoryId: categoryMap['mules'],
      images: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80'
      ],
      colors: ['Tabac', 'Beige', 'Camel'],
      sizes: ['36', '37', '38', '39']
    },
    {
      reference: 'SOLEY-SOPHIA-GRENAT',
      name: 'Sabots Sophia Grenat',
      slug: 'sabots-sophia-grenat',
      description: 'Un hommage à l\'élégance intemporelle. Les sabots Sophia arborent un cuir grenat grainé robuste, fixé sur une semelle légère en bois de tilleul doublée de gomme antidérapante.',
      price: 490,
      salePrice: 420,
      costPrice: 200,
      videoUrl: null,
      stock: 20,
      material: 'Cuir grainé & Bois',
      weight: 0.5,
      status: 'published',
      featured: false,
      isNew: true,
      isBestSeller: false,
      categoryId: categoryMap['sabots'],
      images: [
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80'
      ],
      colors: ['Grenat', 'Noir'],
      sizes: ['38', '39', '40', '41']
    },
    {
      reference: 'SOLEY-KENZA-NOIR',
      name: 'Mocassins Kenza Noir',
      slug: 'mocassins-kenza-noir',
      description: 'Souplesse absolue. Les mocassins Kenza se portent comme une seconde peau. Cousus main dans un cuir nappa noir ultra-souple, ils disposent d\'une semelle intérieure ergonomique à mémoire de forme.',
      price: 420,
      salePrice: null,
      costPrice: 160,
      videoUrl: null,
      stock: 50,
      material: 'Cuir Nappa',
      weight: 0.32,
      status: 'published',
      featured: true,
      isNew: true,
      isBestSeller: true,
      categoryId: categoryMap['mocassins'],
      images: [
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80'
      ],
      colors: ['Noir', 'Blanc', 'Beige'],
      sizes: ['37', '38', '39', '40', '41']
    },
    {
      reference: 'SOLEY-YASMIN-RG',
      name: 'Slippers Yasmin Rose Gold',
      slug: 'slippers-yasmin-rose-gold',
      description: 'L\'accord idéal entre élégance d\'intérieur et soulier de ville. Les slippers Yasmin combinent cuir rose gold scintillant et finitions raffinées.',
      price: 390,
      salePrice: 350,
      costPrice: 150,
      videoUrl: null,
      stock: 25,
      material: 'Cuir scintillant',
      weight: 0.28,
      status: 'published',
      featured: false,
      isNew: false,
      isBestSeller: false,
      categoryId: categoryMap['slippers'],
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
      ],
      colors: ['Rose Gold', 'Or', 'Argent'],
      sizes: ['36', '37', '38', '39', '40']
    }
  ];

  for (const prod of products) {
    const { images, colors: prodColors, sizes: prodSizes, ...rest } = prod;
    
    // Create product
    const createdProduct = await prisma.product.create({
      data: rest
    });

    // Create product images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          image: images[i],
          position: i
        }
      });
    }

    // Create product variants
    for (const col of prodColors) {
      for (const sz of prodSizes) {
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            colorId: colorMap[col] || null,
            sizeId: sizeMap[sz] || null,
            stock: 10,
            sku: `${prod.reference}-${col.substring(0, 3).toUpperCase()}-${sz}-${Math.random().toString(36).substring(7)}`
          }
        });
      }
    }

    // Seed dummy reviews for verification
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        rating: 5,
        comment: "Excellent modèle, très confortable et élégant.",
        customerId: (await prisma.user.findFirst({ where: { role: 'customer' } }))?.id || "d7b9736c-949e-4c3e-967a-5db0d603a110" // Default/fallback UUID
      }
    });
  }

  console.log('Database seeded successfully with professional Soley catalog!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
