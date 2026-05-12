import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchWorkoutFeedbackSummaryWithToken } from "../../api/feedbacks";

type FeedbackSummaryRow = {
  workoutId: number;
  workoutName: string;
  feedbackCount: number;
  avgRating: number;
  dislikeRate: number;
  tooHardRate: number;
  status: "GOOD" | "NEEDS_REVIEW" | "BAD";
};

const statusStyles: Record<FeedbackSummaryRow["status"], string> = {
  GOOD: "bg-emerald-100 text-emerald-700 border-emerald-200",
  NEEDS_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  BAD: "bg-rose-100 text-rose-700 border-rose-200",
};

const barWidth = (value: number) => `${Math.max(0, Math.min(100, value))}%`;

export default function FeedbackAdminPage() {
  const { getToken } = useAuth();

  const {
    data: summary = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-feedback-summary"],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk token");
      }

      return fetchWorkoutFeedbackSummaryWithToken(token);
    },
  });

  if (isLoading) {
    return <p className="text-sm text-(--brand-muted)">Loading feedback...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  const rows = summary as FeedbackSummaryRow[];
  const totalFeedbacks = rows.reduce((sum, row) => sum + row.feedbackCount, 0);

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Workout Feedback Summary</h2>
          <p className="text-sm text-(--brand-muted)">
            Clean summary view for review and future charts.
          </p>
        </div>
        <div className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold">
          Total feedback: {totalFeedbacks}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-(--brand-border) bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-(--brand-muted)">
            Good
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {rows.filter((row) => row.status === "GOOD").length}
          </p>
        </div>
        <div className="rounded-2xl border border-(--brand-border) bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-(--brand-muted)">
            Needs review
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {rows.filter((row) => row.status === "NEEDS_REVIEW").length}
          </p>
        </div>
        <div className="rounded-2xl border border-(--brand-border) bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-(--brand-muted)">
            Bad
          </p>
          <p className="mt-2 text-2xl font-extrabold">
            {rows.filter((row) => row.status === "BAD").length}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-(--brand-muted)">
          No feedback summary found.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article
              key={row.workoutId}
              className="rounded-2xl border border-(--brand-border) bg-(--brand-surface-glass) p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold">{row.workoutName}</p>
                  <p className="text-xs text-(--brand-muted)">
                    Workout #{row.workoutId} · Feedback {row.feedbackCount}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
                >
                  {row.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-(--brand-muted)">
                    <span>Avg rating</span>
                    <span>{row.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60">
                    <div
                      className="h-2 rounded-full bg-(--brand-primary)"
                      style={{ width: barWidth((row.avgRating / 5) * 100) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-(--brand-muted)">
                    <span>Dislike rate</span>
                    <span>{row.dislikeRate.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60">
                    <div
                      className="h-2 rounded-full bg-rose-500"
                      style={{ width: barWidth(row.dislikeRate) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-(--brand-muted)">
                    <span>Too hard rate</span>
                    <span>{row.tooHardRate.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: barWidth(row.tooHardRate) }}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
