import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Анкета предзаписи",
  description: "Предзапись: номер и имя + статистика для администратора",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div style={{ minHeight: "100vh" }}>{children}</div>
      </body>
    </html>
  );
}

