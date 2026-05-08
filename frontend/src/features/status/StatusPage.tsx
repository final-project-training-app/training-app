import { useEffect, useMemo, useRef, useState } from "react";

type RuntimeStatus = "checking" | "online" | "offline" | "protected";

type Desk = "FE" | "API" | "TOOL" | "AUTH";

type CheckTarget = {
  id: string;
  ticker: string;
  desk: Desk;
  name: string;
  tagline: string;
  url: string;
  shortPath: string;
  method: "GET" | "POST";
  expectedStatuses?: number[];
  protectedStatuses?: number[];
  fetchMode?: RequestMode;
};

type CheckResult = {
  status: RuntimeStatus;
  checkedAt: string;
  statusCode?: number;
  latencyMs?: number;
};

const REFRESH_INTERVAL_MS = 30_000;

// LÄGG TILL nya endpoints här — de dyker upp i tabellen vid nästa auto-refresh
// och glöder grönt i 6 sekunder när de är uppe för första gången.
const targets: CheckTarget[] = [
  {
    id: "fe-railway",
    ticker: "FE.RW",
    desk: "FE",
    name: "Frontend shell",
    tagline: "React-appen på TVn. Om denna är nere ser ingen någonting.",
    url: "https://frontend-training.up.railway.app",
    shortPath: "/",
    method: "GET",
    fetchMode: "no-cors",
  },
  {
    id: "be-hi",
    ticker: "HI.PNG",
    desk: "API",
    name: "Heartbeat",
    tagline: "Säger hej. Om hej är trasigt har vi större problem.",
    url: "https://backend-training.up.railway.app/api/hi",
    shortPath: "/api/hi",
    method: "GET",
    expectedStatuses: [200],
  },
  {
    id: "be-workouts",
    ticker: "WO.LST",
    desk: "API",
    name: "Workout list",
    tagline: "Hela katalogen. AI:n hämtar övningar härifrån.",
    url: "https://backend-training.up.railway.app/api/workouts",
    shortPath: "/api/workouts",
    method: "GET",
    expectedStatuses: [200],
  },
  {
    id: "be-workout-detail",
    ticker: "WO.DTL",
    desk: "TOOL",
    name: "Workout details",
    tagline: "get_workout_details — kärnan i tränings-konversationen.",
    url: "https://backend-training.up.railway.app/api/workouts/1",
    shortPath: "/api/workouts/:id",
    method: "GET",
    expectedStatuses: [200],
  },
  {
    id: "be-progress",
    ticker: "US.PRG",
    desk: "TOOL",
    name: "User progress",
    tagline: "get_user_progress — streaks och feel-good-siffror.",
    url: "https://backend-training.up.railway.app/api/users/1/progress",
    shortPath: "/api/users/:id/progress",
    method: "GET",
    expectedStatuses: [200],
  },
  {
    id: "be-user-profile",
    ticker: "US.PRO",
    desk: "AUTH",
    name: "User profile",
    tagline: "Skyddad. 401/403 = vakten gör sitt jobb. Inte nere.",
    url: "https://backend-training.up.railway.app/api/users/1",
    shortPath: "/api/users/:id",
    method: "GET",
    expectedStatuses: [200],
    protectedStatuses: [401, 403],
  },
];

function getInitialResults(): Record<string, CheckResult> {
  const stamp = new Date().toISOString();
  return Object.fromEntries(
    targets.map((target) => [
      target.id,
      { status: "checking" as RuntimeStatus, checkedAt: stamp },
    ]),
  );
}

async function checkTarget(target: CheckTarget): Promise<CheckResult> {
  const startedAt = performance.now();

  try {
    const response = await fetch(target.url, {
      method: target.method,
      mode: target.fetchMode,
      cache: "no-store",
    });

    const latencyMs = Math.round(performance.now() - startedAt);

    if (target.fetchMode === "no-cors") {
      return {
        status: "online",
        checkedAt: new Date().toISOString(),
        latencyMs,
      };
    }

    if (target.protectedStatuses?.includes(response.status)) {
      return {
        status: "protected",
        checkedAt: new Date().toISOString(),
        statusCode: response.status,
        latencyMs,
      };
    }

    if ((target.expectedStatuses ?? [200]).includes(response.status)) {
      return {
        status: "online",
        checkedAt: new Date().toISOString(),
        statusCode: response.status,
        latencyMs,
      };
    }

    return {
      status: "offline",
      checkedAt: new Date().toISOString(),
      statusCode: response.status,
      latencyMs,
    };
  } catch {
    return {
      status: "offline",
      checkedAt: new Date().toISOString(),
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusStyle(status: RuntimeStatus) {
  switch (status) {
    case "online":
      return {
        label: "LIVE",
        text: "text-emerald-300",
        chip: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
        dot: "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)] dot-breathe",
      };
    case "protected":
      return {
        label: "SKYDDAD",
        text: "text-cyan-200",
        chip: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
        dot: "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.7)] dot-breathe",
      };
    case "offline":
      return {
        label: "AKUT",
        text: "text-red-200",
        chip: "border-red-400/60 bg-red-500/20 text-red-100",
        dot: "bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.95)] alarm-pulse",
      };
    default:
      return {
        label: "SCAN",
        text: "text-amber-200",
        chip: "border-amber-300/40 bg-amber-300/10 text-amber-100",
        dot: "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.7)]",
      };
  }
}

function getDeskStyle(desk: Desk) {
  switch (desk) {
    case "FE":
      return "border-sky-300/40 bg-sky-300/10 text-sky-100";
    case "API":
      return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
    case "TOOL":
      return "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-100";
    case "AUTH":
      return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  }
}

function deltaForResult(result: CheckResult): { label: string; tone: string } {
  if (result.status === "offline")
    return { label: "-99.9%", tone: "text-red-300" };
  if (result.status === "checking")
    return { label: "...", tone: "text-amber-200" };

  const latency = result.latencyMs ?? 0;
  // Lägre latency = större inbillad vinst. Ren kontorshumor.
  const num = Math.max(-4, 12 - latency / 80);
  if (num >= 0)
    return { label: `+${num.toFixed(2)}%`, tone: "text-emerald-300" };
  return { label: `${num.toFixed(2)}%`, tone: "text-red-300" };
}

const HEALTHY_QUIPS = [
  "Marknaden är lugn",
  "Allt rullar — ta en kaffe",
  "Inga larm. Hjärnan kan vila",
  "Stabilt som en deadlift",
  "Servrarna snurrar som katter",
  "Grönt på alla håll",
];

const DOWN_QUIPS = [
  "DÖDSDOM AKTIVERAD",
  "NÅGON MÅSTE FIXA DET NU",
  "PRODUKTIONEN SKRIKER",
  "ALLA HÄNDER PÅ DÄCK",
];

const SCAN_QUIPS = [
  "Öppningsauktionen pågår",
  "Första pingen på väg",
  "Väntar på tickers",
];

export function StatusPage() {
  const [results, setResults] = useState<Record<string, CheckResult>>(() =>
    getInitialResults(),
  );
  const [now, setNow] = useState(() => new Date());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let isCancelled = false;

    async function runChecks() {
      const entries = await Promise.all(
        targets.map(
          async (target) => [target.id, await checkTarget(target)] as const,
        ),
      );

      if (isCancelled) return;

      setResults(Object.fromEntries(entries));

      // Ny endpoint tillagd? Låt den glöda grönt i 6 sek när den dyker upp.
      const newcomers = new Set<string>();
      for (const target of targets) {
        if (!seenIdsRef.current.has(target.id)) {
          newcomers.add(target.id);
          seenIdsRef.current.add(target.id);
        }
      }
      if (newcomers.size > 0) {
        setFreshIds(newcomers);
        window.setTimeout(() => setFreshIds(new Set()), 6000);
      }
    }

    void runChecks();
    const intervalId = window.setInterval(
      () => void runChecks(),
      REFRESH_INTERVAL_MS,
    );
    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = "Training App :: Ops Ticker";
  }, []);

  const tally = useMemo(() => {
    const counts = { online: 0, offline: 0, protected: 0, checking: 0 };
    for (const target of targets) {
      const s = results[target.id]?.status ?? "checking";
      counts[s] += 1;
    }
    return counts;
  }, [results]);

  const pingedCount = targets.length;
  const healthyCount = tally.online + tally.protected;
  const indexPct = ((healthyCount - tally.offline * 5) / pingedCount) * 10;
  const indexLabel = `${indexPct >= 0 ? "+" : ""}${indexPct.toFixed(2)}%`;

  const isDown = tally.offline > 0;
  const isScanning = tally.checking > 0 && !isDown;

  const quipIndex = Math.floor(now.getSeconds() / 5);
  const headline = isDown
    ? DOWN_QUIPS[Math.floor(now.getSeconds() / 15) % DOWN_QUIPS.length]
    : isScanning
      ? SCAN_QUIPS[quipIndex % SCAN_QUIPS.length]
      : HEALTHY_QUIPS[quipIndex % HEALTHY_QUIPS.length];

  const headlineTone = isDown
    ? "text-red-200"
    : isScanning
      ? "text-amber-200"
      : "text-emerald-200";

  return (
    <main className="min-h-dvh bg-[#05070d] text-white">
      <style>{`
        @keyframes ticker-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes alarm-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes dot-breathe {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.8); }
        }
        @keyframes fresh-slide-in {
          0%   { opacity: 0; transform: translateX(-18px); background-color: rgba(16, 185, 129, 0.30); }
          15%  { opacity: 1; transform: translateX(0);     background-color: rgba(16, 185, 129, 0.30); }
          100% { opacity: 1; transform: translateX(0);     background-color: rgba(16, 185, 129, 0); }
        }
        @keyframes scan-line {
          0%   { top: -6%; }
          100% { top: 106%; }
        }
        .ticker-track  { animation: ticker-marquee 55s linear infinite; }
        .alarm-pulse   { animation: alarm-pulse  1.1s ease-in-out infinite; }
        .dot-breathe   { animation: dot-breathe  2.4s ease-in-out infinite; }
        .fresh-row     { animation: fresh-slide-in 6s ease-out forwards; }
        .scan-overlay::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.25), transparent);
          animation: scan-line 4s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* TICKER TAPE */}
      <div className="overflow-hidden border-b border-white/10 bg-black/60">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap py-3 font-mono text-sm font-bold uppercase tracking-[0.18em]">
          {[...targets, ...targets].map((target, idx) => {
            const result = results[target.id];
            const style = getStatusStyle(result?.status ?? "checking");
            const delta = result
              ? deltaForResult(result)
              : { label: "...", tone: "text-amber-200" };
            return (
              <span
                key={`${target.id}-${idx}`}
                className="flex items-center gap-3 text-slate-300"
              >
                <span className="text-slate-600">●</span>
                <span className="text-white">{target.ticker}</span>
                <span className={style.text}>{style.label}</span>
                <span className={delta.tone}>{delta.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      <section className="mx-auto flex max-w-400 flex-col gap-6 px-8 py-6">
        {/* HEADER */}
        <header className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-300">
              Training App :: Ops Ticker
            </p>
            <h1
              className={`mt-3 font-mono text-6xl font-black uppercase tracking-tight md:text-7xl ${headlineTone} ${isDown ? "alarm-pulse" : ""}`}
            >
              {headline}
            </h1>
          </div>

          <div className="grid grid-cols-4 gap-3 font-mono">
            <Stat
              label="OPS"
              value={indexLabel}
              tone={
                isDown
                  ? "text-red-200"
                  : indexPct >= 0
                    ? "text-emerald-200"
                    : "text-red-200"
              }
            />
            <Stat
              label="LIVE"
              value={`${healthyCount}/${pingedCount}`}
              tone="text-white"
            />
            <Stat
              label="AKUT"
              value={String(tally.offline)}
              tone={isDown ? "text-red-200 alarm-pulse" : "text-slate-500"}
            />
            <Stat label="KLOCKA" value={formatTime(now)} tone="text-white" />
          </div>
        </header>

        {/* AKUT BANNER */}
        {isDown && (
          <div className="alarm-pulse rounded-2xl border-2 border-red-500/70 bg-red-600/20 p-5 text-center">
            <p className="font-mono text-sm font-black uppercase tracking-[0.4em] text-red-200">
              ⚠ AKUT :: AKUT :: AKUT ⚠
            </p>
            <p className="mt-1 font-mono text-2xl font-black uppercase tracking-widest text-white">
              {tally.offline} endpoint{tally.offline === 1 ? "" : "s"} nere —
              någon måste resa sig.
            </p>
          </div>
        )}

        {/* MAIN TABLE */}
        <div className="scan-overlay relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_0_80px_rgba(16,185,129,0.06)]">
          {/* Column headers */}
          <div className="grid grid-cols-[130px_80px_60px_minmax(0,1.6fr)_130px_110px_130px_minmax(0,1.4fr)] items-center gap-4 border-b border-white/10 bg-white/5 px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.26em] text-slate-500">
            <span>Ticker</span>
            <span>Desk</span>
            <span>Verb</span>
            <span>Endpoint</span>
            <span>Status</span>
            <span className="text-right">Latency</span>
            <span className="text-right">Delta</span>
            <span>Skvaller</span>
          </div>

          {/* Rows */}
          <div>
            {targets.map((target) => {
              const result = results[target.id] ?? {
                status: "checking" as RuntimeStatus,
                checkedAt: new Date().toISOString(),
              };
              const style = getStatusStyle(result.status);
              const delta = deltaForResult(result);
              const isFresh = freshIds.has(target.id);

              return (
                <div
                  key={target.id}
                  className={[
                    "grid grid-cols-[130px_80px_60px_minmax(0,1.6fr)_130px_110px_130px_minmax(0,1.4fr)]",
                    "items-center gap-4 border-b border-white/5 px-6 py-4 font-mono text-base",
                    "transition-colors duration-500",
                    isFresh ? "fresh-row" : "",
                    result.status === "offline"
                      ? "bg-red-500/10"
                      : "hover:bg-white/2",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Ticker + dot */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 flex-none rounded-full ${style.dot}`}
                    />
                    <span className="text-base font-black tracking-widest text-white">
                      {target.ticker}
                    </span>
                  </div>

                  {/* Desk badge */}
                  <span
                    className={`inline-flex justify-center rounded-md border px-2 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${getDeskStyle(target.desk)}`}
                  >
                    {target.desk}
                  </span>

                  {/* Verb */}
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    {target.method}
                  </span>

                  {/* Endpoint short path + name */}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      {target.shortPath}
                    </p>
                    <p className="truncate text-xs font-sans font-medium text-slate-500">
                      {target.name}
                    </p>
                  </div>

                  {/* Status chip + code */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${style.chip} ${result.status === "offline" ? "alarm-pulse" : ""}`}
                    >
                      {style.label}
                    </span>
                    {result.statusCode != null && (
                      <span className="text-[11px] font-bold text-slate-600">
                        {result.statusCode}
                      </span>
                    )}
                  </div>

                  {/* Latency */}
                  <span
                    className={`text-right font-bold tabular-nums ${style.text}`}
                  >
                    {result.latencyMs != null ? `${result.latencyMs} ms` : "—"}
                  </span>

                  {/* Delta */}
                  <span
                    className={`text-right text-lg font-black tabular-nums ${delta.tone}`}
                  >
                    {delta.label}
                  </span>

                  {/* Tagline */}
                  <span className="truncate text-sm font-sans text-slate-400">
                    {target.tagline}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="flex flex-col gap-2 border-t border-white/10 pt-4 font-mono text-[11px] font-black uppercase tracking-[0.28em] text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>
            Auto-refresh var 30:e sek &nbsp;//&nbsp; Skyddade endpoints
            (401/403) räknas som friska &nbsp;//&nbsp; Ny endpoint? Lägg till i
            targets-arrayen — dyker upp nästa tick
          </p>
          <p>Senaste tick: {formatTime(now)}</p>
        </footer>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
