export async function createWorkout(data: unknown) {
  const res = await fetch("/api/admin/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create workout.");
  }

  return res.json();
}
