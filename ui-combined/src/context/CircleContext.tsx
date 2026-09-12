import React, { createContext, useContext, useState, ReactNode } from "react";

interface CircleContextType {
  activeCircle: string;
  setActiveCircle: (circleId: string) => void;
}

const CircleContext = createContext<CircleContextType | undefined>(undefined);

export const CircleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeCircle, setActiveCircleState] = useState<string>(() => {
    try {
      return localStorage.getItem("nyayadrishti_active_circle") || "CIRCLE_DL_SOUTH_01";
    } catch {
      return "CIRCLE_DL_SOUTH_01";
    }
  });

  const setActiveCircle = (circleId: string) => {
    setActiveCircleState(circleId);
    try {
      localStorage.setItem("nyayadrishti_active_circle", circleId);
    } catch {
      // ignore
    }
  };

  return (
    <CircleContext.Provider value={{ activeCircle, setActiveCircle }}>
      {children}
    </CircleContext.Provider>
  );
};

export const useCircle = (): CircleContextType => {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error("useCircle must be used within a CircleProvider");
  }
  return context;
};
