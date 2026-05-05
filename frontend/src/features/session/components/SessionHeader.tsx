type SessionHeaderProps = {
  title: string;
};

export function SessionHeader({ title }: SessionHeaderProps) {
  return (
    <h1 className="text-center text-4xl font-bold text-slate-950 md:text-5xl">
      {title}
    </h1>
  );
}
