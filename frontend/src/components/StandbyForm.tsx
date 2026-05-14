import { useState } from "react";
import { CalendarDays } from "lucide-react";

export type StandbyReason = "STORE_CLOSED" | "NEXT_DAY" | "OTHER";

type StandbyFormProps = {
  standbyError?: string;
  onConfirm: (data: {
    reason: StandbyReason;
    reasonLabel: string;
    returnDate: string;
    observation: string;
  }) => void | Promise<void>;
};

const reasonOptions: { value: StandbyReason; label: string }[] = [
  { value: "STORE_CLOSED", label: "Loja fechada" },
  { value: "NEXT_DAY", label: "Dar andamento no próximo dia" },
  { value: "OTHER", label: "Outro" },
];

export function StandbyForm({
  onConfirm,
  standbyError = "",
}: StandbyFormProps) {
  const [reason, setReason] = useState<StandbyReason>("STORE_CLOSED");
  const [returnDate, setReturnDate] = useState("");
  const [observation, setObservation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedReason = reasonOptions.find((item) => item.value === reason);

  const returnDateIsValid =
    returnDate.trim().length > 0 &&
    new Date(returnDate).getTime() > Date.now();

  const canConfirm = returnDateIsValid && !isSaving;

  async function handleConfirm() {
    if (!canConfirm) return;

    try {
      setIsSaving(true);

      await onConfirm({
        reason,
        reasonLabel: selectedReason?.label || "Outro",
        returnDate,
        observation,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="h-[212px] w-full rounded-[14px] border border-[#EAECF0] bg-white px-5 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <h3 className="mb-3 text-[16px] font-bold leading-6 text-[#0F172A]">
        Colocar em Standby
      </h3>

      <div className="mb-3 grid grid-cols-2 gap-4">
        <Field label="Motivo">
          <select
            value={reason}
            disabled={isSaving}
            onChange={(event) => setReason(event.target.value as StandbyReason)}
            className="h-8 w-full rounded-[10px] border border-[#EAECF0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
          >
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Data de retorno">
          <input
            type="datetime-local"
            value={returnDate}
            disabled={isSaving}
            onChange={(event) => setReturnDate(event.target.value)}
            className="h-8 w-full rounded-[10px] border border-[#EAECF0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
          />

          {!returnDateIsValid && (
            <p className="mt-1 text-[11px] font-medium text-[#B42318]">
              Informe uma data futura válida.
            </p>
          )}
        </Field>
      </div>

      <div className="mb-3">
        <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
          Observação (opcional)
        </label>

        <textarea
          value={observation}
          disabled={isSaving}
          onChange={(event) => setObservation(event.target.value)}
          placeholder="Adicione uma observação, se necessário"
          className="h-[54px] w-full resize-none rounded-[10px] border border-[#EAECF0] bg-white p-3 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
        />
      </div>

      <button
        type="button"
        disabled={!canConfirm}
        onClick={handleConfirm}
        className={[
          "flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[14px] font-semibold text-white transition",
          !canConfirm
            ? "cursor-not-allowed bg-[#94A3B8]"
            : "bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99]",
        ].join(" ")}
      >
        <CalendarDays className="h-4 w-4" />
        {isSaving ? "Salvando..." : "Confirmar"}
      </button>

      {standbyError && (
        <p className="mt-2 text-[12px] font-medium text-[#B42318]">
          {standbyError}
        </p>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
        {label}
      </label>
      {children}
    </div>
  );
}