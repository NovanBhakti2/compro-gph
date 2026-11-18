"use client";

import { startTransition, useActionState, useState } from "react";
import { registerForTraining, type RegisterState } from "@/app/actions/registrations";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type TrainingOption = { slug: string; title: string; date: string; location: string | null };

type Props = {
  lang: string;
  dict: Dictionary["registration"];
  trainings: TrainingOption[];
  initialTraining: string;
  notice?: string;
};

const input =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#C7974C] focus:ring-4 focus:ring-[#C7974C]/15";

const EMPTY = { training: "", name: "", email: "", phone: "" };

export function RegisterForm({ lang, dict: t, trainings, initialTraining, notice }: Props) {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerForTraining.bind(null, lang),
    undefined,
  );
  // Controlled, so a failed submit keeps what was typed
  const [v, setV] = useState({ ...EMPTY, training: initialTraining });
  const set = (patch: Partial<typeof EMPTY>) => setV((all) => ({ ...all, ...patch }));
  // "Register for another training" hides the result it was shown from
  const [dismissed, setDismissed] = useState<RegisterState>();

  if (state?.registered && dismissed !== state) {
    const r = state.registered;
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#0f1932]">{r.existing ? t.existingTitle : t.successTitle}</h2>
        <div className="rounded-xl bg-[#0f1932] px-5 py-4 text-left text-white">
          <p className="font-bold leading-snug">{r.title}</p>
          <p className="mt-1 text-xs text-[#d8bd8d]">{r.date}</p>
          {r.location && <p className="text-xs text-slate-300">{r.location}</p>}
        </div>
        <p className="text-sm leading-relaxed text-slate-500">
          {r.status === "APPROVED" ? t.approvedText : t.successText}
          <br />
          <span className="font-semibold text-slate-800">{r.email}</span>
        </p>
        {r.emailed && <p className="text-xs text-slate-400">{t.emailed}</p>}
        {trainings.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setDismissed(state);
              setV({ ...v, training: "" });
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.another}
          </button>
        )}
      </div>
    );
  }

  const errors = state?.errors;
  const field = (key: keyof typeof EMPTY, hint?: string) => {
    const error = errors?.[key]?.[0];
    return {
      error,
      help: <p className={`text-xs ${error ? "font-medium text-red-600" : "text-slate-400"}`}>{error ?? hint}</p>,
    };
  };
  const name = field("name", t.nameHint);
  const email = field("email", t.emailHint);
  const phone = field("phone", t.phoneHint);
  const trainingError = errors?.training?.[0];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!e.currentTarget.reportValidity()) return;
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-5"
    >
      <p className="text-sm text-slate-500">{t.intro}</p>
      {notice && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">{notice}</p>
      )}
      {state?.message && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {state.message === "closed" ? t.closed : t.error}
        </p>
      )}

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-semibold text-slate-700">{t.trainingLabel}</legend>
        {trainings.map((tr) => {
          const checked = v.training === tr.slug;
          return (
            <label
              key={tr.slug}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                checked
                  ? "border-[#C7974C] bg-[#fbf8f2] ring-4 ring-[#C7974C]/15"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="training"
                value={tr.slug}
                checked={checked}
                onChange={() => set({ training: tr.slug })}
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f1932]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-snug text-[#0f1932]">{tr.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{tr.date}</span>
                {tr.location && <span className="block text-xs text-slate-500">{tr.location}</span>}
              </span>
            </label>
          );
        })}
        {trainingError && <p className="text-xs font-medium text-red-600">{trainingError}</p>}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="reg-name" className="text-sm font-semibold text-slate-700">
          {t.nameLabel}
        </label>
        <input
          id="reg-name"
          name="name"
          value={v.name}
          onChange={(e) => set({ name: e.target.value })}
          required
          minLength={3}
          maxLength={80}
          autoComplete="name"
          placeholder={t.namePlaceholder}
          aria-invalid={Boolean(name.error)}
          className={input}
        />
        {name.help}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="text-sm font-semibold text-slate-700">
          {t.emailLabel}
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          inputMode="email"
          value={v.email}
          onChange={(e) => set({ email: e.target.value })}
          required
          maxLength={150}
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          aria-invalid={Boolean(email.error)}
          className={input}
        />
        {email.help}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="reg-phone" className="text-sm font-semibold text-slate-700">
          {t.phoneLabel}
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          value={v.phone}
          onChange={(e) => set({ phone: e.target.value })}
          required
          maxLength={30}
          autoComplete="tel"
          placeholder={t.phonePlaceholder}
          aria-invalid={Boolean(phone.error)}
          className={input}
        />
        {phone.help}
      </div>
      {/* Honeypot for bots; people never see it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#0f1932] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1b2a4d] disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
      <p className="text-center text-[11px] leading-relaxed text-slate-400">{t.privacy}</p>
    </form>
  );
}
