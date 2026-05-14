import { CheckCircle, PauseCircle, UserRoundPlus } from "lucide-react";

type DemandActionsProps = {
  onFinish: () => void;
  onStandby: () => void;
  onReassign: () => void;
};

export function DemandActions({
  onFinish,
  onStandby,
  onReassign,
}: DemandActionsProps) {
  return (
    <section className="h-[124px] w-full rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <h3 className="mb-4 text-[18px] font-bold leading-6 text-[#0F172A]">
        Ações rápidas
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <ActionCard
          icon={<CheckCircle />}
          title="Finalizar"
          subtitle="Concluir demanda atual"
          className="border-[#D1FAE5] bg-[#ECFDF5] text-[#16A34A]"
          onClick={onFinish}
        />

        <ActionCard
          icon={<PauseCircle />}
          title="Standby"
          subtitle="Agendar retorno"
          className="border-[#FEF3C7] bg-[#FFFBEB] text-[#D97706]"
          onClick={onStandby}
        />

        <ActionCard
          icon={<UserRoundPlus />}
          title="Reatribuir"
          subtitle="Enviar para reatribuição"
          className="border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]"
          darkTitle
          onClick={onReassign}
        />
      </div>
    </section>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  className,
  darkTitle = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  className: string;
  darkTitle?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-[60px] items-center gap-3 rounded-[10px] border px-4 text-left transition hover:brightness-[0.98] active:scale-[0.99]",
        className,
      ].join(" ")}
    >
      <span className="shrink-0 [&>svg]:h-[21px] [&>svg]:w-[21px]">
        {icon}
      </span>

      <span>
        <span
          className={[
            "block text-[14px] font-bold leading-5",
            darkTitle ? "text-[#0F172A]" : "",
          ].join(" ")}
        >
          {title}
        </span>
        <span className="block text-[12px] leading-4 text-[#64748B]">
          {subtitle}
        </span>
      </span>
    </button>
  );
}