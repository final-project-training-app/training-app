import { useEffect, useState, type ReactNode } from "react";

const DESIGN_WIDTH = 430;
const DESIGN_HEIGHT = 932;

function getStageScale() {
  if (typeof window === "undefined") return 1;

  const widthScale = window.innerWidth / DESIGN_WIDTH;
  const heightScale = window.innerHeight / DESIGN_HEIGHT;

  return Math.min(widthScale, heightScale, 1);
}

type AppStageFrameProps = {
  children: ReactNode;
};

export default function AppStageFrame({ children }: AppStageFrameProps) {
  const [stageScale, setStageScale] = useState(getStageScale);

  useEffect(() => {
    function handleResize() {
      setStageScale(getStageScale());
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <div
      className="relative z-10"
      style={{
        width: DESIGN_WIDTH * stageScale,
        height: DESIGN_HEIGHT * stageScale,
      }}
    >
      <div
        className="relative h-[932px] w-[430px] origin-top-left overflow-hidden bg-[#f7f2ff] shadow-[0_0_70px_rgba(55,38,110,0.16)]"
        style={{
          transform: `scale(${stageScale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
