import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Топливо', slug: 'fuel' },
  { name: 'ТО', slug: 'maintenance' },
  { name: 'Ремонт', slug: 'repair' },
  { name: 'Страховка', slug: 'insurance' },
  { name: 'Штрафы', slug: 'fines' },
  { name: 'Мойка', slug: 'wash' },
  { name: 'Парковка', slug: 'parking' },
  { name: 'Прочее', slug: 'other' },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Seeded categories:', categories.map((c) => c.name).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
