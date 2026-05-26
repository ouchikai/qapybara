import type { Metadata } from "next";
import { QueryProvider } from "@/lib/react-query/query-provider";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Qapybara",
  description: "Production-grade QA management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
