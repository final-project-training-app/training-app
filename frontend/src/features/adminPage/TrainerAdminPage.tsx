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

type Props = {
  searchTerm?: string;
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

function toForm(trainer: Trainer): TrainerForm {
  return {
    name: trainer.name ?? "",
    prompt: trainer.prompt ?? "",
    voice: trainer.voice ?? "",
    intro: trainer.intro ?? "",
    language: trainer.language ?? "",
    imageSelect: trainer.imageSelect ?? "",
    imageCall: trainer.imageCall ?? "",
    imageStart: trainer.imageStart ?? "",
  };
}

export default function TrainerAdminPage({ searchTerm = "" }: Props) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();

  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<TrainerForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    data: trainers = [],
    isLoading,
    isError,
    error,
  } = useQuery<Trainer[]>({
    queryKey: ["admin-trainers"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      return fetchTrainersWithToken(token);
    },
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTrainers = useMemo(() => {
    const sorted = [...trainers].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? ""),
    );
    if (!normalizedSearch) return sorted;
    return sorted.filter(
      (t) =>
        t.name?.toLowerCase().includes(normalizedSearch) ||
        t.language?.toLowerCase().includes(normalizedSearch) ||
        t.voice?.toLowerCase().includes(normalizedSearch),
    );
  }, [trainers, normalizedSearch]);

  const selectedTrainer = useMemo(
    () => trainers.find((t) => t.id === selectedId) ?? null,
    [trainers, selectedId],
  );

  useEffect(() => {
    if (filteredTrainers.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId == null || !filteredTrainers.some((t) => t.id === selectedId)) {
      setSelectedId(filteredTrainers[0].id);
    }
  }, [filteredTrainers, selectedId]);

  // Load trainer data when switching to edit
  useEffect(() => {
    if (mode !== "edit" || selectedId == null) return;
    let active = true;

    async function load() {
      try {
        const token = await getToken();
        if (!token) throw new Error("Missing Clerk token");
        const data = (await fetchTrainerByIdWithToken(
          selectedId!,
          token,
        )) as Trainer;
        if (!active) return;
        setForm(toForm(data));
      } catch (err) {
        if (!active) return;
        showToast((err as Error).message || "Failed to load trainer.", {
          type: "error",
        });
        setMode("view");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [mode, selectedId, getToken, showToast]);

  // (no pending delete timer needed — deletion is immediate after confirm modal)

  const createMutation = useMutation({
    mutationFn: async (payload: TrainerForm) => {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
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
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      setSubmitError(null);
      const createdId = (saved as Trainer)?.id;
      if (typeof createdId === "number") setSelectedId(createdId);
      setMode("view");
      showToast("Trainer created.", { type: "success" });
    },
    onError: (err) => {
      const msg = (err as Error).message || "Failed to save trainer.";
      setSubmitError(msg);
      showToast(msg, { type: "error" });
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
      if (!token) throw new Error("Missing Clerk token");
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      setSubmitError(null);
      setMode("view");
      showToast("Trainer updated.", { type: "success" });
    },
    onError: (err) => {
      const msg = (err as Error).message || "Failed to update trainer.";
      setSubmitError(msg);
      showToast(msg, { type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      return deleteTrainerWithToken(id, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
      setMode("view");
      showToast("Trainer deleted.", { type: "success" });
    },
    onError: (err) => {
      showToast((err as Error).message || "Failed to delete.", { type: "error" });
    },
  });

  const validate = () => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.prompt.trim()) next.prompt = "Prompt is required";
    if (!form.voice.trim()) next.voice = "Voice is required";
    if (!form.intro.trim()) next.intro = "Intro is required";
    if (!form.language.trim()) next.language = "Language is required";
    if (form.imageSelect.trim() && !isHttpUrl(form.imageSelect.trim()))
      next.imageSelect = "Must be a valid https:// URL";
    if (form.imageCall.trim() && !isHttpUrl(form.imageCall.trim()))
      next.imageCall = "Must be a valid https:// URL";
    if (form.imageStart.trim() && !isHttpUrl(form.imageStart.trim()))
      next.imageStart = "Must be a valid https:// URL";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name as TrainerField]: undefined }));
  };

  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setFieldErrors({});
    setSubmitError(null);
  };

  const openEdit = () => {
    if (selectedTrainer == null) return;
    setMode("edit");
    setForm(toForm(selectedTrainer));
    setFieldErrors({});
    setSubmitError(null);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    showToast("Saving…", { type: "info" });
    if (mode === "edit" && selectedId != null) {
      await updateMutation.mutateAsync({ id: selectedId, payload: form });
    } else {
      await createMutation.mutateAsync(form);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[#6f6a93]">Loading trainers…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">{(error as Error).message}</p>;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`pointer-events-none fixed right-6 top-6 z-20 rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-[#100b2f] text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && selectedTrainer != null && (
        <ConfirmModal
          open={true}
          title="Delete trainer"
          body={`Delete trainer "${selectedTrainer.name}"? This cannot be undone.`}
          requireTyping="DELETE"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            setConfirmDelete(false);
            deleteMutation.mutate(selectedTrainer.id);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#100b2f]">Trainers</h2>
          <p className="text-sm text-[#6f6a93]">
            Manage AI trainer profiles and configurations.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[#5836d6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4527b8] active:scale-95"
        >
          + Add Trainer
        </button>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* List */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-[#ece5ff] bg-white shadow-sm">
            {filteredTrainers.map((trainer) => (
              <article
                key={trainer.id}
                onClick={() => {
                  setSelectedId(trainer.id);
                  if (mode === "create") setMode("view");
                }}
                className={`cursor-pointer border-b border-[#f3eeff] p-4 transition last:border-b-0 ${
                  selectedId === trainer.id
                    ? "bg-[#f3eeff]"
                    : "bg-white hover:bg-[#faf8ff]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#ece5ff]">
                    {trainer.imageSelect ? (
                      <img
                        src={trainer.imageSelect}
                        alt={trainer.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">
                        🧑‍🏫
                      </div>
                    )
                    }
                    {selectedId === trainer.id && (
                      <div className="absolute inset-0 rounded-lg ring-2 ring-[#5836d6]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#100b2f]">
                      {trainer.name || "Unnamed trainer"}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#9b96b8]">
                      {trainer.language && (
                        <span className="rounded-full bg-[#ede9ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5836d6]">
                          {trainer.language}
                        </span>
                      )}
                      <span>Voice: {trainer.voice || "-"}</span>
                    </div>
                  </div>

                  {selectedId === trainer.id && (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-[#5836d6]" />
                  )}
                </div>
              </article>
            ))}

            {filteredTrainers.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <span className="text-3xl">🔍</span>
                <p className="text-sm font-semibold text-[#100b2f]">
                  No trainers found
                </p>
                <p className="text-xs text-[#9b96b8]">
                  Try a different search term
                </p>
              </div>
            )}
          </div>

          <p className="px-1 text-xs text-[#9b96b8]">
            {filteredTrainers.length} trainer
            {filteredTrainers.length !== 1 ? "s" : ""}
            {normalizedSearch ? ` matching "${searchTerm.trim()}"` : ""}
          </p>
        </div>

        {/* Side panel */}
        <aside className="h-fit rounded-2xl border border-[#ece5ff] bg-white shadow-sm lg:sticky lg:top-5">
          {/* Detail view */}
          {mode === "view" && selectedTrainer != null && (
            <div className="space-y-0">
              <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-t-2xl bg-[#ece5ff]">
                {selectedTrainer.imageSelect ? (
                  <img
                    src={selectedTrainer.imageSelect}
                    alt={selectedTrainer.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-5xl">🧑‍🏫</span>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <button
                  type="button"
                  onClick={openEdit}
                  className="absolute right-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#5836d6] shadow-sm backdrop-blur-sm transition hover:bg-white"
                >
                  ✏️ Edit
                </button>
                {selectedTrainer.language && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#5836d6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {selectedTrainer.language}
                  </span>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-xl font-bold text-[#100b2f]">{selectedTrainer.name}</h3>
                  <p className="mt-0.5 text-xs text-[#9b96b8]">Trainer #{selectedTrainer.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#ece5ff] bg-[#faf8ff] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Language</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#100b2f]">{selectedTrainer.language || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#ece5ff] bg-[#faf8ff] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Voice</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#100b2f]">{selectedTrainer.voice || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#ece5ff] bg-[#faf8ff] px-4 py-3">
                  <span className="text-xl shrink-0">{selectedTrainer.intro ? "🎵" : "🔇"}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">Intro Audio</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#100b2f]">
                      {selectedTrainer.intro ? "Configured ✓" : "Not set"}
                    </p>
                  </div>
                </div>

                {selectedTrainer.prompt && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#b0a8d0]">System Prompt</p>
                    <p className="line-clamp-3 text-xs leading-relaxed text-[#6f6a93]">{selectedTrainer.prompt}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={openEdit}
                  className="w-full rounded-xl bg-[#5836d6] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4527b8] active:scale-[0.98]"
                >
                  Edit Trainer
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {(mode === "create" || mode === "edit") && (
            <form onSubmit={onSubmit} className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#100b2f]">
                  {mode === "create" ? "New Trainer" : "Edit Trainer"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMode("view");
                    setFieldErrors({});
                    setSubmitError(null);
                  }}
                  className="rounded-full border border-[#ece5ff] px-3 py-1 text-xs font-semibold text-[#6f6a93] transition hover:border-[#5836d6] hover:text-[#5836d6]"
                >
                  ✕ Close
                </button>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  ⚠ {submitError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6f6a93]">
                    Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onFormChange}
                    placeholder="e.g. Eva"
                    className={`w-full rounded-xl border p-2.5 text-sm outline-none transition focus:border-[#5836d6] focus:ring-1 focus:ring-[#5836d6]/20 ${
                      fieldErrors.name ? "border-red-400" : "border-[#ece5ff]"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[10px] text-red-500">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6f6a93]">
                    Language *
                  </label>
                  <input
                    name="language"
                    value={form.language}
                    onChange={onFormChange}
                    placeholder="e.g. Swedish"
                    className={`w-full rounded-xl border p-2.5 text-sm outline-none transition focus:border-[#5836d6] ${
                      fieldErrors.language
                        ? "border-red-400"
                        : "border-[#ece5ff]"
                    }`}
                  />
                  {fieldErrors.language && (
                    <p className="text-[10px] text-red-500">
                      {fieldErrors.language}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6f6a93]">
                    Voice *
                  </label>
                  <input
                    name="voice"
                    value={form.voice}
                    onChange={onFormChange}
                    placeholder="e.g. Aoede"
                    className={`w-full rounded-xl border p-2.5 text-sm outline-none transition focus:border-[#5836d6] ${
                      fieldErrors.voice ? "border-red-400" : "border-[#ece5ff]"
                    }`}
                  />
                  {fieldErrors.voice && (
                    <p className="text-[10px] text-red-500">{fieldErrors.voice}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6f6a93]">
                    Intro *
                  </label>
                  <input
                    name="intro"
                    value={form.intro}
                    onChange={onFormChange}
                    placeholder="Short intro text"
                    className={`w-full rounded-xl border p-2.5 text-sm outline-none transition focus:border-[#5836d6] ${
                      fieldErrors.intro ? "border-red-400" : "border-[#ece5ff]"
                    }`}
                  />
                  {fieldErrors.intro && (
                    <p className="text-[10px] text-red-500">{fieldErrors.intro}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6f6a93]">
                  Prompt *
                </label>
                <textarea
                  name="prompt"
                  value={form.prompt}
                  onChange={onFormChange}
                  placeholder="System prompt for this trainer..."
                  className={`min-h-24 w-full rounded-xl border p-2.5 text-sm outline-none transition focus:border-[#5836d6] focus:ring-1 focus:ring-[#5836d6]/20 ${
                    fieldErrors.prompt ? "border-red-400" : "border-[#ece5ff]"
                  }`}
                />
                {fieldErrors.prompt && (
                  <p className="text-[10px] text-red-500">{fieldErrors.prompt}</p>
                )}
              </div>

              <details className="rounded-xl border border-[#ece5ff]">
                <summary className="cursor-pointer px-3 py-2.5 text-xs font-semibold text-[#5836d6]">
                  Image URLs ▾
                </summary>
                <div className="space-y-3 px-3 pb-3">
                  {(
                    [
                      ["imageSelect", "Image Select URL"],
                      ["imageCall", "Image Call URL"],
                      ["imageStart", "Image Start URL"],
                    ] as [TrainerField, string][]
                  ).map(([field, label]) => (
                    <div key={field} className="space-y-1">
                      <label className="text-xs font-semibold text-[#6f6a93]">
                        {label}
                      </label>
                      <input
                        name={field}
                        value={form[field] as string}
                        onChange={onFormChange}
                        placeholder="https://..."
                        className={`w-full rounded-xl border p-2.5 text-sm outline-none transition focus:border-[#5836d6] ${
                          fieldErrors[field]
                            ? "border-red-400"
                            : "border-[#ece5ff]"
                        }`}
                      />
                      {fieldErrors[field] && (
                        <p className="text-[10px] text-red-500">
                          {fieldErrors[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </details>

              <div className="flex items-center gap-2 pt-1">
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-[#5836d6] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4527b8] disabled:opacity-50 active:scale-95"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}

          {mode === "view" && selectedTrainer == null && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <span className="text-4xl">👆</span>
              <p className="text-sm font-semibold text-[#100b2f]">
                Select a trainer
              </p>
              <p className="text-xs text-[#9b96b8]">
                Click any row to see details here
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
