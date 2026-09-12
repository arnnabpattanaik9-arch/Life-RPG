import { prisma } from './prisma.js';
import { SHOP_ITEMS, ACHIEVEMENTS } from '../data/catalog.js';

export async function seedCatalogAndAchievements(): Promise<void> {
  // Seed Shop Items
  for (const item of SHOP_ITEMS) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        icon: item.icon,
      },
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        icon: item.icon,
      },
    });
  }

  // Seed Achievements
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: {
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
      },
      create: {
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
      },
    });
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedCatalogAndAchievements()
    .then(() => {
      console.log('✔ Catalog and achievements seeded successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to seed:', err);
      process.exit(1);
    });
}
