export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-purple-100 px-4 py-8">
      {/* Small image at top */}
      <div className="pt-12">
        <img
          src="/src/assets/image.png"
          alt="Profile"
          className="object-cover shadow-md"
        />
      </div>

      {/* Empty space in middle */}
      <div className="flex-1"></div>

      {/* Dark purple button at bottom */}
      <button className="mb-8 w-full max-w-md rounded-3xl bg-purple-800 px-10 py-10 text-4xl font-extrabold text-white shadow-xl hover:bg-purple-900 transition-colors">
        Träna
      </button>
    </main>
  );
}
