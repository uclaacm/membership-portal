import type { Metadata } from "next";
import { Lato, Poppins } from "next/font/google";
import "./globals.css";

import AuthLayer from "@/components/AuthLayer";
import Provider from "@/components/Provider";

// @TODO:   Eventually, we need to migrate to using the SVG icons instead of the CSS icons,
//          but for now this is a quick fix to get the icons working without having to
//          migrate all of our icons across all files.

// import { config } from '@fortawesome/fontawesome-svg-core';
// import "@fortawesome/fontawesome-svg-core/styles.css";
// config.autoAddCss = false;
import "@fortawesome/fontawesome-free/css/all.min.css";

const latoSans = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  // 700 is needed for section labels and the current-user row; without it the browser
  // synthesised a faux bold.
  weight: ["300", "400", "700"],
});

const poppinsSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  // Was ["700"] only, which is why every word in the sidebar rendered bold. Headings and
  // names ask for 600, so the family has to actually carry the lighter weights.
  weight: ["400", "500", "600", "700"],
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
