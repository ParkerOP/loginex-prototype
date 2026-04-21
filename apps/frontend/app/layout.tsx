import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { SplashProvider } from "@/components/providers/splash-provider";
import { PerformanceProvider } from "@/components/providers/performance-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LogineX | Dashboard",
  description: "Next Generation Logistics Platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen selection:bg-primary/30`}>
        <SessionProvider>
          <PerformanceProvider>
            <SplashProvider>
              {children}
            </SplashProvider>
          </PerformanceProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
