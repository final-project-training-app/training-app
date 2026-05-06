type SessionCoachHeroProps = {
  coachName: string;
  avatarUrl: string;
};

export function SessionCoachHero({
  coachName,
  avatarUrl,
}: SessionCoachHeroProps) {
  return (
    <div className="mb-6 flex justify-center pt-1">
      <div className="h-[200px] w-[200px] overflow-hidden rounded-full bg-[#f1ecff] shadow-[0_10px_40px_rgba(83,64,211,0.08)] sm:h-[230px] sm:w-[230px]">
        <img
          src={avatarUrl}
          alt={coachName}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}