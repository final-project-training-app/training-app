type SessionCallButtonProps = {
  isPlaying: boolean;
  onClick: () => void;
};

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-11 w-11"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .8 3a2 2 0 0 1-.4 2.1L8.2 10a16 16 0 0 0 5.8 5.8l1.2-1.3a2 2 0 0 1 2.1-.4c1 .4 2 .7 3 .8A2 2 0 0 1 22 16.9Z" />
    </svg>
  );
}

export function SessionCallButton({
  isPlaying,
  onClick,
}: SessionCallButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-3 pb-1"
    >
      <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-red-500 text-white shadow-[0_18px_34px_rgba(255,59,48,0.18)]">
        <PhoneIcon />
      </div>

      <span className="text-[1.3rem] font-medium text-slate-900">
        {isPlaying ? "avsluta" : "starta"}
      </span>
    </button>
  );
}