import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import { AppInitializationProvider } from "@/providers/app-initialization-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pipboy",
});

export const metadata: Metadata = {
  title: "Vault-Tec UA | Air Raid Alert Map",
  description: "Ukraine Air Raid Alert Map in Fallout Pip-Boy Style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${shareTechMono.variable} antialiased`}>
        <QueryProvider>
          <AppInitializationProvider>{children}</AppInitializationProvider>
        </QueryProvider>
        <div className="crt-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
