import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrainersWithToken } from "../../api/trainers";

type Trainer = {
  id: number;
  name?: string;
  language?: string;
  voice?: string;
};

type Props = {
  onStatusChange?: (message: string) => void;
};

export default function TrainerAdminPage({ onStatusChange }: Props) {
  const { getToken } = useAuth();

  const {
    data: trainers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-trainers"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk token");
      }

      return fetchTrainersWithToken(token);
    },
  });

  if (isLoading) {
    return <p className="text-sm text-(--brand-muted)">Loading trainers...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Trainers</h2>
        <button
          type="button"
          onClick={() => onStatusChange?.("Trainer create page can be added next.")}
          className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-xs font-semibold"
        >
          Add Trainer
        </button>
      </div>

      <div className="space-y-3">
        {trainers.map((trainer: Trainer) => (
          <article
            key={trainer.id}
            className="rounded-xl border border-(--brand-border) bg-(--brand-surface-glass) p-4"
          >
            <p className="font-semibold">{trainer.name ?? "Unnamed trainer"}</p>
            <p className="text-xs text-(--brand-muted)">
              Language: {trainer.language ?? "-"} | Voice: {trainer.voice ?? "-"}
            </p>
          </article>
        ))}

        {trainers.length === 0 && (
          <p className="text-sm text-(--brand-muted)">No trainers found.</p>
        )}
      </div>
    </section>
  );
}
