import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useCreateWorkout } from "../../hooks/useCreateWorkoutHook";
import { fetchTrainersWithToken } from "../../api/trainers";

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
  kneeFriendly: boolean;
  lowImpact: boolean;
  seated: boolean;
  beginnerFriendly: boolean;
  trainerId: string;
};

import { ToastType } from "../../hooks/useToast";

type StatusFn = (message: string, options?: { type?: ToastType; duration?: number }) => void;

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
    <main className="min-h-dvh bg-(--brand-page) text-(--brand-ink) p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white backdrop-blur rounded-2xl shadow-lg p-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Add Workout</h1>
          <button
            type="button"
            onClick={() => {
                onStatusChange?.("Cancelling...", { type: "info" });
                onBack?.();
              }}
            className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
          >
            Back
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
                  className="p-3 border rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Type *</span>
                <input
                  name="type"
                  placeholder="Strength, Cardio..."
                  value={form.type}
                  onChange={handleChange}
                  className="p-3 border rounded-lg bg-white/10 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Trainer *</span>
                <select
                  name="trainerId"
                  value={form.trainerId}
                  onChange={handleChange}
                  disabled={trainersLoading}
                  className="p-3 border rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <span className="text-sm text-red-400">{trainersError}</span>
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
                  className="p-3 border rounded-lg bg-white/10"
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
                  className="p-3 border rounded-lg bg-white/10"
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
                className="p-3 border rounded-lg bg-white/10 min-h-[120px]"
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
                  className="p-3 border rounded-lg bg-white/10"
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
                  className="p-3 border rounded-lg bg-white/10"
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
                  className="p-3 border rounded-lg bg-white/10"
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
                  className="p-3 border rounded-lg bg-white/10"
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
                  className="flex items-center gap-2 p-3 border rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
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
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg">
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
              className={`relative flex items-center justify-center gap-2 p-3 rounded-lg font-medium text-white transition
    ${
      isSubmitting
        ? "bg-purple-400 cursor-not-allowed"
        : "bg-purple-600 hover:bg-purple-700"
    }
  `}
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
