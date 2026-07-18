"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AIN_VARIANT_STORAGE_KEY, DEFAULT_AIN_VARIANT, type AinVariant } from "@/lib/ain";

type IdentityContextValue = {
  variant: AinVariant;
  setVariant: (variant: AinVariant) => void;
};

const IdentityContext = createContext<IdentityContextValue>({
  variant: DEFAULT_AIN_VARIANT,
  setVariant: () => {}
});

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<AinVariant>(DEFAULT_AIN_VARIANT);

  useEffect(() => {
    const stored = window.localStorage.getItem(AIN_VARIANT_STORAGE_KEY);
    if (stored === "a" || stored === "b" || stored === "c") {
      setVariantState(stored);
    }
  }, []);

  const setVariant = useCallback((next: AinVariant) => {
    setVariantState(next);
    window.localStorage.setItem(AIN_VARIANT_STORAGE_KEY, next);
  }, []);

  return <IdentityContext.Provider value={{ variant, setVariant }}>{children}</IdentityContext.Provider>;
}

export function useAinVariant() {
  return useContext(IdentityContext);
}
