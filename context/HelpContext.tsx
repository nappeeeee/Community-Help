import React, { createContext, ReactNode, useContext, useState } from "react";

type HelpItem = { id: string; text: string };

type HelpContextType = {
  items: HelpItem[];
  addItem: (text: string) => void;
};

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<HelpItem[]>([]);

  const addItem = (text: string) => {
    const newHelp: HelpItem = { id: Date.now().toString(), text };
    setItems((prev) => [...prev, newHelp]);
  };

  return (
    <HelpContext.Provider value={{ items, addItem }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) throw new Error("useHelp must be used inside HelpProvider");
  return context;
}
