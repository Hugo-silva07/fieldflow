"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock3, User } from "lucide-react";

export type DemandStatus =
  | "Em andamento"
  | "Finalizada"
  | "Em standby"
  | "Reatribuída";

export type CurrentDemand = {
  id?: number;
  shopId: string;
  taskType: string;
  assignedTo: string;
  assignedAt: string;
  status: DemandStatus;
  returnTo?: string;
  lastUpdate: string;
};

type DemandCurrentCardProps = {
  demand: CurrentDemand;
};

const statusStyles: Record<DemandStatus, string> = {
  "Em andamento": "bg-[#EFF6FF] text-[#2563EB]",
  Finalizada: "bg-[#ECFDF5] text-[#16A34A]",
  "Em standby": "bg-[#FFFBEB] text-[#D97706]",
  Reatribuída: "bg-[#EFF6FF] text-[#2563EB]",
};

const tmaStyles = {
  normal: "bg-[#ECFDF3] text-[#027A48]",
  warning: "bg-[#FFFAEB] text-[#B54708]",
  critical: "bg-[#FEF3F2] text-[#B42318]",
};

export function DemandCurrentCard({ demand }: DemandCurrentCardProps) {
  const [elapsedTime, setElapsedTime] = useState(
    getElapsedTime(demand.assignedAt)
  );

  const tmaStatus = getTmaStatus(demand.assignedAt);

  useEffect(() => {
    setElapsedTime(getElapsedTime(demand.assignedAt));

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(demand.assignedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [demand.assignedAt]);

  return (
    <section
  className={[
    "h-[253px] w-full rounded-[14px] border bg-white px-6 py-5 transition-all duration-500",
    tmaStatus.label === "TMA CRÍTICO"
      ? "border-[#F04438] shadow-[0_0_0_3px_rgba(240,68,56,0.15)]"
      : "border-[#E5E7EB] shadow-[0_4px_12px_rgba(15,23,42,0.06)]",
  ].join(" ")}
>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold leading-6 text-[#0F172A]">
          Demanda Atual
        </h2>

        <div className="flex items-center gap-2">
          <span
            className={[
              "inline-flex h-[24px] items-center rounded-full px-3 text-[12px] font-bold leading-4",
              statusStyles[demand.status],
            ].join(" ")}
          >
            {demand.status.toUpperCase()}
          </span>

          <span
            className={[
              "inline-flex h-[24px] items-center rounded-full px-3 text-[12px] font-bold leading-4",
              tmaStatus.style,
            ].join(" ")}
          >
            {tmaStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[76px_1fr_1fr_1fr] items-center gap-x-7">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[12px] bg-[#EFF6FF]">
          <ClipboardList className="h-[32px] w-[32px] text-[#2563EB]" />
        </div>

        <Info label="ShoppID" value={demand.shopId} />
        <Info label="Tipo de tarefa" value={demand.taskType} />
        <Info label="Atribuído para" value={demand.assignedTo} nowrap />
      </div>

      <div className="my-4 border-t border-[#E5E7EB]" />

      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <Meta icon={<Clock3 />} label="Atribuída em" value={formatAssignedAt(demand.assignedAt)} />
        <Meta icon={<Clock3 />} label="Tempo em andamento" value={elapsedTime} blue />
        <Meta icon={<User />} label="Retornar para" value={demand.returnTo || "-"} />
        <Meta label="Última atualização" value={demand.lastUpdate} />
      </div>
    </section>
  );
}

function getElapsedTime(assignedAt: string) {
  const start = new Date(assignedAt).getTime();

  if (Number.isNaN(start)) return "--";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function getTmaStatus(assignedAt: string) {
  const start = new Date(assignedAt).getTime();

  if (Number.isNaN(start)) {
    return {
      label: "TMA NORMAL",
      style: tmaStyles.normal,
    };
  }

  const diffMinutes = Math.floor((Date.now() - start) / 1000 / 60);

  if (diffMinutes >= 25) {
    return {
      label: "TMA CRÍTICO",
      style: tmaStyles.critical,
    };
  }

  if (diffMinutes >= 15) {
    return {
      label: "TMA ATENÇÃO",
      style: tmaStyles.warning,
    };
  }

  return {
    label: "TMA NORMAL",
    style: tmaStyles.normal,
  };
}

function formatAssignedAt(assignedAt: string) {
  const date = new Date(assignedAt);

  if (Number.isNaN(date.getTime())) {
    return assignedAt;
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Info({
  label,
  value,
  nowrap = false,
}: {
  label: string;
  value: string;
  nowrap?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium leading-4 text-[#64748B]">
        {label}
      </p>
      <p
        className={[
          "mt-1 text-[16px] font-bold leading-5 text-[#0F172A]",
          nowrap ? "whitespace-nowrap" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
  blue = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  blue?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[12px] leading-5">
      <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center text-[#64748B] [&>svg]:h-[15px] [&>svg]:w-[15px]">
        {icon}
      </span>
      <span className="text-[#64748B]">
        {label}{" "}
        <span
          className={
            blue ? "font-bold text-[#2563EB]" : "font-bold text-[#0F172A]"
          }
        >
          {value}
        </span>
      </span>
    </div>
  );
}