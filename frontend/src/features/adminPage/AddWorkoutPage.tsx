import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type WorkoutForm = {
  name: string;
  instructions: string;
  level: number;
  type: string;
  durationMinutes: number;
  instructionsAudio: string;
  workoutAudio: string;
  instructionsImage: string;
  workoutImage: string;
  kneeFriendly: boolean;
  lowImpact: boolean;
  seated: boolean;
  beginnerFriendly: boolean;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function AddWorkoutPage() {
  const [form, setForm] = useState<WorkoutForm>({
    name: "",
    instructions: "",
    level: 2,
    type: "",
    durationMinutes: 0,
    instructionsAudio: "",
    workoutAudio: "",
    instructionsImage: "",
    workoutImage: "",
    kneeFriendly: false,
    lowImpact: false,
    seated: false,
    beginnerFriendly: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    if (!form.instructions) newErrors.push("Instructions are required");
    if (!form.type) newErrors.push("Type is required");
    if (form.durationMinutes <= 0)
      newErrors.push("Duration must be greater than 0");
    if (form.level < 0 || form.level > 4)
      newErrors.push("Level must be between 0 and 4");
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

    setIsSubmitting(true);
    setSuccess(false);

    try {
      console.log("Submitting workout:", form);

      // simulate API call (replace later)
      await new Promise((res) => setTimeout(res, 1200));

      setSuccess(true);

      // optional: reset form
      // setForm(initialState)
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="min-h-dvh bg-(--brand-page) text-(--brand-ink) p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white backdrop-blur rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Add Workout</h1>

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
                <span className="text-sm opacity-80">Duration (minutes) *</span>
                <input
                  type="number"
                  name="durationMinutes"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  className="p-3 border rounded-lg bg-white/10"
                />
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Instructions *</span>
              <textarea
                name="instructions"
                placeholder="Describe the workout..."
                value={form.instructions}
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
          <button
            type="submit"
            disabled={isSubmitting}
            className={`relative flex items-center justify-center gap-2 p-3 rounded-lg mt-2 font-medium text-white transition
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
                Creating...
              </>
            ) : success ? (
              "✔ Workout Created"
            ) : (
              "Create Workout"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
