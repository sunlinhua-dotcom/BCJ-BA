import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const notoserif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "佰草集 · 修源五行",
  description: "内养生机，年轻嘭弹 - 佰草集修源五行系列产品场景合成工具",
  keywords: ["佰草集", "HERBORIST", "修源五行", "护肤", "仙草", "中医美容"],
  authors: [{ name: "佰草集" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4A6B50",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${notoserif.variable} antialiased font-serif`}>
        {children}
      </body>
    </html>
  );
}
