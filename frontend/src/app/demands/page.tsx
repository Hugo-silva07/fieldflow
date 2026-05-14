  "use client";

  import { useEffect, useState } from "react";
  import { AppShell } from "@/components/AppShell";
  import { CurrentDemand, DemandCurrentCard } from "@/components/DemandCurrentCard";
  import { DemandActions } from "@/components/DemandActions";
  import { PerformanceSummary } from "@/components/PerformanceSummary";
  import { StandbyForm } from "@/components/StandbyForm";
  import { RecentHistory, HistoryItem } from "@/components/RecentHistory";
  import { HelpCard } from "@/components/HelpCard";
  import { FinishForm } from "@/components/FinishForm";
  import { ReassignForm, StandbyDemand } from "@/components/ReassignForm";
  import { apiGet, apiPost } from "@/lib/api";

  function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  }

  function saveToStorage(key: string, value: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  export default function DemandsPage() {
    const [currentDemand, setCurrentDemand] = useState<CurrentDemand | null>(
      () => loadFromStorage("currentDemand", null)
    );
  
    const [standbyDemands, setStandbyDemands] = useState<StandbyDemand[]>(
      () => loadFromStorage("standby", [])
    );

    const [history, setHistory] = useState<HistoryItem[]>(
      () => loadFromStorage("history", [])
    );

    const [metrics, setMetrics] = useState(() =>
      loadFromStorage("metrics", {
        finished: 0,
        standby: 0,
        reassigned: 0,
        average_minutes: 0,
      })
    );

    const [queueStatus, setQueueStatus] = useState({
      interrupted: 0,
    });

    const [selectedPeriod, setSelectedPeriod] = useState<
      "today" | "week" | "month"
    >("today");

    const [showStandbyForm, setShowStandbyForm] = useState(false);
    const [showFinishForm, setShowFinishForm] = useState(false);
    const [showReassignForm, setShowReassignForm] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [analystName, setAnalystName] = useState("Analista");
    const [isPullingDemand, setIsPullingDemand] = useState(false);
    const [demandError, setDemandError] = useState("");
    const [isOffline, setIsOffline] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [finishError, setFinishError] = useState("");
    const [standbyError, setStandbyError] = useState("");
    const [reassignError, setReassignError] = useState("");
    
    
    useEffect(() => saveToStorage("currentDemand", currentDemand), [currentDemand]);
    useEffect(() => saveToStorage("standby", standbyDemands), [standbyDemands]);
    useEffect(() => saveToStorage("metrics", metrics), [metrics]);
    useEffect(() => saveToStorage("history", history), [history]);
    
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setIsMounted(true);

    loadStandbyDemands();
    loadHistory();
    loadSummary();
    loadCurrentUser();
    loadCurrentDemand();
    loadQueueStatus();

    const interval = setInterval(() => {
      loadStandbyDemands();
      loadHistory();
      loadSummary();
      loadCurrentDemand();
      loadQueueStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

    function getNowPtBr() {
      return new Date().toLocaleString("pt-BR");
    }

    function closeForms() {
      setShowStandbyForm(false);
      setShowFinishForm(false);
      setShowReassignForm(false);
    }

    async function pullNextDemand() {
      setIsPullingDemand(true);
      setDemandError("");

      try {
        setIsOffline(false);

        const response = await apiPost("/demands/assign-next/");

        if (response?.data) {
          const item = response.data;

          setCurrentDemand({
            id: item.id,
            shopId: item.shop_id,
            taskType: item.title || item.external_id || "-",
            assignedTo: analystName,
            assignedAt: item.assigned_at || new Date().toISOString(),
            status: "Em andamento",
            returnTo: "",
            lastUpdate: item.updated_at || "-",
          });

          return;
        }

        setCurrentDemand(null);
      } catch (err) {
        console.error("Erro ao buscar próxima demanda no backend.", err);

        setDemandError(
          "Não foi possível buscar uma demanda. Tente novamente."
        );

        setIsOffline(true);
      } finally {
        setIsPullingDemand(false);
      }
    }

    async function loadStandbyDemands() {
    try {
      setIsOffline(false); 
      const response = await apiGet("/demands/standby/");

      if (!response?.data) return;

      const mapped = response.data.map((item: any) => ({
        id: item.id,
        shopId: item.shop_id,
        taskType: item.title || item.external_id || "-",
        assignedTo: analystName,
        assignedAt: item.assigned_at || "-",
        status: "Standby",
        returnTo: "",
        lastUpdate: item.updated_at || "-",
        standbyReason: item.standby_reason || "-",
        returnDate: item.retry_at || "-",
        observation: item.standby_note || "",
      }));

      setStandbyDemands(mapped);
    } catch (err) {
      console.error("Erro ao carregar standby", err);
      setIsOffline(true);
    }
  }

  async function loadHistory() {
    try {
      setIsOffline(false); 
      const response = await apiGet("/demands/history/");

      if (!response?.data) return;

      const mapped: HistoryItem[] = response.data.map((item: any) => ({
        id: String(item.id),
        shopId: item.shop_id,
        taskType: item.task_type,
        description:
          item.action === "INTERRUPTED"
            ? "Demanda interrompida automaticamente."
            : item.observation || "-",
        time: new Date(item.created_at).toLocaleString("pt-BR"),
        status:
          item.action === "REASSIGNED" || item.action === "ASSIGNED"
            ? "Reatribuída"
            : item.action === "PUT_ON_STANDBY" || item.action === "INTERRUPTED"
            ? "Standby"
            : "Finalizada",
      }));

      setHistory(mapped.slice(0, 50));
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
      setIsOffline(true);
    }
  }

  async function loadSummary() {
    try {
      setIsOffline(false); 
      const response = await apiGet("/demands/summary/");

      if (!response?.data) return;

      setMetrics({
        finished: response.data.finished || 0,
        standby: response.data.standby || 0,
        reassigned: response.data.reassigned || 0,
        average_minutes: response.data.average_minutes || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar resumo", err);
      setIsOffline(true);
    }
  }

  async function loadQueueStatus() {
    try {
      setIsOffline(false);

      const response = await apiGet("/demands/queue-status/");

      if (!response?.data) return;

      setQueueStatus({
        interrupted: response.data.interrupted || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar status da fila", err);
      setIsOffline(true);
    }
  }

  async function loadCurrentUser() {
    try {
      setIsOffline(false);

      const response = await apiGet("/accounts/me/");

      if (!response?.data) return;

      setCurrentUserId(response.data.id);
      setAnalystName(response.data.username || "Analista");
    } catch (err) {
      console.error("Erro ao carregar usuário", err);
      setIsOffline(true);
    }
  }

  async function loadCurrentDemand() {
    try {
      setIsOffline(false);
      const response = await apiGet("/demands/current/");

      if (!response?.data) {
        setCurrentDemand(null);
        return;
      }

      const item = response.data;

      setCurrentDemand({
        id: item.id,
        shopId: item.shop_id,
        taskType: item.title || item.external_id || "-",
        assignedTo: analystName,
        assignedAt: item.assigned_at || "-",
        status: "Em andamento",
        returnTo: "",
        lastUpdate: item.updated_at || "-",
      });
    } catch (err) {
      console.error("Erro ao carregar demanda atual", err);
      setIsOffline(true);
    }
  }
        
    if (!isMounted) return null;

    return (
      <AppShell>
        {isOffline && (
      <div className="mb-3 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B42318]">
        Conexão instável com o servidor. Algumas informações podem estar desatualizadas.
      </div>
    )}

        <div className="grid grid-cols-[696px_500px] gap-4">
          <div className="flex flex-col gap-1">
            {currentDemand ? (
              <DemandCurrentCard demand={currentDemand} />
            ) : (
              <section className="h-[253px] w-full rounded-[14px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
                <h2 className="text-[18px] font-bold leading-6 text-[#0F172A]">
                  Demanda Atual
                </h2>

                <div className="mt-16 text-center">
                  <p className="text-[16px] font-bold text-[#0F172A]">
                    Não há tarefas disponíveis
                  </p>

                  <p className="mt-1 text-[13px] text-[#64748B]">
                    Que tal tomar um café?
                  </p>

                  <button
                    type="button"
                    disabled={isPullingDemand}
                    onClick={pullNextDemand}
                    className="mt-5 h-10 rounded-[10px] bg-[#2563EB] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    {isPullingDemand
                      ? "Buscando..."
                      : queueStatus.interrupted > 0
                      ? "Retomar demanda interrompida"
                      : "Pegar próxima demanda"}
                  </button>

                  {demandError && (
                    <p className="mt-3 text-[12px] font-medium text-[#B42318]">
                      {demandError}
                    </p>
                  )}
                </div>
              </section>  
            )}

            {currentDemand && (
              <DemandActions
                onFinish={() => {
                  closeForms();
                  setShowFinishForm(true);
                }}
                onStandby={() => {
                  closeForms();
                  setShowStandbyForm(true);
                }}
                onReassign={() => {
                  closeForms();
                  setShowReassignForm(true);
                }}
              />
            )}

            {showFinishForm && currentDemand && (
              <FinishForm
                isFinishing={isFinishing}
                finishError={finishError}
                onConfirm={async (data) => {
                  try {
                    setIsFinishing(true);
                    setFinishError("");
                    setIsOffline(false);

                    if (currentDemand.id) {
                      await apiPost(
                        `/demands/${currentDemand.id}/change-status/`,
                        {
                          new_status: "FINISHED",
                          observation: data.observation || data.reason,
                        }
                      );
                    }

                    setMetrics((m) => ({
                      ...m,
                      finished: m.finished + 1,
                    }));

                    setHistory((prev) => [
                      {
                        id: Date.now().toString(),
                        shopId: currentDemand.shopId,
                        taskType: currentDemand.taskType,
                        description: data.reason,
                        time: getNowPtBr(),
                        status: "Finalizada",
                      },
                      ...prev,
                    ]);

                    closeForms();
                    setCurrentDemand(null);

                    pullNextDemand();

                    loadHistory();
                    loadSummary();
                    loadStandbyDemands();

                  } catch (err) {
                    console.error("Erro ao finalizar", err);

                    setFinishError(
                      "Não foi possível finalizar a demanda."
                    );

                    setIsOffline(true);
                  } finally {
                    setIsFinishing(false);
                  }
                }}
              />
            )}

            {showStandbyForm && currentDemand && (
              <StandbyForm
                standbyError={standbyError}
                onConfirm={async (data) => {
                  setStandbyError("");
                  setIsOffline(false);
                  try {
                    if (currentDemand.id) {
                      await apiPost(`/demands/${currentDemand.id}/standby/`, {
                        reason: data.reason,
                        retry_at: data.returnDate,
                        note: data.observation,
                      });
                    }

                    setMetrics((m) => ({ ...m, standby: m.standby + 1 }));

                    setStandbyDemands((prev) => [
                      ...prev,
                      {
                        ...currentDemand,
                        standbyReason: data.reasonLabel,
                        returnDate: data.returnDate,
                        observation: data.observation,
                        lastUpdate: getNowPtBr(),
                      },
                    ]);

                    closeForms();
                    setCurrentDemand(null);

                    pullNextDemand();

                    loadHistory();
                    loadSummary();
                    loadStandbyDemands();
                  } catch (err) {
                    console.error("Erro ao colocar em standby", err);

                    setStandbyError(
                      "Não foi possível colocar a demanda em standby."
                    );

                    setIsOffline(true);
                  }
                  }}
              />
            )}

              {(showReassignForm || !currentDemand) && (
              <ReassignForm
                demands={standbyDemands}
                reassignError={reassignError}
                onConfirm={async (demand) => {
                  setReassignError("");
                  setIsOffline(false);
                  
                  try {
                    if (demand.id) {
                      await apiPost(`/demands/${demand.id}/reassign/`, {
                        new_user_id: currentUserId || undefined,
                        note: "Demanda retomada pelo analista",
                        start_immediately: !currentDemand,
                      });
                    }

                    setMetrics((m) => ({
                      ...m,
                      reassigned: m.reassigned + 1,
                    }));

                    if (!currentDemand) {
                      setCurrentDemand({
                        ...demand,
                        status: "Em andamento",
                        assignedTo: analystName,
                        lastUpdate: getNowPtBr(),
                        returnTo: analystName,
                      });
                    }
                  loadStandbyDemands();
                  loadHistory();
                  loadSummary();

                  closeForms();
                  } catch (err) {
                    console.error("Erro ao reatribuir demanda", err);

                    setReassignError(
                      "Não foi possível reatribuir a demanda."
                    );

                    setIsOffline(true);
                  }
                }}
              />
            )}
              </div>
          
          <div className="flex flex-col gap-1">
            <PerformanceSummary
              finishedCount={metrics.finished}
              standbyCount={metrics.standby}
              reassignedCount={metrics.reassigned}
              averageTma={
                metrics.average_minutes > 0
                  ? (() => {
                      const totalMinutes = metrics.average_minutes;

                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;

                      if (hours <= 0) {
                        return `${minutes}min`;
                      }

                      return `${hours}h ${minutes}min`;
                    })()
                  : "--"
              }
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />

            <RecentHistory items={history} />

            <HelpCard />
          </div>
        </div>
      </AppShell>
    );
  }
