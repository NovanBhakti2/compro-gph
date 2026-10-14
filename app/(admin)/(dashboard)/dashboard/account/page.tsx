import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { ChangePasswordForm } from "@/components/organisms/dashboard/ChangePasswordForm";
import { CreateUserForm } from "@/components/organisms/dashboard/CreateUserForm";
import { UserRow } from "@/components/organisms/dashboard/UserRow";
import { Card, PageHeader } from "@/components/organisms/dashboard/ui";

export default async function AccountPage() {
  const user = await requireDashboardUser();
  const isAdmin = user.role === "ADMIN";

  // Only admins see (and query) the user list
  const users = isAdmin
    ? await prisma.users.findMany({
        orderBy: [{ role: "asc" }, { name: "asc" }],
        select: { id: true, name: true, email: true, role: true, _count: { select: { news: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan"
        title="Akun saya"
        description={isAdmin ? "Data login Anda dan pengguna dashboard." : "Data login dashboard Anda."}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Profil">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e0b673] to-[#C7974C] text-xl font-bold text-[#0b1329]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <dl className="min-w-0 space-y-1 text-sm">
                <div>
                  <dt className="sr-only">Nama</dt>
                  <dd className="truncate font-bold text-[#0f1932]">{user.name}</dd>
                </div>
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd className="truncate text-slate-500">{user.email}</dd>
                </div>
                <div>
                  <dt className="sr-only">Role</dt>
                  <dd>
                    <span className="rounded-md bg-[#C7974C]/12 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8a6a32]">
                      {user.role}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          {isAdmin && (
            <Card
              title="Pengguna dashboard"
              description="Siapa saja yang bisa login ke dashboard ini."
              actions={
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {users.length} pengguna
                </span>
              }
              bodyClassName=""
            >
              <ul className="divide-y divide-slate-100">
                {users.map((u: (typeof users)[number]) => (
                  <UserRow
                    key={u.id}
                    isSelf={u.id === user.id}
                    user={{
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      role: u.role,
                      articleCount: u._count.news,
                    }}
                  />
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Ganti password" description="Disarankan setelah login pertama kali.">
            <ChangePasswordForm />
          </Card>

          {isAdmin && (
            <Card title="Tambah pengguna" description="Buat akun login untuk tim Anda.">
              <CreateUserForm />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
