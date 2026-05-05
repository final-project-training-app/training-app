type SessionTimerProps = {
  durationSeconds: number;
};

export function SessionTimer({ durationSeconds }: SessionTimerProps) {
  return (
    <section className="rounded-[2rem] bg-[#f1edff] px-6 py-7">
      <div className="flex items-center justify-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-indigo-700 text-indigo-700">
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-7xl font-bold leading-none text-indigo-700">
            {durationSeconds}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">sekunder</p>
        </div>
      </div>
    </section>
  );
}
