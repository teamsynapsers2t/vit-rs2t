import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { BudgetProvider } from "./gov-dashboard/context/BudgetContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dmmono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Connect - India's Public Budget Optimizer",
  description: "See exactly how India's Union Budget is being allocated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <BudgetProvider>
        <html
          lang="en"
          className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
        >
          <body className="min-h-full flex flex-col font-sans">{children}</body>
        </html>
      </BudgetProvider>
    </ClerkProvider>
  );
}
