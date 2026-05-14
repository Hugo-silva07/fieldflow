import { Headphones } from "lucide-react";

export function HelpCard() {
  return (
    <section className="h-[68px] rounded-[14px] border border-[#BAE6FD] bg-[#E0F2FE] px-4 py-3">
      <div className="flex h-full items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]">
          <Headphones className="h-5 w-5 text-[#2563EB]" />
        </div>

        <div className="flex-1">
          <h3 className="text-[14px] font-bold leading-5 text-[#0F172A]">
            Precisa de ajuda?
          </h3>

          <p className="text-[12px] leading-4 text-[#0369A1]">
            Entre em contato com o coordenador
          </p>
        </div>

        <button className="h-8 rounded-[8px] bg-white px-3 text-[12px] font-semibold text-[#0369A1]">
          Abrir chamado
        </button>
      </div>
    </section>
  );
}