"use client";

import { useActionState, useRef, useState } from "react";
import { createUser, type UserFormState } from "@/app/actions/users";
import { Field, Icon, buttonClass, inputClass } from "./ui";

const ROLES = [
  { value: "EDITOR", label: "Editor", hint: "Menulis & mengelola artikel" },
  { value: "ADMIN", label: "Admin", hint: "Semua akses, termasuk pengguna" },
] as const;

export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<"ADMIN" | "EDITOR">("EDITOR");
  const [state, formAction, pending] = useActionState(
    async (prev: UserFormState, formData: FormData) => {
      const result = await createUser(prev, formData);
      if (result?.ok) {
        formRef.current?.reset();
        setRole("EDITOR");
      }
      return result;
    },
    undefined
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.ok && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700"
        >
          <Icon name="check" />
          {state.message}
        </div>
      )}
      {state?.message && !state.ok && (
        <p className="text-xs font-medium text-red-600">{state.message}</p>
      )}

      <Field label="Nama" htmlFor="new-user-name" error={state?.errors?.name}>
        <input id="new-user-name" name="name" required autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Email" htmlFor="new-user-email" error={state?.errors?.email}>
        <input
          id="new-user-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className={inputClass}
        />
      </Field>

      <fieldset className="space-y-1.5">
        <legend className="pb-1.5 text-xs font-semibold text-slate-700">Role</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => {
            const checked = role === r.value;
            return (
              <label
                key={r.value}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 transition ${
                  checked
                    ? "border-[#0f1932] bg-[#0f1932]/[0.04] ring-1 ring-[#0f1932]"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={checked}
                  onChange={() => setRole(r.value)}
                  className="sr-only"
                />
                <span className="block text-sm font-bold text-[#0f1932]">{r.label}</span>
                <span className="block text-[11px] leading-snug text-slate-500">{r.hint}</span>
              </label>
            );
          })}
        </div>
        {state?.errors?.role && (
          <p className="text-xs font-medium text-red-600">{state.errors.role[0]}</p>
        )}
      </fieldset>

      <Field
        label="Password awal"
        htmlFor="new-user-password"
        hint="Minimal 8 karakter. Berikan ke pengguna, lalu minta ia menggantinya di Akun saya."
        error={state?.errors?.password}
      >
        <input
          id="new-user-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={pending} className={`${buttonClass("primary")} w-full`}>
        <Icon name="plus" />
        {pending ? "Menyimpan..." : "Tambah pengguna"}
      </button>
    </form>
  );
}
