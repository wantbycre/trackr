import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { DemoBadge } from "@/components/demo-badge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trackr — 구직 파이프라인 트래커",
  description: "지원 현황을 칸반으로 관리하고 전형 전환율을 대시보드로 보는 개인 구직 트래커",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <header className="border-b">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
              <Link href="/board" className="font-semibold tracking-tight">
                Trackr
              </Link>
              <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/board" className="hover:text-foreground">
                  보드
                </Link>
                <Link href="/dashboard" className="hover:text-foreground">
                  대시보드
                </Link>
              </nav>
              <div className="ml-auto flex items-center gap-2">
                <DemoBadge />
                <ModeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
