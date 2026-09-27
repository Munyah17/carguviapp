import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Carguvi — Find the part. Trust the source.",
    template: "%s — Carguvi",
  },
  description:
    "Zimbabwe's vehicle-parts marketplace. Search parts, compare verified vendors, buy with confidence.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let isVendor = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const roles = await getUserRoles(user.id);
      isVendor = roles.includes("vendor");
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white pb-16 sm:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <BottomNav isVendor={isVendor} />
      </body>
    </html>
  );
}
