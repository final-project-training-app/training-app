type SessionAudioButtonProps = {
  label: string;
  onClick: () => void;
};

export function SessionAudioButton({
  label,
  onClick,
}: SessionAudioButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[2rem] bg-indigo-700 px-6 py-5 text-3xl font-bold tracking-wide text-white shadow-sm"
    >
      {label}
    </button>
  );
}
