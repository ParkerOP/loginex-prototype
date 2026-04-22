"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePerformance } from "../providers/performance-context";

export default function SplashScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isLowEnd, reduceMotion } = usePerformance();

  useEffect(() => {
    // Attempt to play audio on mount
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio autoplay blocked by browser", e));
    }

    // Animation takes roughly 3-4 seconds, let's wait 4.5s
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 4500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // If the device is very low end and reduceMotion is on, fallback to simple spinner
  if (reduceMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="splash-simple"
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
            <Image
              src="/logo.ico"
              alt="LogineX Logo"
              width={80}
              height={80}
              className="animate-pulse"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <audio ref={audioRef} src="/audio/brand.wav" preload="auto" />

          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          </div>

          <div className="relative flex flex-col items-center">
            <div className="flex items-end text-6xl font-extrabold tracking-tight text-foreground relative h-20">
              {/* L o g */}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Log
              </motion.span>

              {/* squishable letter i */}
              <motion.span
                className="inline-block mx-1"
                animate={{
                  scaleY: [1, 1, 0.3, 0.3, 1],
                  y: [0, 0, 20, 20, 0],
                }}
                transition={{
                  duration: 3,
                  times: [0, 0.16, 0.43, 0.76, 0.83],
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "bottom" }}
              >
                i
              </motion.span>

              {/* n e */}
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                ne
              </motion.span>

              {/* The 'X' space that gets filled later */}
              <motion.span
                className="text-primary w-[40px] text-center ml-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                X
              </motion.span>

              {/* The Hopping 'X' (Logo) */}
              <motion.div
                className="absolute bottom-0 drop-shadow-2xl z-10"
                initial={{
                  x: 300,
                  y: -200,
                  opacity: 0,
                  scale: 0.5,
                  rotate: 180,
                }}
                animate={{
                  x: [300, 105, 105, 105, 230], // Start far right, land on 'i' (around 105px offset), stay, hop to end
                  y: [-200, -80, 5, 5, 0], // Fall down, bounce on 'i', stay squished, land at end
                  opacity: [0, 1, 1, 1, 0], // Fade out when the real text 'X' appears
                  scale: [0.5, 0.8, 0.8, 0.8, 0.5],
                  rotate: [180, 0, 0, 0, 360],
                }}
                transition={{
                  duration: 3,
                  times: [0, 0.33, 0.43, 0.76, 0.93], // align with 'i' squish timeline
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/logo.ico"
                  alt="LogineX Logo"
                  width={60}
                  height={60}
                  priority
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="mt-6 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
