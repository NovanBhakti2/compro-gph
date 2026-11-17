"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { claimCertificate, type ClaimState } from "@/app/actions/certificates";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = { slug: string; dict: Dictionary["certificate"] };

const input =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#C7974C] focus:ring-4 focus:ring-[#C7974C]/15";

/**
 * Two steps: fill in the name and contact, then confirm the name as it will
 * be printed (in capitals, like on the certificate) before it's created.
 */
export function ClaimForm({ slug, dict: t }: Props) {
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(
    claimCertificate.bind(null, slug),
    undefined,
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  // The confirm step belongs to the state it was opened from: any new server
  // response (e.g. a validation error) brings the form back
  const [confirmFrom, setConfirmFrom] = useState<{ state: ClaimState } | null>(null);
  const confirming = confirmFrom !== null && confirmFrom.state === state;
  // An unregistered email brings the form back with the email selected, ready to retype
  useEffect(() => {
    if (state?.message !== "not-registered") return;
    const field = document.getElementById("contact") as HTMLInputElement | null;
    field?.focus();
    field?.select();
  }, [state]);
  // The notice in the card belongs to the response it came with; X hides that one
  const [alertClosedFor, setAlertClosedFor] = useState<ClaimState>();
  const showNotRegistered = state?.message === "not-registered" && alertClosedFor !== state;

  const errors = state?.errors;
  const cleanName = name.trim().replace(/\s+/g, " ");

  if (state?.certificate) {
    const c = state.certificate;
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#0f1932]">{c.existing ? t.existingTitle : t.successTitle}</h2>
          {c.existing && <p className="text-sm text-slate-500">{t.existingText}</p>}
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-4 ring-1 ring-slate-100">
          <p className="font-serif text-xl font-semibold uppercase tracking-wide text-[#0f1932]">{c.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t.numberLabel} <span className="font-semibold text-slate-700">{c.number}</span>
          </p>
        </div>
        {c.emailedTo && (
          <p className="text-sm text-slate-500">
            {t.emailedTo} <span className="font-semibold text-slate-700">{c.emailedTo}</span>.
            <br />
            <span className="text-xs text-slate-400">{t.checkSpam}</span>
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <a
            href={`/api/certificates/${c.code}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C7974C] px-5 py-3 text-sm font-bold text-[#0f1932] transition hover:bg-[#d8bd8d]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t.download}
          </a>
          <a
            href={`/api/certificates/${c.code}?view`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.view}
          </a>
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.set("participant_name", cleanName);
            formData.set("contact", contact);
            startTransition(() => formAction(formData));
          }}
          className="space-y-5 text-center"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0f1932]">{t.confirmTitle}</h2>
            <p className="text-sm text-slate-500">{t.confirmText}</p>
          </div>
          <div className="rounded-xl border border-[#C7974C]/40 bg-[#fbf8f2] px-4 py-6">
            <p className="break-words font-serif text-2xl font-semibold uppercase tracking-wide text-[#0f1932] sm:text-3xl">
              {cleanName}
            </p>
          </div>
          <p className="text-xs text-slate-400">{t.confirmNote}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmFrom(null)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {t.back}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-[#0f1932] px-6 py-3 text-sm font-bold text-white hover:bg-[#1b2a4d] disabled:opacity-60"
            >
              {pending ? t.claiming : t.claim}
            </button>
          </div>
        </form>
      </>
    );
  }

  const nameError = errors?.participant_name?.[0];
  const contactError = errors?.contact?.[0];
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (e.currentTarget.reportValidity()) setConfirmFrom({ state });
        }}
        className="space-y-5"
      >
        <p className="text-sm text-slate-500">{t.claimIntro}</p>
        {showNotRegistered && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
          >
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.notRegisteredTitle}</p>
              <p className="mt-0.5 leading-relaxed text-red-600">{t.notRegistered}</p>
            </div>
            <button
              type="button"
              onClick={() => setAlertClosedFor(state)}
              aria-label={t.dismiss}
              className="-mr-1 -mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-red-400 transition hover:bg-red-100 hover:text-red-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {(state?.message === "error" || state?.message === "closed") && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            {state.message === "closed" ? t.closedText : t.error}
          </p>
        )}
        <div className="space-y-1.5">
          <label htmlFor="participant_name" className="text-sm font-semibold text-slate-700">
            {t.nameLabel}
          </label>
          <input
            id="participant_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={80}
            autoComplete="name"
            placeholder={t.namePlaceholder}
            aria-invalid={Boolean(nameError)}
            className={input}
          />
          <p className={`text-xs ${nameError ? "font-medium text-red-600" : "text-slate-400"}`}>
            {nameError ?? t.nameHint}
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact" className="text-sm font-semibold text-slate-700">
            {t.contactLabel}
          </label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            maxLength={150}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t.contactPlaceholder}
            aria-invalid={Boolean(contactError)}
            className={input}
          />
          <p className={`text-xs ${contactError ? "font-medium text-red-600" : "text-slate-400"}`}>
            {contactError ?? t.contactHint}
          </p>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-[#0f1932] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1b2a4d]"
        >
          {t.next}
        </button>
      </form>
    </>
  );
}
