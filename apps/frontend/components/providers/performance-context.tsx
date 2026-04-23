"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PerformanceContextType {
  isLowEnd: boolean;
  reduceMotion: boolean;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLowEnd: false,
  reduceMotion: false,
});

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const evaluatePerformance = () => {
      let lowEnd = false;

      // Check if running locally to disable degradation
      if (
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
      ) {
        setIsLowEnd(false);
        setReduceMotion(false);
        return;
      }

      // Check for hardware concurrency (CPU cores)
      if (typeof navigator !== "undefined") {
        const nav = navigator as unknown as {
          hardwareConcurrency?: number;
          connection?: {
            effectiveType: string;
            saveData: boolean;
            addEventListener: (type: string, listener: EventListener) => void;
            removeEventListener: (
              type: string,
              listener: EventListener,
            ) => void;
          };
        };
        if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) {
          lowEnd = true;
        }

        // Check for network connection
        if (nav.connection) {
          const { effectiveType, saveData } = nav.connection;
          if (saveData || ["slow-2g", "2g", "3g"].includes(effectiveType)) {
            lowEnd = true;
          }
        }
      }

      // Check OS-level prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== "undefined"
          ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
          : false;

      setIsLowEnd(lowEnd);
      setReduceMotion(prefersReducedMotion || lowEnd);
    };

    evaluatePerformance();

    // Optionally listen for network changes
    if (
      typeof navigator !== "undefined" &&
      (
        navigator as unknown as {
          hardwareConcurrency?: number;
          connection?: {
            effectiveType: string;
            saveData: boolean;
            addEventListener: (type: string, listener: EventListener) => void;
            removeEventListener: (
              type: string,
              listener: EventListener,
            ) => void;
          };
        }
      ).connection
    ) {
      (
        navigator as unknown as {
          hardwareConcurrency?: number;
          connection?: {
            effectiveType: string;
            saveData: boolean;
            addEventListener: (type: string, listener: EventListener) => void;
            removeEventListener: (
              type: string,
              listener: EventListener,
            ) => void;
          };
        }
      ).connection?.addEventListener("change", evaluatePerformance);
    }

    return () => {
      if (
        typeof navigator !== "undefined" &&
        (
          navigator as unknown as {
            hardwareConcurrency?: number;
            connection?: {
              effectiveType: string;
              saveData: boolean;
              addEventListener: (type: string, listener: EventListener) => void;
              removeEventListener: (
                type: string,
                listener: EventListener,
              ) => void;
            };
          }
        ).connection
      ) {
        (
          navigator as unknown as {
            hardwareConcurrency?: number;
            connection?: {
              effectiveType: string;
              saveData: boolean;
              addEventListener: (type: string, listener: EventListener) => void;
              removeEventListener: (
                type: string,
                listener: EventListener,
              ) => void;
            };
          }
        ).connection?.removeEventListener("change", evaluatePerformance);
      }
    };
  }, []);

  return (
    <PerformanceContext.Provider value={{ isLowEnd, reduceMotion }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export const usePerformance = () => useContext(PerformanceContext);
