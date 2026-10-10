"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="from" value={from ?? ""} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-slate-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.email}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#C7974C] focus:ring-2 focus:ring-[#C7974C]/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-slate-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#C7974C] focus:ring-2 focus:ring-[#C7974C]/20"
        />
      </div>

      {state?.message && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#0f1932] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a2747] disabled:opacity-60"
      >
        {pending ? "Masuk..." : "Masuk"}
      </button>
    </form>
  );
}
