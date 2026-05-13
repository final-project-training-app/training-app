import { useState } from "react";
import { Settings } from "lucide-react";
import IntensitySlider from "./IntensitySlider";
import ContextModel from "./ContextModal";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import { AppSheet } from "../../../components/AppSheet";

const DEFAULT_DISPLAY_NAME = "No name entered";

export default function SettingsModalSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { data: user } = useMyProfile();

  return (
    <SettingsModalBody
      key={open ? "open" : "closed"}
      open={open}
      setOpen={setOpen}
      userName={user?.name?.trim() ? user.name : DEFAULT_DISPLAY_NAME}
      intensityLevel={user?.intensityLevel ?? 2}
      context={user?.context ?? ""}
    />
  );
}

function SettingsModalBody({
  open,
  setOpen,
  userName,
  intensityLevel: initialIntensityLevel,
  context: initialContext,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  userName: string;
  intensityLevel: number;
  context: string;
}) {
  const [fullName, setFullName] = useState(userName);
  const [intensityLevel, setIntensityLevel] = useState(initialIntensityLevel);
  const [context, setContext] = useState(initialContext);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();

  return (
    <AppSheet
      open={open}
      title="Inställningar"
      subtitle="Anpassa träningspasset efter dig"
      icon={<Settings size={20} strokeWidth={2.4} />}
      onClose={() => setOpen(false)}
      height="large"
    >
      <div className="space-y-6">
        <section>
          <label
            htmlFor="fullName"
            className="text-[15px] font-extrabold text-[#4f3bb8]"
          >
            Namn
          </label>

          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-3 text-[16px] font-semibold text-[#3f2a7a] outline-none focus:ring-2 focus:ring-[#c8bfeb]"
          />

          <p className="mt-2 text-[12px] font-semibold leading-snug text-[#6b59b2]">
            Namnet är hämtat från din profil.
          </p>
        </section>

        <IntensitySlider value={intensityLevel} onChange={setIntensityLevel} />

        <ContextModel value={context} onChange={setContext} />

        <section className="space-y-2.5">
          <button
            className="w-full rounded-2xl bg-[#5b3fd6] px-4 py-3.5 text-[16px] font-extrabold text-white transition active:scale-[0.985]"
            disabled={updateProfile.isPending}
            onClick={() => {
              setSaveFeedback(null);

              updateProfile.mutate(
                {
                  name: fullName,
                  intensityLevel,
                  context,
                },
                {
                  onSuccess: () => setSaveFeedback("Inställningar sparade ✓"),
                  onError: () =>
                    setSaveFeedback("Kunde inte spara ändringarna"),
                },
              );
            }}
          >
            {updateProfile.isPending ? "Sparar..." : "Spara ändringar"}
          </button>

          {saveFeedback ? (
            <div className="rounded-2xl border border-[#ddd2ff] bg-[#f1ecff] px-4 py-3 text-center text-[14px] font-bold text-[#3f2a7a]">
              {saveFeedback}
            </div>
          ) : null}

          <button
            className="w-full rounded-xl px-4 py-3 text-[15px] font-extrabold text-[#4d2a7a] transition active:scale-[0.985] active:bg-[#efe9fb]"
            onClick={() => setOpen(false)}
          >
            Avbryt
          </button>
        </section>
      </div>
    </AppSheet>
  );
}
