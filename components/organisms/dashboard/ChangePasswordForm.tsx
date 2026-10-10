"use client";

import { useActionState, useRef } from "react";
import { changePassword, type PasswordFormState } from "@/app/actions/account";
import { Field, Icon, buttonClass, inputClass } from "./ui";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: PasswordFormState, formData: FormData) => {
      const result = await changePassword(prev, formData);
      if (result?.ok) formRef.current?.reset();
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

      <Field label="Password lama" htmlFor="current" error={state?.errors?.current}>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <Field
        label="Password baru"
        htmlFor="next"
        hint="Minimal 8 karakter. Gunakan campuran huruf, angka, dan simbol."
        error={state?.errors?.next}
      >
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </Field>
      <Field label="Ulangi password baru" htmlFor="confirm" error={state?.errors?.confirm}>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={pending} className={`${buttonClass("primary")} w-full`}>
        {pending ? "Menyimpan..." : "Ganti password"}
      </button>
    </form>
  );
}
