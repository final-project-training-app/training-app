import { useAdminPage } from "../../hooks/useAdminPage";

export default function AdminPage() {
  const { data, isLoading, error } = useAdminPage();

  if (isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center">
        <h1 className="text-red-500 text-2xl">Not authorized</h1>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-(--brand-page) text-(--brand-ink)">
      <h1 className="text-3xl font-bold">Admin Page</h1>
      <p className="text-lg">{data}</p>
    </main>
  );
}
