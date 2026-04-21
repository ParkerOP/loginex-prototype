"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";
import { usePerformance } from "@/components/providers/performance-context";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reduceMotion } = usePerformance();

  if (pathname === '/login') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
           key={pathname}
           initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(5px)" }}
           animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
           exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02, filter: "blur(5px)" }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
           className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background/50 backdrop-blur-3xl overflow-hidden relative">
      {/* Dynamic Background Noise/Glow */}
      {!reduceMotion && (
        <div className="pointer-events-none fixed inset-0 z-[-1] flex justify-center opacity-30">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden z-10">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto w-full max-w-6xl"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
