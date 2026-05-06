type SessionStatusProps = {
  title: string;
  elapsedSeconds: number;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function SessionStatus({ title, elapsedSeconds }: SessionStatusProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-[2.7rem] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-[3.1rem]">
        {title}
      </h1>
      <p className="mt-2 text-[1.8rem] font-semibold tracking-[-0.03em] text-indigo-700">
        {formatTime(elapsedSeconds)}
      </p>
    </div>
  );
}