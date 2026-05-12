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
import ConfirmModal from "../../components/ConfirmModal";

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

type TrainerField = keyof TrainerForm;

type FieldErrors = Partial<Record<TrainerField, string>>;

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

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TrainerAdminPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();

  const [view, setView] = useState<View>("all");
  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(null);
  const [form, setForm] = useState<TrainerForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

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
      setSubmitError(null);
      showToast("Trainer saved.", { type: "success" });
      setForm(emptyForm);
      setView("all");
    },
    onError: (mutationError) => {
      const message =
        (mutationError as Error).message || "Failed to save trainer.";
      setSubmitError(message);
      showToast(message, { type: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TrainerForm;
    }) => {
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
      setSubmitError(null);
      showToast("Trainer updated.", { type: "success" });
      setView("all");
      setEditingTrainerId(null);
    },
    onError: (mutationError) => {
      const message =
        (mutationError as Error).message || "Failed to update trainer.";
      setSubmitError(message);
      showToast(message, { type: "error" });
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
      showToast("Trainer deleted.", { type: "success" });
    },
    onError: (mutationError) => {
      showToast(
        (mutationError as Error).message || "Failed to delete trainer.",
        { type: "error" },
      );
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
        showToast((loadError as Error).message || "Failed to load trainer.", { type: "error" });
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
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.prompt.trim()) nextErrors.prompt = "Prompt is required";
    if (!form.voice.trim()) nextErrors.voice = "Voice is required";
    if (!form.intro.trim()) nextErrors.intro = "Intro is required";
    if (!form.language.trim()) nextErrors.language = "Language is required";

    if (form.imageSelect.trim() && !isHttpUrl(form.imageSelect.trim())) {
      nextErrors.imageSelect = "Image select must be a valid http/https URL";
    }

    if (form.imageCall.trim() && !isHttpUrl(form.imageCall.trim())) {
      nextErrors.imageCall = "Image call must be a valid http/https URL";
    }

    if (form.imageStart.trim() && !isHttpUrl(form.imageStart.trim())) {
      nextErrors.imageStart = "Image start must be a valid http/https URL";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name as TrainerField]: undefined }));
  };

  const scheduleDelete = (trainer: Trainer) => {
    if (pendingDelete != null) {
      showToast("Undo current delete first.", { type: "info" });
      return;
    }

    // open modal to request typed confirmation
    setConfirmModal({ open: true, trainer });
  };

  const undoDelete = () => {
    if (pendingDelete == null) {
      return;
    }
    window.clearTimeout(pendingDelete.timerId);
    setPendingDelete(null);
    showToast("Delete cancelled.", { type: "info" });
  };

  // confirm modal state
  const [confirmModal, setConfirmModal] = useState<
    | { open: true; trainer: Trainer }
    | { open: false }
  >({ open: false });

  const onConfirmDelete = async () => {
    if (confirmModal.open !== true) return;
    const trainer = confirmModal.trainer;

    const timerId = window.setTimeout(async () => {
      try {
        await deleteMutation.mutateAsync(trainer.id);
      } finally {
        setPendingDelete(null);
      }
    }, 5000);

    setPendingDelete({ id: trainer.id, name: trainer.name, timerId });
    setConfirmModal({ open: false });
    showToast("Delete scheduled. Undo within 5 seconds.", { type: "info" });
  };

  const onCancelDelete = () => setConfirmModal({ open: false });

  const openCreate = () => {
    setFieldErrors({});
    setSubmitError(null);
    setForm(emptyForm);
    setEditingTrainerId(null);
    setView("create");
  };

  const openEdit = (trainerId: number) => {
    setFieldErrors({});
    setSubmitError(null);
    setEditingTrainerId(trainerId);
    setView("edit");
    showToast("Opening trainer edit page...", { type: "info" });
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    showToast("Saving trainer...", { type: "info" });
    await createMutation.mutateAsync(form);
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate() || editingTrainerId == null) return;
    showToast("Saving changes...", { type: "info" });
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
        <div
          className={`pointer-events-none fixed right-6 top-6 z-20 rounded-lg px-4 py-2 text-sm font-medium ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-(--brand-ink) text-(--brand-on-primary)"
          }`}
        >
          {toast.message}
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

      {confirmModal.open && (
        <ConfirmModal
          open={true}
          title="Delete trainer"
          body={`Delete trainer "${confirmModal.trainer.name}"? You can undo within 5 seconds.`}
          requireTyping={"DELETE"}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
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
                    <p className="font-semibold">
                      {trainer.name || "Unnamed trainer"}
                    </p>
                    <p className="text-xs text-(--brand-muted)">
                      Language: {trainer.language || "-"} | Voice:{" "}
                      {trainer.voice || "-"}
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
              <div>
                <button
                  type="button"
                  onClick={() => {
                      showToast("Back to trainers.", { type: "info" });
                      setView("all");
                      setEditingTrainerId(null);
                    }}
                  className="mr-4 rounded-full border border-(--brand-border) bg-(--brand-surface-glass) px-4 py-2 text-sm font-semibold"
                >
                  Back
                </button>
              </div>
              <h1 className="text-3xl font-bold">
                {view === "create" ? "Add Trainer" : "Edit Trainer"}
              </h1>
              <div />
            </div>

            {submitError && (
              <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

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
                    className={`rounded-lg border p-3 ${
                      fieldErrors.name ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.name && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.name}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Language *</span>
                  <input
                    name="language"
                    value={form.language}
                    onChange={onFormChange}
                    className={`rounded-lg border p-3 ${
                      fieldErrors.language ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.language && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.language}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Voice *</span>
                  <input
                    name="voice"
                    value={form.voice}
                    onChange={onFormChange}
                    className={`rounded-lg border p-3 ${
                      fieldErrors.voice ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.voice && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.voice}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Intro *</span>
                  <input
                    name="intro"
                    value={form.intro}
                    onChange={onFormChange}
                    className={`rounded-lg border p-3 ${
                      fieldErrors.intro ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.intro && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.intro}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-1">
                  <span className="text-sm opacity-80">Prompt *</span>
                  <textarea
                    name="prompt"
                    value={form.prompt}
                    onChange={onFormChange}
                    className={`min-h-[140px] rounded-lg border p-3 ${
                      fieldErrors.prompt ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.prompt && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.prompt}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Image Select URL</span>
                  <input
                    name="imageSelect"
                    value={form.imageSelect}
                    onChange={onFormChange}
                    className={`rounded-lg border p-3 ${
                      fieldErrors.imageSelect ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.imageSelect && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.imageSelect}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm opacity-80">Image Call URL</span>
                  <input
                    name="imageCall"
                    value={form.imageCall}
                    onChange={onFormChange}
                    className={`rounded-lg border p-3 ${
                      fieldErrors.imageCall ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.imageCall && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.imageCall}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-1">
                  <span className="text-sm opacity-80">Image Start URL</span>
                  <input
                    name="imageStart"
                    value={form.imageStart}
                    onChange={onFormChange}
                    className={`rounded-lg border p-3 ${
                      fieldErrors.imageStart ? "border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.imageStart && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.imageStart}
                    </span>
                  )}
                </label>
              </div>

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
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
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
