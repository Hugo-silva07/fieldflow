"use client";

import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import type { CurrentDemand } from "@/components/DemandCurrentCard";

export type StandbyDemand = CurrentDemand & {
  standbyReason: string;
  returnDate: string;
  observation: string;
};

type ReassignFormProps = {
  demands: StandbyDemand[];
  reassignError?: string;
  onConfirm: (demand: StandbyDemand) => void | Promise<void>;
};

export function ReassignForm({
  demands,
  reassignError = "",
  onConfirm,
}: ReassignFormProps) {
  const [selectedDemandId, setSelectedDemandId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedDemand = demands.find(
    (demand) => demand.shopId === selectedDemandId
  );

  async function handleConfirm() {
    if (!selectedDemand || isSaving) return;

    try {
      setIsSaving(true);
      await onConfirm(selectedDemand);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="w-full rounded-[14px] border border-[#EAECF0] bg-white px-5 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <h3 className="mb-3 text-[16px] font-bold leading-6 text-[#0F172A]">
        Reatribuir demanda em standby
      </h3>

      {demands.length === 0 ? (
        <div className="rounded-[10px] border border-[#EAECF0] bg-[#F8FAFC] px-3 py-3 text-[13px] text-[#64748B]">
          Nenhuma demanda em standby disponível para reatribuição.
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-2">
            {demands.map((demand) => (
              <label
                key={demand.shopId}
                className={[
                  "flex items-start gap-3 rounded-[10px] border px-3 py-2 transition",
                  isSaving ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                  selectedDemandId === demand.shopId
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#EAECF0] bg-white hover:bg-[#F8FAFC]",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="standbyDemand"
                  value={demand.shopId}
                  checked={selectedDemandId === demand.shopId}
                  disabled={isSaving}
                  onChange={() => setSelectedDemandId(demand.shopId)}
                  className="mt-1 h-4 w-4"
                />

                <span className="flex-1">
                  <span className="block text-[13px] font-bold text-[#0F172A]">
                    {demand.shopId} • {demand.taskType}
                  </span>

                  <span className="block text-[12px] text-[#64748B]">
                    Motivo: {demand.standbyReason}
                  </span>

                  <span className="block text-[12px] text-[#64748B]">
                    Retorno: {demand.returnDate}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <button
            type="button"
            disabled={!selectedDemand || isSaving}
            onClick={handleConfirm}
            className={[
              "flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[14px] font-semibold text-white transition",
              selectedDemand && !isSaving
                ? "bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99]"
                : "cursor-not-allowed bg-[#94A3B8]",
            ].join(" ")}
          >
            <UserRoundPlus className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Confirmar reatribuição"}
          </button>

          {reassignError && (
            <p className="mt-2 text-[12px] font-medium text-[#B42318]">
              {reassignError}
            </p>
          )}
        </>
      )}
    </section>
  );
}