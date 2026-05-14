import {
  CheckCircle,
  PauseCircle,
  ArrowLeftRight,
  Clock,
} from "lucide-react";

type Period = "today" | "week" | "month";

type PerformanceSummaryProps = {
  finishedCount: number;
  standbyCount: number;
  reassignedCount: number;
  averageTma: string;
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
};

const periodLabels: Record<Period, string> = {
  today: "Hoje",
  week: "Semana",
  month: "Mês",
};

export function PerformanceSummary({
  finishedCount,
  standbyCount,
  reassignedCount,
  averageTma,
  selectedPeriod,
  onPeriodChange,
}: PerformanceSummaryProps) {
  return (
    <section className="relative w-full rounded-[14px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[18px] font-bold leading-6 text-[#0F172A]">
          Resumo de desempenho
        </h3>

        <select
          value={selectedPeriod}
          onChange={(event) => onPeriodChange(event.target.value as Period)}
          className="h-8 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#64748B] outline-none"
        >
          <option value="today">{periodLabels.today}</option>
          <option value="week">{periodLabels.week}</option>
          <option value="month">{periodLabels.month}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          value={finishedCount}
          label="Finalizadas"
          labelClass="text-[#16A34A]"
          bgClass="bg-[#ECFDF5]"
          iconBgClass="bg-[#D1FAE5]"
          icon={<CheckCircle className="h-5 w-5 text-[#16A34A]" />}
        />

        <SummaryCard
          value={standbyCount}
          label="Em standby"
          labelClass="text-[#D97706]"
          bgClass="bg-[#FFFBEB]"
          iconBgClass="bg-[#FEF3C7]"
          icon={<PauseCircle className="h-5 w-5 text-[#D97706]" />}
        />

        <SummaryCard
          value={reassignedCount}
          label="Reatribuídas"
          labelClass="text-[#0F172A]"
          bgClass="bg-[#EFF6FF]"
          iconBgClass="bg-[#DBEAFE]"
          icon={<ArrowLeftRight className="h-5 w-5 text-[#2563EB]" />}
        />

        <SummaryCard
          value={averageTma}
          label="TMA médio"
          labelClass="text-[#0F172A]"
          bgClass="bg-[#F5F3FF]"
          iconBgClass="bg-[#EDE9FE]"
          icon={<Clock className="h-5 w-5 text-[#7C3AED]" />}
        />
      </div>
    </section>
  );
}

function SummaryCard({
  value,
  label,
  icon,
  bgClass,
  iconBgClass,
  labelClass,
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  iconBgClass: string;
  labelClass: string;
}) {
  return (
    <div
      className={`flex h-[74px] items-center gap-3 rounded-[12px] px-4 ${bgClass}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${iconBgClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[20px] font-bold text-[#0F172A]">{value}</p>
        <p className={`text-[12px] font-bold ${labelClass}`}>{label}</p>
      </div>
    </div>
  );
}