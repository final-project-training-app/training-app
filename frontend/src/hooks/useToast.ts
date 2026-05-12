import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);

    setTimeout(() => {
      setToast(null);
    }, 2000);
  }, []);

  return { toast, showToast };
}