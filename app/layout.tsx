import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/Navbar";
import GuestBanner from "@/components/GuestBanner";
import { Toaster } from "@/components/ui/sonner";

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
    default: "Prep Coach — AI Interview Prep",
    template: "%s | Prep Coach",
  },
  description:
    "Practice coding interviews with AI-generated problems, real code execution, and personalized feedback. Track your progress and crush your next interview.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "Prep Coach — AI Interview Prep",
    description:
      "Practice coding interviews with AI-generated problems, real code execution, and personalized feedback.",
    siteName: "Prep Coach",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Prep Coach — AI Interview Prep",
    description:
      "Practice coding interviews with AI-generated problems, real code execution, and personalized feedback.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Navbar />
          <GuestBanner />
          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}