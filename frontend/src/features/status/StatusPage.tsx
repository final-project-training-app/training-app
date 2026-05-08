import { useEffect, useState } from "react";
import "./statusPage.css";

type ServiceStatus = "checking" | "up" | "down";

type ServiceCard = {
  id: string;
  name: string;
  url: string;
  description: string;
  fetchMode?: RequestMode;
};

type ServiceCheckResult = {
  status: ServiceStatus;
  checkedAt: string;
};

const REFRESH_INTERVAL_MS = 30_000;

const services: ServiceCard[] = [
  {
    id: "frontend",
    name: "Frontend Railway",
    url: "https://frontend-training.up.railway.app",
    description: "Publik app för teamet",
    fetchMode: "no-cors",
  },
  {
    id: "backend",
    name: "Backend Railway",
    url: "https://backend-training.up.railway.app/api/workouts",
    description: "API och sessionsdata",
  },
];

function getOverallTheme(status: ServiceStatus) {
  if (status === "up") {
    return {
      screenClass: "status-screen--up",
      auraClass: "status-aura--up",
      heroLabel: "FRIDFULLT",
      heroTitle: "ALLT ÄR GRÖNT",
      heroText: "Andas. Systemet lever och allt känns lugnt.",
      heroTone: "text-emerald-50",
      heroAccent: "text-emerald-200",
      pill: "border-emerald-200/50 bg-emerald-50/12 text-emerald-50",
      signalClass: "status-signal--up",
      bannerClass: "border-emerald-200/40 bg-emerald-50/10 text-emerald-50",
      bannerText: "Läget är stabilt",
    };
  }

  if (status === "down") {
    return {
      screenClass: "status-screen--down",
      auraClass: "status-aura--down",
      heroLabel: "KAOS ALERT",
      heroTitle: "SERVERN ÄR NERE",
      heroText: "Gå till panikrummet. Något måste kollas nu.",
      heroTone: "text-red-50",
      heroAccent: "text-red-200",
      pill: "border-red-200/40 bg-red-50/10 text-red-50",
      signalClass: "status-signal--down",
      bannerClass: "border-red-200/40 bg-red-50/10 text-red-50",
      bannerText: "Panikläge aktivt",
    };
  }

  return {
    screenClass: "status-screen--checking",
    auraClass: "status-aura--checking",
    heroLabel: "KOLLAR LÄGET",
    heroTitle: "STATUS LADDAR",
    heroText: "Status uppdateras nu.",
    heroTone: "text-amber-50",
    heroAccent: "text-amber-100",
    pill: "border-amber-100/30 bg-amber-50/10 text-amber-50",
    signalClass: "status-signal--checking",
    bannerClass: "border-amber-100/30 bg-amber-50/10 text-amber-50",
    bannerText: "Kontroll pågår",
  };
}

function getServiceAppearance(status: ServiceStatus) {
  if (status === "up") {
    return {
      label: "GRÖN",
      dot: "status-dot status-dot--up",
      text: "text-emerald-100",
      frame: "border-emerald-100/20 bg-emerald-50/10",
    };
  }

  if (status === "down") {
    return {
      label: "RÖD",
      dot: "status-dot status-dot--down",
      text: "text-red-100",
      frame: "border-red-100/20 bg-red-50/10",
    };
  }

  return {
    label: "KOLLAR",
    dot: "status-dot status-dot--checking",
    text: "text-amber-50",
    frame: "border-amber-100/20 bg-amber-50/10",
  };
}

function formatCheckedAt(timestamp: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

async function pingService(service: ServiceCard): Promise<ServiceCheckResult> {
  try {
    await fetch(service.url, {
      method: "GET",
      mode: service.fetchMode,
      cache: "no-store",
    });

    return {
      status: "up",
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      status: "down",
      checkedAt: new Date().toISOString(),
    };
  }
}

export function StatusPage() {
  const [serviceResults, setServiceResults] = useState<
    Record<string, ServiceCheckResult>
  >(() =>
    Object.fromEntries(
      services.map((service) => [
        service.id,
        {
          status: "checking",
          checkedAt: new Date().toISOString(),
        },
      ]),
    ),
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let isCancelled = false;

    async function runChecks() {
      const nextEntries = await Promise.all(
        services.map(
          async (service) => [service.id, await pingService(service)] as const,
        ),
      );

      if (!isCancelled) {
        setServiceResults(Object.fromEntries(nextEntries));
      }
    }

    void runChecks();

    const intervalId = window.setInterval(() => {
      void runChecks();
    }, REFRESH_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    document.title = "Training App Status";
    document.body.classList.add("status-tv-mode");

    return () => {
      document.body.classList.remove("status-tv-mode");
    };
  }, []);

  const statuses = services.map(
    (service) => serviceResults[service.id]?.status ?? "checking",
  );
  const overallStatus = statuses.every((status) => status === "up")
    ? "up"
    : statuses.some((status) => status === "down")
      ? "down"
      : "checking";
  const theme = getOverallTheme(overallStatus);

  return (
    <main
      className={`status-screen relative min-h-dvh overflow-hidden px-6 py-6 text-white ${theme.screenClass}`}
    >
      <div className={`status-aura ${theme.auraClass}`} />
      <div className="status-noise" />
      {overallStatus === "down" ? <div className="status-alarm-lines" /> : null}

      <section className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-7xl flex-col gap-6">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-base uppercase tracking-[0.42em] text-white/70">
              Training App Status
            </p>
            <p className="mt-3 text-2xl text-white/65 md:text-3xl">
              Frontend och backend på Railway
            </p>
          </div>

          <div className="rounded-full border border-white/15 bg-black/15 px-6 py-3 text-right backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.28em] text-white/55">
              Nu
            </p>
            <p className="mt-1 text-3xl font-black text-white md:text-4xl">
              {now.toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center rounded-[2.5rem] border border-white/12 bg-black/12 px-8 py-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-sm md:px-16">
          {overallStatus === "down" ? (
            <div className="mb-8 flex justify-center">
              <div
                className={`rounded-full border px-8 py-4 text-xl font-black uppercase tracking-[0.34em] md:text-2xl ${theme.bannerClass}`}
              >
                {theme.bannerText}
              </div>
            </div>
          ) : null}

          <div
            className={`status-signal mx-auto mb-8 h-32 w-32 rounded-full md:h-48 md:w-48 ${theme.signalClass}`}
          />

          <p
            className={`text-xl font-bold uppercase tracking-[0.45em] md:text-3xl ${theme.heroAccent}`}
          >
            {theme.heroLabel}
          </p>
          <h1
            className={`mt-6 text-7xl font-black tracking-tight md:text-9xl ${theme.heroTone}`}
          >
            {theme.heroTitle}
          </h1>
          <p
            className={`mx-auto mt-6 max-w-4xl text-2xl font-medium md:text-4xl ${theme.heroAccent}`}
          >
            {theme.heroText}
          </p>

          <div className="mt-8 flex justify-center">
            <div
              className={`rounded-full border px-8 py-4 text-xl font-bold uppercase tracking-[0.28em] md:text-2xl ${theme.pill}`}
            >
              Auto-refresh var 30:e sekund
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const result = serviceResults[service.id];
            const status = result?.status ?? "checking";
            const appearance = getServiceAppearance(status);

            return (
              <article
                key={service.id}
                className={`rounded-[2rem] border p-7 shadow-[0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur-sm ${appearance.frame}`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-white/55">
                      Service
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                      {service.name}
                    </h2>
                    <p className="mt-3 text-lg text-white/75">
                      {service.description}
                    </p>
                  </div>

                  <div className={appearance.dot} />
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-[1.1fr_1fr] md:items-end">
                  <p
                    className={`text-5xl font-black md:text-6xl ${appearance.text}`}
                  >
                    {appearance.label}
                  </p>

                  <div className="space-y-2 text-sm text-white/70 md:text-base">
                    <p>URL: {service.url}</p>
                    <p>
                      Senast kollad:{" "}
                      {result ? formatCheckedAt(result.checkedAt) : "-"}
                    </p>
                    <p>Auto-refresh: var 30:e sekund</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
