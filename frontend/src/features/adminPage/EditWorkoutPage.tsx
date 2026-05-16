import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { fetchWorkoutById, updateWorkout } from "../../api/workouts";
import { fetchTrainersWithToken } from "../../api/trainers";
import type { ToastType } from "../../hooks/useToast";

type TrainerOption = {
  id: number;
  name: string;
};

type WorkoutForm = {
  name: string;
  description: string;
  level: number;
  type: string;
  durationSeconds: number;
  instructionsAudio: string;
  workoutAudio: string;
  instructionsImage: string;
  workoutImage: string;
  instructionsVideo: string;
  instructionsVideoStart: string;
  instructionsVideoStop: string;
  kneeFriendly: boolean;
  lowImpact: boolean;
  seated: boolean;
  beginnerFriendly: boolean;
  trainerId: string;
};

type WorkoutResponse = {
  id: number;
  name?: string;
  description?: string;
  level?: number;
  type?: string;
  durationSeconds?: number;
  instructionsAudio?: string;
  workoutAudio?: string;
  instructionsImage?: string;
  workoutImage?: string;
  instructionsVideo?: string | null;
  instructionsVideoStart?: number | null;
  instructionsVideoStop?: number | null;
  kneeFriendly?: boolean;
  lowImpact?: boolean;
  seated?: boolean;
  beginnerFriendly?: boolean;
  trainer?: {
    id?: number;
  } | null;
};

type StatusFn = (
  message: string,
  options?: { type?: ToastType; duration?: number },
) => void;

type Props = {
  workoutId: number;
  onBack: () => void;
  onStatusChange?: StatusFn;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const emptyForm: WorkoutForm = {
  name: "",
  description: "",
  level: 2,
  type: "",
  durationSeconds: 0,
  instructionsAudio: "",
  workoutAudio: "",
  instructionsImage: "",
  workoutImage: "",
  instructionsVideo: "",
  instructionsVideoStart: "",
  instructionsVideoStop: "",
  kneeFriendly: false,
  lowImpact: false,
  seated: false,
  beginnerFriendly: false,
  trainerId: "",
};

export default function EditWorkoutPage({
  workoutId,
  onBack,
  onStatusChange,
}: Props) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<WorkoutForm>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const token = await getToken();

        if (!token) {
          throw new Error("Missing Clerk token");
        }

        const [workout, trainerList] = await Promise.all([
          fetchWorkoutById(workoutId, token),
          fetchTrainersWithToken(token),
        ]);

        if (!isMounted) return;

        const workoutData = workout as WorkoutResponse;

        setTrainers(Array.isArray(trainerList) ? trainerList : []);
        setForm({
          name: workoutData.name ?? "",
          description: workoutData.description ?? "",
          level: workoutData.level ?? 2,
          type: workoutData.type ?? "",
          durationSeconds: workoutData.durationSeconds ?? 0,
          instructionsAudio: workoutData.instructionsAudio ?? "",
          workoutAudio: workoutData.workoutAudio ?? "",
          instructionsImage: workoutData.instructionsImage ?? "",
          workoutImage: workoutData.workoutImage ?? "",
          instructionsVideo: workoutData.instructionsVideo ?? "",
          instructionsVideoStart: workoutData.instructionsVideoStart != null ? String(workoutData.instructionsVideoStart) : "",
          instructionsVideoStop: workoutData.instructionsVideoStop != null ? String(workoutData.instructionsVideoStop) : "",
          kneeFriendly: workoutData.kneeFriendly ?? false,
          lowImpact: workoutData.lowImpact ?? false,
          seated: workoutData.seated ?? false,
          beginnerFriendly: workoutData.beginnerFriendly ?? false,
          trainerId:
            workoutData.trainer?.id != null
              ? String(workoutData.trainer.id)
              : "",
        });
      } catch (error) {
        console.error(error);
        onStatusChange?.("Failed to load workout.", { type: "error" });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [getToken, onStatusChange, workoutId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    const nextValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? Number(value)
          : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const validate = () => {
    const nextErrors: string[] = [];

    if (!form.name) nextErrors.push("Name is required");
    if (!form.description) nextErrors.push("Description is required");
    if (!form.type) nextErrors.push("Type is required");
    if (form.durationSeconds <= 0)
      nextErrors.push("Duration must be greater than 0");
    if (form.level < 0 || form.level > 4)
      nextErrors.push("Level must be between 0 and 4");
    if (!form.trainerId) nextErrors.push("Trainer is required");
    if (!form.instructionsAudio || !isValidUrl(form.instructionsAudio)) {
      nextErrors.push("Instructions Audio must be a valid URL");
    }
    if (!form.workoutAudio || !isValidUrl(form.workoutAudio)) {
      nextErrors.push("Workout Audio must be a valid URL");
    }
    if (!form.instructionsImage || !isValidUrl(form.instructionsImage)) {
      nextErrors.push("Instructions Image must be a valid URL");
    }
    if (!form.workoutImage || !isValidUrl(form.workoutImage)) {
      nextErrors.push("Workout Image must be a valid URL");
    }

    if (form.instructionsVideo && !isValidUrl(form.instructionsVideo))
      nextErrors.push("Instructions Video must be a valid URL");

    const start = form.instructionsVideoStart !== "" ? Number(form.instructionsVideoStart) : null;
    const stop = form.instructionsVideoStop !== "" ? Number(form.instructionsVideoStop) : null;
    if (start !== null && stop !== null && start >= stop)
      nextErrors.push("Instructions Video Start must be less than Stop");

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      onStatusChange?.("Saving changes...", { type: "info" });

      const token = await getToken();
      if (!token) {
        throw new Error("Missing Clerk token");
      }

      await updateWorkout(
        workoutId,
        {
          name: form.name,
          description: form.description,
          level: form.level,
          type: form.type,
          durationSeconds: form.durationSeconds,
          instructionsAudio: form.instructionsAudio,
          workoutAudio: form.workoutAudio,
          instructionsImage: form.instructionsImage,
          workoutImage: form.workoutImage,
          instructionsVideo: form.instructionsVideo || null,
          instructionsVideoStart: form.instructionsVideoStart !== "" ? Number(form.instructionsVideoStart) : null,
          instructionsVideoStop: form.instructionsVideoStop !== "" ? Number(form.instructionsVideoStop) : null,
          kneeFriendly: form.kneeFriendly,
          lowImpact: form.lowImpact,
          seated: form.seated,
          beginnerFriendly: form.beginnerFriendly,
          trainer: {
            id: Number(form.trainerId),
          },
        },
        token,
      );

      onStatusChange?.("Changes saved.", { type: "success" });
      onBack();
    } catch (error) {
      console.error(error);
      onStatusChange?.("Failed to save changes.", { type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-(--brand-border) bg-white p-6">
        <p className="text-sm text-(--brand-muted)">Loading workout...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-(--brand-page) p-6 text-(--brand-ink)">
      <div className="w-full max-w-4xl rounded-2xl border border-(--brand-border) bg-white p-8 shadow-lg">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Edit Workout</h1>
          <button
            type="button"
            onClick={() => {
              onStatusChange?.("Back to workouts.", { type: "info" });
              onBack();
            }}
            className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Type *</span>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Trainer *</span>
              <select
                name="trainerId"
                value={form.trainerId}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              >
                <option value="">Choose a trainer</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Level *</span>
              <input
                type="number"
                min="0"
                max="4"
                name="level"
                value={form.level}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm opacity-80">Duration (seconds) *</span>
              <input
                type="number"
                min="0"
                name="durationSeconds"
                value={form.durationSeconds}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">Description *</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="min-h-[120px] rounded-lg border border-(--brand-border) bg-white p-3"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Instructions Audio *</span>
              <input
                name="instructionsAudio"
                value={form.instructionsAudio}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Workout Audio *</span>
              <input
                name="workoutAudio"
                value={form.workoutAudio}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Instructions Image *</span>
              <input
                name="instructionsImage"
                value={form.instructionsImage}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Workout Image *</span>
              <input
                name="workoutImage"
                value={form.workoutImage}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm opacity-80">Instructions Video (URL, optional)</span>
              <input
                name="instructionsVideo"
                placeholder="https://example.com/video.mp4"
                value={form.instructionsVideo}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Video Start (seconds after audio begins, optional)</span>
              <input
                name="instructionsVideoStart"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 11"
                value={form.instructionsVideoStart}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Video Stop (seconds after audio begins, optional)</span>
              <input
                name="instructionsVideoStop"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 31"
                value={form.instructionsVideoStop}
                onChange={handleChange}
                className="rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "kneeFriendly", label: "Knee Friendly" },
              { name: "lowImpact", label: "Low Impact" },
              { name: "seated", label: "Seated" },
              { name: "beginnerFriendly", label: "Beginner" },
            ].map((item) => (
              <label
                key={item.name}
                className="flex items-center gap-2 rounded-lg border border-(--brand-border) bg-(--brand-surface-glass) p-3"
              >
                <input
                  type="checkbox"
                  name={item.name}
                  checked={form[item.name as keyof WorkoutForm] as boolean}
                  onChange={handleChange}
                />
                {item.label}
              </label>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onStatusChange?.("Cancelling...", { type: "info" });
                onBack();
              }}
              className="rounded-lg border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-3 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`rounded-lg px-4 py-3 text-sm font-medium text-(--brand-on-primary) ${
                saving
                  ? "cursor-not-allowed bg-(--brand-primary)/60"
                  : "bg-(--brand-primary) hover:bg-(--brand-primary)/90"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
