import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MUA Assistant",
  description: "The ultimate tool for Independent Makeup Artists",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#A78BFA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming for native feel
};

import { ToastProvider } from "@/components/ui/Toast";

import { LanguageProvider } from "@/components/LanguageContext";
import { AuthProvider } from "@/components/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SyncInitializer } from "@/components/SyncInitializer";
import { PostHogProvider } from "@/components/PostHogProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <PostHogProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <OfflineIndicator />
                <SyncInitializer />
                {children}
                <BottomNav />
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
