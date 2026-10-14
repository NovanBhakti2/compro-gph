import { LoginForm } from "./LoginForm";

export const metadata = { title: "Login", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-sm space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <img src="/gph-logo.png" alt="GPH" className="mx-auto h-12 w-auto" />
          <h1 className="pt-3 text-xl font-extrabold text-[#0f1932]">
            Dashboard Admin
          </h1>
          <p className="text-sm text-slate-500">Masuk untuk mengelola artikel</p>
        </div>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
