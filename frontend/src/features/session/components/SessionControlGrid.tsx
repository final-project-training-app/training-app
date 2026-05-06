import { SessionControlButton } from "./SessionControlButton";

type SessionControlGridProps = {
  durationSeconds: number;
};

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Z" />
      <path d="M19 12a7 7 0 0 1-14 0" />
      <path d="M12 19v3" />
      <path d="M5 5l14 14" />
    </svg>
  );
}

function KeypadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor">
      <circle cx="6" cy="6" r="1.8" />
      <circle cx="12" cy="6" r="1.8" />
      <circle cx="18" cy="6" r="1.8" />
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="12" cy="18" r="1.8" />
      <circle cx="18" cy="18" r="1.8" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10v4h4l5 4V6l-5 4H5Z" />
      <path d="M18 9a4.5 4.5 0 0 1 0 6" />
      <path d="M20.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="M12 14h.01" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function SessionControlGrid({
  durationSeconds,
}: SessionControlGridProps) {
  return (
    <div className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-7">
      <SessionControlButton label="textläge" icon={<MicIcon />} />
      <SessionControlButton label="knappsats" icon={<KeypadIcon />} />
      <SessionControlButton label="högtalare" icon={<SpeakerIcon />} />
      <SessionControlButton
        label="tid"
        icon={
          <span className="text-[2.2rem] font-extrabold leading-none">
            {durationSeconds > 0 ? durationSeconds : 45}
          </span>
        }
      />
      <SessionControlButton label="träningssvit" icon={<CalendarIcon />} />
      <SessionControlButton label="min info" icon={<UserIcon />} />
    </div>
  );
}