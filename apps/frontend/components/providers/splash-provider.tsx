"use client";

import { useState, useEffect } from "react";
import SplashScreen from "../ui/SplashScreen";

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);


  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("loginex_splash_played");
    if (!hasPlayed) {
      setShowSplash(true);
    }
    setHasChecked(true);
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("loginex_splash_played", "true");
    setShowSplash(false);
  };


  // Avoid hydration mismatch by rendering immediately but relying on the component state
  return (
    <>
      {hasChecked && showSplash && <SplashScreen onComplete={handleComplete} />}
      {!hasChecked && <div className="fixed inset-0 z-50 bg-background" />}
      <div
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 0.8s ease-in-out",
          pointerEvents: showSplash ? "none" : "auto",
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </>
  );
}
