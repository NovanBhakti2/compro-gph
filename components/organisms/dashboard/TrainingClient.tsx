"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  addParticipant,
  deleteCertificate,
  deleteTraining,
  renameCertificate,
  resendCertificateEmail,
  toggleTrainingClaims,
  type FormState,
} from "@/app/actions/certificates";
import {
  approveAllRegistrations,
  decideRegistration,
  deleteRegistration,
  importRegistrations,
  resendApprovalEmail,
  type ImportState,
} from "@/app/actions/registrations";
import { deleteTrainer } from "@/app/actions/trainers";
import { Icon, buttonClass, inputClass } from "./ui";

/* Client pieces of the training detail page. */

export function ClaimLinkCard({ url, qrDataUrl, fileName }: { url: string; qrDataUrl: string; fileName: string }) {
  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-[240px] rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <img src={qrDataUrl} alt="QR klaim sertifikat" className="block h-auto w-full" />
      </div>
      <CopyLink url={url} />
      <div className="grid grid-cols-2 gap-2">
        <a href={qrDataUrl} download={fileName} className={buttonClass("secondary", "sm")}>
          <Icon name="download" />
          Unduh QR
        </a>
        <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>
          <Icon name="external" />
          Buka halaman
        </a>
      </div>
    </div>
  );
}

export function ClaimToggle({ id, open }: { id: string; open: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleTrainingClaims(id))}
      className={buttonClass(open ? "secondary" : "primary")}
    >
      <Icon name={open ? "x" : "check"} />
      {open ? "Tutup klaim" : "Buka klaim"}
    </button>
  );
}

export function DeleteTrainingButton({ id, title, count }: { id: string; title: string; count: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const warning = count
          ? `Hapus training "${title}" beserta ${count} sertifikatnya? Link verifikasi di sertifikat yang sudah diunduh tidak akan berlaku lagi.`
          : `Hapus training "${title}"?`;
        if (confirm(warning)) startTransition(() => deleteTraining(id));
      }}
      className={buttonClass("danger")}
    >
      <Icon name="trash" />
      Hapus
    </button>
  );
}

export function AddParticipantForm({ trainingId, emailEnabled }: { trainingId: string; emailEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addParticipant.bind(null, trainingId),
    undefined,
  );
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // React resets the form after the action; put the cursor back for the next one
    if (state?.message?.startsWith("ok")) nameRef.current?.focus();
  }, [state]);
  const errors = state?.errors;

  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
      <div>
        <input
          ref={nameRef}
          name="participant_name"
          required
          placeholder="Nama peserta"
          aria-label="Nama peserta"
          className={inputClass}
        />
        {errors?.participant_name && (
          <p className="mt-1 text-xs font-medium text-red-600">{errors.participant_name[0]}</p>
        )}
      </div>
      <div>
        <input
          name="contact"
          type="email"
          placeholder="Email (opsional)"
          aria-label="Email peserta"
          className={inputClass}
        />
        {errors?.contact && <p className="mt-1 text-xs font-medium text-red-600">{errors.contact[0]}</p>}
      </div>
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        <Icon name="plus" />
        {pending ? "Menambah..." : "Tambah"}
      </button>
      {emailEnabled && (
        <label className="flex items-center gap-2 text-xs text-slate-600 sm:col-span-3">
          <input type="checkbox" name="send_email" defaultChecked className="h-4 w-4 accent-[#0f1932]" />
          Kirim sertifikat ke email peserta
        </label>
      )}
      {state?.message === "ok-emailed" && (
        <p className="text-xs font-medium text-emerald-700 sm:col-span-3">
          Peserta ditambahkan dan sertifikat sudah dikirim ke emailnya.
        </p>
      )}
      {state?.message && !state.message.startsWith("ok") && (
        <p className="text-xs font-medium text-red-600 sm:col-span-3">{state.message}</p>
      )}
    </form>
  );
}

export function CertificateRow({
  id,
  code,
  name,
  contact,
  number,
  claimedAt,
  emailEnabled,
}: {
  id: string;
  code: string;
  name: string;
  contact: string | null;
  number: string;
  claimedAt: string;
  emailEnabled: boolean;
}) {
  const [mailNote, setMailNote] = useState<{ ok: boolean; text: string }>();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await renameCertificate(id, value);
      if (result.error) setError(result.error);
      else {
        setError(undefined);
        setEditing(false);
      }
    });

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
      <div className="min-w-0 flex-1 basis-56">
        {editing ? (
          <div className="space-y-1">
            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(false);
                }}
                autoFocus
                aria-label="Nama di sertifikat"
                className={`${inputClass} h-9`}
              />
              <button type="button" disabled={pending} onClick={save} className={buttonClass("primary", "sm")}>
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setValue(name);
                  setError(undefined);
                }}
                className={buttonClass("ghost", "sm")}
              >
                Batal
              </button>
            </div>
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </div>
        ) : (
          <>
            <p className="truncate text-sm font-semibold uppercase tracking-wide text-[#0f1932]">{name}</p>
            <p className="truncate text-xs text-slate-400">{contact ?? "Ditambahkan admin, tanpa email"}</p>
            {mailNote && (
              <p className={`text-xs font-medium ${mailNote.ok ? "text-emerald-700" : "text-red-600"}`}>
                {mailNote.text}
              </p>
            )}
          </>
        )}
      </div>
      <div className="w-36 shrink-0">
        <p className="font-mono text-xs font-semibold text-slate-700">{number}</p>
        <p className="text-[11px] text-slate-400">{claimedAt}</p>
      </div>
      <div className="flex items-center gap-1">
        {emailEnabled && contact && (
          <button
            type="button"
            title="Kirim ulang ke email"
            aria-label="Kirim ulang ke email"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await resendCertificateEmail(id);
                setMailNote(
                  result.error ? { ok: false, text: result.error } : { ok: true, text: `Terkirim ke ${contact}` },
                );
              })
            }
            className={buttonClass("ghost", "icon")}
          >
            <Icon name="mail" />
          </button>
        )}
        <a
          href={`/api/certificates/${code}`}
          title="Unduh PDF"
          aria-label="Unduh PDF"
          className={buttonClass("ghost", "icon")}
        >
          <Icon name="download" />
        </a>
        <a
          href={`/verify/${code}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Halaman verifikasi"
          aria-label="Halaman verifikasi"
          className={buttonClass("ghost", "icon")}
        >
          <Icon name="external" />
        </a>
        <button
          type="button"
          title="Ubah nama"
          aria-label="Ubah nama"
          onClick={() => setEditing(true)}
          className={buttonClass("ghost", "icon")}
        >
          <Icon name="edit" />
        </button>
        <button
          type="button"
          title="Hapus"
          aria-label="Hapus"
          disabled={pending}
          onClick={() => {
            if (confirm(`Hapus sertifikat ${number} atas nama ${name}? Link verifikasinya tidak akan berlaku lagi.`)) {
              startTransition(() => deleteCertificate(id));
            }
          }}
          className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
        >
          <Icon name="trash" />
        </button>
      </div>
    </li>
  );
}

export function DeleteTrainerButton({ id, name, count }: { id: string; name: string; count: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      title="Hapus"
      aria-label="Hapus"
      disabled={pending}
      onClick={() => {
        const warning = count
          ? `Hapus trainer "${name}"? ${count} training yang memakainya akan tanpa trainer: nama dan tanda tangan di sertifikatnya kosong.`
          : `Hapus trainer "${name}"?`;
        if (confirm(warning)) startTransition(() => deleteTrainer(id));
      }}
      className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
    >
      <Icon name="trash" />
    </button>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/70">
      <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-600" title={url}>
        {url}
      </p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url).catch(() => null);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className={buttonClass("ghost", "sm")}
      >
        <Icon name={copied ? "check" : "copy"} />
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

export function DeleteRegistrationButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      title="Hapus pendaftar"
      aria-label="Hapus pendaftar"
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus pendaftaran ${name}? Orang ini tidak akan bisa klaim sertifikat.`)) {
          startTransition(() => deleteRegistration(id));
        }
      }}
      className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
    >
      <Icon name="trash" />
    </button>
  );
}

const IMPORT_MAX_BYTES = 1024 * 1024;
// A file download, not a page
const IMPORT_TEMPLATE_URL = "/api/trainings/registrations-template";

/** Upload an Excel/CSV list of people who signed up outside the website. */
export function ImportRegistrationsForm({ trainingId }: { trainingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ImportState, FormData>(
    importRegistrations.bind(null, trainingId),
    undefined,
  );
  const [fileError, setFileError] = useState<string>();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary", "sm")}>
        <Icon name="up" />
        Import Excel
      </button>
    );
  }

  const r = state?.result;
  return (
    <div className="w-full space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0f1932]">Import pendaftar dari Excel</p>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Untuk peserta yang mendaftar di luar website (Google Form, WhatsApp, daftar manual). Wajib ada kolom{" "}
            <b>Nama</b> dan <b>Email</b>; <b>No. HP</b> opsional. Email yang sudah terdaftar dilewati.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup"
          className={buttonClass("ghost", "icon")}
        >
          <Icon name="x" />
        </button>
      </div>
      <form
        action={formAction}
        onSubmit={(e) => {
          const file = (e.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0];
          if (file && file.size > IMPORT_MAX_BYTES) {
            e.preventDefault();
            setFileError("File terlalu besar (maksimal 1 MB).");
          } else setFileError(undefined);
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          type="file"
          name="file"
          required
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="min-w-0 flex-1 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
        />
        <button type="submit" disabled={pending} className={buttonClass("primary", "sm")}>
          {pending ? "Mengimport..." : "Import"}
        </button>
        <a href={IMPORT_TEMPLATE_URL} download className={buttonClass("ghost", "sm")}>
          <Icon name="download" />
          Template
        </a>
      </form>
      {(fileError || state?.error) && <p className="text-xs font-medium text-red-600">{fileError ?? state?.error}</p>}
      {r && !fileError && (
        <div className="space-y-1.5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          <p>
            <b className="text-emerald-700">{r.added} ditambahkan</b>
            {r.skipped > 0 && <> · {r.skipped} dilewati (sudah terdaftar / dobel di file)</>}
            {r.invalidCount > 0 && (
              <>
                {" "}
                · <b className="text-red-600">{r.invalidCount} tidak valid</b>
              </>
            )}
          </p>
          {r.invalid.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-[11px] text-red-600">
              {r.invalid.map((i) => (
                <li key={i.line}>
                  Baris {i.line}: {i.reason}
                </li>
              ))}
              {r.invalidCount > r.invalid.length && <li>…dan {r.invalidCount - r.invalid.length} baris lain</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Approve / reject buttons of one sign-up, plus the approval email status. */
export function RegistrationDecision({
  id,
  status,
  claimed,
  notified,
  emailEnabled,
}: {
  id: string;
  status: string;
  claimed: boolean;
  notified: boolean;
  emailEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string }>();
  const decide = (next: "APPROVED" | "REJECTED") =>
    startTransition(async () => {
      const result = await decideRegistration(id, next);
      if (result.error) setNote({ ok: false, text: result.error });
      else if (next === "APPROVED")
        setNote(
          result.emailed
            ? { ok: true, text: "Disetujui, email terkirim" }
            : {
                ok: true,
                text: emailEnabled ? "Disetujui (email gagal, kirim ulang nanti)" : "Disetujui (email belum aktif)",
              },
        );
      else setNote(undefined);
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {status === "PENDING" && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => decide("APPROVED")}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              Setujui
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => decide("REJECTED")}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              Tolak
            </button>
          </>
        )}
        {status === "APPROVED" && (
          <>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                claimed ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
              }`}
            >
              {claimed ? "Sudah klaim" : "Disetujui"}
            </span>
            {emailEnabled && (
              <button
                type="button"
                disabled={pending}
                title={notified ? "Email persetujuan terkirim. Klik untuk kirim ulang" : "Kirim email persetujuan"}
                aria-label="Kirim email persetujuan"
                onClick={() =>
                  startTransition(async () => {
                    const result = await resendApprovalEmail(id);
                    setNote(result.error ? { ok: false, text: result.error } : { ok: true, text: "Email terkirim" });
                  })
                }
                className={`${buttonClass("ghost", "icon")} ${notified ? "text-emerald-600" : "text-slate-400"}`}
              >
                <Icon name="mail" />
              </button>
            )}
            {!claimed && (
              <button
                type="button"
                disabled={pending}
                title="Tolak"
                aria-label="Tolak"
                onClick={() => {
                  if (confirm("Batalkan persetujuan dan tolak pendaftar ini? Ia tidak akan bisa klaim sertifikat.")) {
                    decide("REJECTED");
                  }
                }}
                className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
              >
                <Icon name="x" />
              </button>
            )}
          </>
        )}
        {status === "REJECTED" && (
          <>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              Ditolak
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => decide("APPROVED")}
              className={buttonClass("ghost", "sm")}
            >
              Setujui
            </button>
          </>
        )}
      </div>
      {note && <p className={`text-[11px] ${note.ok ? "text-emerald-700" : "text-red-600"}`}>{note.text}</p>}
    </div>
  );
}

export function ApproveAllButton({
  trainingId,
  count,
  emailEnabled,
}: {
  trainingId: string;
  count: number;
  emailEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string>();
  return (
    <span className="inline-flex items-center gap-2">
      {note && <span className="text-[11px] text-emerald-700">{note}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const mail = emailEnabled ? " Email persetujuan akan dikirim ke masing-masing." : "";
          if (!confirm(`Setujui ${count} pendaftar yang menunggu?${mail}`)) return;
          startTransition(async () => {
            const r = await approveAllRegistrations(trainingId);
            setNote(`${r.approved} disetujui${emailEnabled ? `, ${r.emailed} email terkirim` : ""}`);
          });
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        <Icon name="check" className="h-3.5 w-3.5" />
        {pending ? "Menyetujui..." : `Setujui semua (${count})`}
      </button>
    </span>
  );
}
