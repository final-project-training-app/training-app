import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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

const statusConfig: Record<FeedbackSummaryRow["status"], { label: string; icon: string; color: string; bgColor: string }> = {
  GOOD: { label: "Good", icon: "✓", color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  NEEDS_REVIEW: { label: "Needs Review", icon: "!", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  BAD: { label: "Bad", icon: "✕", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
};

const barWidth = (value: number) => `${Math.max(0, Math.min(100, value))}%`;

const PAGE_SIZE = 6;

function SkeletonRow() {
  return (
    <div className="space-y-3 rounded-2xl border border-[#ece5ff] bg-white p-4 animate-pulse">
      <div className="h-4 w-1/4 rounded-full bg-[#ede9ff]" />
      <div className="h-3 w-1/3 rounded-full bg-[#f3eeff]" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-2 rounded-full bg-[#ede9ff]" />
        <div className="h-2 rounded-full bg-[#ede9ff]" />
        <div className="h-2 rounded-full bg-[#ede9ff]" />
      </div>
    </div>
  );
}

export default function FeedbackAdminPage() {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "GOOD" | "NEEDS_REVIEW" | "BAD">("");
  const [sortBy, setSortBy] = useState<"rating" | "feedback" | "name">("rating");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: summary = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-feedback-summary"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      return fetchWorkoutFeedbackSummaryWithToken(token);
    },
  });

  const rows = summary as FeedbackSummaryRow[];
  const totalFeedbacks = rows.reduce((sum, row) => sum + row.feedbackCount, 0);

  const filtered = useMemo(() => {
    let result = [...rows];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) => row.workoutName.toLowerCase().includes(term));
    }
    if (filterStatus) {
      result = result.filter((row) => row.status === filterStatus);
    }
    if (sortBy === "rating") {
      result.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sortBy === "feedback") {
      result.sort((a, b) => b.feedbackCount - a.feedbackCount);
    } else {
      result.sort((a, b) => a.workoutName.localeCompare(b.workoutName));
    }
    return result;
  }, [rows, searchTerm, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goodCount = rows.filter((r) => r.status === "GOOD").length;
  const reviewCount = rows.filter((r) => r.status === "NEEDS_REVIEW").length;
  const badCount = rows.filter((r) => r.status === "BAD").length;

  if (isError) return <p className="text-sm text-red-500">{(error as Error).message}</p>;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#100b2f]">Feedback</h2>
          <p className="mt-0.5 text-sm text-[#6f6a93]">Review workout feedback and ratings.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ece5ff] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Good Workouts</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{goodCount}</p>
          <p className="mt-1 text-xs text-[#9b96b8]">{totalFeedbacks > 0 ? `${((goodCount / rows.length) * 100).toFixed(0)}%` : "0%"}</p>
        </div>
        <div className="rounded-2xl border border-[#ece5ff] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Needs Review</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{reviewCount}</p>
          <p className="mt-1 text-xs text-[#9b96b8]">{totalFeedbacks > 0 ? `${((reviewCount / rows.length) * 100).toFixed(0)}%` : "0%"}</p>
        </div>
        <div className="rounded-2xl border border-[#ece5ff] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Bad Workouts</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{badCount}</p>
          <p className="mt-1 text-xs text-[#9b96b8]">{totalFeedbacks > 0 ? `${((badCount / rows.length) * 100).toFixed(0)}%` : "0%"}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#ece5ff] bg-white px-4 py-3 shadow-sm">
        <div className="relative min-w-40 flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a8d0]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-lg border border-[#ece5ff] bg-[#faf8ff] py-2 pl-8 pr-3 text-sm text-[#100b2f] outline-none transition placeholder:text-[#c0bada] focus:border-[#5836d6] focus:ring-1 focus:ring-[#5836d6]/20"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
          className={`rounded-lg border py-2 pl-3 pr-6 text-xs font-semibold outline-none transition ${filterStatus ? "border-[#5836d6] bg-[#f0ebff] text-[#5836d6]" : "border-[#ece5ff] bg-white text-[#6f6a93] hover:border-[#c4b8f5]"}`}
        >
          <option value="">All Status</option>
          <option value="GOOD">Good</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
          <option value="BAD">Bad</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
          className="rounded-lg border border-[#ece5ff] bg-white py-2 pl-3 pr-6 text-xs font-semibold text-[#6f6a93] outline-none transition hover:border-[#c4b8f5]"
        >
          <option value="rating">Highest Rating</option>
          <option value="feedback">Most Feedback</option>
          <option value="name">A → Z</option>
        </select>

        {(searchTerm || filterStatus) && (
          <button
            type="button"
            onClick={() => { setSearchTerm(""); setFilterStatus(""); setCurrentPage(1); }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#ece5ff] bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0ebff] text-2xl">🔍</div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#100b2f]">No workouts found</p>
            <p className="mt-0.5 text-xs text-[#9b96b8]">Try adjusting your search or filters</p>
          </div>
          {(searchTerm || filterStatus) && (
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setFilterStatus(""); setCurrentPage(1); }}
              className="rounded-lg bg-[#f0ebff] px-3 py-1.5 text-xs font-semibold text-[#5836d6] hover:bg-[#ede9ff]"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paged.map((row) => {
              const cfg = statusConfig[row.status];
              return (
                <article
                  key={row.workoutId}
                  className="rounded-2xl border border-[#ece5ff] bg-white p-5 transition hover:border-[#ddd5f8] shadow-sm"
                >
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-[#100b2f]">{row.workoutName}</p>
                      <p className="mt-0.5 text-xs text-[#9b96b8]">Workout #{row.workoutId} • {row.feedbackCount} feedback</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border ${cfg.bgColor} px-3 py-1.5 text-xs font-semibold ${cfg.color}`}>
                      <span>{cfg.icon}</span> {cfg.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Rating</span>
                        <span className="text-xs font-bold text-[#100b2f]">{row.avgRating.toFixed(1)} ⭐</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#ede9ff] overflow-hidden">
                        <div className="h-full bg-[#5836d6] transition-all" style={{ width: barWidth((row.avgRating / 5) * 100) }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Dislike</span>
                        <span className="text-xs font-bold text-[#100b2f]">{row.dislikeRate.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-red-100 overflow-hidden">
                        <div className="h-full bg-red-500 transition-all" style={{ width: barWidth(row.dislikeRate) }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Too Hard</span>
                        <span className="text-xs font-bold text-[#100b2f]">{row.tooHardRate.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all" style={{ width: barWidth(row.tooHardRate) }} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-xs text-[#9b96b8]">
                Showing {pageStart}–{pageEnd} of {filtered.length} workout{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ece5ff] bg-white text-sm text-[#5836d6] transition hover:bg-[#f3eeff] disabled:opacity-30"
                >←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      currentPage === p ? "bg-[#5836d6] text-white shadow-sm" : "border border-[#ece5ff] bg-white text-[#5836d6] hover:bg-[#f3eeff]"
                    }`}
                  >{p}</button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ece5ff] bg-white text-sm text-[#5836d6] transition hover:bg-[#f3eeff] disabled:opacity-30"
                >→</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
