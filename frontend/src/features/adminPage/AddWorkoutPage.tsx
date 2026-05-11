export default function AddWorkoutPage({ workoutData }: { workoutData: unknown }) {
  return (
    <>
      <main className="flex h-dvh flex-col items-center justify-center bg-(--brand-page) text-(--brand-ink)">
        <h1 className="text-3xl font-bold">Admin Page</h1>
        <p className="text-lg">{String(workoutData)}</p>
      </main>
    </>
  );
}
