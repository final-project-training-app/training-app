import { useNavigate } from "@tanstack/react-router";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f6ff]">
      {/* Full-width image at top */}
      <div className="flex flex-1 overflow-hidden">
        <img
          src="/src/assets/image.png"
          alt="Profile"
          className="w-full object-cover"
        />
      </div>

      {/* Button at bottom */}
      <div className="flex items-center justify-center px-4 py-8">
        <button
          onClick={() => navigate({ to: "/session/1" })}
          className="rounded-2xl bg-cyan-400 px-8 py-4 text-xl font-semibold text-zinc-950 shadow-md hover:bg-cyan-300 transition-colors"
        >
          Träna
        </button>
      </div>
    </main>
  );
}
