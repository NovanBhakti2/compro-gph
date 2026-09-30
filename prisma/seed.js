// prisma/seed.js
const { PrismaClient, NewsStatus, Role } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Artikel 1: Vimala Pullman Ciawi
const vimalaArticleContent = `
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start not-prose my-6">
    <div class="lg:col-span-7 space-y-6 text-slate-600 leading-relaxed text-base">
      <p class="text-xl font-bold text-[#0f1932] leading-snug">
        Food safety becomes meaningful when teams can connect standards with the choices they make throughout each working day.
      </p>

      <p class="text-slate-500">
        At Vimala Pullman Ciawi, the training created space to revisit practical food-safety awareness in a hospitality setting. The session emphasized clear habits, shared responsibility, and the importance of applying consistent practices across everyday operations.
      </p>

      <h2 class="text-2xl font-extrabold text-[#0f1932] pt-4">
        From awareness to everyday practice
      </h2>

      <p>
        The discussion focused on helping team members recognize how individual actions contribute to a wider culture of safety and quality. Practical learning supports teams in understanding not only what a procedure asks for, but why consistent application matters for colleagues, guests, and the operation as a whole.
      </p>

      <div class="p-6 bg-white border-l-4 border-[#C7974C] rounded-r-2xl shadow-sm my-6">
        <p class="italic font-medium text-slate-800 text-base leading-relaxed">
          Consistent hospitality standards are strengthened when practical knowledge is understood, discussed, and carried into daily routines.
        </p>
      </div>

      <h2 class="text-2xl font-extrabold text-[#0f1932] pt-4">
        Supporting a capable, consistent team
      </h2>

      <p>
        Ongoing capability building helps make food safety part of the operational rhythm. By reinforcing awareness and encouraging teams to communicate clearly, hospitality organizations can support more dependable practices and a stronger shared commitment to service quality.
      </p>
    </div>

    <div class="lg:col-span-5">
      <div class="bg-[#0b1329] text-white p-8 rounded-3xl space-y-6 shadow-lg border border-slate-800">
        <div>
          <span class="text-[10px] font-bold tracking-widest text-[#C7974C] uppercase">
            KEY TOPICS
          </span>
          <h3 class="text-2xl font-bold mt-1 text-white leading-snug">
            What the session reinforced
          </h3>
        </div>

        <div class="space-y-6 border-t border-slate-800/80 pt-6">
          <div class="space-y-1.5">
            <h4 class="font-bold text-white text-base">Practical awareness</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Connecting everyday food handling decisions with safe hospitality operations.
            </p>
          </div>

          <div class="space-y-1.5">
            <h4 class="font-bold text-white text-base">Team capability</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Building shared understanding so teams can apply good practices with confidence.
            </p>
          </div>

          <div class="space-y-1.5">
            <h4 class="font-bold text-white text-base">Operational consistency</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Reinforcing repeatable routines that support dependable service standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Artikel 2: Apurva Kempinski Bali (Lengkap dengan Galeri Bawah)
const kempinskiArticleContent = `
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start not-prose my-6">
    <div class="lg:col-span-7 space-y-6 text-slate-600 leading-relaxed text-base">
      <p class="text-xl font-bold text-[#0f1932] leading-snug">
        Food safety becomes part of service culture when teams can connect practical guidance with the decisions they make throughout each working day.
      </p>

      <p class="text-slate-500">
        At Apurva Kempinski Bali, the workshop setting brought colleagues together to revisit practical food-safety awareness in the context of hospitality operations. The session encouraged participation and a shared understanding of how everyday actions can help prevent risk.
      </p>

      <h2 class="text-2xl font-extrabold text-[#0f1932] pt-4">
        From awareness to everyday practice
      </h2>

      <p>
        Discussion-based learning helps teams consider why consistent routines matter, from careful handling and clear communication to collective responsibility. In an operational environment, these habits support both food safety and reliable service standards.
      </p>

      <div class="p-6 bg-white border-l-4 border-[#C7974C] rounded-r-2xl shadow-sm my-6">
        <p class="italic font-medium text-slate-800 text-base leading-relaxed">
          Practical awareness grows through open participation, shared responsibility, and the consistent application of good habits.
        </p>
      </div>

      <h2 class="text-2xl font-extrabold text-[#0f1932] pt-4">
        Supporting a capable, consistent team
      </h2>

      <p>
        Capability building gives teams opportunities to refresh their knowledge and align around safe ways of working. Reinforcement over time can help food-safety thinking remain visible within the rhythm of hospitality service.
      </p>
    </div>

    <div class="lg:col-span-5">
      <div class="bg-[#0b1329] text-white p-8 rounded-3xl space-y-6 shadow-lg border border-slate-800">
        <div>
          <span class="text-[10px] font-bold tracking-widest text-[#C7974C] uppercase">
            KEY TOPICS
          </span>
          <h3 class="text-2xl font-bold mt-1 text-white leading-snug">
            What the session reinforced
          </h3>
        </div>

        <div class="space-y-6 border-t border-slate-800/80 pt-6">
          <div class="space-y-1.5">
            <h4 class="font-bold text-white text-base">Practical awareness</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Connecting daily food handling choices with risk prevention.
            </p>
          </div>

          <div class="space-y-1.5">
            <h4 class="font-bold text-white text-base">Team participation</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Creating space to discuss, question, and reinforce shared practices.
            </p>
          </div>

          <div class="space-y-1.5">
            <h4 class="font-bold text-white text-base">Consistent standards</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Supporting dependable routines across hospitality operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Galeri Foto Dokumentasi Kegiatan (Sesuai Gambar Bagian Bawah) -->
  <div class="pt-10 border-t border-slate-200/80 space-y-4 not-prose">
    <div class="space-y-1">
      <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        INSIDE THE WORKSHOP
      </span>
      <h3 class="text-2xl font-extrabold text-[#0f1932]">
        Learning together in Bali
      </h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
      <div class="h-44 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-2xs">
        <img
          src="/content/bali-1.jpg"
          alt="Workshop session 1"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div class="h-44 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-2xs">
        <img
          src="/content/bali-2.jpg"
          alt="Workshop session 2"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div class="h-44 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-2xs">
        <img
          src="/content/bali-3.jpg"
          alt="Workshop session 3"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  </div>
`;

async function main() {
  console.log('=== MEMULAI SEEDING 2 ARTIKEL FOOD SAFETY ===');

  // 1. Bersihkan Data Lama
  await prisma.news.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.users.deleteMany();
  console.log('✓ Database dibersihkan.');

  // 2. Buat User Admin
  const hashedPassword = await bcrypt.hash('AdminGPH2026!', 10);
  const adminUser = await prisma.users.create({
    data: {
      id: crypto.randomUUID(),
      email: 'admin@gamaputraharmoni.com',
      name: 'Admin Gama Putra Harmoni',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✓ User Admin dibuat.');

  // 3. Buat Kategori Food Safety
  const foodSafetyCategory = await prisma.categories.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Food Safety',
      slug: 'food-safety',
      description: 'Keamanan pangan & higiene industri',
    },
  });
  console.log('✓ Kategori Food Safety dibuat.');

  // 4. Buat 2 Artikel Utama Sesuai Foto
  const articles = [
    {
      title: 'Food Safety Training at Vimala Pullman Ciawi',
      slug: 'food-safety-training-at-vimala-pullman-ciawi',
      content: vimalaArticleContent,
      thumbnail_url: '/content/vimala-pulman.jpg',
      status: NewsStatus.PUBLISHED,
      published_at: new Date('2026-09-12T10:00:00Z'),
      author_id: adminUser.id,
      category_id: foodSafetyCategory.id,
    },
    {
      title: 'Food Safety Training at Apurva Kempinski Bali',
      slug: 'food-safety-training-at-apurva-kempinski-bali',
      content: kempinskiArticleContent,
      thumbnail_url: '/content/bali-thumbnail.jpg',
      status: NewsStatus.PUBLISHED,
      published_at: new Date('2026-09-20T09:00:00Z'),
      author_id: adminUser.id,
      category_id: foodSafetyCategory.id,
    },
  ];

  for (const article of articles) {
    const created = await prisma.news.create({ data: article });
    console.log(`✓ Artikel berhasil dibuat: ${created.title}`);
  }

  console.log('=== SEEDING 2 ARTIKEL SELESAI SUKSES ===');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });