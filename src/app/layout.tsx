import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
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

// viewport-fit=cover lets env(safe-area-inset-*) reach the CSS, so the
// bottom nav clears Safari's bottom URL bar on iOS.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let roles: string[] = [];
  let signedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      signedIn = true;
      roles = await getUserRoles(user.id);
    }
  }
  const isVendor = roles.includes("vendor");
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const isEnumerator = roles.includes("enumerator");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav
          isVendor={isVendor}
          isAdmin={isAdmin}
          isEnumerator={isEnumerator}
          signedIn={signedIn}
        />
      </body>
    </html>
  );
}
