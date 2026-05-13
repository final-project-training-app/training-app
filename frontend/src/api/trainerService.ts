export type Trainer = {
  id: string;
  name: string;
  role?: string;
  image_url?: string;
  voice_preview_url?: string;
};

export const trainerKeys = {
  all: ['trainers'] as const,
  list: () => trainerKeys.all,
  detail: (id: string) => [...trainerKeys.all, 'detail', id] as const,
};

export async function fetchTrainers(): Promise<Trainer[]> {
  const res = await fetch('/trainers');
  if (!res.ok) throw new Error('Failed to fetch trainers');
  return res.json();
}

export async function updateSelectedTrainer(trainerId: string): Promise<void> {
  const res = await fetch('/user/selected-trainer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainer_id: trainerId }),
  });
  if (!res.ok) throw new Error('Failed to update selected trainer');
}
