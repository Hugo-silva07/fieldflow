"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  HelpCircle,
  Home,
  Settings,
  LogOut,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("username") || "Analista"
      : "Analista";

const firstLetter = username.charAt(0).toUpperCase();

function formatAnalystName(login: string) {
  return login
    .replace("_v", "")
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const displayName = formatAnalystName(username);
  
  async function handleLogout() {
  const token = localStorage.getItem("token");

  try {
    await fetch("http://localhost:8000/api/demands/interrupt-current/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ reason: "Logout do analista" }),
    });
  } catch (err) {
    console.error("Erro ao interromper demanda no logout", err);
  } finally {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 flex h-screen w-[229px] flex-col justify-between bg-[#101828] py-8">
        <div>
          <div className="mb-10 flex h-[100px] items-center px-8 pt-8">
            <img src="/logo-99food.png" alt="99Food" className="h-33 w-auto" />
          </div>

          <nav className="space-y-1">
            <NavItem icon={<Home />} label="Dashboard" />
            <NavItem active icon={<ClipboardList />} label="Demandas" />
            <NavItem icon={<Clock3 />} label="Standby" />
            <NavItem icon={<BarChart3 />} label="Histórico" />
            <NavItem icon={<FileText />} label="Relatórios" />
          </nav>

          <div className="my-4 border-t border-[#1D2939]" />

          <nav className="space-y-1">
            <NavItem icon={<Settings />} label="Configurações" />
            <NavItem icon={<HelpCircle />} label="Ajuda" />
          </nav>
        </div>

        {/* USUÁRIO SIDEBAR */}
        <div className="border-t border-[#1D2939] pt-3 relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex w-full items-center gap-4 px-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34D399] text-white font-semibold">
              {firstLetter}
            </div>

            <div className="flex-1 text-left">
              <div className="text-[15px] font-semibold text-white">
                {displayName}
              </div>
              <div
                className={[
                  "text-[12px]",
                  isAvailable ? "text-[#22C55E]" : "text-[#F59E0B]",
                ].join(" ")}
              >
                ● {isAvailable ? "Online" : "Em pausa"}
              </div>
            </div>

            <ChevronDown className="h-4 w-4 text-[#CBD5E1]" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-14 left-4 w-[180px] rounded-[10px] bg-white shadow-lg">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F5F7FA]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[229px] min-h-screen px-11 py-2">
        <header className="mb-5 flex h-[72px] items-center justify-between">
          <div>
            <h1 className="text-[30px] font-bold text-[#0F172A]">
              Portal do Analista
            </h1>
            <p className="text-[14px] text-[#667085]">
              Gerencie suas demandas e acompanhe seu desempenho
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* STATUS */}
            <button
              onClick={() => setIsAvailable((prev) => !prev)}
              className={[
                "flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold",
                isAvailable
                  ? "bg-[#ECFDF3] text-[#067647]"
                  : "bg-[#FFFBEB] text-[#B45309]",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  isAvailable ? "bg-[#12B76A]" : "bg-[#F59E0B]",
                ].join(" ")}
              />
              {isAvailable ? "Disponível" : "Em pausa"}
            </button>

            {/* NOTIFICAÇÃO */}
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] hover:bg-[#F2F4F7]">
              <Bell className="h-5 w-5 text-[#64748B]" />
            </div>

            {/* AVATAR SIMPLES */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34D399] text-white font-semibold cursor-pointer">
              A
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

/* NAV ITEM */
function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex h-11 items-center gap-3 rounded-[10px] px-3 text-[14px]",
        active ? "bg-[#1F2937] text-white" : "text-[#CBD5E1]",
      ].join(" ")}
    >
      {icon}
      {label}
    </div>
  );
}