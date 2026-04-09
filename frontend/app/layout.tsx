import type { Metadata } from "next";
import { Lato, Poppins } from "next/font/google";
import "./globals.css";

import AuthLayer from "@/components/AuthLayer";
import Provider from "@/components/Provider";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

const latoSans = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const poppinsSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "ACM Membership Portal",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${latoSans.variable} ${poppinsSans.variable} antialiased`}
        style={{ background: "#ffffff", color: "#000000" }}>
        <AuthLayer>
          <Provider>{children}</Provider>
        </AuthLayer>
      </body>
    </html>
  );
}
