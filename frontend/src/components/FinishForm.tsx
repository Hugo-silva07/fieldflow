"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

type FinishReason =
  | "Tarefa concluída com sucesso"
  | "Tarefa não realizada";

type FinishFormProps = {
  isFinishing?: boolean;
  finishError?: string;
  onConfirm: (data: {
    reason: FinishReason;
    observation: string;
  }) => void | Promise<void>;
};

export function FinishForm({
  onConfirm,
  isFinishing = false,
  finishError = "",
}: FinishFormProps) {

  const [reason, setReason] = useState<FinishReason>(
    "Tarefa concluída com sucesso"
  );
  const [observation, setObservation] = useState("");
  
  const observationRequired = reason === "Tarefa não realizada";
  const canConfirm = !observationRequired || observation.trim().length > 0;

  async function handleConfirm() {
  if (!canConfirm || isFinishing) return;

  await onConfirm({ reason, observation });
}

  return (
    <section className="h-[178px] w-full rounded-[14px] border border-[#EAECF0] bg-white px-5 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <h3 className="mb-3 text-[16px] font-bold leading-6 text-[#0F172A]">
        Finalizar demanda
      </h3>

      <div className="mb-3">
        <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
          Motivo
        </label>

        <select
          value={reason}
          disabled={isFinishing}
          onChange={(event) => setReason(event.target.value as FinishReason)}
          className="h-8 w-full rounded-[10px] border border-[#EAECF0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
        >
          <option>Tarefa concluída com sucesso</option>
          <option>Tarefa não realizada</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
          Observação {observationRequired ? "(obrigatória)" : "(opcional)"}
        </label>

        <textarea
          value={observation}
          disabled={isFinishing}
          onChange={(event) => setObservation(event.target.value)}
          placeholder={
            observationRequired
              ? "Explique por que a tarefa não foi realizada"
              : "Adicione uma observação, se necessário"
          }
          className="h-[46px] w-full resize-none rounded-[10px] border border-[#EAECF0] bg-white p-3 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
        />
      </div>

      <button
        type="button"
        disabled={!canConfirm || isFinishing}
        onClick={handleConfirm}
        className={[
          "flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[14px] font-semibold text-white transition",
          canConfirm && !isFinishing
            ? "bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99]"
            : "cursor-not-allowed bg-[#94A3B8]",
        ].join(" ")}
      >
        <CheckCircle className="h-4 w-4" />
        {isFinishing ? "Salvando..." : "Confirmar finalização"}
      </button>

     {finishError && (
        <p className="mt-2 text-[12px] font-medium text-[#B42318]">
          {finishError}
        </p>
      )} 
    </section>
  );
}