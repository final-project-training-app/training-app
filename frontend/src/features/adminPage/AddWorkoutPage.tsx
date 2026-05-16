import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/react";
import { useCreateWorkout } from "../../hooks/useCreateWorkoutHook";
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

type StatusFn = (
  message: string,
  options?: { type?: ToastType; duration?: number },
) => void;

type Props = {
  onBack?: () => void;
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

export default function AddWorkoutPage({ onBack, onStatusChange }: Props) {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [form, setForm] = useState<WorkoutForm>({
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
  });
  const { mutateAsync, isPending } = useCreateWorkout(getToken);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [trainersLoading, setTrainersLoading] = useState(true);
  const [trainersError, setTrainersError] = useState("");
  const isSubmitting = isPending;

  useEffect(() => {
    let isMounted = true;

    async function loadTrainers() {
      try {
        setTrainersLoading(true);
        const token = await getToken();

        if (!token) {
          throw new Error("Missing Clerk token");
        }

        const data = await fetchTrainersWithToken(token);

        if (!isMounted) return;

        setTrainers(Array.isArray(data) ? data : []);
        setTrainersError("");
      } catch (error) {
        if (!isMounted) return;

        console.error(error);
        setTrainersError("Could not load trainers.");
        onStatusChange?.("Failed to load trainers.", { type: "error" });
      } finally {
        if (isMounted) {
          setTrainersLoading(false);
        }
      }
    }

    loadTrainers();

    return () => {
      isMounted = false;
    };
  }, [getToken, onStatusChange]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? Number(value)
          : value;

    // Constrain level to 0-4
    if (name === "level" && typeof newValue === "number") {
      newValue = Math.min(Math.max(newValue, 0), 4);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validate = () => {
    const newErrors: string[] = [];

    if (!form.name) newErrors.push("Name is required");
    if (!form.description) newErrors.push("Description is required");
    if (!form.type) newErrors.push("Type is required");
    if (form.durationSeconds <= 0)
      newErrors.push("Duration must be greater than 0");
    if (form.level < 0 || form.level > 4)
      newErrors.push("Level must be between 0 and 4");
    if (!form.trainerId) newErrors.push("Trainer is required");
    if (!form.instructionsAudio)
      newErrors.push("Instructions Audio is required");
    else if (!isValidUrl(form.instructionsAudio))
      newErrors.push("Instructions Audio must be a valid URL");
    if (!form.workoutAudio) newErrors.push("Workout Audio is required");
    else if (!isValidUrl(form.workoutAudio))
      newErrors.push("Workout Audio must be a valid URL");
    if (!form.instructionsImage)
      newErrors.push("Instructions Image is required");
    else if (!isValidUrl(form.instructionsImage))
      newErrors.push("Instructions Image must be a valid URL");
    if (!form.workoutImage) newErrors.push("Workout Image is required");
    else if (!isValidUrl(form.workoutImage))
      newErrors.push("Workout Image must be a valid URL");

    if (form.instructionsVideo && !isValidUrl(form.instructionsVideo))
      newErrors.push("Instructions Video must be a valid URL");

    const start = form.instructionsVideoStart !== "" ? Number(form.instructionsVideoStart) : null;
    const stop = form.instructionsVideoStop !== "" ? Number(form.instructionsVideoStop) : null;
    if (start !== null && stop !== null && start >= stop)
      newErrors.push("Instructions Video Start must be less than Stop");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSuccess(false);
    onStatusChange?.("Saving workout...", { type: "info" });

    try {
      await mutateAsync({
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
      });

      setSuccess(true);
      onStatusChange?.("Workout saved.", { type: "success" });

      // optional reset
      // setForm(initialState)
    } catch (err) {
      console.error(err);
      onStatusChange?.("Failed to save workout.", { type: "error" });
    }
  }
  return (
    <main className="flex min-h-dvh items-center justify-center bg-(--brand-page) p-6 text-(--brand-ink)">
      <div className="w-full max-w-4xl rounded-2xl border border-(--brand-border) bg-white p-8 shadow-lg">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">
            {t("workoutsAdmin.addWorkoutPageTitle")}
          </h1>
          <button
            type="button"
            onClick={() => {
              onStatusChange?.("Cancelling...", { type: "info" });
              onBack?.();
            }}
            className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
          >
            {t("workoutsAdmin.back")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Name *</span>
                <input
                  name="name"
                  placeholder="Morning Yoga"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Type *</span>
                <input
                  name="type"
                  placeholder="Strength, Cardio..."
                  value={form.type}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Trainer *</span>
                <select
                  name="trainerId"
                  value={form.trainerId}
                  onChange={handleChange}
                  disabled={trainersLoading}
                  className="rounded-lg border border-(--brand-border) bg-white p-3 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                >
                  <option value="">
                    {trainersLoading
                      ? "Loading trainers..."
                      : "Choose a trainer"}
                  </option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                {trainersError && (
                  <span className="text-sm text-red-600">{trainersError}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Level *</span>
                <input
                  type="number"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  min="0"
                  max="4"
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Duration (seconds) *</span>
                <input
                  type="number"
                  name="durationSeconds"
                  value={form.durationSeconds}
                  onChange={handleChange}
                  min="0"
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Description *</span>
              <textarea
                name="description"
                placeholder="Describe the workout..."
                value={form.description}
                onChange={handleChange}
                className="min-h-[120px] rounded-lg border border-(--brand-border) bg-white p-3"
              />
            </label>
          </div>

          {/* Media */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">
                  Instructions Audio * (URL)
                </span>
                <input
                  name="instructionsAudio"
                  placeholder="https://example.com/audio.mp3"
                  value={form.instructionsAudio}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">
                  Workout Audio * (URL)
                </span>
                <input
                  name="workoutAudio"
                  placeholder="https://example.com/audio.mp3"
                  value={form.workoutAudio}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">
                  Instructions Image * (URL)
                </span>
                <input
                  name="instructionsImage"
                  placeholder="https://example.com/image.jpg"
                  value={form.instructionsImage}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">
                  Workout Image * (URL)
                </span>
                <input
                  name="workoutImage"
                  placeholder="https://example.com/image.jpg"
                  value={form.workoutImage}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm opacity-80">
                  Instructions Video (URL, optional)
                </span>
                <input
                  name="instructionsVideo"
                  placeholder="https://example.com/video.mp4"
                  value={form.instructionsVideo}
                  onChange={handleChange}
                  className="rounded-lg border border-(--brand-border) bg-white p-3"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">
                  Video Start (seconds after audio begins, optional)
                </span>
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
                <span className="text-sm opacity-80">
                  Video Stop (seconds after audio begins, optional)
                </span>
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
          </div>

          {/* Options */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Options</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "kneeFriendly", label: "Knee Friendly" },
                { name: "lowImpact", label: "Low Impact" },
                { name: "seated", label: "Seated" },
                { name: "beginnerFriendly", label: "Beginner" },
              ].map((item) => (
                <label
                  key={item.name}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--brand-border) bg-(--brand-surface-glass) p-3 hover:border-(--brand-primary)"
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
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onStatusChange?.("Cancelling...");
                onBack?.();
              }}
              className="rounded-lg border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-3 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-(--brand-on-primary) transition ${
                isSubmitting
                  ? "cursor-not-allowed bg-(--brand-primary)/60"
                  : "bg-(--brand-primary) hover:bg-(--brand-primary)/90"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : success ? (
                "Saved"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
