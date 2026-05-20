import type { Metadata } from "next";
import { ClientShell } from "@/components/layout/ClientShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookTalk — Books. People. Conversations.",
  description: "Connect with local book lovers, join clubs, and discover your next great read.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
