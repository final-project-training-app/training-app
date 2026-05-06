import { useNavigate } from "@tanstack/react-router";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8f6ff] px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        {/* Profile Image */}
        <div className="flex justify-center">
          <img
            src="/src/assets/image.png"
            alt="Profile"
            className="h-64 w-64 rounded-full object-cover shadow-lg"
          />
        </div>

        {/* Träna Button */}
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
