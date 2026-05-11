import { useState } from "react";

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

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Submitting workout:", form);

    // TODO: send to backend
    // await fetch('/api/admin/workouts', { method: 'POST', body: JSON.stringify(form) })
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
                <span className="text-sm opacity-80">Level</span>
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
                <span className="text-sm opacity-80">Instructions Audio</span>
                <input
                  name="instructionsAudio"
                  value={form.instructionsAudio}
                  onChange={handleChange}
                  className="p-3 border rounded-lg bg-white/10"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Workout Audio</span>
                <input
                  name="workoutAudio"
                  value={form.workoutAudio}
                  onChange={handleChange}
                  className="p-3 border rounded-lg bg-white/10"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Instructions Image</span>
                <input
                  name="instructionsImage"
                  value={form.instructionsImage}
                  onChange={handleChange}
                  className="p-3 border rounded-lg bg-white/10"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm opacity-80">Workout Image</span>
                <input
                  name="workoutImage"
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
            className="bg-blue-600 hover:bg-blue-700 transition text-white font-medium p-3 rounded-lg mt-2"
          >
            Create Workout
          </button>
        </form>
      </div>
    </main>
  );
}
