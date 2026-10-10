import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { createCategory } from "@/app/actions/categories";
import { CategoryForm } from "@/components/organisms/dashboard/CategoryForm";
import { CategoryRow } from "@/components/organisms/dashboard/CategoryRow";
import { CATEGORY_COLUMNS, Card, PageHeader } from "@/components/organisms/dashboard/ui";

export default async function CategoriesPage() {
  await requireDashboardUser();

  const categories = await prisma.categories.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { news: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="News & Articles"
        title="Kategori"
        description="Kelompokkan artikel agar mudah dicari pembaca."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          title="Daftar kategori"
          actions={
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {categories.length} kategori
            </span>
          }
          bodyClassName=""
        >
          {categories.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">
              Belum ada kategori. Tambahkan lewat form di samping.
            </p>
          ) : (
            <>
              <div
                className={`hidden gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid ${CATEGORY_COLUMNS}`}
              >
                <span>Nama</span>
                <span>Artikel</span>
                <span className="text-right">Aksi</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {categories.map((c: (typeof categories)[number]) => (
                  <CategoryRow
                    key={c.id}
                    category={{
                      id: c.id,
                      name: c.name,
                      slug: c.slug,
                      description: c.description,
                      articleCount: c._count.news,
                    }}
                  />
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="Tambah kategori" className="lg:sticky lg:top-8">
          <CategoryForm action={createCategory} submitLabel="Tambah kategori" />
        </Card>
      </div>
    </div>
  );
}
