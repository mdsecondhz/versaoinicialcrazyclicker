import { useState, useCallback } from "react";

export interface ClickPopup {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export function useClickEffect() {
  const [popups, setPopups] = useState<ClickPopup[]>([]);

  const addPopup = useCallback((x: number, y: number, amount: number) => {
    const id = Date.now() + Math.random();
    setPopups((prev) => [...prev, { id, x, y, amount }]);

    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  }, []);

  return { popups, addPopup };
}
