"use client";

import { useState } from "react";
import SplashScreen from "../ui/SplashScreen";

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  // Avoid hydration mismatch by rendering immediately but relying on the component state
  return (
    <>
      <SplashScreen onComplete={() => setShowSplash(false)} />
      <div
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 0.8s ease-in-out",
          pointerEvents: showSplash ? "none" : "auto"
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </>
  );
}
