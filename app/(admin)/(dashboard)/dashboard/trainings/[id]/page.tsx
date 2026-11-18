import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { isEmailEnabled } from "@/lib/email";
import { requireAdmin } from "@/lib/dal";
import {
  claimStatus,
  claimUrl,
  contactKey,
  formatClaimUntil,
  formatTrainingDate,
  formatTrainingTime,
  type Certificate,
  type TrainingWithTrainer,
} from "@/lib/certificates";
import {
  RETENTION_DAYS,
  formatPhone,
  isRegistrationOpen,
  purgeDate,
  purgeExpiredRegistrations,
  registerUrl,
  whatsappUrl,
  type Registration,
} from "@/lib/registrations";
import { TrainingStatusBadge } from "@/components/organisms/dashboard/TrainingStatusBadge";
import {
  AddParticipantForm,
  CertificateRow,
  ClaimLinkCard,
  ClaimToggle,
  CopyLink,
  ApproveAllButton,
  DeleteRegistrationButton,
  ImportRegistrationsForm,
  RegistrationDecision,
  DeleteTrainingButton,
} from "@/components/organisms/dashboard/TrainingClient";
import { Card, EmptyState, Icon, buttonClass } from "@/components/organisms/dashboard/ui";

const dayFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const claimedFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  // Also runs daily from the cron; here so the page never shows overdue data
  await purgeExpiredRegistrations();
  const training: (TrainingWithTrainer & { certificates: Certificate[]; registrations: Registration[] }) | null =
    await prisma.trainings.findUnique({
      where: { id },
      include: {
        certificates: { orderBy: { seq: "asc" } },
        registrations: { orderBy: { created_at: "asc" } },
        trainer: true,
      },
    });
  if (!training) notFound();
  const registrationOpen = isRegistrationOpen(training);
  const claimedKeys = new Set(training.certificates.map((c: Certificate) => c.contact_key));
  const claimedCount = training.registrations.filter((r: Registration) => claimedKeys.has(contactKey(r.email))).length;
  const pendingCount = training.registrations.filter((r: Registration) => r.status === "PENDING").length;
  const approvedCount = training.registrations.filter((r: Registration) => r.status === "APPROVED").length;
  // Waiting sign-ups first: they need the admin's attention
  const registrations = [...training.registrations].sort(
    (a: Registration, b: Registration) => Number(b.status === "PENDING") - Number(a.status === "PENDING"),
  );

  const status = claimStatus(training);
  const emailEnabled = isEmailEnabled();
  const url = claimUrl(training.slug);
  // Large enough to print on a banner or put on a slide
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f1932" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link href="/dashboard/trainings" aria-label="Kembali" className={`${buttonClass("secondary", "icon")} mt-1`}>
            <Icon name="back" />
          </Link>
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f1932]">{training.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <TrainingStatusBadge status={status} />
              <span>
                {[formatTrainingDate(training.starts_on, training.ends_on, "id-ID"), formatTrainingTime(training)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {training.location && <span>{training.location}</span>}
              <span>
                Trainer: {training.trainer ? training.trainer.name : "belum dipilih (kosong di sertifikat)"}
                {training.trainer && !training.trainer.signature_url && " (tanpa tanda tangan)"}
              </span>
              <span>
                {training.claim_until ? `Klaim sampai ${formatClaimUntil(training.claim_until)}` : "Tanpa batas klaim"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ClaimToggle id={training.id} open={training.is_open} />
          <Link href={`/dashboard/trainings/${training.id}/edit`} className={buttonClass("secondary")}>
            <Icon name="edit" />
            Edit
          </Link>
          <DeleteTrainingButton id={training.id} title={training.title} count={training.certificates.length} />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6 lg:sticky lg:top-8">
          <Card
            title="Link pendaftaran"
            description={registrationOpen ? "Bagikan ke calon peserta, atau pasang di tombol promo." : undefined}
          >
            {registrationOpen ? (
              <CopyLink url={registerUrl(training.slug)} />
            ) : (
              <p className="text-xs leading-relaxed text-slate-500">
                {training.registrations_purged_at
                  ? "Pendaftaran sudah selesai."
                  : training.registration_open
                    ? "Pendaftaran otomatis ditutup karena training sudah lewat."
                    : "Pendaftaran ditutup. Buka lagi lewat Edit."}
              </p>
            )}
          </Card>
          <Card title="QR klaim" description="Tampilkan di slide penutup, cetak, atau kirim ke grup peserta.">
            <ClaimLinkCard url={url} qrDataUrl={qrDataUrl} fileName={`QR-${training.slug}.png`} />
            {status !== "OPEN" && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                {status === "CLOSED"
                  ? "Klaim sedang ditutup. Peserta yang scan akan melihat pesan bahwa klaim sudah ditutup."
                  : "Masa klaim sudah habis. Ubah batas klaim di Edit kalau perlu dibuka lagi."}
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title={`Pendaftar (${training.registrations_purged_at ? (training.registrations_purged_count ?? 0) : training.registrations.length})`}
            description={
              training.registrations_purged_at
                ? undefined
                : `${pendingCount} menunggu · ${approvedCount} disetujui · ${claimedCount} sudah klaim. Hanya pendaftar yang disetujui yang bisa klaim sertifikat.`
            }
            actions={
              training.registrations.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {pendingCount > 0 && (
                    <ApproveAllButton trainingId={training.id} count={pendingCount} emailEnabled={emailEnabled} />
                  )}
                  <a href={`/api/trainings/${training.id}/registrations`} className={buttonClass("secondary", "sm")}>
                    <Icon name="download" />
                    Export Excel
                  </a>
                </div>
              )
            }
            bodyClassName=""
          >
            {training.registrations_purged_at ? (
              <p className="px-5 py-4 text-xs leading-relaxed text-slate-500">
                Data pendaftar (nama, email, no. HP) sudah dihapus otomatis pada{" "}
                {dayFormat.format(training.registrations_purged_at)}. Sertifikat peserta tetap tersimpan dan bisa
                diverifikasi.
              </p>
            ) : (
              <>
                <p className="border-b border-slate-100 bg-sky-50 px-5 py-2.5 text-[11px] leading-relaxed text-sky-800">
                  Data pendaftar dihapus otomatis pada <b>{dayFormat.format(purgeDate(training))}</b> ({RETENTION_DAYS}{" "}
                  hari setelah {training.claim_until ? "batas klaim" : "training selesai"}). Export dulu kalau perlu
                  arsip.
                </p>
                <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                  <ImportRegistrationsForm trainingId={training.id} />
                </div>
                {training.registrations.length === 0 ? (
                  <EmptyState
                    title="Belum ada pendaftar"
                    description="Pendaftar dari halaman /register atau hasil import Excel akan muncul di sini."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {registrations.map((r: Registration) => {
                      const claimed = claimedKeys.has(contactKey(r.email));
                      return (
                        <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                          <div className="min-w-0 flex-1 basis-56">
                            <p className="truncate text-sm font-semibold text-[#0f1932]">{r.name}</p>
                            <p className="truncate text-xs text-slate-400">
                              {r.email}
                              {/* Imported lists may have no phone number */}
                              {r.phone && (
                                <>
                                  {" · "}
                                  <a
                                    href={whatsappUrl(r.phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Chat WhatsApp"
                                    className="hover:text-emerald-600 hover:underline"
                                  >
                                    {formatPhone(r.phone)}
                                  </a>
                                </>
                              )}
                            </p>
                          </div>
                          <RegistrationDecision
                            id={r.id}
                            status={r.status}
                            claimed={claimed}
                            notified={Boolean(r.notified_at)}
                            emailEnabled={emailEnabled}
                          />
                          <span className="w-28 text-right text-[11px] text-slate-400">
                            {claimedFormat.format(r.created_at)}
                          </span>
                          <DeleteRegistrationButton id={r.id} name={r.name} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </Card>

          <Card
            title={`Peserta (${training.certificates.length})`}
            description="Sertifikat dibuat dan dikirim ke email otomatis saat pendaftar klaim. Tambahkan manual untuk peserta yang tidak bisa scan atau tidak mendaftar."
            bodyClassName=""
          >
            <div className="border-b border-slate-100 bg-slate-50/50 p-4">
              <AddParticipantForm trainingId={training.id} emailEnabled={emailEnabled} />
            </div>
            {!emailEnabled && (
              <p className="border-b border-slate-100 bg-amber-50 px-5 py-2.5 text-[11px] leading-relaxed text-amber-800">
                Pengiriman email belum aktif (RESEND_API_KEY belum diisi). Peserta tetap bisa mengunduh sertifikat
                langsung setelah klaim.
              </p>
            )}
            {training.certificates.length === 0 ? (
              <EmptyState title="Belum ada yang klaim" description="Peserta yang klaim lewat QR akan muncul di sini." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {training.certificates.map((c: Certificate) => (
                  <CertificateRow
                    key={c.id}
                    id={c.id}
                    code={c.code}
                    name={c.participant_name}
                    contact={c.contact}
                    number={c.number}
                    claimedAt={claimedFormat.format(c.created_at)}
                    emailEnabled={emailEnabled}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
