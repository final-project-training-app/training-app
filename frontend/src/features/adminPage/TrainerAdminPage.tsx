import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  createTrainerWithToken,
  deleteTrainerWithToken,
  fetchTrainerByIdWithToken,
  fetchTrainersWithToken,
  updateTrainerWithToken,
} from "../../api/trainers";
import { useToast } from "../../hooks/useToast";

type Trainer = {
  id: number;
  name: string;
  prompt: string;
  voice: string;
  intro: string;
  language: string;
  imageSelect?: string | null;
  imageCall?: string | null;
  imageStart?: string | null;
};

type TrainerForm = {
  name: string;
  prompt: string;
  voice: string;
  intro: string;
  language: string;
  imageSelect: string;
  imageCall: string;
  imageStart: string;
};

type View = "all" | "create" | "edit";

type PendingDelete = {
  id: number;
  name: string;
  timerId: number;
};

const emptyForm: TrainerForm = {
  name: "",
  prompt: "",
  voice: "",
  intro: "",
  language: "",
  imageSelect: "",
  imageCall: "",
  imageStart: "",
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function TrainerAdminPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();

  const [view, setView] = useState<View>("all");
  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(null);
  const [form, setForm] = useState<TrainerForm>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

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

  const createMutation = useMutation({
    mutationFn: async (payload: TrainerForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing Clerk token");
      }
      return createTrainerWithToken(
        {
          ...payload,
          imageSelect: normalizeOptional(payload.imageSelect),
          imageCall: normalizeOptional(payload.imageCall),
          imageStart: normalizeOptional(payload.imageStart),
        },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      showToast("Trainer saved.");
      setForm(emptyForm);
      setView("all");
    },
    onError: (mutationError) => {
      showToast((mutationError as Error).message || "Failed to save trainer.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: TrainerForm }) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing Clerk token");
      }
      return updateTrainerWithToken(
        id,
        {
          ...payload,
          imageSelect: normalizeOptional(payload.imageSelect),
          imageCall: normalizeOptional(payload.imageCall),
          imageStart: normalizeOptional(payload.imageStart),
        },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      showToast("Trainer updated.");
      setView("all");
      setEditingTrainerId(null);
    },
    onError: (mutationError) => {
      showToast((mutationError as Error).message || "Failed to update trainer.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trainerId: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing Clerk token");
      }
      return deleteTrainerWithToken(trainerId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      showToast("Trainer deleted.");
    },
    onError: (mutationError) => {
      showToast((mutationError as Error).message || "Failed to delete trainer.");
    },
  });

  useEffect(() => {
    return () => {
      if (pendingDelete != null) {
        window.clearTimeout(pendingDelete.timerId);
      }
    };
  }, [pendingDelete]);

  useEffect(() => {
    if (view !== "edit" || editingTrainerId == null) {
      return;
    }

    const trainerId = editingTrainerId;

    let active = true;

    async function loadTrainer() {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Missing Clerk token");
        }

        const trainer = (await fetchTrainerByIdWithToken(
          trainerId,
          token,
        )) as Trainer;

        if (!active) return;

        setForm({
          name: trainer.name ?? "",
          prompt: trainer.prompt ?? "",
          voice: trainer.voice ?? "",
          intro: trainer.intro ?? "",
          language: trainer.language ?? "",
          imageSelect: trainer.imageSelect ?? "",
          imageCall: trainer.imageCall ?? "",
          imageStart: trainer.imageStart ?? "",
        });
      } catch (loadError) {
        if (!active) return;
        showToast((loadError as Error).message || "Failed to load trainer.");
        setView("all");
        setEditingTrainerId(null);
      }
    }

    loadTrainer();

    return () => {
      active = false;
    };
  }, [editingTrainerId, getToken, showToast, view]);

  const sortedTrainers = useMemo(() => {
    return [...(trainers as Trainer[])].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? ""),
    );
  }, [trainers]);

  const validate = () => {
    const nextErrors: string[] = [];

    if (!form.name.trim()) nextErrors.push("Name is required");
    if (!form.prompt.trim()) nextErrors.push("Prompt is required");
    if (!form.voice.trim()) nextErrors.push("Voice is required");
    if (!form.intro.trim()) nextErrors.push("Intro URL is required");
    if (form.intro.trim() && !isHttpUrl(form.intro.trim())) {
      nextErrors.push("Intro must be a valid http/https URL");
    }
    if (!form.language.trim()) nextErrors.push("Language is required");

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const onFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const scheduleDelete = (trainer: Trainer) => {
    if (pendingDelete != null) {
      showToast("Undo current delete first.");
      return;
    }

    const confirmed = window.confirm(
      `Delete trainer "${trainer.name}"? You can undo for 5 seconds.`,
    );

    if (!confirmed) {
      return;
    }

    const timerId = window.setTimeout(async () => {
      try {
        await deleteMutation.mutateAsync(trainer.id);
      } finally {
        setPendingDelete(null);
      }
    }, 5000);

    setPendingDelete({ id: trainer.id, name: trainer.name, timerId });
    showToast("Delete scheduled. Undo within 5 seconds.");
  };

  const undoDelete = () => {
    if (pendingDelete == null) {
      return;
    }
    window.clearTimeout(pendingDelete.timerId);
    setPendingDelete(null);
    showToast("Delete cancelled.");
  };

  const openCreate = () => {
    setErrors([]);
    setForm(emptyForm);
    setEditingTrainerId(null);
    setView("create");
  };

  const openEdit = (trainerId: number) => {
    setErrors([]);
    setEditingTrainerId(trainerId);
    setView("edit");
    showToast("Opening trainer edit page...");
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    showToast("Saving trainer...");
    await createMutation.mutateAsync(form);
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || editingTrainerId == null) return;
    showToast("Saving changes...");
    await updateMutation.mutateAsync({ id: editingTrainerId, payload: form });
  };

  if (isLoading) {
    return <p className="text-sm text-(--brand-muted)">Loading trainers...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  return (
    <section className="space-y-4">
      {toast && (
        <div className="pointer-events-none fixed right-6 top-6 z-20 rounded-lg bg-(--brand-ink) px-4 py-2 text-sm font-medium text-(--brand-on-primary)">
          {toast}
        </div>
      )}

      {pendingDelete != null && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            Delete pending for {pendingDelete.name}. You can undo now.
          </p>
          <button
            type="button"
            onClick={undoDelete}
            className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Undo
          </button>
        </div>
      )}

      {view === "all" && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">All Trainers</h2>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-full bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-(--brand-on-primary)"
            >
              + Add Trainer
            </button>
          </div>

          <div className="space-y-3">
            {sortedTrainers.map((trainer) => (
              <article
                key={trainer.id}
                onClick={() => openEdit(trainer.id)}
                className="cursor-pointer rounded-xl border border-(--brand-border) bg-(--brand-surface-glass) p-4 transition hover:border-(--brand-primary)"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{trainer.name || "Unnamed trainer"}</p>
                    <p className="text-xs text-(--brand-muted)">
                      Language: {trainer.language || "-"} | Voice: {trainer.voice || "-"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(trainer.id);
                      }}
                      className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        scheduleDelete(trainer);
                      }}
                      className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {sortedTrainers.length === 0 && (
              <p className="text-sm text-(--brand-muted)">No trainers found.</p>
            )}
          </div>
        </>
      )}

      {(view === "create" || view === "edit") && (
        <main className="min-h-dvh bg-(--brand-page) text-(--brand-ink) p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-8 flex items-center justify-between gap-3">
              <h1 className="text-3xl font-bold">
                {view === "create" ? "Add Trainer" : "Edit Trainer"}
              </h1>
              <button
                type="button"
                onClick={() => {
                  showToast("Back to trainers.");
                  setView("all");
                  setEditingTrainerId(null);
                }}
                className="rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
              >
                Back
              </button>
            </div>

            <form
              onSubmit={view === "create" ? submitCreate : submitEdit}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Name *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Language *</span>
                  <input
                    name="language"
                    value={form.language}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Voice *</span>
                  <input
                    name="voice"
                    value={form.voice}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Intro URL *</span>
                  <input
                    name="intro"
                    value={form.intro}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>

                <label className="md:col-span-2 flex flex-col gap-1">
                  <span className="text-sm opacity-80">Prompt *</span>
                  <textarea
                    name="prompt"
                    value={form.prompt}
                    onChange={onFormChange}
                    className="min-h-[140px] rounded-lg border p-3"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Image Select URL</span>
                  <input
                    name="imageSelect"
                    value={form.imageSelect}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Image Call URL</span>
                  <input
                    name="imageCall"
                    value={form.imageCall}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>

                <label className="md:col-span-2 flex flex-col gap-1">
                  <span className="text-sm opacity-80">Image Start URL</span>
                  <input
                    name="imageStart"
                    value={form.imageStart}
                    onChange={onFormChange}
                    className="rounded-lg border p-3"
                  />
                </label>
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-red-500">
                  {errors.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Cancelling...");
                    setView("all");
                    setEditingTrainerId(null);
                  }}
                  className="rounded-lg border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-3 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-(--brand-primary) px-4 py-3 text-sm font-medium text-(--brand-on-primary) disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </main>
      )}
    </section>
  );
}
