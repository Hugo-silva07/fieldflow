import { ArrowLeftRight, CheckCircle, Clock3 } from "lucide-react";

export type HistoryStatus = "Finalizada" | "Standby" | "Reatribuída";

export type HistoryItem = {
  id: string;
  shopId: string;
  taskType: string;
  description: string;
  time: string;
  status: HistoryStatus;
};

const historyStyles: Record<
  HistoryStatus,
  {
    icon: typeof CheckCircle;
    iconColor: string;
    iconBg: string;
    badgeClass: string;
  }
> = {
  Finalizada: {
    icon: CheckCircle,
    iconColor: "#16A34A",
    iconBg: "#DCFCE7",
    badgeClass: "bg-[#DCFCE7] text-[#16A34A]",
  },
  Standby: {
    icon: Clock3,
    iconColor: "#D97706",
    iconBg: "#FEF3C7",
    badgeClass: "bg-[#FEF3C7] text-[#D97706]",
  },
  Reatribuída: {
    icon: ArrowLeftRight,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
    badgeClass: "bg-[#DBEAFE] text-[#2563EB]",
  },
};

type RecentHistoryProps = {
  items: HistoryItem[];
};

export function RecentHistory({ items }: RecentHistoryProps) {
  return (
    <section className="w-full rounded-[14px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[18px] font-bold leading-6 text-[#0F172A]">
          Histórico recente
        </h3>

        <span className="text-[11px] font-semibold text-[#94A3B8]">
          Últimas ações
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-[13px] font-medium text-[#64748B]">
          Nenhuma ação registrada ainda.
        </div>
      ) : (
        <div>
          {items.slice(0, 4).map((item, index) => {
            const style = historyStyles[item.status];
            const Icon = style.icon;

            return (
              <div
                key={item.id}
                className={[
                  "flex items-center justify-between py-2",
                  index !== items.slice(0, 4).length - 1
                    ? "border-b border-[#F1F5F9]"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: style.iconBg }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: style.iconColor }}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold leading-5 text-[#0F172A]">
                      {item.shopId} - {item.taskType}
                    </p>
                    <p className="text-[11px] leading-4 text-[#64748B]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] leading-4 text-[#64748B]">
                    {item.time}
                  </span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4",
                      style.badgeClass,
                    ].join(" ")}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}