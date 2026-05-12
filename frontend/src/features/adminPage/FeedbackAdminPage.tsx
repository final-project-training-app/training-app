import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeedbacksWithToken } from "../../api/feedbacks";

type Feedback = {
  id: number;
  userId?: number;
  workoutId?: number;
  rating?: number;
  liked?: boolean;
  difficulty?: string;
  comment?: string;
  createdAt?: string;
};

export default function FeedbackAdminPage() {
  const { getToken } = useAuth();

  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-feedbacks"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk token");
      }

      return fetchFeedbacksWithToken(token);
    },
  });

  if (isLoading) {
    return <p className="text-sm text-(--brand-muted)">Loading feedback...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">User Feedback</h2>

      <div className="space-y-3">
        {feedbacks.map((feedback: Feedback) => (
          <article
            key={feedback.id}
            className="rounded-xl border border-(--brand-border) bg-(--brand-surface-glass) p-4"
          >
            <p className="text-sm font-semibold">
              Workout #{feedback.workoutId ?? "-"} | User #{feedback.userId ?? "-"}
            </p>
            <p className="text-xs text-(--brand-muted)">
              Rating: {feedback.rating ?? "-"} | Liked: {String(feedback.liked ?? "-")} | Difficulty: {feedback.difficulty ?? "-"}
            </p>
            {feedback.comment && (
              <p className="mt-2 text-sm text-(--brand-ink)">{feedback.comment}</p>
            )}
          </article>
        ))}

        {feedbacks.length === 0 && (
          <p className="text-sm text-(--brand-muted)">No feedback found.</p>
        )}
      </div>
    </section>
  );
}
