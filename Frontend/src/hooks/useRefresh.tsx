import { createContext, useState, useContext, ReactNode } from "react";

const RefreshContext = createContext<{ refresh: () => void } | null>(null);

export const RefreshProvider = ({ children }: { children: ReactNode }) => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((prev) => prev + 1); // Форсируем обновление

  return (
    <RefreshContext.Provider value={{ refresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
};
