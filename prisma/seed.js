// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai seeding data...');

  const user = await prisma.users.create({
    data: {
      id: 'usr-' + Date.now(),
      email: 'admin@company.com',
      name: 'Super Admin',
      password: 'hashed_password_123',
      role: 'ADMIN', // Tulis langsung sebagai string
    },
  });

  console.log('User created:', user);

  const news = await prisma.news.create({
    data: {
      id: 'news-' + Date.now(),
      title: 'Peluncuran Website Resmi Perusahaan',
      slug: 'peluncuran-website-resmi-perusahaan',
      content: 'Kami bangga mengumumkan peluncuran website resmi baru perusahaan kami...',
      thumbnail_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      status: 'PUBLISHED', // Tulis langsung sebagai string
      author_id: user.id,
      published_at: new Date(),
    },
  });

  console.log('News created:', news);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });