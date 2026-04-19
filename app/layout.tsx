import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google"; // Use Outfit for premium feel
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import PwaRegister from "../components/PwaRegister";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whats Coop",
  description: "Sistema de envio de mensagens",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Whats Coop",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.png", // Using the 192x192 icon for best compatibility
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <PwaRegister />
        <ToastContainer />
      </body>
    </html>
  );
}
