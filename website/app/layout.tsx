import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CitrusVer - Fresh Squeezed Version Management",
  description: "Beautiful, interactive version bumping for Node.js projects. Zero dependencies, powerful git integration, and a delightful CLI experience.",
  keywords: ["version management", "semver", "npm", "git", "cli", "node.js", "semantic versioning", "release management"],
  authors: [{ name: "Jake Rains", url: "https://jakerains.com" }],
  creator: "Jake Rains",
  publisher: "Jake Rains",
  openGraph: {
    title: "CitrusVer - Fresh Squeezed Version Management",
    description: "Beautiful, interactive version bumping for Node.js projects with zero dependencies",
    url: "https://citrusver.jakerains.com",
    siteName: "CitrusVer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CitrusVer - Fresh Squeezed Version Management",
    description: "Beautiful, interactive version bumping for Node.js projects",
    creator: "@jakerains",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
