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
    level: 1,
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

    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? Number(value)
          : value;

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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-(--brand-page) text-(--brand-ink) p-6">
      <h1 className="text-3xl font-bold mb-6">Add Workout</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
      >
        <input
          name="name"
          placeholder="Workout Name"
          value={form.name}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="type"
          placeholder="Type (e.g. strength, cardio)"
          value={form.type}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="number"
          name="level"
          value={form.level}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="number"
          name="durationMinutes"
          placeholder="Duration (minutes)"
          value={form.durationMinutes}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="instructionsAudio"
          placeholder="Instructions Audio URL"
          value={form.instructionsAudio}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="workoutAudio"
          placeholder="Workout Audio URL"
          value={form.workoutAudio}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="instructionsImage"
          placeholder="Instructions Image URL"
          value={form.instructionsImage}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="workoutImage"
          placeholder="Workout Image URL"
          value={form.workoutImage}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        {/* Boolean flags */}
        <label>
          <input
            type="checkbox"
            name="kneeFriendly"
            checked={form.kneeFriendly}
            onChange={handleChange}
          />{" "}
          Knee Friendly
        </label>

        <label>
          <input
            type="checkbox"
            name="lowImpact"
            checked={form.lowImpact}
            onChange={handleChange}
          />{" "}
          Low Impact
        </label>

        <label>
          <input
            type="checkbox"
            name="seated"
            checked={form.seated}
            onChange={handleChange}
          />{" "}
          Seated
        </label>

        <label>
          <input
            type="checkbox"
            name="beginnerFriendly"
            checked={form.beginnerFriendly}
            onChange={handleChange}
          />{" "}
          Beginner Friendly
        </label>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="text-red-500">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Workout
        </button>
      </form>
    </main>
  );
}
