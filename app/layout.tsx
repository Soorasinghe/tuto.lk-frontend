import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tuto.lk | Sri Lanka's Verified Tuition Network",
  description: "Find verified O/L, A/L, and Cambridge tutors in Sri Lanka. Connect with experts right down to your village.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {/* The flex-grow ensures the main content pushes the footer down */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}